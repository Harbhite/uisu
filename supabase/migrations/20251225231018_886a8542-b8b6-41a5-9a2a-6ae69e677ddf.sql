-- Add image_url column to clubs table
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS image_url text;