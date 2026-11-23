DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON public.audit_logs;
CREATE POLICY "Users can create own audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view checkins" ON public.event_checkins;
CREATE POLICY "Attendees and staff can view checkins"
ON public.event_checkins
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can view RSVPs" ON public.event_rsvps;
CREATE POLICY "Attendees and staff can view RSVPs"
ON public.event_rsvps
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can view quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view own quiz attempts"
ON public.quiz_attempts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Lost found items viewable by everyone" ON public.lost_found_items;
CREATE POLICY "Active lost found items are public"
ON public.lost_found_items
FOR SELECT
TO anon, authenticated
USING (status = 'active' OR auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can delete club images" ON storage.objects;
CREATE POLICY "Staff can delete club images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'club-images' AND public.is_moderator_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can update club images" ON storage.objects;
CREATE POLICY "Staff can update club images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'club-images' AND public.is_moderator_or_admin(auth.uid()))
WITH CHECK (bucket_id = 'club-images' AND public.is_moderator_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can delete own form uploads" ON storage.objects;
CREATE POLICY "Users can delete own form uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'form-uploads' AND owner_id = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "Anyone can update documents" ON storage.objects;
CREATE POLICY "Owners or staff can update documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND (owner_id = (SELECT auth.uid()::text) OR public.is_moderator_or_admin(auth.uid())))
WITH CHECK (bucket_id = 'documents' AND (owner_id = (SELECT auth.uid()::text) OR public.is_moderator_or_admin(auth.uid())));

DROP POLICY IF EXISTS "Anyone can delete documents" ON storage.objects;
CREATE POLICY "Owners or staff can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND (owner_id = (SELECT auth.uid()::text) OR public.is_moderator_or_admin(auth.uid())));

DROP POLICY IF EXISTS "Users can delete own marketplace images" ON storage.objects;
CREATE POLICY "Users can delete own marketplace images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'marketplace' AND (owner_id = (SELECT auth.uid()::text) OR public.is_moderator_or_admin(auth.uid())));

DROP POLICY IF EXISTS "Users can delete own lost-found images" ON storage.objects;
CREATE POLICY "Users can delete own lost-found images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'lost-found' AND (owner_id = (SELECT auth.uid()::text) OR public.is_moderator_or_admin(auth.uid())));

CREATE OR REPLACE FUNCTION public.get_event_going_count(p_event_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT count(*)::integer
  FROM public.event_rsvps
  WHERE event_id = p_event_id
    AND status = 'going';
$$;
REVOKE ALL ON FUNCTION public.get_event_going_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_event_going_count(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_quiz_leaderboard(p_quizlet_id uuid, p_limit integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  user_display_name text,
  accuracy numeric,
  time_taken_seconds integer,
  score integer,
  total_questions integer,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT a.id, a.user_display_name, a.accuracy, a.time_taken_seconds,
         a.score, a.total_questions, a.created_at
  FROM public.quiz_attempts AS a
  JOIN public.quizlets AS q ON q.id = a.quizlet_id
  WHERE a.quizlet_id = p_quizlet_id
    AND q.is_published = true
  ORDER BY a.accuracy DESC, a.time_taken_seconds ASC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 10), 1), 10);
$$;
REVOKE ALL ON FUNCTION public.get_public_quiz_leaderboard(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_quiz_leaderboard(uuid, integer) TO anon, authenticated;