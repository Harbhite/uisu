-- Newsletter template versions for history & rollback
CREATE TABLE public.newsletter_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.newsletter_templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  html_shell text NOT NULL,
  thumbnail_color text,
  is_active boolean NOT NULL DEFAULT true,
  version_number integer NOT NULL,
  edited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  edit_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_template_versions TO authenticated;
GRANT ALL ON public.newsletter_template_versions TO service_role;

ALTER TABLE public.newsletter_template_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage template versions"
ON public.newsletter_template_versions
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX idx_template_versions_template ON public.newsletter_template_versions(template_id, version_number DESC);

-- Auto-snapshot trigger: on every UPDATE of a template, record the OLD state as a version.
CREATE OR REPLACE FUNCTION public.snapshot_newsletter_template()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_ver integer;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_ver
  FROM public.newsletter_template_versions
  WHERE template_id = OLD.id;

  INSERT INTO public.newsletter_template_versions
    (template_id, name, description, html_shell, thumbnail_color, is_active, version_number, edited_by)
  VALUES
    (OLD.id, OLD.name, OLD.description, OLD.html_shell, OLD.thumbnail_color, OLD.is_active, next_ver, auth.uid());

  RETURN NEW;
END;
$$;

CREATE TRIGGER newsletter_templates_versioning
BEFORE UPDATE ON public.newsletter_templates
FOR EACH ROW
WHEN (OLD.html_shell IS DISTINCT FROM NEW.html_shell
   OR OLD.name IS DISTINCT FROM NEW.name
   OR OLD.description IS DISTINCT FROM NEW.description)
EXECUTE FUNCTION public.snapshot_newsletter_template();

-- Shareable StudyBuddy sessions
ALTER TABLE public.study_sessions
  ADD COLUMN IF NOT EXISTS share_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS is_shared boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shared_at timestamptz,
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- Allow anonymous + authenticated public reads when shared
CREATE POLICY "Anyone can view shared sessions"
ON public.study_sessions
FOR SELECT
TO anon, authenticated
USING (is_shared = true AND share_token IS NOT NULL);

GRANT SELECT ON public.study_sessions TO anon;