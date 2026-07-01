/**
 * Filter Service for Academic Bank
 * Handles advanced filtering and search operations
 */

import { supabase as _sb } from '@/integrations/supabase/client';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = _sb;
import { FilterCriteria, AcademicResourceExtended } from '@/types/academicbank';

/**
 * Apply advanced filters to resources
 */
export const applyAdvancedFilters = async (
  filters: FilterCriteria
): Promise<AcademicResourceExtended[]> => {
  try {
    let query = supabase
      .from('academic_resources')
      .select('*')
      .neq('resource_type', 'folder'); // Exclude folders from results

    // Apply faculty filter
    if (filters.faculty) {
      query = query.eq('faculty', filters.faculty);
    }

    // Apply department filter
    if (filters.department) {
      query = query.eq('department', filters.department);
    }

    // Apply level filter
    if (filters.level) {
      query = query.eq('level', filters.level);
    }

    // Apply semester filter
    if (filters.semester) {
      query = query.eq('semester', filters.semester);
    }

    // Apply course code filter
    if (filters.courseCode) {
      query = query.ilike('course_code', `%${filters.courseCode}%`);
    }

    // Apply search query (searches name and OCR text)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery.toLowerCase();
      query = query.or(
        `name.ilike.%${searchTerm}%,ocr_text.ilike.%${searchTerm}%,course_code.ilike.%${searchTerm}%`
      );
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'asc';
    const ascending = sortOrder === 'asc';

    switch (sortBy) {
      case 'date':
        query = query.order('created_at', { ascending });
        break;
      case 'downloads':
        query = query.order('download_count', { ascending });
        break;
      case 'views':
        query = query.order('view_count', { ascending });
        break;
      case 'name':
      default:
        query = query.order('name', { ascending });
        break;
    }

    const { data, error } = await query.limit(500);

    if (error) throw error;
    return (data || []) as AcademicResourceExtended[];
  } catch (error) {
    console.error('Error applying filters:', error);
    return [];
  }
};

/**
 * Get available departments for a faculty
 */
export const getDepartmentsForFaculty = async (
  faculty: string
): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('academic_resources')
      .select('department')
      .eq('faculty', faculty)
      .neq('department', null)
      .order('department', { ascending: true });

    if (error) throw error;

    // Get unique departments
    const departments = [...new Set((data || []).map(d => d.department).filter(Boolean))];
    return departments as string[];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

/**
 * Get available course codes for a faculty/level combination
 */
export const getCoursesForFilter = async (
  faculty?: string,
  level?: string
): Promise<{ code: string; title?: string }[]> => {
  try {
    let query = supabase
      .from('academic_resources')
      .select('course_code, course_title')
      .neq('course_code', null);

    if (faculty) {
      query = query.eq('faculty', faculty);
    }

    if (level) {
      query = query.eq('level', level);
    }

    const { data, error } = await query.order('course_code', { ascending: true });

    if (error) throw error;

    // Get unique courses
    const courseMap = new Map<string, string>();
    (data || []).forEach(item => {
      if (item.course_code && !courseMap.has(item.course_code)) {
        courseMap.set(item.course_code, item.course_title || '');
      }
    });

    return Array.from(courseMap.entries()).map(([code, title]) => ({
      code,
      title: title || undefined
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

/**
 * Get filter statistics (count of resources for each filter option)
 */
export const getFilterStatistics = async (): Promise<{
  byFaculty: Record<string, number>;
  byLevel: Record<string, number>;
  bySemester: Record<string, number>;
}> => {
  try {
    const { data, error } = await supabase
      .from('academic_resources')
      .select('faculty, level, semester')
      .neq('resource_type', 'folder');

    if (error) throw error;

    const stats = {
      byFaculty: {} as Record<string, number>,
      byLevel: {} as Record<string, number>,
      bySemester: {} as Record<string, number>
    };

    (data || []).forEach(item => {
      if (item.faculty) {
        stats.byFaculty[item.faculty] = (stats.byFaculty[item.faculty] || 0) + 1;
      }
      if (item.level) {
        stats.byLevel[item.level] = (stats.byLevel[item.level] || 0) + 1;
      }
      if (item.semester) {
        stats.bySemester[item.semester] = (stats.bySemester[item.semester] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching filter statistics:', error);
    return {
      byFaculty: {},
      byLevel: {},
      bySemester: {}
    };
  }
};

/**
 * Save filter preset for user
 */
export const saveFilterPreset = async (
  presetName: string,
  filters: FilterCriteria
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Store in localStorage as a simple implementation
    const presets = JSON.parse(localStorage.getItem('academicbank_filter_presets') || '{}');
    presets[presetName] = filters;
    localStorage.setItem('academicbank_filter_presets', JSON.stringify(presets));

    return true;
  } catch (error) {
    console.error('Error saving filter preset:', error);
    return false;
  }
};

/**
 * Get saved filter presets
 */
export const getFilterPresets = (): Record<string, FilterCriteria> => {
  try {
    return JSON.parse(localStorage.getItem('academicbank_filter_presets') || '{}');
  } catch (error) {
    console.error('Error loading filter presets:', error);
    return {};
  }
};

/**
 * Delete filter preset
 */
export const deleteFilterPreset = async (presetName: string): Promise<boolean> => {
  try {
    const presets = JSON.parse(localStorage.getItem('academicbank_filter_presets') || '{}');
    delete presets[presetName];
    localStorage.setItem('academicbank_filter_presets', JSON.stringify(presets));
    return true;
  } catch (error) {
    console.error('Error deleting filter preset:', error);
    return false;
  }
};

/**
 * Perform full-text search across all resources
 */
export const performFullTextSearch = async (
  query: string,
  limit: number = 50
): Promise<AcademicResourceExtended[]> => {
  try {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('academic_resources')
      .select('*')
      .or(
        `name.ilike.%${query}%,` +
        `ocr_text.ilike.%${query}%,` +
        `course_code.ilike.%${query}%,` +
        `course_title.ilike.%${query}%`
      )
      .neq('resource_type', 'folder')
      .order('name', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []) as AcademicResourceExtended[];
  } catch (error) {
    console.error('Error performing full-text search:', error);
    return [];
  }
};
