/**
 * Multi-file upload utilities for AI tools.
 * Reads multiple files and merges their text content.
 */
import { readFileContent } from './file-utils';

export interface FileResult {
  name: string;
  text: string;
  isImage: boolean;
}

/**
 * Read multiple files and return their contents.
 */
export async function readMultipleFiles(files: File[]): Promise<FileResult[]> {
  return Promise.all(
    files.map(async (file) => {
      const { text, isImage } = await readFileContent(file);
      return { name: file.name, text, isImage };
    })
  );
}

/**
 * Merge multiple file results into a single text block.
 * Images are returned separately.
 */
export function mergeFileContents(results: FileResult[]): { mergedText: string; imageDataUrls: string[] } {
  const textParts: string[] = [];
  const imageDataUrls: string[] = [];

  for (const r of results) {
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
