import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { offlineDb } from '@/lib/tutorials-db';
import { useEffect, useState } from 'react';

// Forced offline mode as requested for sql.js backend
const useOnlineStatus = () => false;

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
  tutor?: Tutor;
  modules?: TutorialModule[]; // Optional for list views
}

export interface TutorialModule {
  id: string;
  tutorial_id: string;
  section_title: string;
  title: string;
  type: 'Video' | 'Audio' | 'Text' | 'Essay';
  content: string | null;
  duration: string | null;
  sort_order: number;
  is_locked: boolean;
}

export interface TutorApplication {
  id: string;
  user_id: string;
  name: string;
  bio: string;
  expertise: string[];
  portfolio_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// --- Hooks ---

export const useTutors = () => {
  const isOnline = useOnlineStatus();
  return useQuery({
    queryKey: ['tutors'],
    queryFn: async () => isOnline ? [] : await offlineDb.getTutors(),
  });
};

export const useTutor = (id: string) => {
  const isOnline = useOnlineStatus();
  return useQuery({
    queryKey: ['tutor', id],
    queryFn: async () => isOnline ? null : await offlineDb.getTutor(id),
    enabled: !!id,
  });
};

export const useTutorials = (filters?: { format?: string; level?: string; search?: string; tutorId?: string }) => {
  const isOnline = useOnlineStatus();
  return useQuery({
    queryKey: ['tutorials', filters],
    queryFn: async () => isOnline ? [] : await offlineDb.getTutorials(filters),
  });
};

export const useAllTutorials = (filters?: { search?: string; status?: string }) => {
  const isOnline = useOnlineStatus();
  return useQuery({
    queryKey: ['all-tutorials', filters],
    queryFn: async () => {
      if (isOnline) return [];
      const all = await offlineDb.getTutorials({ ...filters, includeUnapproved: true });
      if (filters?.status === 'pending') return all.filter(t => !t.is_approved);
      return all;
    }
  });
};

export const useTutorial = (id: string) => {
  const isOnline = useOnlineStatus();
  return useQuery({
    queryKey: ['tutorial', id],
    queryFn: async () => {
      if (isOnline) return null;
      const tutorial = await offlineDb.getTutorial(id);
      if (!tutorial) return null;
      const modules = await offlineDb.getModules(id);
      const tutor = await offlineDb.getTutor(tutorial.tutor_id);
      return { ...tutorial, modules, tutor } as Tutorial;
    },
    enabled: !!id,
  });
};

export const useCreateTutorial = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  return useMutation({
    mutationFn: async ({ tutorial, modules }: { tutorial: Partial<Tutorial>; modules: { title: string; section_title?: string; type: string; content?: string; duration?: string; sort_order: number }[] }) => {
      if (isOnline) throw new Error("Online creation not supported yet");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newTutorial = await offlineDb.createTutorial(tutorial as any);
      for (const module of modules) {
        await offlineDb.createModule(crypto.randomUUID(), newTutorial.id, module);
      }
      return newTutorial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['all-tutorials'] });
    }
  });
};

export const useUpdateTutorialStatus = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  return useMutation({
    mutationFn: async ({ id, isPublished, isApproved }: { id: string; isPublished: boolean; isApproved: boolean }) => {
      if (isOnline) throw new Error("Online update not supported");
      await offlineDb.updateTutorialStatus(id, isPublished, isApproved);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['all-tutorials'] });
    }
  });
};

export const useEnrollmentStatus = (tutorialId: string, userId?: string) => {
  const isOnline = useOnlineStatus();
  return useQuery({
    queryKey: ['enrollment-status', tutorialId, userId],
    queryFn: async () => (!userId || isOnline) ? false : await offlineDb.isEnrolled(userId, tutorialId),
    enabled: !!tutorialId && !!userId,
  });
};

export const useEnroll = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  return useMutation({
    mutationFn: async ({ tutorialId, userId }: { tutorialId: string; userId: string }) => {
      if (isOnline) throw new Error("Online mode not supported");
      return await offlineDb.enroll(userId, tutorialId);
    },
    onSuccess: (_, { tutorialId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-status', tutorialId, userId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', userId] });
      queryClient.invalidateQueries({ queryKey: ['tutorial', tutorialId] });
    },
  });
};

export const useUserEnrollments = (userId?: string) => {
  const isOnline = useOnlineStatus();
  return useQuery({
    queryKey: ['enrollments', userId],
    queryFn: async () => (!userId || isOnline) ? [] : await offlineDb.getEnrollments(userId),
    enabled: !!userId,
  });
};

export const useProgress = (tutorialId: string, userId?: string) => {
  const isOnline = useOnlineStatus();
  return useQuery({
    queryKey: ['progress', tutorialId, userId],
    queryFn: async () => (!userId || isOnline) ? [] : await offlineDb.getProgress(userId, tutorialId),
    enabled: !!tutorialId && !!userId,
  });
};

export const useMarkComplete = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  return useMutation({
    mutationFn: async ({ moduleId, tutorialId, userId }: { moduleId: string; tutorialId: string; userId: string }) => {
      if (isOnline) throw new Error("Online mode not supported");
      return await offlineDb.markModuleComplete(userId, moduleId, tutorialId);
    },
    onSuccess: (_, { tutorialId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['progress', tutorialId, userId] });
    },
  });
};

export const useUserBookmarks = (userId?: string) => {
  const isOnline = useOnlineStatus();
  return useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: async () => (!userId || isOnline) ? [] : await offlineDb.getBookmarks(userId),
    enabled: !!userId,
  });
};

// Tutor Applications
export const useTutorApplications = (status?: string) => {
  const isOnline = useOnlineStatus();
  return useQuery({
    queryKey: ['tutor-applications', status],
    queryFn: async () => isOnline ? [] : await offlineDb.getAllTutorApplications(status),
  });
};

export const useUpdateTutorApplication = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (isOnline) throw new Error("Online mode not supported");
      await offlineDb.updateTutorApplicationStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-applications'] });
      queryClient.invalidateQueries({ queryKey: ['tutors'] });
    }
  });
};

// Add Missing Hooks
export const useBookmarkStatus = (tutorialId: string, userId?: string) => {
  const isOnline = useOnlineStatus();
  return useQuery({
    queryKey: ['bookmark-status', tutorialId, userId],
    queryFn: async () => (!userId || isOnline) ? false : await offlineDb.isBookmarked(userId, tutorialId),
    enabled: !!tutorialId && !!userId,
  });
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  return useMutation({
    mutationFn: async ({ tutorialId, userId }: { tutorialId: string; userId: string }) => {
      if (isOnline) throw new Error("Online mode not supported");
      return await offlineDb.toggleBookmark(userId, tutorialId);
    },
    onSuccess: (_, { tutorialId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['bookmark-status', tutorialId, userId] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks', userId] });
    },
  });
};

export const useReviews = (tutorialId: string) => {
  const isOnline = useOnlineStatus();
  return useQuery({
    queryKey: ['reviews', tutorialId],
    queryFn: async () => isOnline ? [] : await offlineDb.getReviews(tutorialId),
    enabled: !!tutorialId,
  });
};

export const useAddReview = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  return useMutation({
    mutationFn: async ({ tutorialId, userId, rating, comment, userName }: { tutorialId: string; userId: string; rating: number; comment?: string; userName?: string }) => {
      if (isOnline) throw new Error("Online mode not supported");
      return await offlineDb.addReview(userId, tutorialId, rating, comment, userName);
    },
    onSuccess: (_, { tutorialId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', tutorialId] });
      queryClient.invalidateQueries({ queryKey: ['tutorial', tutorialId] });
    },
  });
};
