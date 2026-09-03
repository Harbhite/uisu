
-- Anonymous feedback table
CREATE TABLE public.anonymous_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: anyone can insert (no auth required), only staff can read
ALTER TABLE public.anonymous_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit anonymous feedback" ON public.anonymous_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view anonymous feedback" ON public.anonymous_feedback
  FOR SELECT USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete anonymous feedback" ON public.anonymous_feedback
  FOR DELETE USING (is_moderator_or_admin(auth.uid()));

-- Content scheduling: add scheduled_at to announcements and ink_pieces
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.ink_pieces ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
