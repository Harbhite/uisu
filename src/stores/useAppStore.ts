import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ------------------------------------------------------------------ */
/*  Form Draft                                                        */
/* ------------------------------------------------------------------ */
export interface FormDraft {
  /** Unique key for the form, e.g. "contact", "ink-editor:<id>" */
  key: string;
  data: Record<string, unknown>;
  updatedAt: number;
}

/* ------------------------------------------------------------------ */
/*  State shape                                                       */
/* ------------------------------------------------------------------ */
interface AppState {
  /* Navigation ---------------------------------------------------- */
  lastVisitedRoute: string;
  sidebarOpen: boolean;
  setLastVisitedRoute: (route: string) => void;
  setSidebarOpen: (open: boolean) => void;

  /* Form drafts --------------------------------------------------- */
  formDrafts: Record<string, FormDraft>;
  /** Save or update a form draft */
  saveFormDraft: (key: string, data: Record<string, unknown>) => void;
  /** Retrieve a draft (returns undefined if none exists) */
  getFormDraft: (key: string) => FormDraft | undefined;
  /** Remove a draft after successful submission */
  clearFormDraft: (key: string) => void;
  /** Remove all drafts */
  clearAllFormDrafts: () => void;

  /* Generic key-value bag ----------------------------------------- */
  appData: Record<string, unknown>;
  setAppData: (key: string, value: unknown) => void;
  getAppData: <T = unknown>(key: string) => T | undefined;
  clearAppData: (key: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Store                                                             */
/* ------------------------------------------------------------------ */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      /* Navigation */
      lastVisitedRoute: '/',
      sidebarOpen: true,
      setLastVisitedRoute: (route) => set({ lastVisitedRoute: route }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      /* Form drafts */
      formDrafts: {},
      saveFormDraft: (key, data) =>
        set((state) => ({
          formDrafts: {
            ...state.formDrafts,
            [key]: { key, data, updatedAt: Date.now() },
          },
        })),
      getFormDraft: (key) => get().formDrafts[key],
      clearFormDraft: (key) =>
        set((state) => {
          const { [key]: _, ...rest } = state.formDrafts;
          return { formDrafts: rest };
        }),
      clearAllFormDrafts: () => set({ formDrafts: {} }),

      /* Generic key-value */
      appData: {},
      setAppData: (key, value) =>
        set((state) => ({
          appData: { ...state.appData, [key]: value },
        })),
      getAppData: <T = unknown>(key: string) => get().appData[key] as T | undefined,
      clearAppData: (key) =>
        set((state) => {
          const { [key]: _, ...rest } = state.appData;
          return { appData: rest };
        }),
    }),
    {
      name: 'uisu-app-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist these keys (exclude methods)
      partialize: (state) => ({
        lastVisitedRoute: state.lastVisitedRoute,
        sidebarOpen: state.sidebarOpen,
        formDrafts: state.formDrafts,
        appData: state.appData,
      }),
    }
  )
);
