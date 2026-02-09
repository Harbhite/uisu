import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DBTutor {
  id: string;
  name: string;
  tier: 'Official' | 'Verified' | 'Community';
  bio: string | null;
  avatar: string | null;
  courses_count: number | null;
  students_count: number | null;
  rating: number | null;
  is_verified: boolean | null;
}

export interface DBModule {
  id: string;
  title: string;
  type: 'Video' | 'Audio' | 'Text' | 'Essay';
  content: string | null;
  duration: string | null;
  sort_order: number | null;
  is_locked: boolean | null;
}

export interface DBTutorial {
  id: string;
  title: string;
  description: string | null;
  tutor_id: string;
  format: 'Video' | 'Audio' | 'Text' | 'Essay';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  cover_image: string | null;
  tags: string[] | null;
  rating: number | null;
  students_count: number | null;
  is_published: boolean | null;
  is_approved: boolean | null;
  created_at: string | null;
  modules?: DBModule[];
}

export const useTutors = () => {
  return useQuery({
    queryKey: ['tutors'],
    queryFn: async (): Promise<DBTutor[]> => {
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .order('tier', { ascending: true });
      if (error) throw error;
      return (data ?? []) as DBTutor[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTutor = (id: string) => {
  return useQuery({
    queryKey: ['tutor', id],
    queryFn: async (): Promise<DBTutor | null> => {
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as DBTutor | null;
    },
    enabled: !!id,
  });
};

export const useTutorials = () => {
  return useQuery({
    queryKey: ['tutorials'],
    queryFn: async (): Promise<DBTutorial[]> => {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .eq('is_published', true)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as DBTutorial[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTutorial = (id: string) => {
  return useQuery({
    queryKey: ['tutorial', id],
    queryFn: async (): Promise<(DBTutorial & { modules: DBModule[] }) | null> => {
      const { data: tutorial, error } = await supabase
        .from('tutorials')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!tutorial) return null;

      const { data: modules, error: modError } = await supabase
        .from('tutorial_modules')
        .select('*')
        .eq('tutorial_id', id)
        .order('sort_order', { ascending: true });
      if (modError) throw modError;

      return {
        ...(tutorial as DBTutorial),
        modules: (modules ?? []) as DBModule[],
      };
    },
    enabled: !!id,
  });
};

export const useTutorTutorials = (tutorId: string) => {
  return useQuery({
    queryKey: ['tutor-tutorials', tutorId],
    queryFn: async (): Promise<DBTutorial[]> => {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as DBTutorial[];
    },
    enabled: !!tutorId,
  });
};
