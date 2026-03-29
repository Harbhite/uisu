
CREATE TABLE IF NOT EXISTS public.past_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code text NOT NULL,
  course_title text NOT NULL DEFAULT '',
  faculty text NOT NULL DEFAULT 'Science',
  year text NOT NULL DEFAULT '2024',
  semester text NOT NULL DEFAULT 'First',
  question_text text NOT NULL,
  ai_solution text,
  submitted_by uuid REFERENCES auth.users(id),
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.past_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Past questions viewable by everyone"
  ON public.past_questions FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Authenticated users can submit questions"
  ON public.past_questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Staff can manage past questions"
  ON public.past_questions FOR ALL
  TO authenticated
  USING (is_moderator_or_admin(auth.uid()));

CREATE TRIGGER update_past_questions_updated_at
  BEFORE UPDATE ON public.past_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
