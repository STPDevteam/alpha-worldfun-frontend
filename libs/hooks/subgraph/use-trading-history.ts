import { useQuery, useInfiniteQuery, UseQueryOptions } from "@tanstack/react-query";
import { subgraphService } from "@/libs/services/api/subgraph.service";
import {
  BondingCurveTradesResponse,
  BondingCurveHistoryResponse,
  BondingCurveTradesFilters,
  BondingCurveHistoryFilters,
  TradeType,
  TradeHistoryType,
} from "@/libs/types/subgraph.types";
import {
  bondingCurveTradesResponseSchema,
} from "@/libs/schemas/subgraph.schema";

// Query keys for cache management
export const tradingHistoryQueryKeys = {
  all: ["trading-history"] as const,
  trades: ["trading-history", "trades"] as const,
  history: ["trading-history", "history"] as const,
  tradesByFilters: (filters: BondingCurveTradesFilters) =>
    [...tradingHistoryQueryKeys.trades, "filters", filters] as const,
  historyByFilters: (filters: BondingCurveHistoryFilters) =>
    [...tradingHistoryQueryKeys.history, "filters", filters] as const,
  tradesByPool: (poolAddress: string, tradeType: TradeType) =>
    [...tradingHistoryQueryKeys.trades, "pool", poolAddress, tradeType] as const,
  historyByTrader: (traderAddress: string) =>
    [...tradingHistoryQueryKeys.history, "trader", traderAddress] as const,
} as const;

/**
 * Hook to fetch bonding curve trades (buys/sells) with pagination and filters
 * @param filters Query filters
 * @param options TanStack Query options
 */
export const useBondingCurveTrades = (
  filters: BondingCurveTradesFilters = {},
  options?: Omit<UseQueryOptions<BondingCurveTradesResponse, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: tradingHistoryQueryKeys.tradesByFilters(filters),
    queryFn: async () => {
      const response = await subgraphService.getBondingCurveTrades(filters);

      // Validate response with Zod schema
      const validatedData = bondingCurveTradesResponseSchema.parse(response);
      return validatedData;
    },
    staleTime: 15 * 1000, // 15 seconds for trading data
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

/**
 * Hook to fetch bonding curve trade history with pagination and filters
 * @param filters Query filters
 * @param options TanStack Query options
 */
export const useBondingCurveHistory = (
  filters: BondingCurveHistoryFilters = {},
  options?: Omit<UseQueryOptions<BondingCurveHistoryResponse, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: tradingHistoryQueryKeys.historyByFilters(filters),
    queryFn: async () => {
      const response = await subgraphService.getBondingCurveHistory(filters);
      return response as BondingCurveHistoryResponse;
    },
    staleTime: 30 * 1000, // 30 seconds for trading data
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchIntervalInBackground: true, // Allow background refetching
    ...options,
  });
};

/**
 * Hook to fetch trades for a specific bonding curve pool
 * @param poolAddress Bonding curve pool address
 * @param tradeType Type of trades (BUY or SELL)
 * @param page Page number
 * @param limit Items per page
 */
export const useBondingCurveTradesByPool = (
  poolAddress: string | undefined,
  tradeType: TradeType = TradeType.BUY,
  page = 1,
  limit = 20,
  options?: Omit<UseQueryOptions<BondingCurveTradesResponse, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: poolAddress
      ? [...tradingHistoryQueryKeys.tradesByPool(poolAddress, tradeType), page, limit]
      : [],
    queryFn: async () => {
      if (!poolAddress) throw new Error("Pool address is required");

      const response = await subgraphService.getBondingCurveTradesByPool(
        poolAddress,
        tradeType,
        page,
        limit
      );
      const validatedData = bondingCurveTradesResponseSchema.parse(response);
      return validatedData;
    },
    enabled: !!poolAddress && poolAddress.length === 42 && poolAddress.startsWith("0x"),
    staleTime: 15 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 3,
    ...options,
  });
};

/**
 * Hook to fetch trade history for a specific trader
 * @param traderAddress Trader wallet address
 * @param tradeType Type of trades (ALL, BUY, or SELL)
 * @param page Page number
 * @param limit Items per page
 */
export const useBondingCurveHistoryByTrader = (
  traderAddress: string | undefined,
  tradeType: TradeHistoryType = TradeHistoryType.ALL,
  page = 1,
  limit = 20,
  options?: Omit<UseQueryOptions<BondingCurveHistoryResponse, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: traderAddress
      ? [...tradingHistoryQueryKeys.historyByTrader(traderAddress), tradeType, page, limit]
      : [],
    queryFn: async () => {
      if (!traderAddress) throw new Error("Trader address is required");

      const response = await subgraphService.getBondingCurveHistoryByTrader(
        traderAddress,
        tradeType,
        page,
        limit
      );
      return response as BondingCurveHistoryResponse;
    },
    enabled: !!traderAddress && traderAddress.length === 42 && traderAddress.startsWith("0x"),
    staleTime: 15 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 3,
    ...options,
  });
};

/**
 * Hook to fetch trading history with infinite scroll
 * @param filters Query filters
 */
export const useInfiniteBondingCurveHistory = (
  filters: Omit<BondingCurveHistoryFilters, 'page'> = {}
) => {
  return useInfiniteQuery({
    queryKey: [...tradingHistoryQueryKeys.historyByFilters(filters), "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await subgraphService.getBondingCurveHistory({
        ...filters,
        page: pageParam,
        limit: filters.limit || 20,
      });

      return response as BondingCurveHistoryResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage;
      return meta.hasNextPage ? meta.page + 1 : undefined;
    },
    staleTime: 15 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 3,
  });
};

/**
 * Hook to get recent trading activity for a bonding curve
 * @param poolAddress Bonding curve pool address
 * @param limit Number of recent trades
 */
export const useRecentBondingCurveActivity = (
  poolAddress: string | undefined,
  limit = 10
) => {
  return useBondingCurveHistory(
    { bondingCurveAddress: poolAddress, page: 1, limit },
    {
      staleTime: 10 * 1000, // 10 seconds for recent activity
      refetchInterval: 30 * 1000, // Refetch every 30 seconds
      refetchIntervalInBackground: false,
    }
  );
};

/**
 * Hook to get trader portfolio/statistics
 * @param traderAddress Trader wallet address
 */
export const useTraderPortfolio = (traderAddress: string | undefined) => {
  const { data, isLoading, error } = useBondingCurveHistoryByTrader(
    traderAddress,
    TradeHistoryType.ALL,
    1,
    1000 // Get more data for stats
  );

  const portfolio = data ? {
    totalTrades: data.meta.total,
    trades: data.data,
    buyTrades: data.data.filter(trade => 'buyer' in trade),
    sellTrades: data.data.filter(trade => 'seller' in trade),
    totalBuyAmount: data.data
      .filter(trade => 'buyer' in trade)
      .reduce((sum, trade) => sum + BigInt(trade.aweAmount), BigInt(0)),
    totalSellAmount: data.data
      .filter(trade => 'seller' in trade)
      .reduce((sum, trade) => sum + BigInt(trade.aweAmount), BigInt(0)),
    totalTokensBought: data.data
      .filter(trade => 'buyer' in trade)
      .reduce((sum, trade) => sum + BigInt(trade.tokenAmount), BigInt(0)),
    totalTokensSold: data.data
      .filter(trade => 'seller' in trade)
      .reduce((sum, trade) => sum + BigInt(trade.tokenAmount), BigInt(0)),
    netPosition: data.data.reduce((net, trade) => {
      if ('buyer' in trade) {
        return net + BigInt(trade.tokenAmount);
      } else {
        return net - BigInt(trade.tokenAmount);
      }
    }, BigInt(0)),
    profitLoss: data.data.reduce((pnl, trade) => {
      if ('buyer' in trade) {
        return pnl - BigInt(trade.aweAmount); // Cost
      } else {
        return pnl + BigInt(trade.aweAmount); // Revenue
      }
    }, BigInt(0)),
    uniquePools: new Set(data.data.map(trade => trade.bondingCurve)).size,
    firstTrade: data.data.sort((a, b) =>
      parseInt(a.blockTimestamp) - parseInt(b.blockTimestamp)
    )[0],
    recentTrades: data.data
      .sort((a, b) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp))
      .slice(0, 20),
  } : null;

  return {
    portfolio,
    isLoading,
    error,
    hasActivity: !!portfolio && data!.meta.total > 0,
  };
};

/**
 * Hook to get live trading feed across all bonding curves
 * @param limit Number of recent trades
 */
export const useLiveTradingFeed = (limit = 50) => {
  return useBondingCurveHistory(
    { page: 1, limit },
    {
      staleTime: 5 * 1000, // 5 seconds for live feed
      refetchInterval: 15 * 1000, // Refetch every 15 seconds
      refetchIntervalInBackground: false,
      select: (data) => ({
        ...data,
        data: data.data.sort((a, b) =>
          parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp)
        )
      }),
    }
  );
};

/**
 * Hook to get trading volume statistics for a time period
 * @param poolAddress Optional pool address filter
 * @param timeframe Time period for stats
 */
export const useTradingVolumeStats = (
  poolAddress?: string,
  timeframe: '1h' | '24h' | '7d' | '30d' = '24h'
) => {
  const limit = timeframe === '1h' ? 100 :
                timeframe === '24h' ? 500 :
                timeframe === '7d' ? 1000 : 2000;

  const { data, isLoading, error } = useBondingCurveHistory(
    {
      bondingCurveAddress: poolAddress,
      page: 1,
      limit
    }
  );

  const now = Date.now();
  const timeframeMs = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  }[timeframe];

  const stats = data ? {
    timeframe,
    totalTrades: data.data.filter(trade =>
      now - (parseInt(trade.blockTimestamp) * 1000) <= timeframeMs
    ).length,
    totalVolume: data.data
      .filter(trade => now - (parseInt(trade.blockTimestamp) * 1000) <= timeframeMs)
      .reduce((sum, trade) => sum + BigInt(trade.aweAmount), BigInt(0)),
    buyVolume: data.data
      .filter(trade =>
        'buyer' in trade &&
        now - (parseInt(trade.blockTimestamp) * 1000) <= timeframeMs
      )
      .reduce((sum, trade) => sum + BigInt(trade.aweAmount), BigInt(0)),
    sellVolume: data.data
      .filter(trade =>
        'seller' in trade &&
        now - (parseInt(trade.blockTimestamp) * 1000) <= timeframeMs
      )
      .reduce((sum, trade) => sum + BigInt(trade.aweAmount), BigInt(0)),
    uniqueTraders: new Set(
      data.data
        .filter(trade => now - (parseInt(trade.blockTimestamp) * 1000) <= timeframeMs)
        .map(trade => 'buyer' in trade ? trade.buyer : trade.seller)
    ).size,
  } : null;

  return {
    stats,
    isLoading,
    error,
  };
};