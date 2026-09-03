-- Create scholarships table
CREATE TABLE IF NOT EXISTS public.scholarships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  provider text NOT NULL,
  amount text NOT NULL,
  deadline date NOT NULL,
  category text NOT NULL CHECK (category IN ('local', 'international', 'corporate')),
  eligibility text[] DEFAULT '{}',
  description text,
  application_url text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active scholarships" 
ON public.scholarships 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Staff can create scholarships" 
ON public.scholarships 
FOR INSERT 
WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update scholarships" 
ON public.scholarships 
FOR UPDATE 
USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete scholarships" 
ON public.scholarships 
FOR DELETE 
USING (is_moderator_or_admin(auth.uid()));

-- Create cv_templates table for user uploads
CREATE TABLE IF NOT EXISTS public.cv_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  file_url text,
  format text NOT NULL,
  category text DEFAULT 'general',
  download_count integer DEFAULT 0,
  uploaded_by uuid REFERENCES auth.users(id),
  is_approved boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.cv_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved CV templates" 
ON public.cv_templates 
FOR SELECT 
USING (is_approved = true AND is_active = true);

CREATE POLICY "Users can view their own templates" 
ON public.cv_templates 
FOR SELECT 
USING (auth.uid() = uploaded_by);

CREATE POLICY "Authenticated users can upload CV templates" 
ON public.cv_templates 
FOR INSERT 
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own templates" 
ON public.cv_templates 
FOR UPDATE 
USING (auth.uid() = uploaded_by);

CREATE POLICY "Staff can update any CV template" 
ON public.cv_templates 
FOR UPDATE 
USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Users can delete own templates or staff can delete any" 
ON public.cv_templates 
FOR DELETE 
USING (auth.uid() = uploaded_by OR is_moderator_or_admin(auth.uid()));

-- Add user_submitted_by and is_approved to job_listings for user submissions
ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT true;

-- Drop existing insert policy and create new ones for user submissions
DROP POLICY IF EXISTS "Staff can create job listings" ON public.job_listings;

CREATE POLICY "Anyone can submit job listings" 
ON public.job_listings 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Update select policy to show pending jobs to their submitters
DROP POLICY IF EXISTS "Anyone can view active job listings" ON public.job_listings;

CREATE POLICY "View active approved jobs or own submissions" 
ON public.job_listings 
FOR SELECT 
USING (
  (is_active = true AND is_approved = true) 
  OR auth.uid() = submitted_by
  OR is_moderator_or_admin(auth.uid())
);

-- Seed initial scholarships from the hardcoded data
INSERT INTO public.scholarships (title, provider, amount, deadline, category, eligibility, description, application_url, is_active)
VALUES 
  ('MTN Foundation Scholarship', 'MTN Nigeria', '₦200,000', '2026-06-30', 'corporate', ARRAY['Nigerian Student', 'CGPA 3.5+', '200-400 Level'], 'Annual scholarship for outstanding students in Nigerian universities. Covers tuition and provides monthly stipend for academic materials.', '#', true),
  ('NNPC/Total National Merit Scholarship', 'NNPC & Total Energies', '₦150,000', '2026-05-15', 'corporate', ARRAY['Nigerian Citizen', 'CGPA 3.0+', 'Science/Engineering'], 'Merit-based scholarship for students in science and engineering disciplines. Includes internship opportunities.', '#', true),
  ('Agbami Medical & Engineering Scholarship', 'Agbami Partners', '₦500,000', '2026-04-30', 'corporate', ARRAY['Medical/Engineering Student', 'CGPA 3.5+', '300+ Level'], 'Premium scholarship for medical and engineering students with exceptional academic records.', '#', true),
  ('Shell Nigeria Scholarship', 'Shell Petroleum', '₦400,000', '2026-07-31', 'corporate', ARRAY['Nigerian Student', 'CGPA 3.5+', 'STEM Fields'], 'Comprehensive scholarship covering tuition, accommodation, and professional development programs.', '#', true),
  ('UI Endowment Fund Scholarship', 'University of Ibadan', '₦100,000', '2026-03-15', 'local', ARRAY['UI Student', 'CGPA 4.0+', 'Financial Need'], 'Internal scholarship for outstanding UI students demonstrating financial need and academic excellence.', '#', true),
  ('Chevron Undergraduate Scholarship', 'Chevron Nigeria', '₦300,000', '2026-06-15', 'corporate', ARRAY['Nigerian Student', 'CGPA 3.5+', '200-400 Level'], 'Annual scholarship supporting Nigerian undergraduates with academic excellence.', '#', true),
  ('Bilateral Education Agreement (BEA)', 'Federal Government of Nigeria', 'Full Tuition + Stipend', '2026-02-28', 'international', ARRAY['Nigerian Citizen', 'CGPA 3.5+', 'Postgraduate'], 'Government-sponsored international scholarship for postgraduate studies in partner countries.', '#', true),
  ('Mastercard Foundation Scholars Program', 'Mastercard Foundation', 'Full Scholarship', '2026-08-31', 'international', ARRAY['African Student', 'Academic Excellence', 'Leadership Potential'], 'Comprehensive scholarship covering tuition, accommodation, travel, and leadership development.', '#', true),
  ('Oyo State Bursary Award', 'Oyo State Government', '₦50,000', '2026-09-30', 'local', ARRAY['Oyo State Indigene', 'UI Student', 'Good Standing'], 'Annual bursary for indigenes of Oyo State studying at University of Ibadan.', '#', true),
  ('First Bank Endowment Scholarship', 'First Bank of Nigeria', '₦250,000', '2026-05-31', 'corporate', ARRAY['Nigerian Student', 'CGPA 3.5+', 'Business/Economics'], 'Scholarship for students in business and economics programs with strong academic performance.', '#', true);

-- Create storage bucket for CV templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-templates', 'cv-templates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for CV templates
CREATE POLICY "Anyone can view CV templates"
ON storage.objects FOR SELECT
USING (bucket_id = 'cv-templates');

CREATE POLICY "Authenticated users can upload CV templates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cv-templates' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own CV files or staff can delete any"
ON storage.objects FOR DELETE
USING (bucket_id = 'cv-templates' AND (auth.uid()::text = (storage.foldername(name))[1] OR is_moderator_or_admin(auth.uid())));