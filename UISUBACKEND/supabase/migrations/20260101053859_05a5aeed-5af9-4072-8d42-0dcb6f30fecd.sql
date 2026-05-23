-- Add bio and socials columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS socials jsonb DEFAULT '{}'::jsonb;