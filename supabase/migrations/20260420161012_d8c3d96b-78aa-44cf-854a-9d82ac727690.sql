
-- 1. QUIZ ATTEMPTS (for leaderboards)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quizlet_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_display_name TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quizlet ON public.quiz_attempts(quizlet_id, accuracy DESC, time_taken_seconds ASC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz attempts" ON public.quiz_attempts
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can record attempts" ON public.quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete own attempts or staff any" ON public.quiz_attempts
  FOR DELETE USING (auth.uid() = user_id OR is_moderator_or_admin(auth.uid()));

-- 2. USER STREAKS
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own streak" ON public.user_streaks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own streak" ON public.user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own streak" ON public.user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. QUIZLETS: add created_by + delete policy for authors
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='quizlets') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='quizlets' AND column_name='created_by') THEN
      ALTER TABLE public.quizlets ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    
    DROP POLICY IF EXISTS "Authors or staff can delete quizlets" ON public.quizlets;
    CREATE POLICY "Authors or staff can delete quizlets" ON public.quizlets
      FOR DELETE USING (auth.uid() = created_by OR is_moderator_or_admin(auth.uid()));
  END IF;
END $$;

-- 4. FLASHCARD DECKS: sharing support
ALTER TABLE public.flashcard_decks 
  ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Allow viewing shared decks via invite
DROP POLICY IF EXISTS "Shared decks viewable with token" ON public.flashcard_decks;
CREATE POLICY "Shared decks viewable with token" ON public.flashcard_decks
  FOR SELECT USING (is_shared = true);

-- 5. DECK MEMBERS
CREATE TABLE IF NOT EXISTS public.deck_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(deck_id, user_id)
);

ALTER TABLE public.deck_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view own memberships" ON public.deck_members
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.flashcard_decks WHERE id = deck_members.deck_id AND user_id = auth.uid()
  ));
CREATE POLICY "Users can join decks" ON public.deck_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave decks" ON public.deck_members
  FOR DELETE USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.flashcard_decks WHERE id = deck_members.deck_id AND user_id = auth.uid()
  ));

-- 6. ESSAY CHECKS
CREATE TABLE IF NOT EXISTS public.essay_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  essay_text TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
  overall_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.essay_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own essay checks" ON public.essay_checks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own essay checks" ON public.essay_checks
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users delete own essay checks" ON public.essay_checks
  FOR DELETE USING (auth.uid() = user_id);

-- 7. ERROR LOGS
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  route TEXT,
  message TEXT NOT NULL,
  stack TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON public.error_logs(created_at DESC);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log errors" ON public.error_logs
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view error logs" ON public.error_logs
  FOR SELECT USING (is_moderator_or_admin(auth.uid()));
CREATE POLICY "Staff can delete error logs" ON public.error_logs
  FOR DELETE USING (is_moderator_or_admin(auth.uid()));
