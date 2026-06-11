import { Block, VoteTransaction } from './Block';

export class Blockchain {
  public chain: Block[];
  public difficulty: number;
  public pendingVotes: VoteTransaction[];

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // Simple difficulty for demonstration
    this.pendingVotes = [];
  }

  private createGenesisBlock(): Block {
    return new Block(0, Date.now(), [], "0");
  }

  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  public addVote(vote: VoteTransaction): void {
    this.pendingVotes.push(vote);
  }

  public minePendingVotes(): void {
    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingVotes,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);
    this.pendingVotes = [];
  }

  public isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if current block's hash is correct
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.error(`Block ${i} has invalid hash`);
        return false;
      }

      // Check if current block points to the correct previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`Block ${i} has invalid previousHash`);
        return false;
      }
    }
    return true;
  }

  public getVotesForPoll(pollId: string): VoteTransaction[] {
    const votes: VoteTransaction[] = [];
    for (const block of this.chain) {
      for (const vote of block.votes) {
        if (vote.pollId === pollId) {
          votes.push(vote);
        }
      }
    }
    return votes;
  }

  public getVoteCountsForPoll(pollId: string): Record<string, number> {
    const counts: Record<string, number> = {};
    const votes = this.getVotesForPoll(pollId);
    for (const vote of votes) {
      counts[vote.optionId] = (counts[vote.optionId] || 0) + 1;
    }
    return counts;
  }
}
