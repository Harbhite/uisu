-- Add new profile fields for student info
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS faculty text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS hall_of_residence text,
ADD COLUMN IF NOT EXISTS level text,
ADD COLUMN IF NOT EXISTS clubs text[] DEFAULT '{}';