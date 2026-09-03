-- Add hall_leaders column to halls table for leadership management
ALTER TABLE public.halls ADD COLUMN IF NOT EXISTS leaders jsonb DEFAULT '[]'::jsonb;

-- Create academic_resources table for Academic Bank persistence
CREATE TABLE IF NOT EXISTS public.academic_resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  resource_type text NOT NULL DEFAULT 'folder', -- 'folder', 'pdf', 'doc', 'ppt', 'xls'
  parent_id uuid REFERENCES public.academic_resources(id) ON DELETE CASCADE,
  file_url text,
  file_size text,
  owner text DEFAULT 'Admin',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.academic_resources ENABLE ROW LEVEL SECURITY;

-- Policies for academic_resources
CREATE POLICY "Academic resources are viewable by everyone"
  ON public.academic_resources FOR SELECT
  USING (true);

CREATE POLICY "Staff can create academic resources"
  ON public.academic_resources FOR INSERT
  WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update academic resources"
  ON public.academic_resources FOR UPDATE
  USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete academic resources"
  ON public.academic_resources FOR DELETE
  USING (is_moderator_or_admin(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_academic_resources_updated_at
  BEFORE UPDATE ON public.academic_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the 13 UI faculties as root folders
INSERT INTO public.academic_resources (name, resource_type, parent_id) VALUES
  ('General Studies (GES)', 'folder', NULL),
  ('Faculty of Agriculture', 'folder', NULL),
  ('Faculty of Arts', 'folder', NULL),
  ('Faculty of Clinical Sciences', 'folder', NULL),
  ('Faculty of Dentistry', 'folder', NULL),
  ('Faculty of Education', 'folder', NULL),
  ('Faculty of Law', 'folder', NULL),
  ('Faculty of Pharmacy', 'folder', NULL),
  ('Faculty of Public Health', 'folder', NULL),
  ('Faculty of Renewable Natural Resources', 'folder', NULL),
  ('Faculty of Science', 'folder', NULL),
  ('Faculty of Social Sciences', 'folder', NULL),
  ('Faculty of Technology', 'folder', NULL),
  ('Faculty of Veterinary Medicine', 'folder', NULL);