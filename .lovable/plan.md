
# On-chain Elections on Polygon Amoy

Adds real blockchain settlement to the **Elections module only**. Regular polls stay off-chain. Backend custodies a wallet, signs and submits every vote, and users get a real tx hash + block explorer link they can independently verify on Amoy.

## Architecture

```text
Voter (UI)                Edge function                Polygon Amoy
  │  cast vote            │                               │
  ├──────────────────────▶│  auth + eligibility check     │
  │                       │  build tx (candidate index)   │
  │                       ├──────────────────────────────▶│  Election.sol.castVote()
  │                       │◀───── tx hash, block# ────────┤
  │◀───tx hash + explorer─┤  write to election_votes      │
```

Trust model, stated honestly:
- Backend is a **custodial signer**: it holds the relayer key and decides which votes to submit. Anti-double-vote is enforced *twice* — once in the DB (`election_votes` unique constraint, already exists) and once in the smart contract (`hasVoted[election][voter]` mapping keyed by the user's UUID hash).
- What the chain gives you: **immutable, publicly auditable tally**. Anyone can read the contract and count votes without trusting our DB. That's the real win here.
- What it does not give you: censorship resistance (backend can refuse to relay). This is the tradeoff of the custodial choice.

## Smart contract — `Elections.sol`

Solidity 0.8.24, deployed once, reused for every election.

```text
struct Election { string title; uint64 startsAt; uint64 endsAt; uint8 candidateCount; bool exists; }
mapping(bytes32 => Election)                       elections;         // key = election UUID hash
mapping(bytes32 => mapping(uint8 => uint256))      voteCount;         // election => candidate idx => votes
mapping(bytes32 => mapping(bytes32 => bool))       hasVoted;          // election => voterHash => voted

createElection(bytes32 id, string title, uint64 startsAt, uint64 endsAt, uint8 candidateCount)  // onlyRelayer
castVote(bytes32 electionId, bytes32 voterHash, uint8 candidateIdx)                            // onlyRelayer, within window, not voted
getResults(bytes32 electionId) → uint256[]
```

- `voterHash = keccak256(userId || electionId)` — same user can't vote twice, but their UUID never touches the chain.
- `onlyRelayer` modifier: only the backend wallet can write. Reads are public.
- Constant gas per vote (~50k), free on Amoy.

Compiled offline with Hardhat, artifact (ABI + bytecode) checked into `supabase/functions/_shared/contracts/Elections.json`. Deployment is a one-time script run by the edge function `chain-deploy-election` (admin-only).

## Backend

### New secrets
- `RELAYER_PRIVATE_KEY` — 0x-prefixed key of the backend wallet (funded from Amoy faucet)
- `POLYGON_AMOY_RPC_URL` — public RPC (default `https://rpc-amoy.polygon.technology`) or Alchemy/Infura for reliability
- `ELECTIONS_CONTRACT_ADDRESS` — populated after first deploy

### Edge functions (all in `supabase/functions/`)
1. **`chain-deploy-election`** — admin only. Takes an `elections.id`, fetches candidates from DB, calls `createElection` on chain, stores returned tx hash + block# back on the row. Idempotent.
2. **`chain-cast-vote`** — authenticated user. Validates: (a) user is verified student via `profiles`, (b) election is open, (c) no existing `election_votes` row. Computes `voterHash`, submits `castVote` tx via ethers.js, awaits 1 confirmation, then inserts the DB row with `tx_hash`, `block_number`, `chain_id=80002`.
3. **`chain-tally`** — public read. Calls `getResults` on chain and returns candidate → count. Used on results page so users see the on-chain number, not just DB.

Shared helper `_shared/chain.ts` exposes `getProvider()`, `getRelayer()`, `getContract()`.

### DB migration
Extends existing `elections` and `election_votes` — does not create new tables.
```text
elections:        + chain_tx_hash text, chain_block_number bigint, chain_deployed_at timestamptz, on_chain boolean default false
election_votes:   + tx_hash text, block_number bigint, chain_id int
```

## Frontend

- **Admin → Elections**: new "Deploy on-chain" button per election. Shows tx hash + Polygonscan link once deployed. Election creation form gets an "On-chain election" toggle.
- **Voting UI**: for on-chain elections, the confirm modal explains "Your vote will be recorded on Polygon Amoy testnet" and shows a spinner while the tx confirms (~2–5s). Success screen shows the tx hash with a copy button and "View on Polygonscan" link.
- **Results page**: for on-chain elections, adds a chain badge, tally is fetched from `chain-tally`, and each candidate row links to the contract on Polygonscan. A DB/chain drift check surfaces a warning if numbers disagree (they never should).
- Small `useOnChainElection(id)` hook wraps the three edge functions.

## What I need from you (before I ship code)

1. **Relayer key** — I'll generate a fresh EVM wallet address and give you the address. You fund it with ~0.5 MATIC from the Amoy faucet (https://faucet.polygon.technology), then paste the private key into the `RELAYER_PRIVATE_KEY` secret via the secure form. **Never share the key in chat.**
2. **RPC** — the public Amoy RPC is fine to start. If you have Alchemy/Infura, better; give me the URL.
3. **Contract deploy** — I'll compile `Elections.sol` locally, commit the artifact, and add a one-shot admin action that deploys it. You click deploy once; from then on every election reuses that address.

## Build order

1. Migration for `elections` / `election_votes` chain columns.
2. `Elections.sol` + committed artifact.
3. `_shared/chain.ts` helper.
4. Three edge functions + tests.
5. Admin deploy button + on-chain toggle on the election form.
6. Voter flow (confirm modal, tx hash screen).
7. Results page: chain tally + Polygonscan links.
8. End-to-end verification: deploy → vote as two users → confirm tallies match on Polygonscan.

Confirm and I'll start with step 1 (migration) and give you the relayer address to fund.
