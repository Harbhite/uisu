
-- =============================================
-- 1. MARKETPLACE LISTINGS
-- =============================================
CREATE TABLE public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  price_type text NOT NULL DEFAULT 'fixed', -- fixed, negotiable, free, swap
  category text NOT NULL DEFAULT 'other',
  condition text DEFAULT 'used', -- new, like_new, used, fair
  photos text[] DEFAULT '{}'::text[],
  contact_method text DEFAULT 'in_app', -- in_app, whatsapp, phone
  contact_info text,
  status text NOT NULL DEFAULT 'active', -- active, sold, reserved, expired
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listings are viewable by everyone"
  ON public.marketplace_listings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create listings"
  ON public.marketplace_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON public.marketplace_listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings or staff can delete any"
  ON public.marketplace_listings FOR DELETE
  USING (auth.uid() = user_id OR is_moderator_or_admin(auth.uid()));

-- Storage bucket for listing photos
INSERT INTO storage.buckets (id, name, public) VALUES ('marketplace', 'marketplace', true);

CREATE POLICY "Anyone can view marketplace images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'marketplace');

CREATE POLICY "Authenticated users can upload marketplace images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'marketplace' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own marketplace images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'marketplace' AND auth.uid() IS NOT NULL);

-- =============================================
-- 2. QR CODE CHECK-IN (extend event_rsvps)
-- =============================================
ALTER TABLE public.event_rsvps
  ADD COLUMN IF NOT EXISTS qr_token text UNIQUE DEFAULT encode(extensions.gen_random_bytes(16), 'hex');

CREATE TABLE public.event_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  rsvp_id uuid NOT NULL REFERENCES public.event_rsvps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  checked_in_by uuid,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  method text DEFAULT 'qr_scan', -- qr_scan, manual
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view checkins"
  ON public.event_checkins FOR SELECT USING (true);

CREATE POLICY "Staff can create checkins"
  ON public.event_checkins FOR INSERT
  WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete checkins"
  ON public.event_checkins FOR DELETE
  USING (is_moderator_or_admin(auth.uid()));

-- =============================================
-- 3. POLLS & VOTING
-- =============================================
CREATE TABLE public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text,
  poll_type text NOT NULL DEFAULT 'single_choice', -- single_choice, ranked_choice, approval
  status text NOT NULL DEFAULT 'draft', -- draft, active, closed
  is_anonymous boolean DEFAULT false,
  show_results_before_close boolean DEFAULT false,
  allow_comments boolean DEFAULT false,
  max_choices integer DEFAULT 1, -- for approval voting
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active polls viewable by everyone"
  ON public.polls FOR SELECT
  USING (status IN ('active', 'closed') OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can create polls"
  ON public.polls FOR INSERT
  WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update polls"
  ON public.polls FOR UPDATE
  USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete polls"
  ON public.polls FOR DELETE
  USING (is_moderator_or_admin(auth.uid()));

CREATE TABLE public.poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  vote_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Poll options viewable by everyone"
  ON public.poll_options FOR SELECT USING (true);

CREATE POLICY "Staff can manage poll options"
  ON public.poll_options FOR ALL
  USING (is_moderator_or_admin(auth.uid()));

CREATE TABLE public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rank integer DEFAULT 1, -- for ranked-choice voting
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, option_id, user_id)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own votes"
  ON public.poll_votes FOR SELECT
  USING (auth.uid() = user_id OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Authenticated users can vote"
  ON public.poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON public.poll_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update vote counts
CREATE OR REPLACE FUNCTION public.update_poll_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.poll_options SET vote_count = vote_count + 1 WHERE id = NEW.option_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.poll_options SET vote_count = GREATEST(0, vote_count - 1) WHERE id = OLD.option_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_poll_vote_count_trigger
  AFTER INSERT OR DELETE ON public.poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_poll_vote_count();
