import { create } from 'zustand';

interface HistoryState {
  activeEraIndex: number;
  setActiveEraIndex: (index: number) => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  activeEraIndex: 0,
  setActiveEraIndex: (index) => set({ activeEraIndex: index }),
}));
