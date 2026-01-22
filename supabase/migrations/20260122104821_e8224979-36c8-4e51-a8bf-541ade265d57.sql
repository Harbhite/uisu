-- Add email notification preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications jsonb DEFAULT '{"submission_approved": true, "submission_rejected": true}'::jsonb;