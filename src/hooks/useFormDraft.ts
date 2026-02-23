import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/useAppStore';

/**
 * Hook that auto-saves form data to localStorage via the global app store.
 *
 * @param draftKey  Unique identifier for this form, e.g. "contact-form"
 * @param data      Current form data object
 * @param options   debounceMs (default 1000), enabled (default true)
 *
 * @returns { clearDraft, hasDraft, restoreDraft }
 */
export const useFormDraft = <T extends Record<string, unknown>>(
  draftKey: string,
  data: T,
  options?: { debounceMs?: number; enabled?: boolean }
) => {
  const { debounceMs = 1000, enabled = true } = options ?? {};
  const { saveFormDraft, getFormDraft, clearFormDraft } = useAppStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save with debounce
  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      saveFormDraft(draftKey, data as Record<string, unknown>);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, draftKey, debounceMs, enabled, saveFormDraft]);

  const restoreDraft = useCallback((): T | undefined => {
    const draft = getFormDraft(draftKey);
    return draft?.data as T | undefined;
  }, [draftKey, getFormDraft]);

  const clearDraft = useCallback(() => {
    clearFormDraft(draftKey);
  }, [draftKey, clearFormDraft]);

  const hasDraft = !!getFormDraft(draftKey);

  return { clearDraft, hasDraft, restoreDraft };
};
