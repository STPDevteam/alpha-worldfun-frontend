import { create } from "zustand";
import {
  WorldCard,
  WorldCardFilters,
  WorldCardsState,
  TokenStatus,
  TokenType,
} from "@/libs/types/world-card";

interface WorldCardsStore extends WorldCardsState {
  actions: {
    setCards: (cards: WorldCard[]) => void;
    setFilters: (filters: Partial<WorldCardFilters>) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    resetFilters: () => void;
  };
}

const useWorldCardsStore = create<WorldCardsStore>((set, get) => ({
  cards: [],
  filteredCards: [],
  filters: {
    status: undefined,
    tokenType: undefined,
    tokenizeOnly: false,
  },
  isLoading: false,
  error: null,

  actions: {
    setCards: (cards) => {
      set((state) => {
        const filters = state.filters;
        let filtered = [...cards];

        if (filters.status) {
          filtered = filtered.filter((card) => card.status === filters.status);
        }

        if (filters.tokenType) {
          filtered = filtered.filter((card) => card.tokenType === filters.tokenType);
        }

        return {
          cards,
          filteredCards: filtered,
        };
      });
    },

    setFilters: (newFilters) => {
      set((state) => {
        const updatedFilters = { ...state.filters, ...newFilters };
        let filtered = [...state.cards];

        if (updatedFilters.status) {
          filtered = filtered.filter(
            (card) => card.status === updatedFilters.status
          );
        }

        if (updatedFilters.tokenType) {
          filtered = filtered.filter(
            (card) => card.tokenType === updatedFilters.tokenType
          );
        }

        return {
          filters: updatedFilters,
          filteredCards: filtered,
        };
      });
    },

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error }),

    resetFilters: () => {
      set((state) => {
        const resetFilters = {
          status: undefined,
          tokenType: undefined,
          tokenizeOnly: false,
        };
        const filtered = [...state.cards];

        return {
          filters: resetFilters,
          filteredCards: filtered,
        };
      });
    },
  },
}));

export const useWorldCards = () =>
  useWorldCardsStore((state) => state.filteredCards);
export const useAllWorldCards = () =>
  useWorldCardsStore((state) => state.cards);
export const useWorldCardsFilters = () =>
  useWorldCardsStore((state) => state.filters);
export const useWorldCardsLoading = () =>
  useWorldCardsStore((state) => state.isLoading);
export const useWorldCardsError = () =>
  useWorldCardsStore((state) => state.error);
export const useWorldCardsActions = () =>
  useWorldCardsStore((state) => state.actions);

export const useWorldCardsStats = () => {
  const totalCards = useWorldCardsStore((state) => state.cards.length);
  const liveCards = useWorldCardsStore(
    (state) =>
      state.cards.filter((card) => card.status === TokenStatus.LIVE).length
  );
  const upcomingCards = useWorldCardsStore(
    (state) =>
      state.cards.filter((card) => card.status === TokenStatus.ON_GOING).length
  );
  const completedCards = useWorldCardsStore(
    (state) =>
      state.cards.filter((card) => card.status === TokenStatus.CANCELLED).length
  );
  const filteredCount = useWorldCardsStore(
    (state) => state.filteredCards.length
  );

  return {
    total: totalCards,
    live: liveCards,
    upcoming: upcomingCards,
    completed: completedCards,
    filtered: filteredCount,
  };
};
