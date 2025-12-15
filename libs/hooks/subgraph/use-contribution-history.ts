import {
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { subgraphService } from "@/libs/services/api/subgraph.service";
import {
  ContributionHistoryResponse,
  ContributionHistoryFilters,
} from "@/libs/types/subgraph.types";
import { contributionHistoryResponseSchema } from "@/libs/schemas/subgraph.schema";

// Query keys for cache management
export const contributionHistoryQueryKeys = {
  all: ["contribution-history"] as const,
  byFilters: (filters: ContributionHistoryFilters) =>
    [...contributionHistoryQueryKeys.all, "filters", filters] as const,
  byContributor: (contributorAddress: string) =>
    [
      ...contributionHistoryQueryKeys.all,
      "contributor",
      contributorAddress,
    ] as const,
} as const;

/**
 * Hook to fetch contribution history with pagination and filters
 * @param filters Query filters
 * @param options TanStack Query options
 */
export const useContributionHistory = (
  filters: ContributionHistoryFilters = {},
  options?: Omit<
    UseQueryOptions<ContributionHistoryResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: contributionHistoryQueryKeys.byFilters(filters),
    queryFn: async () => {
      const response = await subgraphService.getContributionHistory(filters);

      // Validate response with Zod schema
      const validatedData = contributionHistoryResponseSchema.parse(response);
      return validatedData;
    },
    staleTime: 15 * 1000, // 15 seconds (shorter for transaction data)
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

/**
 * Hook to fetch contribution history with infinite scroll
 * @param filters Query filters
 */
export const useInfiniteContributionHistory = (
  filters: Omit<ContributionHistoryFilters, "page"> = {}
) => {
  return useInfiniteQuery({
    queryKey: [...contributionHistoryQueryKeys.byFilters(filters), "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await subgraphService.getContributionHistory({
        ...filters,
        page: pageParam,
        limit: filters.limit || 20,
      });

      const validatedData = contributionHistoryResponseSchema.parse(response);
      return validatedData;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage;
      return meta.hasNextPage ? meta.page + 1 : undefined;
    },
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });
};

/**
 * Hook to fetch contribution history for a specific DAO
 * @param daoAddress DAO contract address
 * @param page Page number
 * @param limit Items per page
 */
export const useContributionHistoryByDao = (
  daoAddress: string | undefined,
  page = 1,
  limit = 10,
  options?: Omit<
    UseQueryOptions<ContributionHistoryResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useContributionHistory(
    { daoAddress, page, limit },
    {
      refetchInterval: 30 * 1000, // Refetch every 30 seconds
      refetchIntervalInBackground: true, // Continue refetching in background
      ...options,
    }
  );
};

/**
 * Hook to fetch contribution history for a specific contributor
 * @param contributorAddress Contributor wallet address
 * @param page Page number
 * @param limit Items per page
 */
export const useContributionHistoryByContributor = (
  contributorAddress: string | undefined,
  page = 1,
  limit = 10,
  options?: Omit<
    UseQueryOptions<ContributionHistoryResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: contributorAddress
      ? [
          ...contributionHistoryQueryKeys.byContributor(contributorAddress),
          page,
          limit,
        ]
      : [],
    queryFn: async () => {
      if (!contributorAddress)
        throw new Error("Contributor address is required");

      const response =
        await subgraphService.getContributionHistoryByContributor(
          contributorAddress,
          page,
          limit
        );
      const validatedData = contributionHistoryResponseSchema.parse(response);
      return validatedData;
    },
    enabled:
      !!contributorAddress &&
      contributorAddress.length === 42 &&
      contributorAddress.startsWith("0x"),
    staleTime: 15 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 3,
    ...options,
  });
};

/**
 * Hook to get contribution statistics for a user
 * @param contributorAddress User wallet address
 */
export const useUserContributionStats = (
  contributorAddress: string | undefined
) => {
  const { data, isLoading, error } = useContributionHistoryByContributor(
    contributorAddress,
    1,
    1000 // Get more data for stats
  );

  const stats = data
    ? {
        totalContributions: data.data.filter(
          (h) => h.contributionType === "CONTRIBUTION"
        ).length,
        totalRefunds: data.data.filter((h) => h.contributionType === "REFUND")
          .length,
        totalBondingCurveBuys: data.data.filter(
          (h) => h.contributionType === "BONDING_CURVE_BUY"
        ).length,
        totalBondingCurveSells: data.data.filter(
          (h) => h.contributionType === "BONDING_CURVE_SELL"
        ).length,
        totalAmountContributed: data.data
          .filter((h) => h.contributionType === "CONTRIBUTION")
          .reduce((sum, h) => sum + BigInt(h.amount), BigInt(0)),
        totalAmountRefunded: data.data
          .filter((h) => h.contributionType === "REFUND")
          .reduce((sum, h) => sum + BigInt(h.amount), BigInt(0)),
        netContribution: data.data.reduce((sum, h) => {
          const amount = BigInt(h.amount);
          if (h.contributionType === "CONTRIBUTION") return sum + amount;
          if (h.contributionType === "REFUND") return sum - amount;
          return sum;
        }, BigInt(0)),
        // uniqueDAOs removed since dao field is not present
        firstContribution: data.data
          .filter((h) => h.contributionType === "CONTRIBUTION")
          .sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp))[0],
        recentActivity: data.data
          .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
          .slice(0, 10),
      }
    : null;

  return {
    stats,
    isLoading,
    error,
    hasActivity: !!stats && data!.meta.total > 0,
  };
};

/**
 * Hook to get recent contribution activity across all DAOs
 * @param limit Number of recent contributions to fetch
 */
export const useRecentContributionActivity = (
  limit = 20,
  options?: Omit<
    UseQueryOptions<ContributionHistoryResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useContributionHistory(
    { page: 1, limit },
    {
      staleTime: 5 * 1000, // 5 seconds for recent activity
      ...options,
    }
  );
};

/**
 * Hook to get contribution activity for a specific DAO with real-time updates
 * @param daoAddress DAO contract address
 * @param limit Number of recent contributions
 */
export const useDaoRecentActivity = (
  daoAddress: string | undefined,
  limit = 10
) => {
  return useContributionHistoryByDao(daoAddress, 1, limit, {
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchIntervalInBackground: true,
  });
};
