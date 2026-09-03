
-- Add form_type column to forms table
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS form_type text NOT NULL DEFAULT 'form';
