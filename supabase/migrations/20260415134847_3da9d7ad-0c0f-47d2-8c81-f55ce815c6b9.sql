
-- Quizlets table for saved/shared quizzes
CREATE TABLE public.quizlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  question_count integer NOT NULL DEFAULT 0,
  difficulty text NOT NULL DEFAULT 'intermediate',
  rigidity text NOT NULL DEFAULT 'Standard',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  attempt_count integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true
);

ALTER TABLE public.quizlets ENABLE ROW LEVEL SECURITY;

-- Everyone can view published quizlets
CREATE POLICY "Published quizlets viewable by everyone"
ON public.quizlets FOR SELECT
TO public
USING (is_published = true);

-- Creators can view their own (even unpublished)
CREATE POLICY "Users can view own quizlets"
ON public.quizlets FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Authenticated users can create quizlets
CREATE POLICY "Authenticated users can create quizlets"
ON public.quizlets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can update own quizlets
CREATE POLICY "Users can update own quizlets"
ON public.quizlets FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Users can delete own quizlets, staff can delete any
CREATE POLICY "Users can delete own quizlets or staff any"
ON public.quizlets FOR DELETE
TO authenticated
USING (auth.uid() = created_by OR is_moderator_or_admin(auth.uid()));

-- Quizlet attempts table 
CREATE TABLE public.quizlet_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quizlet_id uuid REFERENCES public.quizlets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  time_seconds integer NOT NULL DEFAULT 0,
  completed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quizlet_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view own attempts
CREATE POLICY "Users can view own attempts"
ON public.quizlet_attempts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create attempts
CREATE POLICY "Users can create attempts"
ON public.quizlet_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Increment attempt count trigger
CREATE OR REPLACE FUNCTION public.update_quizlet_attempt_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.quizlets SET attempt_count = attempt_count + 1 WHERE id = NEW.quizlet_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_quizlet_attempt_insert
AFTER INSERT ON public.quizlet_attempts
FOR EACH ROW EXECUTE FUNCTION public.update_quizlet_attempt_count();
