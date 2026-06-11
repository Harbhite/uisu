# Blockchain-based Voting for UISU Polls

This document outlines the architecture and implementation details for integrating a simplified blockchain-based voting system into the existing UISU polls feature. The goal is to enhance the transparency, immutability, and verifiability of voting records for sensitive processes like elections.

## 1. Introduction

The current UISU polls feature relies on Supabase for storing poll data, options, and user votes. While Supabase provides robust data management and authentication, the immutability and public verifiability of voting records can be further strengthened by leveraging blockchain technology. This implementation introduces a lightweight, custom blockchain specifically for recording votes, ensuring that once a vote is cast, it cannot be altered or removed.

## 2. Architectural Overview

Our approach involves a hybrid architecture that combines the existing Supabase infrastructure with a new, custom blockchain for vote recording. The key components are:

*   **Existing Supabase Database**: Continues to store poll metadata (titles, descriptions, options, start/end times, anonymity settings) and user authentication data.
*   **Custom Blockchain**: A server-side managed blockchain specifically designed to store vote transactions. Each block will contain a record of votes, a timestamp, the hash of the previous block, and a nonce for proof-of-work.
*   **Supabase Edge Function (or Server-side API)**: Acts as an intermediary between the frontend and the blockchain. All vote submissions will be routed through this function, which will validate the vote, add it to the blockchain, and potentially update cached vote counts in Supabase.
*   **Frontend (React/TypeScript)**: The existing `PollsPage.tsx` will be modified to interact with the new Edge Function for vote submission and to display vote counts derived from the blockchain.

```mermaid
graph TD
    A[Frontend (PollsPage.tsx)] --> B{Supabase Edge Function / API}
    B --> C[Custom Blockchain (Vote Ledger)]
    B --> D[Supabase Database (Poll Metadata & Cached Counts)]
    C -- Read Votes --> B
    D -- Read Polls --> B
    A -- Display Polls & Results --> D
```

## 3. Blockchain Core Design

### 3.1. Block Structure

Each block in our blockchain will be a JSON object with the following properties:

*   `index`: A numerical index representing the block's position in the chain.
*   `timestamp`: The time at which the block was created.
*   `votes`: An array of vote transactions included in this block. Each vote transaction will contain:
    *   `pollId`: The ID of the poll being voted on.
    *   `optionId`: The ID of the chosen option.
    *   `userIdHash`: A cryptographic hash of the user's ID, to prevent double-voting while maintaining a degree of privacy for anonymous polls (or direct `userId` for non-anonymous polls).
    *   `timestamp`: The time the vote was cast.
*   `previousHash`: The cryptographic hash of the preceding block in the chain.
*   `nonce`: A number used in the Proof-of-Work algorithm.
*   `hash`: The cryptographic hash of the current block's contents.

### 3.2. Chain Management

*   **Genesis Block**: The first block in the chain, manually created.
*   **Adding Blocks**: New blocks are added to the chain after successful mining (Proof-of-Work).
*   **Immutability**: Once a block is added, its contents cannot be changed without invalidating all subsequent blocks.

### 3.3. Proof-of-Work (PoW)

To ensure the integrity and security of the blockchain, a simplified Proof-of-Work mechanism will be implemented. This involves finding a `nonce` that, when combined with the block's data, produces a hash that meets a certain difficulty target (e.g., starts with a certain number of zeros). This process makes it computationally expensive to alter past blocks.

### 3.4. Integrity Verification

The entire blockchain can be verified by iterating through each block and recalculating its hash, ensuring it matches the stored hash and that its `previousHash` matches the hash of the preceding block. This guarantees the chain's integrity.

## 4. Integration with Existing Polls

### 4.1. Vote Submission Flow

1.  User selects an option(s) on the `PollsPage.tsx`.
2.  The frontend sends a request to the Supabase Edge Function (or server-side API) with the `pollId`, `optionId(s)`, and the `userId` (or a token representing the user).
3.  The Edge Function performs initial validation (e.g., poll is active, user hasn't voted before if not allowed).
4.  The Edge Function then creates a new vote transaction and attempts to mine a new block containing this vote.
5.  Upon successful mining, the new block is added to the blockchain.
6.  The Edge Function updates a cached vote count in Supabase (for performance) and returns a success response to the frontend.

### 4.2. Preventing Double Voting

For non-anonymous polls, the `userIdHash` (or `userId` directly) within the vote transaction will be used to check if a user has already voted in a specific poll. For anonymous polls, preventing double-voting is more complex and might require advanced cryptographic techniques (e.g., zero-knowledge proofs) which are beyond the scope of this initial simplified implementation. For now, anonymous polls will rely on the honor system or a simpler mechanism like IP-based rate limiting if strict anonymity is maintained on the blockchain.

### 4.3. Displaying Results

Vote counts displayed on the `PollsPage.tsx` will primarily be sourced from the cached counts in Supabase, which are updated by the Edge Function after each successful vote. For full verifiability, an option to view the raw blockchain data will be provided.

## 5. Security Considerations

*   **Immutability**: The core benefit of this approach is that once a vote is recorded on the blockchain, it cannot be tampered with.
*   **Transparency**: The entire vote ledger can be made publicly accessible for auditing and verification.
*   **Proof-of-Work**: Protects against malicious actors attempting to rewrite the voting history.
*   **Authentication**: Supabase's existing authentication will secure access to the voting mechanism.

## 6. Next Steps

1.  Implement the core blockchain logic (Block, Blockchain classes) in a new server-side module.
2.  Create a Supabase Edge Function (or API endpoint) to handle vote submissions and interact with the blockchain.
3.  Modify `PollsPage.tsx` to send vote requests to the new Edge Function.
4.  Update the UI to reflect blockchain-derived vote counts and potentially add a blockchain explorer link.
5.  Write comprehensive tests for the blockchain and integration points.

## 7. Implementation Details

### 7.1. Blockchain Core (`src/lib/blockchain/`)

The blockchain core is implemented in TypeScript within the `src/lib/blockchain/` directory, consisting of `Block.ts` and `Blockchain.ts`.

#### `Block.ts`

This file defines the `VoteTransaction` interface and the `Block` class. Each `Block` contains:

*   `index`: The block number.
*   `timestamp`: When the block was created.
*   `votes`: An array of `VoteTransaction` objects. Each transaction includes `pollId`, `optionId`, `userIdHash` (a hashed user ID for privacy and double-voting prevention), and `timestamp`.
*   `previousHash`: The hash of the preceding block, linking the chain.
*   `nonce`: A number incremented during mining to find a valid hash.
*   `hash`: The block's unique identifier, calculated from its contents.

The `calculateHash()` method uses `crypto-js` (SHA256) to generate the hash. The `mineBlock()` method implements a simple Proof-of-Work by finding a `nonce` that results in a hash starting with a specified number of zeros (difficulty).

#### `Blockchain.ts`

This file defines the `Blockchain` class, which manages the chain of blocks. Key functionalities include:

*   `constructor()`: Initializes the blockchain with a genesis block and sets the mining `difficulty`.
*   `createGenesisBlock()`: Creates the very first block in the chain.
*   `getLatestBlock()`: Returns the most recently added block.
*   `addVote(vote: VoteTransaction)`: Adds a new vote to a list of `pendingVotes`.
*   `minePendingVotes()`: Creates a new block with all `pendingVotes`, mines it using Proof-of-Work, adds it to the chain, and clears `pendingVotes`.
*   `isChainValid()`: Verifies the integrity of the entire blockchain by checking each block's hash and its link to the previous block.
*   `getVotesForPoll(pollId: string)`: Retrieves all vote transactions for a specific poll from the blockchain.
*   `getVoteCountsForPoll(pollId: string)`: Calculates and returns the vote counts for each option in a given poll based on the blockchain data.

### 7.2. Supabase Edge Function (`supabase/functions/blockchain-vote/index.ts`)

This Deno-based Edge Function acts as the secure gateway for submitting votes to the blockchain. It performs the following steps:

1.  **Receives Vote Request**: Accepts `pollId`, `optionId`, and `userId` from the frontend.
2.  **Creates Vote Transaction**: Constructs a `VoteTransaction` object.
3.  **Adds to Pending Votes**: Adds the transaction to the in-memory blockchain's `pendingVotes` (note: for a production system, this in-memory state would need to be replaced with a persistent storage solution for the blockchain).
4.  **Mines New Block**: Initiates the mining process to include the new vote(s) in a new block. This involves calculating the hash with a specific difficulty.
5.  **Updates Supabase**: After successful mining, it updates the `vote_count` in the `poll_options` table in the Supabase database. This keeps the frontend display performant by using cached counts while the blockchain maintains the immutable record.
6.  **Returns Block Hash**: Responds to the frontend with the hash and index of the block where the vote was recorded.

**Note on Persistence**: The current blockchain implementation within the Edge Function is in-memory. For a production environment, the blockchain state (the `chain` array) would need to be persisted to a database or a dedicated blockchain storage solution to ensure data is not lost when the Edge Function instance is reset.

### 7.3. Frontend Integration (`src/pages/PollsPage.tsx` and `src/hooks/useBlockchainVote.ts`)

#### `src/hooks/useBlockchainVote.ts`

This new React hook provides an abstraction for interacting with the `blockchain-vote` Supabase Edge Function. It exposes:

*   `submitBlockchainVote`: An asynchronous function that takes `pollId`, `optionId`, and `userId`, and sends them to the Edge Function. It handles loading states and displays success/error toasts.
*   `voting`: A boolean state indicating if a vote submission is in progress.
*   `blockchainData`: Stores the response from the Edge Function, including the `blockHash` and `blockIndex`.

#### `src/pages/PollsPage.tsx`

This component has been modified to utilize the `useBlockchainVote` hook:

1.  **Import `useBlockchainVote`**: The hook is imported and its `submitBlockchainVote` function is destructured.
2.  **`handleVote` Modification**: After successfully recording the vote in Supabase, the `handleVote` function now calls `submitBlockchainVote` to also record the vote on the blockchain. The returned `blockHash` is stored in a local state (`blockchainTx`) to potentially display to the user.
3.  **User Feedback**: A toast message confirms that the vote has been submitted and recorded on the blockchain.

## 8. Usage and Verification

### 8.1. Casting a Vote

Users interact with the polls feature as usual. When a user casts a vote:

1.  The vote is first recorded in the Supabase database for immediate display and existing application logic.
2.  Concurrently, the vote is sent to the `blockchain-vote` Supabase Edge Function.
3.  The Edge Function processes the vote, mines a new block (or adds to a pending block), and records the vote immutably on the blockchain.
4.  A confirmation message will indicate that the vote has been recorded on the blockchain, potentially showing the block hash.

### 8.2. Verifying Vote Integrity

To verify the integrity of the votes:

1.  **Access the Blockchain Data**: In a production setup, an API endpoint would be exposed to retrieve the entire blockchain or specific poll data from it. For this demonstration, the blockchain state is in-memory within the Edge Function, so direct external access for verification is not straightforward without further development.
2.  **Recalculate Hashes**: An external tool or script could download the blockchain data and re-calculate the hash of each block, ensuring it matches the stored hash and that the `previousHash` links correctly. Any discrepancy would indicate tampering.
3.  **Audit Vote Counts**: The vote counts derived from the blockchain (`getVoteCountsForPoll` method) can be compared against the cached counts in Supabase to ensure consistency.

## 9. Future Enhancements

*   **Blockchain Persistence**: Implement a mechanism to persist the blockchain data (e.g., to a dedicated database table in Supabase or a separate storage service) to ensure data durability beyond the lifespan of an Edge Function instance.
*   **Advanced Double-Voting Prevention**: For anonymous polls, explore cryptographic solutions like zero-knowledge proofs or more robust IP-based/device-fingerprinting mechanisms.
*   **Blockchain Explorer UI**: Develop a simple user interface to view the blockchain, inspect blocks, and verify transactions directly from the frontend.
*   **Smart Contracts for Poll Logic**: For more complex voting rules (e.g., weighted voting, liquid democracy), consider integrating with a full-fledged smart contract platform.
*   **Decentralized Mining**: Explore options for distributed mining to enhance decentralization and resilience.

## 10. Conclusion

By integrating a lightweight blockchain, the UISU polls feature gains an additional layer of transparency and immutability, crucial for sensitive voting processes. This hybrid approach leverages the strengths of both traditional database systems and blockchain technology to provide a more trustworthy and verifiable voting experience.
