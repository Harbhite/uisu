CREATE TABLE public.site_seo_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  site_name text NOT NULL DEFAULT 'UISU SPACE',
  site_description text NOT NULL DEFAULT 'The official digital space of the University of Ibadan Students’ Union — connecting students, preserving history, and empowering the community.',
  social_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_seo_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_seo_settings TO authenticated;
GRANT ALL ON public.site_seo_settings TO service_role;

ALTER TABLE public.site_seo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site SEO settings"
  ON public.site_seo_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can create site SEO settings"
  ON public.site_seo_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update site SEO settings"
  ON public.site_seo_settings
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));