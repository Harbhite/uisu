/**
 * OCR Service for Academic Bank
 * Handles document text extraction via Tesseract.js and backend integration
 */

import { supabase as _sb } from '@/integrations/supabase/client';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = _sb;
import { OCRJob, AcademicResourceExtended } from '@/types/academicbank';

/**
 * Initialize OCR job for a resource
 * This creates a job record in the database for async processing
 */
export const initializeOCRJob = async (resourceId: string): Promise<OCRJob | null> => {
  try {
    const { data, error } = await supabase
      .from('ocr_jobs')
      .insert({
        resource_id: resourceId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data as OCRJob;
  } catch (error) {
    console.error('Error initializing OCR job:', error);
    return null;
  }
};

/**
 * Get OCR status for a resource
 */
export const getOCRStatus = async (resourceId: string): Promise<OCRJob | null> => {
  try {
    const { data, error } = await supabase
      .from('ocr_jobs')
      .select('*')
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data as OCRJob || null;
  } catch (error) {
    console.error('Error fetching OCR status:', error);
    return null;
  }
};

/**
 * Update resource with OCR text and metadata
 */
export const updateResourceWithOCR = async (
  resourceId: string,
  ocrText: string
): Promise<AcademicResourceExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('academic_resources')
      .update({
        ocr_text: ocrText,
        has_ocr: true,
        ocr_status: 'completed'
      })
      .eq('id', resourceId)
      .select()
      .single();

    if (error) throw error;
    return data as AcademicResourceExtended;
  } catch (error) {
    console.error('Error updating resource with OCR:', error);
    return null;
  }
};

/**
 * Mark OCR job as completed
 */
export const completeOCRJob = async (
  jobId: string,
  extractedText: string
): Promise<OCRJob | null> => {
  try {
    const { data, error } = await supabase
      .from('ocr_jobs')
      .update({
        status: 'completed',
        extracted_text: extractedText,
        processed_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return data as OCRJob;
  } catch (error) {
    console.error('Error completing OCR job:', error);
    return null;
  }
};

/**
 * Mark OCR job as failed
 */
export const failOCRJob = async (
  jobId: string,
  errorMessage: string
): Promise<OCRJob | null> => {
  try {
    const { data, error } = await supabase
      .from('ocr_jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        processed_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return data as OCRJob;
  } catch (error) {
    console.error('Error failing OCR job:', error);
    return null;
  }
};

/**
 * Trigger OCR processing for a resource
 * This would typically call a backend function or webhook
 */
export const triggerOCRProcessing = async (resourceId: string, fileUrl: string): Promise<boolean> => {
  try {
    // Initialize the job first
    const job = await initializeOCRJob(resourceId);
    if (!job) return false;

    // In a real implementation, this would trigger a backend service
    // For now, we'll call a hypothetical edge function
    // const { data, error } = await supabase.functions.invoke('process-ocr', {
    //   body: { jobId: job.id, resourceId, fileUrl }
    // });

    console.log('OCR processing triggered for resource:', resourceId);
    return true;
  } catch (error) {
    console.error('Error triggering OCR processing:', error);
    return false;
  }
};

/**
 * Search resources by OCR text
 */
export const searchByOCRText = async (
  query: string,
  limit: number = 20
): Promise<AcademicResourceExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('academic_resources')
      .select('*')
      .or(`ocr_text.ilike.%${query}%,name.ilike.%${query}%`)
      .eq('has_ocr', true)
      .limit(limit);

    if (error) throw error;
    return (data || []) as AcademicResourceExtended[];
  } catch (error) {
    console.error('Error searching OCR text:', error);
    return [];
  }
};

/**
 * Get resources pending OCR processing
 */
export const getPendingOCRJobs = async (limit: number = 50): Promise<OCRJob[]> => {
  try {
    const { data, error } = await supabase
      .from('ocr_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []) as OCRJob[];
  } catch (error) {
    console.error('Error fetching pending OCR jobs:', error);
    return [];
  }
};

/**
 * Extract text from PDF using client-side processing (fallback)
 * This is a simplified version - in production, use a proper library like pdfjs
 */
export const extractTextFromPDF = async (fileUrl: string): Promise<string> => {
  try {
    // This would require pdfjs-dist or similar library
    // For now, returning a placeholder
    console.log('PDF extraction would be performed here for:', fileUrl);
    return 'PDF text extraction not yet implemented';
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '';
  }
};

/**
 * Extract text from image using client-side processing (fallback)
 * This would use Tesseract.js for OCR
 */
export const extractTextFromImage = async (fileUrl: string): Promise<string> => {
  try {
    // This would require tesseract.js
    // For now, returning a placeholder
    console.log('Image OCR would be performed here for:', fileUrl);
    return 'Image OCR not yet implemented';
  } catch (error) {
    console.error('Error extracting image text:', error);
    return '';
  }
};
