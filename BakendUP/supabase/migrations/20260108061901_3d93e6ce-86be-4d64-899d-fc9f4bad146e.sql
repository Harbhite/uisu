-- Add download_count column to academic_resources for tracking
ALTER TABLE public.academic_resources
ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0;