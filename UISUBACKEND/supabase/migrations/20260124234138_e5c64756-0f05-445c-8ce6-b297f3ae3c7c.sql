-- Add contact and social fields to clubs table for full editability
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS meeting_location text,
ADD COLUMN IF NOT EXISTS meeting_schedule text;