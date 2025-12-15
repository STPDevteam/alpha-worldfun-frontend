import {
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { subgraphService } from "@/libs/services/api/subgraph.service";
import {
  BondingCurveResponse,
  BondingCurveByPoolResponse,
  BondingCurveFilters,
} from "@/libs/types/subgraph.types";
import {
  bondingCurveResponseSchema,
  bondingCurveByPoolResponseSchema,
} from "@/libs/schemas/subgraph.schema";

// Query keys for cache management
export const bondingCurveQueryKeys = {
  all: ["bonding-curve"] as const,
  byFilters: (filters: BondingCurveFilters) =>
    [...bondingCurveQueryKeys.all, "filters", filters] as const,
  byPool: (poolAddress: string) =>
    [...bondingCurveQueryKeys.all, "pool", poolAddress] as const,
  byToken: (tokenAddress: string) =>
    [...bondingCurveQueryKeys.all, "token", tokenAddress] as const,
} as const;

/**
 * Hook to fetch bonding curves with pagination and filters
 * @param filters Query filters
 * @param options TanStack Query options
 */
export const useBondingCurves = (
  filters: BondingCurveFilters = {},
  options?: Omit<
    UseQueryOptions<BondingCurveResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: bondingCurveQueryKeys.byFilters(filters),
    queryFn: async () => {
      const response = await subgraphService.getBondingCurves(filters);

      // Validate response with Zod schema
      const validatedData = bondingCurveResponseSchema.parse(response);
      return validatedData;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

/**
 * Hook to fetch bonding curve data by pool address
 * @param poolAddress Bonding curve pool address
 * @param options TanStack Query options
 */
export const useBondingCurveByPool = (
  poolAddress: string | undefined,
  options?: Omit<
    UseQueryOptions<BondingCurveByPoolResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: poolAddress ? bondingCurveQueryKeys.byPool(poolAddress) : [],
    queryFn: async () => {
      if (!poolAddress) throw new Error("Pool address is required");

      const response = await subgraphService.getBondingCurveByPool(poolAddress);

      // Validate response with Zod schema
      const validatedData = bondingCurveByPoolResponseSchema.parse(response);
      return validatedData;
    },
    enabled:
      !!poolAddress &&
      poolAddress.length === 42 &&
      poolAddress.startsWith("0x"),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

/**
 * Hook to fetch bonding curves for a specific token
 * @param tokenAddress Token contract address
 * @param page Page number
 * @param limit Items per page
 */
export const useBondingCurvesByToken = (
  tokenAddress: string | undefined,
  page = 1,
  limit = 10,
  options?: Omit<
    UseQueryOptions<BondingCurveResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: tokenAddress
      ? [...bondingCurveQueryKeys.byToken(tokenAddress), page, limit]
      : [],
    queryFn: async () => {
      if (!tokenAddress) throw new Error("Token address is required");

      const response = await subgraphService.getBondingCurvesByToken(
        tokenAddress,
        page,
        limit
      );
      const validatedData = bondingCurveResponseSchema.parse(response);
      return validatedData;
    },
    enabled:
      !!tokenAddress &&
      tokenAddress.length === 42 &&
      tokenAddress.startsWith("0x"),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 3,
    ...options,
  });
};

/**
 * Hook to fetch bonding curves with infinite scroll
 * @param filters Query filters
 */
export const useInfiniteBondingCurves = (
  filters: Omit<BondingCurveFilters, "page"> = {}
) => {
  return useInfiniteQuery({
    queryKey: [...bondingCurveQueryKeys.byFilters(filters), "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await subgraphService.getBondingCurves({
        ...filters,
        page: pageParam,
        limit: filters.limit || 20,
      });

      const validatedData = bondingCurveResponseSchema.parse(response);
      return validatedData;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage;
      return meta.hasNextPage ? meta.page + 1 : undefined;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 3,
  });
};

/**
 * Hook to get bonding curve trading statistics
 * @param poolAddress Bonding curve pool address
 */
export const useBondingCurveTradingStats = (
  poolAddress: string | undefined
) => {
  const { data, isLoading, error } = useBondingCurveByPool(poolAddress);
  const stats = data
    ? {
        totalBuys: parseInt(data.totalBuys),
        totalSells: parseInt(data.totalSells),
        totalBuyVolume: BigInt(data.totalBuyVolume),
        totalSellVolume: BigInt(data.totalSellVolume),
        totalTokensTraded: BigInt(data.totalTokensTraded),
        totalVolume: BigInt(data.totalVolume),
        netVolume: BigInt(data.totalBuyVolume) - BigInt(data.totalSellVolume),
        buyToSellRatio:
          parseInt(data.totalSells) > 0
            ? parseInt(data.totalBuys) / parseInt(data.totalSells)
            : parseInt(data.totalBuys),
        averageBuyAmount:
          parseInt(data.totalBuys) > 0
            ? BigInt(data.totalBuyVolume) / BigInt(data.totalBuys)
            : BigInt(0),
        averageSellAmount:
          parseInt(data.totalSells) > 0
            ? BigInt(data.totalSellVolume) / BigInt(data.totalSells)
            : BigInt(0),
        isActive: data.isActive,
        createdAt: new Date(parseInt(data.createdAt) * 1000),
        graduatedAt: data.graduatedAt
          ? new Date(parseInt(data.graduatedAt) * 1000)
          : null,
        totalTraders: (data.traders?.length ?? 0),
      }
    : null;

  return {
    stats,
    isLoading,
    error,
    bondingCurve: data,
  };
};

/**
 * Hook to get bonding curve top traders
 * @param poolAddress Bonding curve pool address
 * @param limit Number of top traders to return
 */
export const useBondingCurveTopTraders = (
  poolAddress: string | undefined,
  limit = 10
) => {
  const { data, isLoading, error } = useBondingCurveByPool(poolAddress);

  const traders = data?.traders ?? [];

  const topTraders = traders
    .map((trader) => ({
      address: trader.trader,
      totalBought: BigInt(trader.totalBought),
      totalSold: BigInt(trader.totalSold),
      totalBuyVolume: BigInt(trader.totalBuyVolume),
      totalSellVolume: BigInt(trader.totalSellVolume),
      netVolume: BigInt(trader.totalBuyVolume) - BigInt(trader.totalSellVolume),
      buyCount: parseInt(trader.buyCount),
      sellCount: parseInt(trader.sellCount),
      totalTrades: parseInt(trader.buyCount) + parseInt(trader.sellCount),
      firstTradeAt: new Date(parseInt(trader.firstTradeAt) * 1000),
      lastTradeAt: new Date(parseInt(trader.lastTradeAt) * 1000),
      profitLoss: BigInt(trader.totalSellVolume) - BigInt(trader.totalBuyVolume),
    }))
    .sort((a, b) => Number(b.netVolume - a.netVolume))
    .slice(0, limit);



  return {
    topTraders,
    isLoading,
    error,
  };
};

/**
 * Hook to check if a bonding curve exists and get basic info
 * @param poolAddress Bonding curve pool address
 */
export const useBondingCurveExists = (poolAddress: string | undefined) => {
  const { data, isLoading, error } = useBondingCurveByPool(poolAddress, {
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    exists: !!data && !error,
    isLoading,
    bondingCurve: data,
    error,
    isActive: data?.isActive ?? false,
    hasGraduated: !!data?.graduatedAt,
  };
};

/**
 * Hook to get active bonding curves
 * @param limit Number of active curves to fetch
 */
export const useActiveBondingCurves = (limit = 20) => {
  // Note: This assumes backend filters for active curves
  // If not available, we'd need to filter client-side
  return useBondingCurves(
    { limit },
    {
      select: (data) => ({
        ...data,
        data: data.data.filter((curve) => curve.isActive),
      }),
      staleTime: 15 * 1000, // 15 seconds for active data
    }
  );
};

/**
 * Hook to get recently created bonding curves
 * @param limit Number of recent curves to fetch
 */
export const useRecentBondingCurves = (limit = 10) => {
  return useBondingCurves(
    { page: 1, limit },
    {
      select: (data) => ({
        ...data,
        data: data.data.sort(
          (a, b) => parseInt(b.createdAt) - parseInt(a.createdAt)
        ),
      }),
      staleTime: 30 * 1000,
    }
  );
};
