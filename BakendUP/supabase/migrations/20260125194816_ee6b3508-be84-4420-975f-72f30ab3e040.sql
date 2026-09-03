-- Create helper functions for incrementing campaign stats
CREATE OR REPLACE FUNCTION public.increment_campaign_opens(campaign_uuid UUID, is_unique BOOLEAN)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF is_unique THEN
    UPDATE newsletter_campaigns 
    SET open_count = COALESCE(open_count, 0) + 1,
        unique_opens = COALESCE(unique_opens, 0) + 1,
        updated_at = now()
    WHERE id = campaign_uuid;
  ELSE
    UPDATE newsletter_campaigns 
    SET open_count = COALESCE(open_count, 0) + 1,
        updated_at = now()
    WHERE id = campaign_uuid;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_campaign_clicks(campaign_uuid UUID, is_unique BOOLEAN)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF is_unique THEN
    UPDATE newsletter_campaigns 
    SET click_count = COALESCE(click_count, 0) + 1,
        unique_clicks = COALESCE(unique_clicks, 0) + 1,
        updated_at = now()
    WHERE id = campaign_uuid;
  ELSE
    UPDATE newsletter_campaigns 
    SET click_count = COALESCE(click_count, 0) + 1,
        updated_at = now()
    WHERE id = campaign_uuid;
  END IF;
END;
$$;