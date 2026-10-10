ALTER TABLE public.quizlets ADD COLUMN IF NOT EXISTS time_limit_minutes integer CHECK (time_limit_minutes IS NULL OR (time_limit_minutes > 0 AND time_limit_minutes <= 600));
DROP POLICY IF EXISTS "Authenticated users can create quizlets" ON public.quizlets;
CREATE POLICY "Staff can create quizlets" ON public.quizlets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by AND public.is_moderator_or_admin(auth.uid()));
CREATE POLICY "Staff can update any quizlet" ON public.quizlets FOR UPDATE TO authenticated
  USING (public.is_moderator_or_admin(auth.uid())) WITH CHECK (public.is_moderator_or_admin(auth.uid()));