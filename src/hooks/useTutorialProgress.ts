import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTutorialProgress = (tutorialId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tutorial-progress', tutorialId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tutorial_progress')
        .select('*')
        .eq('tutorial_id', tutorialId)
        .eq('user_id', user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && !!tutorialId,
  });
};

export const useMarkModuleComplete = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tutorialId, moduleId }: { tutorialId: string; moduleId: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('tutorial_progress')
        .insert({ user_id: user.id, tutorial_id: tutorialId, module_id: moduleId });
      if (error && error.code !== '23505') throw error; // ignore duplicate
    },
    onSuccess: (_, { tutorialId }) => {
      queryClient.invalidateQueries({ queryKey: ['tutorial-progress', tutorialId] });
      queryClient.invalidateQueries({ queryKey: ['all-tutorial-progress'] });
    },
  });
};

export const useAllTutorialProgress = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['all-tutorial-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tutorial_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
};
