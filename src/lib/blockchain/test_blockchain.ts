import { Blockchain } from './Blockchain';
import { VoteTransaction } from './Block';

const uisuBlockchain = new Blockchain();

console.log('Mining block 1...');
const vote1: VoteTransaction = {
  pollId: 'poll-123',
  optionId: 'option-A',
  userIdHash: 'user-hash-1',
  timestamp: Date.now()
};
uisuBlockchain.addVote(vote1);
uisuBlockchain.minePendingVotes();

console.log('Mining block 2...');
const vote2: VoteTransaction = {
  pollId: 'poll-123',
  optionId: 'option-B',
  userIdHash: 'user-hash-2',
  timestamp: Date.now()
};
const vote3: VoteTransaction = {
  pollId: 'poll-456',
  optionId: 'option-X',
  userIdHash: 'user-hash-3',
  timestamp: Date.now()
};
uisuBlockchain.addVote(vote2);
uisuBlockchain.addVote(vote3);
uisuBlockchain.minePendingVotes();

console.log('Blockchain valid:', uisuBlockchain.isChainValid());

console.log('Votes for poll-123:', uisuBlockchain.getVotesForPoll('poll-123'));
console.log('Vote counts for poll-123:', uisuBlockchain.getVoteCountsForPoll('poll-123'));

// Attempt tampering
console.log('\n--- Tampering Attempt ---');
uisuBlockchain.chain[1].votes[0].optionId = 'tampered-option';
console.log('Blockchain valid after tampering:', uisuBlockchain.isChainValid());
