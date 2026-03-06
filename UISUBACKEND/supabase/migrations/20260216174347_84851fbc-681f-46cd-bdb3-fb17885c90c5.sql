
-- Add scheduled publishing columns to forms
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS opens_at timestamp with time zone DEFAULT NULL;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS closes_at timestamp with time zone DEFAULT NULL;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS max_responses integer DEFAULT NULL;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS notify_on_submit boolean DEFAULT false;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS notify_emails text[] DEFAULT '{}';

-- Add conditional logic columns to form_fields
ALTER TABLE public.form_fields ADD COLUMN IF NOT EXISTS conditions jsonb DEFAULT NULL;
