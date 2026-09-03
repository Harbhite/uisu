
ALTER TABLE public.elections
  ADD COLUMN IF NOT EXISTS on_chain boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS chain_id integer,
  ADD COLUMN IF NOT EXISTS chain_election_key text,
  ADD COLUMN IF NOT EXISTS chain_tx_hash text,
  ADD COLUMN IF NOT EXISTS chain_block_number bigint,
  ADD COLUMN IF NOT EXISTS chain_deployed_at timestamptz;

ALTER TABLE public.election_votes
  ADD COLUMN IF NOT EXISTS tx_hash text,
  ADD COLUMN IF NOT EXISTS block_number bigint,
  ADD COLUMN IF NOT EXISTS chain_id integer,
  ADD COLUMN IF NOT EXISTS voter_hash text;

CREATE INDEX IF NOT EXISTS idx_election_votes_tx_hash ON public.election_votes(tx_hash);
CREATE INDEX IF NOT EXISTS idx_elections_on_chain ON public.elections(on_chain);
