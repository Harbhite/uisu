/**
 * Recommendation Service for Academic Bank
 * Handles smart resource recommendations based on user interactions and metadata
 */

import { supabase as _sb } from '@/integrations/supabase/client';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = _sb;
import { ResourceRecommendation, ResourceInteraction, AcademicResourceExtended } from '@/types/academicbank';

/**
 * Track user interaction with a resource
 */
export const trackResourceInteraction = async (
  resourceId: string,
  interactionType: 'view' | 'download' | 'bookmark',
  sessionId?: string
): Promise<ResourceInteraction | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('resource_interactions')
      .insert({
        user_id: user.id,
        resource_id: resourceId,
        interaction_type: interactionType,
        session_id: sessionId || `session_${Date.now()}`
      })
      .select()
      .single();

    if (error) throw error;
    return data as ResourceInteraction;
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return null;
  }
};

/**
 * Get recommendations for a specific resource
 * Returns resources that are frequently accessed together
 */
export const getRecommendationsForResource = async (
  resourceId: string,
  limit: number = 5
): Promise<ResourceRecommendation[]> => {
  try {
    const { data, error } = await supabase
      .from('resource_recommendations')
      .select('*')
      .eq('resource_id', resourceId)
      .order('co_interaction_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as ResourceRecommendation[];
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

/**
 * Get personalized recommendations for the current user
 * Based on their download/view history
 */
export const getPersonalizedRecommendations = async (
  limit: number = 10
): Promise<AcademicResourceExtended[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get user's interaction history
    const { data: interactions, error: interactionError } = await supabase
      .from('resource_interactions')
      .select('resource_id')
      .eq('user_id', user.id)
      .eq('interaction_type', 'download')
      .order('created_at', { ascending: false })
      .limit(10);

    if (interactionError) throw interactionError;

    if (!interactions || interactions.length === 0) {
      // Return trending resources if no history
      return getTrendingResources(limit);
    }

    const resourceIds = interactions.map(i => i.resource_id);

    // Get resources with similar metadata
    const { data: recommendations, error: recError } = await supabase
      .from('academic_resources')
      .select('*')
      .in('course_code', 
        (await supabase
          .from('academic_resources')
          .select('course_code')
          .in('id', resourceIds)
          .then(r => r.data?.map(d => d.course_code) || [])
        ) as string[]
      )
      .neq('id', resourceIds[0]) // Exclude already viewed
      .order('view_count', { ascending: false })
      .limit(limit);

    if (recError) throw recError;
    return (recommendations || []) as AcademicResourceExtended[];
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    return [];
  }
};

/**
 * Get trending resources based on view count
 */
export const getTrendingResources = async (
  limit: number = 10,
  timeframeHours: number = 168 // 1 week
): Promise<AcademicResourceExtended[]> => {
  try {
    const cutoffDate = new Date(Date.now() - timeframeHours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('academic_resources')
      .select('*')
      .gt('created_at', cutoffDate)
      .neq('resource_type', 'folder')
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as AcademicResourceExtended[];
  } catch (error) {
    console.error('Error fetching trending resources:', error);
    return [];
  }
};

/**
 * Get resources by similar course code or faculty
 */
export const getRelatedResources = async (
  resource: AcademicResourceExtended,
  limit: number = 5
): Promise<AcademicResourceExtended[]> => {
  try {
    let query = supabase
      .from('academic_resources')
      .select('*')
      .neq('id', resource.id)
      .neq('resource_type', 'folder');

    // Filter by course code first
    if (resource.course_code) {
      query = query.eq('course_code', resource.course_code);
    } else if (resource.level && resource.faculty) {
      // Fall back to level and faculty
      query = query
        .eq('level', resource.level)
        .eq('faculty', resource.faculty);
    }

    const { data, error } = await query
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as AcademicResourceExtended[];
  } catch (error) {
    console.error('Error fetching related resources:', error);
    return [];
  }
};

/**
 * Get co-downloaded resources
 * Resources that are frequently downloaded together
 */
export const getCoDownloadedResources = async (
  resourceId: string,
  limit: number = 5
): Promise<AcademicResourceExtended[]> => {
  try {
    // Get users who downloaded this resource
    const { data: downloaders, error: downloadError } = await supabase
      .from('resource_interactions')
      .select('user_id')
      .eq('resource_id', resourceId)
      .eq('interaction_type', 'download')
      .limit(100);

    if (downloadError) throw downloadError;
    if (!downloaders || downloaders.length === 0) return [];

    const userIds = downloaders.map(d => d.user_id);

    // Get other resources downloaded by these users
    const { data: coDownloads, error: coError } = await supabase
      .from('resource_interactions')
      .select('resource_id')
      .in('user_id', userIds)
      .neq('resource_id', resourceId)
      .eq('interaction_type', 'download');

    if (coError) throw coError;
    if (!coDownloads || coDownloads.length === 0) return [];

    // Count occurrences and get top resources
    const resourceCounts = coDownloads.reduce((acc, item) => {
      acc[item.resource_id] = (acc[item.resource_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topResourceIds = (Object.entries(resourceCounts) as [string, number][])
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);

    const { data: resources, error: resError } = await supabase
      .from('academic_resources')
      .select('*')
      .in('id', topResourceIds);

    if (resError) throw resError;
    return (resources || []) as AcademicResourceExtended[];
  } catch (error) {
    console.error('Error fetching co-downloaded resources:', error);
    return [];
  }
};

/**
 * Update view count for a resource
 */
export const incrementViewCount = async (resourceId: string): Promise<void> => {
  try {
    const { data: resource } = await supabase
      .from('academic_resources')
      .select('view_count')
      .eq('id', resourceId)
      .single();

    const newCount = (resource?.view_count || 0) + 1;

    await supabase
      .from('academic_resources')
      .update({ view_count: newCount })
      .eq('id', resourceId);
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

/**
 * Get user's download history
 */
export const getUserDownloadHistory = async (
  limit: number = 20
): Promise<AcademicResourceExtended[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: interactions, error: intError } = await supabase
      .from('resource_interactions')
      .select('resource_id')
      .eq('user_id', user.id)
      .eq('interaction_type', 'download')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (intError) throw intError;
    if (!interactions || interactions.length === 0) return [];

    const resourceIds = interactions.map(i => i.resource_id);

    const { data: resources, error: resError } = await supabase
      .from('academic_resources')
      .select('*')
      .in('id', resourceIds);

    if (resError) throw resError;
    return (resources || []) as AcademicResourceExtended[];
  } catch (error) {
    console.error('Error fetching download history:', error);
    return [];
  }
};
