// Shared helpers for Polygon Amoy chain access
import { ethers } from "npm:ethers@6.13.4";
import { createClient } from "npm:@supabase/supabase-js@2";
import artifact from "./contracts/Elections.json" with { type: "json" };

export const ELECTIONS_KEY = "elections_contract_address";

export function adminClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

export async function getContractAddressFromDb(): Promise<string | null> {
  const { data } = await adminClient().from("chain_config").select("value").eq("key", ELECTIONS_KEY).maybeSingle();
  return data?.value ?? null;
}

export async function saveContractAddress(address: string) {
  await adminClient().from("chain_config").upsert({ key: ELECTIONS_KEY, value: address, updated_at: new Date().toISOString() });
}

export const CHAIN_ID = 80002; // Polygon Amoy
export const EXPLORER = "https://amoy.polygonscan.com";

export function getProvider() {
  const rpc = Deno.env.get("POLYGON_AMOY_RPC_URL") || "https://rpc-amoy.polygon.technology";
  return new ethers.JsonRpcProvider(rpc, CHAIN_ID);
}

export function getRelayer() {
  const pk = Deno.env.get("RELAYER_PRIVATE_KEY");
  if (!pk) throw new Error("RELAYER_PRIVATE_KEY not configured");
  return new ethers.Wallet(pk, getProvider());
}

export async function getContractAddress(): Promise<string> {
  // Prefer DB (persisted after deploy). Fall back to env var if set.
  const fromEnv = Deno.env.get("ELECTIONS_CONTRACT_ADDRESS");
  if (fromEnv) return fromEnv;
  const fromDb = await getContractAddressFromDb();
  if (!fromDb) throw new Error("Elections contract not yet deployed. Admin: run chain-deploy-contract first.");
  return fromDb;
}

export async function getContract(withSigner = false) {
  const signerOrProvider = withSigner ? getRelayer() : getProvider();
  const address = await getContractAddress();
  return new ethers.Contract(address, (artifact as any).abi, signerOrProvider);
}

export function getFactory() {
  return new ethers.ContractFactory((artifact as any).abi, (artifact as any).bytecode, getRelayer());
}

// bytes32 helpers
export function idToBytes32(uuid: string): string {
  // deterministic keccak256 of the uuid string (lowercased) → 32 bytes
  return ethers.keccak256(ethers.toUtf8Bytes(uuid.toLowerCase()));
}

export function voterHash(userId: string, electionId: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(`${userId.toLowerCase()}::${electionId.toLowerCase()}`));
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
