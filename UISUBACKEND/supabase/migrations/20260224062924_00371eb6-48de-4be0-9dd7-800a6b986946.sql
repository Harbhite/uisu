
-- 1. Emoji reactions table for ink pieces
CREATE TABLE public.ink_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_id uuid NOT NULL REFERENCES public.ink_pieces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('like', 'insightful', 'fire', 'clap', 'love')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (piece_id, user_id, reaction)
);

ALTER TABLE public.ink_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON public.ink_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add reactions" ON public.ink_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON public.ink_reactions FOR DELETE USING (auth.uid() = user_id);

-- 2. Study buddy sessions table
CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL DEFAULT 'explainer',
  topic text,
  material_preview text,
  response text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.study_sessions FOR DELETE USING (auth.uid() = user_id);

-- 3. Flashcard spaced repetition data
CREATE TABLE public.flashcard_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic text NOT NULL,
  cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  sr_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_reviewed_at timestamptz
);

ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own decks" ON public.flashcard_decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create decks" ON public.flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decks" ON public.flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own decks" ON public.flashcard_decks FOR DELETE USING (auth.uid() = user_id);

-- 4. Add faculty/level/hall to newsletter_subscribers for segmentation
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS faculty text,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS hall text;

-- 5. Event reminders opt-in (store on event_rsvps)
ALTER TABLE public.event_rsvps
  ADD COLUMN IF NOT EXISTS remind_24h boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS remind_1h boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_email text;
