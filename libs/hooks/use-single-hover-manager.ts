import { create } from "zustand";

interface HoverState {
  activeCardId: string | null;
  setActiveCard: (id: string | null) => void;
}

export const useSingleHoverManager = create<HoverState>((set) => ({
  activeCardId: null,
  setActiveCard: (id) => set({ activeCardId: id }),
}));
