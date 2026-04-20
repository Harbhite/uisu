/**
 * Client-side image compression utility.
 * Uses browser-image-compression to cap file size around ~800KB.
 * Safe to call with non-image files (returns them unchanged).
 */
import imageCompression from 'browser-image-compression';

export interface CompressOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

const DEFAULTS: Required<CompressOptions> = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  // Skip tiny files
  if (file.size < 300 * 1024) return file;
  try {
    const merged = { ...DEFAULTS, ...options };
    const compressed = await imageCompression(file, merged);
    // Preserve original name with proper extension
    return new File([compressed], file.name, { type: compressed.type, lastModified: Date.now() });
  } catch (err) {
    console.warn('Image compression failed, using original:', err);
    return file;
  }
}

export async function compressImages(files: File[], options: CompressOptions = {}): Promise<File[]> {
  return Promise.all(files.map(f => compressImage(f, options)));
}
