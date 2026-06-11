import { SHA256 } from 'crypto-js';

export interface VoteTransaction {
  pollId: string;
  optionId: string;
  userIdHash: string;
  timestamp: number;
}

export class Block {
  public index: number;
  public timestamp: number;
  public votes: VoteTransaction[];
  public previousHash: string;
  public nonce: number;
  public hash: string;

  constructor(index: number, timestamp: number, votes: VoteTransaction[], previousHash: string = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.votes = votes;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  public calculateHash(): string {
    const data = this.index + this.previousHash + this.timestamp + JSON.stringify(this.votes) + this.nonce;
    return SHA256(data).toString();
  }

  public mineBlock(difficulty: number): void {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }
}
