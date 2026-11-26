DROP POLICY IF EXISTS "Authenticated users can view all resources" ON public.resources;

DROP POLICY IF EXISTS "Authenticated users can insert documents" ON public.documents;

DROP POLICY IF EXISTS "Anyone can submit job listings" ON public.job_listings;
CREATE POLICY "Authenticated users can submit pending job listings"
ON public.job_listings
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = submitted_by AND is_approved = false)
  OR public.is_moderator_or_admin(auth.uid())
);

DROP POLICY IF EXISTS "Anyone can submit confessions" ON public.confessions;
CREATE POLICY "Anyone can submit moderated confessions"
ON public.confessions
FOR INSERT
TO public
WITH CHECK (
  char_length(btrim(content)) BETWEEN 10 AND 1000
  AND (COALESCE(is_approved, false) = false OR public.is_moderator_or_admin(auth.uid()))
  AND (COALESCE(is_flagged, false) = false OR public.is_moderator_or_admin(auth.uid()))
  AND (
    parent_id IS NULL
    OR public.is_moderator_or_admin(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.confessions AS parent
      WHERE parent.id = parent_id
        AND parent.is_approved = true
        AND COALESCE(parent.is_flagged, false) = false
    )
  )
);

DROP POLICY IF EXISTS "Anyone can submit anonymous feedback" ON public.anonymous_feedback;
CREATE POLICY "Anyone can submit bounded anonymous feedback"
ON public.anonymous_feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(btrim(message)) BETWEEN 1 AND 2000
  AND category IN ('general', 'academic', 'welfare', 'facilities', 'events', 'website')
);

DROP POLICY IF EXISTS "Anyone can log errors" ON public.error_logs;
CREATE POLICY "Clients can submit their own bounded error reports"
ON public.error_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(btrim(message)) BETWEEN 1 AND 2000
  AND (stack IS NULL OR char_length(stack) <= 5000)
  AND (route IS NULL OR char_length(route) <= 512)
  AND (user_agent IS NULL OR char_length(user_agent) <= 1000)
  AND jsonb_typeof(COALESCE(metadata, '{}'::jsonb)) = 'object'
  AND (user_id IS NULL OR user_id = auth.uid())
);

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Staff can insert newsletter subscribers"
ON public.newsletter_subscribers
FOR INSERT
TO authenticated
WITH CHECK (public.is_moderator_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;

DROP POLICY IF EXISTS "Service role can insert tracking" ON public.email_tracking;
REVOKE INSERT ON public.email_tracking FROM PUBLIC, anon, authenticated;
GRANT INSERT ON public.email_tracking TO service_role;
CREATE POLICY "Service role can insert email tracking"
ON public.email_tracking
FOR INSERT
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "chain_config public read" ON public.chain_config;
CREATE POLICY "Staff can read chain configuration"
ON public.chain_config
FOR SELECT
TO authenticated
USING (public.is_moderator_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Hall posts viewable by everyone" ON public.hall_posts;
CREATE POLICY "Users can view own hall posts or staff can view all"
ON public.hall_posts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.marketplace_listings;
CREATE POLICY "Active marketplace listings are public"
ON public.marketplace_listings
FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  OR auth.uid() = user_id
  OR public.is_moderator_or_admin(auth.uid())
);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users and staff can view profile details"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_moderator_or_admin(auth.uid()));

CREATE OR REPLACE VIEW public.public_profiles WITH (security_barrier = true) AS
SELECT id, full_name, avatar_url, created_at, bio, socials, faculty, department,
       hall_of_residence, level, clubs
FROM public.profiles;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

DROP POLICY IF EXISTS "Tutors are viewable by everyone" ON public.tutors;
CREATE POLICY "Tutors can view own record or staff can view all"
ON public.tutors
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

CREATE OR REPLACE VIEW public.public_tutors WITH (security_barrier = true) AS
SELECT id, name, tier, bio, avatar, courses_count, students_count, rating, is_verified
FROM public.tutors;
GRANT SELECT ON public.public_tutors TO anon, authenticated;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.tutorial_reviews;
CREATE POLICY "Users can view own tutorial reviews or staff can view all"
ON public.tutorial_reviews
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

CREATE OR REPLACE VIEW public.public_tutorial_reviews WITH (security_barrier = true) AS
SELECT review.id, review.tutorial_id, review.rating, review.comment, review.created_at
FROM public.tutorial_reviews AS review
JOIN public.tutorials AS tutorial ON tutorial.id = review.tutorial_id
WHERE tutorial.is_published = true AND tutorial.is_approved = true;
GRANT SELECT ON public.public_tutorial_reviews TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view likes" ON public.ink_likes;
CREATE POLICY "Users can view own ink likes or staff can view all"
ON public.ink_likes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can view reactions" ON public.ink_reactions;
CREATE POLICY "Users can view own ink reactions or staff can view all"
ON public.ink_reactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Reactions viewable by everyone" ON public.gazette_reactions;
CREATE POLICY "Users can view own gazette reactions or staff can view all"
ON public.gazette_reactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Reactions viewable by all" ON public.confession_reactions;
CREATE POLICY "Users can view own confession reactions or staff can view all"
ON public.confession_reactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can view upvotes" ON public.complaint_upvotes;
CREATE POLICY "Users can view own complaint upvotes or staff can view all"
ON public.complaint_upvotes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.get_public_ink_like_count(p_piece_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  SELECT count(*)::integer
  FROM public.ink_likes AS likes
  JOIN public.ink_pieces AS piece ON piece.id = likes.piece_id
  WHERE likes.piece_id = p_piece_id
    AND piece.is_published = true;
$function$;
REVOKE ALL ON FUNCTION public.get_public_ink_like_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_ink_like_count(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_public_ink_reaction_counts(p_piece_id uuid)
RETURNS TABLE(reaction text, reaction_count bigint, reacted_by_user boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  SELECT r.reaction,
         count(*)::bigint,
         count(*) FILTER (WHERE r.user_id = auth.uid()) > 0
  FROM public.ink_reactions AS r
  JOIN public.ink_pieces AS piece ON piece.id = r.piece_id
  WHERE r.piece_id = p_piece_id
    AND piece.is_published = true
  GROUP BY r.reaction;
$function$;
REVOKE ALL ON FUNCTION public.get_public_ink_reaction_counts(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_ink_reaction_counts(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_public_gazette_reaction_counts(p_article_id uuid)
RETURNS TABLE(reaction_type text, reaction_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  SELECT r.reaction_type, count(*)::bigint
  FROM public.gazette_reactions AS r
  JOIN public.gazette_articles AS article ON article.id = r.article_id
  WHERE r.article_id = p_article_id
    AND article.is_published = true
  GROUP BY r.reaction_type;
$function$;
REVOKE ALL ON FUNCTION public.get_public_gazette_reaction_counts(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_gazette_reaction_counts(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_public_confession_reaction_counts(p_confession_ids uuid[])
RETURNS TABLE(confession_id uuid, reaction_type text, reaction_count bigint, reacted_by_user boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  SELECT r.confession_id,
         r.reaction_type,
         count(*)::bigint,
         count(*) FILTER (WHERE r.user_id = auth.uid()) > 0
  FROM public.confession_reactions AS r
  JOIN public.confessions AS confession ON confession.id = r.confession_id
  WHERE r.confession_id = ANY(COALESCE(p_confession_ids, ARRAY[]::uuid[]))
    AND (
      (confession.is_approved = true AND COALESCE(confession.is_flagged, false) = false)
      OR public.is_moderator_or_admin(auth.uid())
    )
  GROUP BY r.confession_id, r.reaction_type;
$function$;
REVOKE ALL ON FUNCTION public.get_public_confession_reaction_counts(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_confession_reaction_counts(uuid[]) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload to documents bucket" ON storage.objects;
CREATE POLICY "Owners can upload to documents bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND owner_id = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "Auth users can upload lost-found images" ON storage.objects;
CREATE POLICY "Owners can upload lost-found images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lost-found' AND owner_id = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "Authenticated users can upload marketplace images" ON storage.objects;
CREATE POLICY "Owners can upload marketplace images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'marketplace' AND owner_id = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "Staff can upload club images" ON storage.objects;
CREATE POLICY "Staff can upload club images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'club-images'
  AND owner_id = (SELECT auth.uid()::text)
  AND public.is_moderator_or_admin(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can upload CV templates" ON storage.objects;
CREATE POLICY "Owners can upload CV templates"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cv-templates' AND owner_id = (SELECT auth.uid()::text));