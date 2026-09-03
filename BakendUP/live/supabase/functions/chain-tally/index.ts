// Reads on-chain tally for an election. Public.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, getContract, EXPLORER, getContractAddressFromDb } from "../_shared/chain.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const electionId = url.searchParams.get("electionId");
    if (!electionId) return json({ error: "electionId required" }, 400);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: election } = await admin.from("elections").select("*").eq("id", electionId).maybeSingle();
    if (!election?.on_chain || !election.chain_election_key) return json({ error: "Not on-chain" }, 400);

    const { data: candidates } = await admin
      .from("election_candidates").select("id, name, position, photo_url").eq("election_id", electionId).order("created_at");

    const contract = await getContract(false);
    const tallies: bigint[] = await contract.getResults(election.chain_election_key);
    const results = (candidates || []).map((c, i) => ({
      ...c,
      votes: Number(tallies[i] ?? 0n),
    }));

    const addr = Deno.env.get("ELECTIONS_CONTRACT_ADDRESS") || await getContractAddressFromDb();
    return json({
      electionId,
      contractAddress: addr,
      explorer: addr ? `${EXPLORER}/address/${addr}` : null,
      total: results.reduce((s, r) => s + r.votes, 0),
      results,
    });
  } catch (e) {
    console.error("tally error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
