import { useEffect, useRef, useCallback, useState } from 'react';

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  interval?: number;
  enabled?: boolean;
}

export const useAutosave = <T>({ 
  data, 
  onSave, 
  interval = 30000, 
  enabled = true 
}: UseAutosaveOptions<T>) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const previousDataRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(async () => {
    const currentDataString = JSON.stringify(data);
    
    // Don't save if data hasn't changed
    if (currentDataString === previousDataRef.current) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(data);
      previousDataRef.current = currentDataString;
      setLastSaved(new Date());
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data, onSave]);

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(save, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, interval, enabled, save]);

  // Initialize previous data ref
  useEffect(() => {
    previousDataRef.current = JSON.stringify(data);
  }, []);

  return { lastSaved, isSaving, saveNow: save };
};

// Helper to calculate word count from EditorJS content
export const calculateWordCount = (content: { blocks?: Array<{ data?: { text?: string; items?: unknown[] } }> }): number => {
  if (!content?.blocks) return 0;
  
  let wordCount = 0;
  content.blocks.forEach(block => {
    if (typeof block.data?.text === 'string') {
      // Strip HTML tags before counting
      const plainText = block.data.text.replace(/<[^>]*>/g, '');
      wordCount += plainText.split(/\s+/).filter(Boolean).length;
    }
    if (Array.isArray(block.data?.items)) {
      block.data.items.forEach((item: unknown) => {
        if (typeof item === 'string') {
          const plainText = item.replace(/<[^>]*>/g, '');
          wordCount += plainText.split(/\s+/).filter(Boolean).length;
        } else if (typeof item === 'object' && item !== null && 'text' in item) {
          const plainText = String((item as { text: string }).text).replace(/<[^>]*>/g, '');
          wordCount += plainText.split(/\s+/).filter(Boolean).length;
        }
      });
    }
  });
  
  return wordCount;
};

// Helper to calculate reading time (avg 200 words per minute)
export const calculateReadingTime = (wordCount: number): number => {
  return Math.max(1, Math.ceil(wordCount / 200));
};
