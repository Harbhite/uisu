
-- 1) Sender name on campaigns
ALTER TABLE public.newsletter_campaigns
  ADD COLUMN IF NOT EXISTS sender_name text,
  ADD COLUMN IF NOT EXISTS audience_id uuid;

-- 2) Audiences (saved segments)
CREATE TABLE IF NOT EXISTS public.newsletter_audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'manual' CHECK (type IN ('all','manual','filter')),
  filter_source text,
  member_count integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_audiences TO authenticated;
GRANT ALL ON public.newsletter_audiences TO service_role;

ALTER TABLE public.newsletter_audiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage audiences"
  ON public.newsletter_audiences
  FOR ALL
  TO authenticated
  USING (public.is_moderator_or_admin(auth.uid()))
  WITH CHECK (public.is_moderator_or_admin(auth.uid()));

CREATE TRIGGER update_newsletter_audiences_updated_at
  BEFORE UPDATE ON public.newsletter_audiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Members of manual audiences
CREATE TABLE IF NOT EXISTS public.newsletter_audience_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audience_id uuid NOT NULL REFERENCES public.newsletter_audiences(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (audience_id, email)
);

CREATE INDEX IF NOT EXISTS idx_audience_members_audience ON public.newsletter_audience_members(audience_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_audience_members TO authenticated;
GRANT ALL ON public.newsletter_audience_members TO service_role;

ALTER TABLE public.newsletter_audience_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage audience members"
  ON public.newsletter_audience_members
  FOR ALL
  TO authenticated
  USING (public.is_moderator_or_admin(auth.uid()))
  WITH CHECK (public.is_moderator_or_admin(auth.uid()));

-- 4) Auto-maintain member_count
CREATE OR REPLACE FUNCTION public.refresh_audience_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  target_id := COALESCE(NEW.audience_id, OLD.audience_id);
  UPDATE public.newsletter_audiences
  SET member_count = (
    SELECT COUNT(*) FROM public.newsletter_audience_members WHERE audience_id = target_id
  ),
  updated_at = now()
  WHERE id = target_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audience_member_count ON public.newsletter_audience_members;
CREATE TRIGGER trg_audience_member_count
  AFTER INSERT OR DELETE ON public.newsletter_audience_members
  FOR EACH ROW EXECUTE FUNCTION public.refresh_audience_member_count();
