// Deploys the Elections contract to Polygon Amoy (admin-only, one-time).
// Once deployed, the address must be saved as ELECTIONS_CONTRACT_ADDRESS secret.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, getFactory, getProvider, EXPLORER, getContractAddressFromDb, saveContractAddress } from "../_shared/chain.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims, error: cErr } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (cErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub;

    // Admin check
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await admin.rpc("is_admin", { _user_id: userId });
    if (!isAdmin) return json({ error: "Admin only" }, 403);

    // Check relayer balance first — deploy needs gas
    const provider = getProvider();
    const relayerAddr = Deno.env.get("RELAYER_ADDRESS")!;
    const bal = await provider.getBalance(relayerAddr);
    if (bal === 0n) {
      return json({
        error: "Relayer wallet has no MATIC. Fund it at https://faucet.polygon.technology (Amoy)",
        relayer: relayerAddr,
      }, 400);
    }

    const existingEnv = Deno.env.get("ELECTIONS_CONTRACT_ADDRESS");
    const existingDb = await getContractAddressFromDb();
    const existing = existingEnv || existingDb;
    if (existing) {
      return json({ address: existing, alreadyDeployed: true, explorer: `${EXPLORER}/address/${existing}` });
    }

    const factory = getFactory();
    const contract = await factory.deploy(relayerAddr);
    const tx = contract.deploymentTransaction();
    await contract.waitForDeployment();
    const address = await contract.getAddress();

    await saveContractAddress(address);

    return json({
      address,
      txHash: tx?.hash,
      explorer: `${EXPLORER}/address/${address}`,
      note: "Contract deployed and address saved. Elections module is ready.",
    });
  } catch (e) {
    console.error("deploy error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
