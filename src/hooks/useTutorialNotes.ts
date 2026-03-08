import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTutorialNote = (moduleId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tutorial-note', moduleId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('tutorial_notes' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!moduleId,
  });
};

export const useSaveNote = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ moduleId, tutorialId, content }: { moduleId: string; tutorialId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('tutorial_notes' as any)
        .upsert(
          { user_id: user.id, module_id: moduleId, tutorial_id: tutorialId, content, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,module_id' }
        );
      if (error) throw error;
    },
    onSuccess: (_, { moduleId }) => {
      queryClient.invalidateQueries({ queryKey: ['tutorial-note', moduleId] });
    },
  });
};
