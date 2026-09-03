// Casts a vote on-chain via the relayer, then records it in election_votes.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, getContract, idToBytes32, voterHash, EXPLORER, CHAIN_ID } from "../_shared/chain.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (!claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const { electionId, candidateId } = await req.json();
    if (!electionId || !candidateId) return json({ error: "electionId + candidateId required" }, 400);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 1. Election must exist and be on-chain
    const { data: election } = await admin.from("elections").select("*").eq("id", electionId).maybeSingle();
    if (!election) return json({ error: "Election not found" }, 404);
    if (!election.on_chain || !election.chain_election_key) return json({ error: "Election not on-chain" }, 400);
    const now = Date.now();
    if (new Date(election.starts_at).getTime() > now) return json({ error: "Not open yet" }, 400);
    if (new Date(election.ends_at).getTime() < now) return json({ error: "Election closed" }, 400);

    // 2. Candidate list → determine index (deterministic order)
    const { data: candidates } = await admin
      .from("election_candidates").select("id, position").eq("election_id", electionId).order("created_at");
    if (!candidates) return json({ error: "No candidates" }, 400);
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return json({ error: "Candidate not in election" }, 400);
    const candidateIdx = candidates.findIndex(c => c.id === candidateId);

    // 3. No double vote in DB (per position)
    const { data: prior } = await admin
      .from("election_votes").select("id")
      .eq("election_id", electionId).eq("user_id", userId).eq("position", candidate.position).maybeSingle();
    if (prior) return json({ error: "Already voted for this position" }, 400);

    // 4. Submit on-chain
    const contract = await getContract(true);
    const idHash = election.chain_election_key;
    const vHash = voterHash(userId, electionId);

    // Pre-check chain state to avoid wasting gas on obvious re-vote
    const already = await contract.hasVoted(idHash, vHash);
    if (already) return json({ error: "Already voted on-chain" }, 400);

    const tx = await contract.castVote(idHash, vHash, candidateIdx);
    const receipt = await tx.wait(1);

    // 5. Record in DB
    const { error: insErr } = await admin.from("election_votes").insert({
      election_id: electionId,
      candidate_id: candidateId,
      user_id: userId,
      position: candidate.position,
      tx_hash: tx.hash,
      block_number: receipt?.blockNumber ?? null,
      chain_id: CHAIN_ID,
      voter_hash: vHash,
    });
    if (insErr) console.error("db insert after chain vote", insErr);

    return json({
      ok: true,
      txHash: tx.hash,
      blockNumber: receipt?.blockNumber,
      explorer: `${EXPLORER}/tx/${tx.hash}`,
    });
  } catch (e) {
    console.error("cast-vote error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
