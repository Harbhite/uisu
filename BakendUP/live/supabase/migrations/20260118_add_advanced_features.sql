-- Add columns to academic_resources for Advanced Filtering, OCR, and Recommendations

-- Add academic metadata columns for filtering
ALTER TABLE public.academic_resources ADD COLUMN IF NOT EXISTS faculty text;
ALTER TABLE public.academic_resources ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.academic_resources ADD COLUMN IF NOT EXISTS level text; -- '100L', '200L', '300L', '400L', '500L'
ALTER TABLE public.academic_resources ADD COLUMN IF NOT EXISTS semester text; -- '1st', '2nd', 'Annual'
ALTER TABLE public.academic_resources ADD COLUMN IF NOT EXISTS course_code text; -- e.g., 'MAT111', 'PHY101'
ALTER TABLE public.academic_resources ADD COLUMN IF NOT EXISTS course_title text;

-- Add OCR and searchable content column
ALTER TABLE public.academic_resources ADD COLUMN IF NOT EXISTS ocr_text text; -- Full text from OCR
ALTER TABLE public.academic_resources ADD COLUMN IF NOT EXISTS has_ocr boolean DEFAULT false;
ALTER TABLE public.academic_resources ADD COLUMN IF NOT EXISTS ocr_status text DEFAULT 'pending'; -- 'pending', 'processing', 'completed', 'failed'

-- Add recommendation tracking columns
ALTER TABLE public.academic_resources ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE public.academic_resources ADD COLUMN IF NOT EXISTS co_download_count integer DEFAULT 0; -- Times downloaded with other resources
ALTER TABLE public.academic_resources ADD COLUMN IF NOT EXISTS related_resources uuid[] DEFAULT '{}'; -- Array of related resource IDs

-- Create a table to track resource interactions for recommendations
CREATE TABLE IF NOT EXISTS public.resource_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.academic_resources(id) ON DELETE CASCADE,
  interaction_type text NOT NULL, -- 'view', 'download', 'bookmark'
  created_at timestamp with time zone DEFAULT now(),
  session_id text -- To group interactions in a single session
);

-- Enable RLS on resource_interactions
ALTER TABLE public.resource_interactions ENABLE ROW LEVEL SECURITY;

-- Policies for resource_interactions
CREATE POLICY "Users can view their own interactions"
  ON public.resource_interactions FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can create interactions"
  ON public.resource_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a table for OCR jobs (for async processing)
CREATE TABLE IF NOT EXISTS public.ocr_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id uuid NOT NULL REFERENCES public.academic_resources(id) ON DELETE CASCADE,
  status text DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  extracted_text text,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone
);

-- Enable RLS on ocr_jobs
ALTER TABLE public.ocr_jobs ENABLE ROW LEVEL SECURITY;

-- Policies for ocr_jobs (staff only)
CREATE POLICY "Staff can view OCR jobs"
  ON public.ocr_jobs FOR SELECT
  USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can create OCR jobs"
  ON public.ocr_jobs FOR INSERT
  WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update OCR jobs"
  ON public.ocr_jobs FOR UPDATE
  USING (is_moderator_or_admin(auth.uid()));

-- Create full-text search index on academic_resources
CREATE INDEX IF NOT EXISTS idx_academic_resources_ocr_text 
  ON public.academic_resources USING GIN (to_tsvector('english', ocr_text));

CREATE INDEX IF NOT EXISTS idx_academic_resources_name 
  ON public.academic_resources USING GIN (to_tsvector('english', name));

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_academic_resources_faculty 
  ON public.academic_resources(faculty);

CREATE INDEX IF NOT EXISTS idx_academic_resources_department 
  ON public.academic_resources(department);

CREATE INDEX IF NOT EXISTS idx_academic_resources_level 
  ON public.academic_resources(level);

CREATE INDEX IF NOT EXISTS idx_academic_resources_semester 
  ON public.academic_resources(semester);

CREATE INDEX IF NOT EXISTS idx_academic_resources_course_code 
  ON public.academic_resources(course_code);

-- Create index for resource interactions
CREATE INDEX IF NOT EXISTS idx_resource_interactions_user_resource 
  ON public.resource_interactions(user_id, resource_id);

CREATE INDEX IF NOT EXISTS idx_resource_interactions_resource 
  ON public.resource_interactions(resource_id);

-- Create a view for recommendation engine
CREATE OR REPLACE VIEW public.resource_recommendations AS
SELECT 
  r1.id as resource_id,
  r2.id as related_resource_id,
  COUNT(DISTINCT ri1.user_id) as co_interaction_count,
  r2.name as related_resource_name,
  r2.course_code as related_course_code
FROM public.academic_resources r1
JOIN public.academic_resources r2 ON r1.course_code = r2.course_code 
  OR r1.level = r2.level 
  OR r1.faculty = r2.faculty
LEFT JOIN public.resource_interactions ri1 ON ri1.resource_id = r1.id
LEFT JOIN public.resource_interactions ri2 ON ri2.resource_id = r2.id 
  AND ri1.user_id = ri2.user_id
WHERE r1.id != r2.id
GROUP BY r1.id, r2.id, r2.name, r2.course_code
ORDER BY co_interaction_count DESC;

-- Add trigger to update updated_at for ocr_jobs
CREATE TRIGGER update_ocr_jobs_updated_at
  BEFORE UPDATE ON public.ocr_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
