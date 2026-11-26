DROP POLICY IF EXISTS "Anyone can submit moderated confessions" ON public.confessions;
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
      WHERE parent.id = confessions.parent_id
        AND parent.is_approved = true
        AND COALESCE(parent.is_flagged, false) = false
    )
  )
);