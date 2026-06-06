
CREATE TABLE IF NOT EXISTS public.newsletter_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  sent_by UUID,
  sender_name TEXT,
  audience_id UUID,
  audience_label TEXT,
  audience_mode TEXT,
  recipients_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.newsletter_send_log TO authenticated;
GRANT ALL ON public.newsletter_send_log TO service_role;

ALTER TABLE public.newsletter_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view newsletter send log"
  ON public.newsletter_send_log
  FOR SELECT
  TO authenticated
  USING (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can insert newsletter send log"
  ON public.newsletter_send_log
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_moderator_or_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_newsletter_send_log_campaign ON public.newsletter_send_log (campaign_id, created_at DESC);
