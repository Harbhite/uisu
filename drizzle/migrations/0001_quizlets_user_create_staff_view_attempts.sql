DROP POLICY IF EXISTS "Authenticated users can create quizlets" ON public.quizlets;
DROP POLICY IF EXISTS "Staff can create quizlets" ON public.quizlets;
CREATE POLICY "Authenticated users can create quizlets"
ON public.quizlets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Staff can view all attempts" ON public.quiz_attempts;
CREATE POLICY "Staff can view all attempts"
ON public.quiz_attempts FOR SELECT
TO authenticated
USING (public.is_moderator_or_admin(auth.uid()));