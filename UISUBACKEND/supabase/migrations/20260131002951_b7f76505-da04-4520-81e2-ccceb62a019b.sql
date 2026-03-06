-- Add A/B testing columns to newsletter_campaigns
ALTER TABLE public.newsletter_campaigns 
ADD COLUMN IF NOT EXISTS ab_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ab_variant_a_template text,
ADD COLUMN IF NOT EXISTS ab_variant_b_template text,
ADD COLUMN IF NOT EXISTS ab_variant_a_opens integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ab_variant_b_opens integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ab_variant_a_clicks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ab_variant_b_clicks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ab_variant_a_sent integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ab_variant_b_sent integer DEFAULT 0;

-- Add variant column to email_tracking to know which variant was sent
ALTER TABLE public.email_tracking
ADD COLUMN IF NOT EXISTS ab_variant text;