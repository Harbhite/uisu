import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { offlineDb } from '@/lib/tutorials-db';
import { useEffect, useState } from 'react';

// Check if online
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

// Types matching our database schema
export interface Tutor {
  id: string;
  user_id: string | null;
  name: string;
  tier: 'Official' | 'Verified' | 'Community';
  bio: string | null;
  avatar: string | null;
  courses_count: number;
  students_count: number;
  rating: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  tutor_id: string;
  format: 'Video' | 'Audio' | 'Text' | 'Essay';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  cover_image: string | null;
  tags: string[];
  rating: number;
  ratings_count: number;
  students_count: number;
  is_published: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  tutor?: Tutor;
}

export interface TutorialModule {
  id: string;
  tutorial_id: string;
  title: string;
  type: 'Video' | 'Audio' | 'Text' | 'Essay';
  content: string | null;
  duration: string | null;
  sort_order: number;
  is_locked: boolean;
  created_at: string;
}

export interface TutorialEnrollment {
  id: string;
  user_id: string;
  tutorial_id: string;
  enrolled_at: string;
  completed_at: string | null;
}

export interface TutorialProgress {
  id: string;
  user_id: string;
  module_id: string;
  tutorial_id: string;
  completed_at: string;
}

export interface TutorialReview {
  id: string;
  user_id: string;
  tutorial_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface TutorialBookmark {
  id: string;
  user_id: string;
  tutorial_id: string;
  created_at: string;
}

// Hook to fetch all tutors
export const useTutors = () => {
  const isOnline = useOnlineStatus();
  
  return useQuery({
    queryKey: ['tutors'],
    queryFn: async () => {
      if (!isOnline) {
        return await offlineDb.getTutors();
      }
      
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .order('tier', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Tutor[];
    },
  });
};

// Hook to fetch single tutor
export const useTutor = (id: string) => {
  const isOnline = useOnlineStatus();
  
  return useQuery({
    queryKey: ['tutor', id],
    queryFn: async () => {
      if (!isOnline) {
        return await offlineDb.getTutor(id);
      }
      
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Tutor | null;
    },
    enabled: !!id,
  });
};

// Hook to fetch tutorials with filters
export const useTutorials = (filters?: { format?: string; level?: string; search?: string; tutorId?: string }) => {
  const isOnline = useOnlineStatus();
  
  return useQuery({
    queryKey: ['tutorials', filters],
    queryFn: async () => {
      if (!isOnline) {
        return await offlineDb.getTutorials(filters);
      }
      
      let query = supabase
        .from('tutorials')
        .select('*, tutor:tutors(*)')
        .eq('is_published', true)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (filters?.format) {
        query = query.eq('format', filters.format as 'Video' | 'Audio' | 'Text' | 'Essay');
      }
      if (filters?.level) {
        query = query.eq('level', filters.level as 'Beginner' | 'Intermediate' | 'Advanced');
      }
      if (filters?.tutorId) {
        query = query.eq('tutor_id', filters.tutorId);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Tutorial[];
    },
  });
};

// Hook to fetch single tutorial with modules
export const useTutorial = (id: string) => {
  const isOnline = useOnlineStatus();
  
  return useQuery({
    queryKey: ['tutorial', id],
    queryFn: async () => {
      if (!isOnline) {
        const tutorial = await offlineDb.getTutorial(id);
        if (!tutorial) return null;
        const modules = await offlineDb.getModules(id);
        const tutor = await offlineDb.getTutor(tutorial.tutor_id);
        return { ...tutorial, modules, tutor };
      }
      
      const { data: tutorial, error } = await supabase
        .from('tutorials')
        .select('*, tutor:tutors(*)')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      if (!tutorial) return null;
      
      const { data: modules } = await supabase
        .from('tutorial_modules')
        .select('*')
        .eq('tutorial_id', id)
        .order('sort_order', { ascending: true });
      
      return { ...tutorial, modules: modules || [] } as Tutorial & { modules: TutorialModule[] };
    },
    enabled: !!id,
  });
};

// Hook to fetch tutorial modules
export const useTutorialModules = (tutorialId: string) => {
  const isOnline = useOnlineStatus();
  
  return useQuery({
    queryKey: ['tutorial-modules', tutorialId],
    queryFn: async () => {
      if (!isOnline) {
        return await offlineDb.getModules(tutorialId);
      }
      
      const { data, error } = await supabase
        .from('tutorial_modules')
        .select('*')
        .eq('tutorial_id', tutorialId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as TutorialModule[];
    },
    enabled: !!tutorialId,
  });
};

// Hook to check enrollment status
export const useEnrollmentStatus = (tutorialId: string, userId?: string) => {
  const isOnline = useOnlineStatus();
  
  return useQuery({
    queryKey: ['enrollment-status', tutorialId, userId],
    queryFn: async () => {
      if (!userId) return false;
      
      if (!isOnline) {
        return await offlineDb.isEnrolled(userId, tutorialId);
      }
      
      const { data } = await supabase
        .from('tutorial_enrollments')
        .select('id')
        .eq('tutorial_id', tutorialId)
        .eq('user_id', userId)
        .maybeSingle();
      
      return !!data;
    },
    enabled: !!tutorialId && !!userId,
  });
};

// Hook to enroll in a tutorial
export const useEnroll = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  
  return useMutation({
    mutationFn: async ({ tutorialId, userId }: { tutorialId: string; userId: string }) => {
      if (!isOnline) {
        return await offlineDb.enroll(userId, tutorialId);
      }
      
      const { data, error } = await supabase
        .from('tutorial_enrollments')
        .insert({ tutorial_id: tutorialId, user_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { tutorialId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-status', tutorialId, userId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', userId] });
      queryClient.invalidateQueries({ queryKey: ['tutorial', tutorialId] });
    },
  });
};

// Hook to unenroll from a tutorial
export const useUnenroll = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  
  return useMutation({
    mutationFn: async ({ tutorialId, userId }: { tutorialId: string; userId: string }) => {
      if (!isOnline) {
        await offlineDb.unenroll(userId, tutorialId);
        return;
      }
      
      const { error } = await supabase
        .from('tutorial_enrollments')
        .delete()
        .eq('tutorial_id', tutorialId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, { tutorialId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-status', tutorialId, userId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', userId] });
      queryClient.invalidateQueries({ queryKey: ['tutorial', tutorialId] });
    },
  });
};

// Hook to get user enrollments
export const useUserEnrollments = (userId?: string) => {
  const isOnline = useOnlineStatus();
  
  return useQuery({
    queryKey: ['enrollments', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      if (!isOnline) {
        return await offlineDb.getEnrollments(userId);
      }
      
      const { data, error } = await supabase
        .from('tutorial_enrollments')
        .select('*, tutorial:tutorials(*, tutor:tutors(*))')
        .eq('user_id', userId)
        .order('enrolled_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Hook to get/update progress
export const useProgress = (tutorialId: string, userId?: string) => {
  const isOnline = useOnlineStatus();
  
  return useQuery({
    queryKey: ['progress', tutorialId, userId],
    queryFn: async () => {
      if (!userId) return [];
      
      if (!isOnline) {
        return await offlineDb.getProgress(userId, tutorialId);
      }
      
      const { data, error } = await supabase
        .from('tutorial_progress')
        .select('module_id')
        .eq('tutorial_id', tutorialId)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data.map(p => p.module_id);
    },
    enabled: !!tutorialId && !!userId,
  });
};

// Hook to mark module complete
export const useMarkComplete = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  
  return useMutation({
    mutationFn: async ({ moduleId, tutorialId, userId }: { moduleId: string; tutorialId: string; userId: string }) => {
      if (!isOnline) {
        return await offlineDb.markModuleComplete(userId, moduleId, tutorialId);
      }
      
      const { data, error } = await supabase
        .from('tutorial_progress')
        .upsert({ module_id: moduleId, tutorial_id: tutorialId, user_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { tutorialId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['progress', tutorialId, userId] });
    },
  });
};

// Hook to get reviews
export const useReviews = (tutorialId: string) => {
  const isOnline = useOnlineStatus();
  
  return useQuery({
    queryKey: ['reviews', tutorialId],
    queryFn: async () => {
      if (!isOnline) {
        return await offlineDb.getReviews(tutorialId);
      }
      
      const { data, error } = await supabase
        .from('tutorial_reviews')
        .select('*')
        .eq('tutorial_id', tutorialId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles separately since there's no FK relationship
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(review => ({
        ...review,
        profile: profileMap.get(review.user_id) || null,
      })) as TutorialReview[];
    },
    enabled: !!tutorialId,
  });
};

// Hook to add/update review
export const useAddReview = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  
  return useMutation({
    mutationFn: async ({ tutorialId, userId, rating, comment }: { tutorialId: string; userId: string; rating: number; comment?: string }) => {
      if (!isOnline) {
        return await offlineDb.addReview(userId, tutorialId, rating, comment);
      }
      
      const { data, error } = await supabase
        .from('tutorial_reviews')
        .upsert({ tutorial_id: tutorialId, user_id: userId, rating, comment })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { tutorialId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', tutorialId] });
      queryClient.invalidateQueries({ queryKey: ['tutorial', tutorialId] });
    },
  });
};

// Hook to check bookmark status
export const useBookmarkStatus = (tutorialId: string, userId?: string) => {
  const isOnline = useOnlineStatus();
  
  return useQuery({
    queryKey: ['bookmark-status', tutorialId, userId],
    queryFn: async () => {
      if (!userId) return false;
      
      if (!isOnline) {
        return await offlineDb.isBookmarked(userId, tutorialId);
      }
      
      const { data } = await supabase
        .from('tutorial_bookmarks')
        .select('id')
        .eq('tutorial_id', tutorialId)
        .eq('user_id', userId)
        .maybeSingle();
      
      return !!data;
    },
    enabled: !!tutorialId && !!userId,
  });
};

// Hook to toggle bookmark
export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  
  return useMutation({
    mutationFn: async ({ tutorialId, userId, isBookmarked }: { tutorialId: string; userId: string; isBookmarked: boolean }) => {
      if (!isOnline) {
        return await offlineDb.toggleBookmark(userId, tutorialId);
      }
      
      if (isBookmarked) {
        const { error } = await supabase
          .from('tutorial_bookmarks')
          .delete()
          .eq('tutorial_id', tutorialId)
          .eq('user_id', userId);
        if (error) throw error;
        return false;
      } else {
        const { error } = await supabase
          .from('tutorial_bookmarks')
          .insert({ tutorial_id: tutorialId, user_id: userId });
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (_, { tutorialId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['bookmark-status', tutorialId, userId] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks', userId] });
    },
  });
};

// Hook to get user bookmarks
export const useUserBookmarks = (userId?: string) => {
  const isOnline = useOnlineStatus();
  
  return useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      if (!isOnline) {
        return await offlineDb.getBookmarks(userId);
      }
      
      const { data, error } = await supabase
        .from('tutorial_bookmarks')
        .select('*, tutorial:tutorials(*, tutor:tutors(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Hook to submit tutor application
export const useSubmitTutorApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, name, bio, expertise, portfolioUrl }: { 
      userId: string; 
      name: string; 
      bio: string; 
      expertise: string[]; 
      portfolioUrl?: string 
    }) => {
      const { data, error } = await supabase
        .from('tutor_applications')
        .insert({ user_id: userId, name, bio, expertise, portfolio_url: portfolioUrl })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['tutor-application', userId] });
    },
  });
};

// Hook to get user's tutor application status
export const useTutorApplicationStatus = (userId?: string) => {
  return useQuery({
    queryKey: ['tutor-application', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('tutor_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
