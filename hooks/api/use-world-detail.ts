import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorldCard, TokenStatus } from "@/libs/types/world-card";
import { fetchWorldById } from "@/libs/api/world-cards-api";

interface UseWorldDetailOptions {
  isGraduated?: boolean;
}

interface UseWorldDetailReturn {
  data: WorldCard | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useWorldDetail = (
  worldId: string,
  options: UseWorldDetailOptions = {}
): UseWorldDetailReturn => {
  const { isGraduated } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["world-detail", worldId],
    queryFn: async () => {
      if (!worldId) {
        throw new Error("World ID is required");
      }
      return await fetchWorldById(worldId);
    },
    enabled: Boolean(worldId),
    staleTime: 60_000, // 1 minute - data stays fresh
    refetchInterval: (query) => {
      const worldData = query.state.data as WorldCard | undefined;
      if (worldData?.status === TokenStatus.ON_GOING && isGraduated === true) {
        return 10_000;
      }

      return false; // Disable auto-refetch for other statuses
    },
    refetchOnWindowFocus: false, // Disable refetch on window focus
    retry: 2,
  });

  const safeRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    data: data ?? null,
    isLoading,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    refetch: safeRefetch,
  };
};

