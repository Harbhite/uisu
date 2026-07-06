
CREATE TABLE IF NOT EXISTS public.chain_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.chain_config TO authenticated, anon;
GRANT ALL ON public.chain_config TO service_role;

ALTER TABLE public.chain_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chain_config public read" ON public.chain_config FOR SELECT USING (true);
CREATE POLICY "chain_config admin write" ON public.chain_config FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
