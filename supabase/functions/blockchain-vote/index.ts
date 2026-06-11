import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VoteTransaction {
  pollId: string;
  optionId: string;
  userIdHash: string;
  timestamp: number;
}

interface Block {
  index: number;
  timestamp: number;
  votes: VoteTransaction[];
  previousHash: string;
  nonce: number;
  hash: string;
}

// Simple in-memory blockchain (in production, this should be persisted)
let blockchain: { chain: Block[]; pendingVotes: VoteTransaction[] } = {
  chain: [
    {
      index: 0,
      timestamp: Date.now(),
      votes: [],
      previousHash: "0",
      nonce: 0,
      hash: "genesis",
    },
  ],
  pendingVotes: [],
};

function sha256(data: string): string {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  return crypto.subtle.digest("SHA-256", dataBuffer).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }) as any;
}

async function calculateBlockHash(block: Block): Promise<string> {
  const data = `${block.index}${block.previousHash}${block.timestamp}${JSON.stringify(
    block.votes
  )}${block.nonce}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function mineBlock(block: Block, difficulty: number): Promise<Block> {
  const target = "0".repeat(difficulty);
  while ((await calculateBlockHash(block)).substring(0, difficulty) !== target) {
    block.nonce++;
  }
  block.hash = await calculateBlockHash(block);
  return block;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { pollId, optionId, userId } = await req.json();

    if (!pollId || !optionId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create vote transaction
    const vote: VoteTransaction = {
      pollId,
      optionId,
      userIdHash: userId, // In production, hash this
      timestamp: Date.now(),
    };

    // Add vote to pending
    blockchain.pendingVotes.push(vote);

    // Mine a new block (simplified - in production, batch votes)
    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
    const newBlock: Block = {
      index: blockchain.chain.length,
      timestamp: Date.now(),
      votes: blockchain.pendingVotes,
      previousHash: lastBlock.hash,
      nonce: 0,
      hash: "",
    };

    const minedBlock = await mineBlock(newBlock, 2);
    blockchain.chain.push(minedBlock);
    blockchain.pendingVotes = [];

    // Update vote count in Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    await supabase
      .from("poll_options")
      .update({ vote_count: (await getVoteCountForOption(pollId, optionId)) + 1 })
      .eq("id", optionId);

    return new Response(
      JSON.stringify({
        success: true,
        blockHash: minedBlock.hash,
        blockIndex: minedBlock.index,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getVoteCountForOption(pollId: string, optionId: string): Promise<number> {
  let count = 0;
  for (const block of blockchain.chain) {
    for (const vote of block.votes) {
      if (vote.pollId === pollId && vote.optionId === optionId) {
        count++;
      }
    }
  }
  return count;
}
