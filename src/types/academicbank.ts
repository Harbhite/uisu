/**
 * Types for Advanced Academic Bank Features
 * Includes filtering, OCR, recommendations, and interactions
 */

export type AcademicLevel = '100L' | '200L' | '300L' | '400L' | '500L';
export type Semester = '1st' | '2nd' | 'Annual';
export type InteractionType = 'view' | 'download' | 'bookmark';
export type OCRStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Extended Academic Resource with filtering and OCR metadata
 */
export interface AcademicResourceExtended {
  id: string;
  name: string;
  resource_type: string;
  parent_id: string | null;
  file_url: string | null;
  file_size: string | null;
  owner: string | null;
  created_at: string | null;
  updated_at: string | null;
  download_count?: number;
  view_count?: number;
  
  // Filtering metadata
  faculty?: string;
  department?: string;
  level?: AcademicLevel;
  semester?: Semester;
  course_code?: string;
  course_title?: string;
  
  // OCR and searchable content
  ocr_text?: string;
  has_ocr?: boolean;
  ocr_status?: OCRStatus;
  
  // Recommendations
  co_download_count?: number;
  related_resources?: string[];
}

/**
 * Filter criteria for advanced search
 */
export interface FilterCriteria {
  faculty?: string;
  department?: string;
  level?: AcademicLevel;
  semester?: Semester;
  courseCode?: string;
  searchQuery?: string;
  sortBy?: 'name' | 'date' | 'downloads' | 'views';
  sortOrder?: 'asc' | 'desc';
}

/**
 * User interaction with resources
 */
export interface ResourceInteraction {
  id: string;
  user_id: string;
  resource_id: string;
  interaction_type: InteractionType;
  created_at: string;
  session_id?: string;
}

/**
 * OCR Job for async processing
 */
export interface OCRJob {
  id: string;
  resource_id: string;
  status: JobStatus;
  extracted_text?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

/**
 * Recommendation result
 */
export interface ResourceRecommendation {
  resource_id: string;
  related_resource_id: string;
  co_interaction_count: number;
  related_resource_name: string;
  related_course_code?: string;
}

/**
 * Faculties at University of Ibadan
 */
export const FACULTIES = [
  'General Studies (GES)',
  'Faculty of Agriculture',
  'Faculty of Arts',
  'Faculty of Clinical Sciences',
  'Faculty of Dentistry',
  'Faculty of Education',
  'Faculty of Law',
  'Faculty of Pharmacy',
  'Faculty of Public Health',
  'Faculty of Renewable Natural Resources',
  'Faculty of Science',
  'Faculty of Social Sciences',
  'Faculty of Technology',
  'Faculty of Veterinary Medicine'
];

/**
 * Academic levels
 */
export const ACADEMIC_LEVELS: AcademicLevel[] = ['100L', '200L', '300L', '400L', '500L'];

/**
 * Semesters
 */
export const SEMESTERS: Semester[] = ['1st', '2nd', 'Annual'];
