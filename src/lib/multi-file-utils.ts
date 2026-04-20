/**
 * Multi-file upload utilities for AI tools.
 * Reads multiple files and merges their text content, with per-file progress callbacks.
 */
import { readFileContent } from './file-utils';

export type FileStatus = 'pending' | 'processing' | 'done' | 'error';

export interface FileProgress {
  name: string;
  status: FileStatus;
  error?: string;
}

export interface FileResult {
  name: string;
  text: string;
  isImage: boolean;
  error?: string;
}

/**
 * Read multiple files sequentially with per-file progress callbacks.
 */
export async function readMultipleFiles(
  files: File[],
  onProgress?: (progress: FileProgress[]) => void,
): Promise<FileResult[]> {
  const progress: FileProgress[] = files.map(f => ({ name: f.name, status: 'pending' }));
  const results: FileResult[] = [];
  onProgress?.(progress);

  for (let i = 0; i < files.length; i++) {
    progress[i] = { ...progress[i], status: 'processing' };
    onProgress?.([...progress]);
    try {
      const { text, isImage } = await readFileContent(files[i]);
      results.push({ name: files[i].name, text, isImage });
      progress[i] = { ...progress[i], status: 'done' };
    } catch (err: any) {
      const msg = err?.message || 'Failed to read file';
      results.push({ name: files[i].name, text: '', isImage: false, error: msg });
      progress[i] = { ...progress[i], status: 'error', error: msg };
    }
    onProgress?.([...progress]);
  }
  return results;
}

/**
 * Merge multiple file results into a single text block.
 * Images are returned separately.
 */
export function mergeFileContents(results: FileResult[]): { mergedText: string; imageDataUrls: string[] } {
  const textParts: string[] = [];
  const imageDataUrls: string[] = [];

  for (const r of results) {
    if (r.error || !r.text) continue;
    if (r.isImage) {
      imageDataUrls.push(r.text);
    } else {
      textParts.push(`--- FILE: ${r.name} ---\n${r.text}`);
    }
  }

  return {
    mergedText: textParts.join('\n\n'),
    imageDataUrls,
  };
}
