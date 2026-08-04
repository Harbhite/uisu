CREATE TABLE public.quicklinks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.quicklinks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quicklinks TO authenticated;
GRANT ALL ON public.quicklinks TO service_role;

ALTER TABLE public.quicklinks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published quicklinks"
ON public.quicklinks FOR SELECT
USING (is_published = true OR public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can insert quicklinks"
ON public.quicklinks FOR INSERT TO authenticated
WITH CHECK (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update quicklinks"
ON public.quicklinks FOR UPDATE TO authenticated
USING (public.is_moderator_or_admin(auth.uid()))
WITH CHECK (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete quicklinks"
ON public.quicklinks FOR DELETE TO authenticated
USING (public.is_moderator_or_admin(auth.uid()));

CREATE INDEX idx_quicklinks_category ON public.quicklinks (category, sort_order);

CREATE TRIGGER update_quicklinks_updated_at
BEFORE UPDATE ON public.quicklinks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();