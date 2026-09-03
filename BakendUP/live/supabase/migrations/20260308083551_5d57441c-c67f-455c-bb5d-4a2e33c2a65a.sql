
-- Create tutorial_notes table for per-module user notes
CREATE TABLE public.tutorial_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id UUID NOT NULL,
  tutorial_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint so one note per user per module
ALTER TABLE public.tutorial_notes ADD CONSTRAINT tutorial_notes_user_module_unique UNIQUE (user_id, module_id);

-- Enable RLS
ALTER TABLE public.tutorial_notes ENABLE ROW LEVEL SECURITY;

-- Users can view their own notes
CREATE POLICY "Users can view own notes" ON public.tutorial_notes FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own notes
CREATE POLICY "Users can create own notes" ON public.tutorial_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update own notes" ON public.tutorial_notes FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete own notes" ON public.tutorial_notes FOR DELETE USING (auth.uid() = user_id);
