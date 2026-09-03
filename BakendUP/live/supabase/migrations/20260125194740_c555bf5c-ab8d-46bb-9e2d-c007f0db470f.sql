-- Create email tracking table for opens and clicks
CREATE TABLE public.email_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click')),
  link_url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_email_tracking_campaign ON public.email_tracking(campaign_id);
CREATE INDEX idx_email_tracking_email ON public.email_tracking(subscriber_email);
CREATE INDEX idx_email_tracking_type ON public.email_tracking(event_type);
CREATE INDEX idx_email_tracking_created ON public.email_tracking(created_at);

-- Enable RLS
ALTER TABLE public.email_tracking ENABLE ROW LEVEL SECURITY;

-- Staff can view tracking data
CREATE POLICY "Staff can view email tracking"
ON public.email_tracking FOR SELECT
USING (is_moderator_or_admin(auth.uid()));

-- Service role can insert tracking events (via edge function)
CREATE POLICY "Service role can insert tracking"
ON public.email_tracking FOR INSERT
WITH CHECK (true);

-- Add tracking columns to newsletter_campaigns table
ALTER TABLE public.newsletter_campaigns
ADD COLUMN IF NOT EXISTS open_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unique_opens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unique_clicks INTEGER DEFAULT 0;