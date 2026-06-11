import { useEffect, useRef, useCallback } from 'react';

/**
 * Admin Dashboard Persistence State
 * Stores user preferences and draft data for the admin dashboard
 */
export interface AdminDashboardState {
  // Active tab selection
  activeTab: string;
  
  // Modal and form state
  showModal: boolean;
  editingItemId: string | null;
  formData: Record<string, unknown>;
  activitiesInput: string;
  teamMembers: Array<{ role: string; name: string; alias?: string }>;
  
  // Newsletter composer state
  composeSubject: string;
  composeContent: string;
  selectedTemplate: string;
  senderName: string;
  audienceMode: 'all' | 'saved' | 'adhoc';
  selectedAudienceId: string;
  adhocEmailsText: string;
  scheduleDate: string;
  scheduleTime: string;
  
  // A/B Testing state
  abEnabled: boolean;
  abVariantA: string;
  abVariantB: string;
  
  // Audit log filters
  auditSearchQuery: string;
  auditActionFilter: string;
  auditStartDate: string;
  auditEndDate: string;
  auditTableFilter: string;
}

const STORAGE_KEY = 'admin_dashboard_state';
const DEBOUNCE_MS = 1000;

/**
 * Hook to persist and restore admin dashboard state to/from localStorage
 * 
 * @param state Current state object containing all dashboard values
 * @param enabled Whether persistence is enabled (default: true)
 * @returns Object with saveState and restoreState functions
 */
export const useAdminDashboardPersistence = (
  state: Partial<AdminDashboardState>,
  enabled: boolean = true
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousStateRef = useRef<string>('');

  /**
   * Save state to localStorage with debouncing
   */
  const saveState = useCallback(() => {
    if (!enabled) return;

    try {
      const stateString = JSON.stringify(state);
      
      // Only save if state has actually changed
      if (stateString === previousStateRef.current) {
        return;
      }

      localStorage.setItem(STORAGE_KEY, stateString);
      previousStateRef.current = stateString;
    } catch (error) {
      console.error('Failed to save admin dashboard state:', error);
    }
  }, [state, enabled]);

  /**
   * Restore state from localStorage
   */
  const restoreState = useCallback((): Partial<AdminDashboardState> | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved) as Partial<AdminDashboardState>;
      previousStateRef.current = saved;
      return parsed;
    } catch (error) {
      console.error('Failed to restore admin dashboard state:', error);
      return null;
    }
  }, []);

  /**
   * Clear all persisted state
   */
  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      previousStateRef.current = '';
    } catch (error) {
      console.error('Failed to clear admin dashboard state:', error);
    }
  }, []);

  /**
   * Auto-save with debouncing on state change
   */
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(saveState, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state, enabled, saveState]);

  return {
    saveState,
    restoreState,
    clearState,
  };
};

/**
 * Hook to persist individual admin dashboard values
 * Useful for persisting specific state without the full state object
 */
export const useAdminDashboardValue = <T>(
  key: keyof AdminDashboardState,
  defaultValue: T,
  enabled: boolean = true
): [T, (value: T) => void] => {
  const getStoredValue = useCallback((): T => {
    if (!enabled) return defaultValue;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return defaultValue;
      
      const parsed = JSON.parse(saved) as Partial<AdminDashboardState>;
      const value = parsed[key];
      return value !== undefined ? (value as T) : defaultValue;
    } catch (error) {
      console.error(`Failed to get admin dashboard value for key "${key}":`, error);
      return defaultValue;
    }
  }, [key, defaultValue, enabled]);

  const setValue = useCallback((value: T) => {
    if (!enabled) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const current = saved ? (JSON.parse(saved) as Partial<AdminDashboardState>) : {};
      
      const updated = {
        ...current,
        [key]: value,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error(`Failed to set admin dashboard value for key "${key}":`, error);
    }
  }, [key, enabled]);

  return [getStoredValue(), setValue];
};
