
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.newsletter_audience_members ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.newsletter_audience_members ADD COLUMN IF NOT EXISTS full_name TEXT;
