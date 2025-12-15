import { useQuery } from "@tanstack/react-query";
import { fetchWorldById } from "@/libs/api/world-cards-api";

// Query keys following hierarchical structure
export const worldDetailQueryKeys = {
  all: ["world-detail"] as const,
  byId: (id: string) => [...worldDetailQueryKeys.all, { id }] as const,
} as const;

export function useWorldById(worldId: string) {
  return useQuery({
    queryKey: worldDetailQueryKeys.byId(worldId),
    queryFn: async () => {
      if (!worldId || worldId.trim() === "") {
        throw new Error("World ID is required");
      }

      const data = await fetchWorldById(worldId);
      return data;
    },
    enabled: !!worldId && worldId.trim() !== "",
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on 404 or validation errors
      if (error instanceof Error) {
        if (
          error.message.includes("404") ||
          error.message.includes("World ID is required")
        ) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
}
