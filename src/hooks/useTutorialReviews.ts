import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TutorialReview {
  id: string;
  user_id: string;
  tutorial_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export const useTutorialReviews = (tutorialId: string) => {
  return useQuery({
    queryKey: ['tutorial-reviews', tutorialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutorial_reviews')
        .select('*')
        .eq('tutorial_id', tutorialId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as TutorialReview[];
    },
    enabled: !!tutorialId,
  });
};

export const useSubmitReview = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tutorialId, rating, comment }: { tutorialId: string; rating: number; comment: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('tutorial_reviews')
        .upsert(
          { user_id: user.id, tutorial_id: tutorialId, rating, comment, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,tutorial_id' as any }
        );
      if (error) throw error;
    },
    onSuccess: (_, { tutorialId }) => {
      queryClient.invalidateQueries({ queryKey: ['tutorial-reviews', tutorialId] });
      queryClient.invalidateQueries({ queryKey: ['tutorial', tutorialId] });
    },
  });
};
