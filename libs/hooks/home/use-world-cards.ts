import { useQueryClient } from "@tanstack/react-query";
import { useInfiniteList } from "@/libs/hooks/common";
import { fetchWorldCardsPage } from "@/libs/api/world-cards-api";
import {
  useWorldCardsFilters,
  //useWorldCardsLoading,
  //useWorldCardsError,
  useWorldCardsActions as useStoreActions,
  //useWorldCardsStats,
} from "@/libs/stores/world-cards-store";
import type { WorldCard, WorldCardFilters } from "@/libs/types/world-card";
import type { UseInfiniteListReturn } from "@/libs/types/pagination";

// Clean interfaces
interface InfiniteWorldCardsOptions {
  pageSize?: number;
  enabled?: boolean;
  additionalFilters?: Partial<WorldCardFilters>;
}

interface WorldCardsActions {
  setFilters: (filters: Partial<WorldCardFilters>) => void;
  resetFilters: () => void;
  invalidateData: () => void;
}

export function useInfiniteWorldCards(
  options: InfiniteWorldCardsOptions = {}
): UseInfiniteListReturn<WorldCard> {
  const { pageSize = 12, enabled = true, additionalFilters = {} } = options;
  const storeFilters = useWorldCardsFilters();
  const mergedFilters = { ...storeFilters, ...additionalFilters };
  const optimizedPageSize = pageSize;

  return useInfiniteList<WorldCard>({
    queryKey: ["world-cards", "infinite", JSON.stringify(mergedFilters)],
    queryFn: fetchWorldCardsPage,
    pageSize: optimizedPageSize,
    enabled,
    filters: mergedFilters,
    staleTime: 300000, // 5 minutes cache
    gcTime: 600000, // 10 minutes garbage collection
  });
}

export function useWorldCardsActions(): WorldCardsActions {
  const queryClient = useQueryClient();
  const storeActions = useStoreActions();
  const { setFilters: setStoreFilters, resetFilters } = storeActions;

  const setFilters = (filters: Partial<WorldCardFilters>) => {
    setStoreFilters(filters);
  };

  const resetFiltersEnhanced = () => {
    resetFilters();
  };

  const invalidateData = () => {
    queryClient.invalidateQueries({
      queryKey: ["world-cards"],
    });
  };

  return {
    setFilters,
    resetFilters: resetFiltersEnhanced,
    invalidateData,
  };
}

export {
  useWorldCardsFilters,
  useWorldCardsLoading,
  useWorldCardsError,
  useWorldCardsStats,
} from "@/libs/stores/world-cards-store";
