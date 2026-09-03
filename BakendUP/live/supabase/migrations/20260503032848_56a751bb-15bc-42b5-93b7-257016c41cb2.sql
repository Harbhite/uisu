-- AI metadata columns
ALTER TABLE public.lost_found_items
  ADD COLUMN IF NOT EXISTS ai_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ai_attributes jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_summary text;

CREATE INDEX IF NOT EXISTS idx_lf_items_ai_tags ON public.lost_found_items USING GIN(ai_tags);
CREATE INDEX IF NOT EXISTS idx_lf_items_type_status_created ON public.lost_found_items(item_type, status, created_at DESC);

-- Matches table
CREATE TABLE IF NOT EXISTS public.lost_found_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id uuid NOT NULL REFERENCES public.lost_found_items(id) ON DELETE CASCADE,
  found_item_id uuid NOT NULL REFERENCES public.lost_found_items(id) ON DELETE CASCADE,
  confidence text NOT NULL,
  reason text,
  viewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lost_item_id, found_item_id)
);

ALTER TABLE public.lost_found_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners or staff can view matches"
ON public.lost_found_matches FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.lost_found_items i WHERE i.id = lost_item_id AND i.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.lost_found_items i WHERE i.id = found_item_id AND i.user_id = auth.uid())
  OR public.is_moderator_or_admin(auth.uid())
);

CREATE POLICY "Lost owner can mark viewed"
ON public.lost_found_matches FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.lost_found_items i WHERE i.id = lost_item_id AND i.user_id = auth.uid())
);

-- Inserts only happen via service-role edge function; no INSERT policy needed.

-- Claims table
CREATE TABLE IF NOT EXISTS public.lost_found_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  found_item_id uuid NOT NULL REFERENCES public.lost_found_items(id) ON DELETE CASCADE,
  claimant_id uuid NOT NULL,
  claim_text text NOT NULL,
  verification_questions jsonb DEFAULT '[]'::jsonb,
  fraud_score int DEFAULT 0,
  fraud_reasons text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lost_found_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can create claims"
ON public.lost_found_claims FOR INSERT
WITH CHECK (auth.uid() = claimant_id);

CREATE POLICY "Claimant, finder, or staff can view claims"
ON public.lost_found_claims FOR SELECT
USING (
  auth.uid() = claimant_id
  OR EXISTS (SELECT 1 FROM public.lost_found_items i WHERE i.id = found_item_id AND i.user_id = auth.uid())
  OR public.is_moderator_or_admin(auth.uid())
);

CREATE POLICY "Finder or staff can update claim status"
ON public.lost_found_claims FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.lost_found_items i WHERE i.id = found_item_id AND i.user_id = auth.uid())
  OR public.is_moderator_or_admin(auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_lf_claims_found_item ON public.lost_found_claims(found_item_id);
CREATE INDEX IF NOT EXISTS idx_lf_matches_lost_item ON public.lost_found_matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_lf_matches_found_item ON public.lost_found_matches(found_item_id);