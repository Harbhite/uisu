/**
 * Shared file reading utilities for AI tools.
 * Handles PDF extraction via pdfjs-dist, images as base64, and text files.
 */
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extract text from a PDF file using pdfjs-dist.
 * Handles 100+ page documents reliably.
 */
export async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => item.str)
      .join(' ');
    if (text.trim()) {
      pages.push(`--- Page ${i} ---\n${text}`);
    }
  }

  return pages.join('\n\n');
}

/**
 * Read a file and return its text content.
 * - PDFs: extracted via pdfjs-dist
 * - Images: returned as base64 data URL
 * - Everything else: read as text
 */
export async function readFileContent(file: File): Promise<{ text: string; isImage: boolean }> {
  // PDF files
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    const text = await extractPdfText(file);
    if (!text.trim()) {
      // Fallback: might be a scanned PDF with no extractable text
      return { text: '[This PDF appears to be scanned/image-based. Text extraction returned no content. Please paste the text manually or use a text-based PDF.]', isImage: false };
    }
    return { text, isImage: false };
  }

  // Image files
  if (file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ text: reader.result as string, isImage: true });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Text-based files
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ text: reader.result as string, isImage: false });
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Depth/difficulty levels for AI tools
 */
export type DepthLevel = 'beginner' | 'intermediate' | 'advanced';

export const DEPTH_LABELS: Record<DepthLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const DEPTH_DESCRIPTIONS: Record<DepthLevel, string> = {
  beginner: 'Simple language, basic concepts, more examples',
  intermediate: 'Standard academic depth with balanced detail',
  advanced: 'Expert-level analysis, edge cases, nuanced reasoning',
};

export function getDepthInstruction(depth: DepthLevel): string {
  switch (depth) {
    case 'beginner':
      return 'TARGET AUDIENCE: Beginner-level student. Use simple, accessible language. Explain every concept from scratch with plenty of real-world analogies and examples. Avoid jargon or define it immediately when used.';
    case 'intermediate':
      return 'TARGET AUDIENCE: Intermediate-level student with foundational knowledge. Use standard academic language. Balance depth with clarity. Include examples where helpful.';
    case 'advanced':
      return 'TARGET AUDIENCE: Advanced student or researcher. Use precise academic/technical language freely. Go deep into nuances, edge cases, exceptions, and cross-disciplinary connections. Challenge assumptions and present competing perspectives.';
  }
}
