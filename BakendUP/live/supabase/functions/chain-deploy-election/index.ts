// Creates an election on-chain (admin-only). Records tx_hash & block on the DB row.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, getContract, idToBytes32, EXPLORER, CHAIN_ID } from "../_shared/chain.ts";

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
    const userId = claims.claims.sub;

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await admin.rpc("is_admin", { _user_id: userId });
    if (!isAdmin) return json({ error: "Admin only" }, 403);

    const { electionId } = await req.json();
    if (!electionId) return json({ error: "electionId required" }, 400);

    const { data: election, error: eErr } = await admin
      .from("elections").select("*").eq("id", electionId).maybeSingle();
    if (eErr || !election) return json({ error: "Election not found" }, 404);
    if (election.chain_tx_hash) {
      return json({
        alreadyDeployed: true,
        txHash: election.chain_tx_hash,
        explorer: `${EXPLORER}/tx/${election.chain_tx_hash}`,
      });
    }

    const { data: candidates } = await admin
      .from("election_candidates").select("id").eq("election_id", electionId).order("created_at");
    if (!candidates || candidates.length === 0) return json({ error: "No candidates" }, 400);
    if (candidates.length > 64) return json({ error: "Max 64 candidates" }, 400);

    const contract = await getContract(true);
    const idHash = idToBytes32(electionId);
    const startsAt = Math.floor(new Date(election.starts_at).getTime() / 1000);
    const endsAt = Math.floor(new Date(election.ends_at).getTime() / 1000);

    const tx = await contract.createElection(idHash, election.title, startsAt, endsAt, candidates.length);
    const receipt = await tx.wait(1);

    await admin.from("elections").update({
      on_chain: true,
      chain_id: CHAIN_ID,
      chain_election_key: idHash,
      chain_tx_hash: tx.hash,
      chain_block_number: receipt?.blockNumber ?? null,
      chain_deployed_at: new Date().toISOString(),
    }).eq("id", electionId);

    return json({
      txHash: tx.hash,
      blockNumber: receipt?.blockNumber,
      explorer: `${EXPLORER}/tx/${tx.hash}`,
    });
  } catch (e) {
    console.error("deploy-election error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
