CREATE TABLE public.newsletter_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  html_shell text NOT NULL,
  thumbnail_color text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_templates TO authenticated;
GRANT ALL ON public.newsletter_templates TO service_role;

ALTER TABLE public.newsletter_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage newsletter templates"
  ON public.newsletter_templates
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER update_newsletter_templates_updated_at
  BEFORE UPDATE ON public.newsletter_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_newsletter_templates_active ON public.newsletter_templates(is_active) WHERE is_active = true;