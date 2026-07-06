// Shared helpers for Polygon Amoy chain access
import { ethers } from "npm:ethers@6.13.4";
import artifact from "./contracts/Elections.json" with { type: "json" };

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

export function getContractAddress(): string {
  const a = Deno.env.get("ELECTIONS_CONTRACT_ADDRESS");
  if (!a) throw new Error("ELECTIONS_CONTRACT_ADDRESS not set — deploy the contract first");
  return a;
}

export function getContract(withSigner = false) {
  const signerOrProvider = withSigner ? getRelayer() : getProvider();
  return new ethers.Contract(getContractAddress(), (artifact as any).abi, signerOrProvider);
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
