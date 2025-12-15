import { useQuery } from "@tanstack/react-query";
import { worldCardService } from "@/libs/services/api/world-card.service";
import type { WorldCard } from "@/libs/types/world-card";

export function useFeaturedWorlds() {
  return useQuery<WorldCard[], Error>({
    queryKey: ["featured-worlds"],
    queryFn: async () => {
      const response = await worldCardService.getFeaturedTokens();
      return worldCardService.transformToWorldCards(response.tokens);
    },
    staleTime: 30000, // 30 seconds - matches backend cache
    gcTime: 300000, // 5 minutes garbage collection
    refetchOnWindowFocus: false,
    retry: 3,
  });
}
