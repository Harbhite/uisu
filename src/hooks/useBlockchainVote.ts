import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlockchainVoteResponse {
  success: boolean;
  blockHash: string;
  blockIndex: number;
}

export const useBlockchainVote = () => {
  const [voting, setVoting] = useState(false);
  const [blockchainData, setBlockchainData] = useState<BlockchainVoteResponse | null>(null);

  const submitBlockchainVote = async (
    pollId: string,
    optionId: string,
    userId: string
  ): Promise<BlockchainVoteResponse | null> => {
    setVoting(true);
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-vote', {
        body: { pollId, optionId, userId },
      });

      if (error) throw error;

      setBlockchainData(data as BlockchainVoteResponse);
      toast.success(`Vote recorded on blockchain (Block #${data.blockIndex})`);
      return data as BlockchainVoteResponse;
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit blockchain vote');
      return null;
    } finally {
      setVoting(false);
    }
  };

  return { submitBlockchainVote, voting, blockchainData };
};
