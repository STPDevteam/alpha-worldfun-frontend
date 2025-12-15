import { worldCardService } from '@/libs/services/api/world-card.service';
import type { WorldCard, WorldCardFilters } from "@/libs/types/world-card";
import { TokenStatus } from "@/libs/types/world-card";
import type { PaginatedResponse, InfiniteQueryParams } from "@/libs/types/pagination";

/**
 * Apply frontend-only filters
 */
export function applyWorldCardFilters(
  cards: WorldCard[],
  filters: WorldCardFilters
): WorldCard[] {
  const filteredCards = [...cards];

  // Currently no frontend-only filters applied. Reserved for future use.

  return filteredCards;
}

/**
 * Fetch paginated world cards from real API
 */
export async function fetchWorldCardsPage({
  pageParam,
  filters = {},
}: InfiniteQueryParams): Promise<PaginatedResponse<WorldCard>> {
  const page = pageParam ? parseInt(pageParam.toString(), 10) : 1; // Backend uses 1-based pagination
  const limit = 12;

  try {
    const searchFilters: WorldCardFilters = {
      ...filters as WorldCardFilters,
      page,
      limit,
    };
    
    // Fetch from real API
    const backendResponse = await worldCardService.searchTokens(searchFilters);
    
    // Transform backend tokens to WorldCards with computed properties
    const worldCards = worldCardService.transformToWorldCards(backendResponse.tokens);
    
    // Apply frontend-only filters
    const processedCards = applyWorldCardFilters(worldCards, searchFilters);
    
    return {
      items: processedCards,
      pagination: {
        page,
        nextCursor: page < backendResponse.totalPages ? (page + 1).toString() : undefined,
        hasMore: page < backendResponse.totalPages,
        total: backendResponse.total,
        limit,
      },
    };
  } catch (error) {
    console.error('Failed to fetch world cards:', error);
    // Return empty result on error
    return {
      items: [],
      pagination: {
        page,
        hasMore: false,
        total: 0,
        limit,
      },
    };
  }
}

/**
 * Fetch world detail by ID
 */
export async function fetchWorldById(id: string): Promise<WorldCard> {
  try {
    return await worldCardService.getWorldById(id);
  } catch (error) {
    console.error('Failed to fetch world detail:', error);
    throw error;
  }
}