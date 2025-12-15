import { useMemo } from "react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { subgraphService } from "@/libs/services/api/subgraph.service";
import { DaoResponse } from "@/libs/types/subgraph.types";
import { daoResponseSchema } from "@/libs/schemas/subgraph.schema";

const TOKEN_DECIMALS = 18;

const parseTokenAmount = (value?: string | null): number | null => {
  if (!value) {
    return null;
  }

  try {
    return Number(formatUnits(BigInt(value), TOKEN_DECIMALS));
  } catch (error) {
    console.error("Failed to parse token amount", { value, error });
    return null;
  }
};

const parseCount = (value?: string | null): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const calculateProgressPercentage = (
  raised: number | null,
  goal: number | null,
  isGoalReached: boolean
): number | null => {
  if (raised === null || goal === null || goal <= 0) {
    return isGoalReached ? 100 : null;
  }

  const progress = (raised / goal) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

const calculateTimeRemainingSeconds = (endDate: Date | null): number | null => {
  if (!endDate) {
    return null;
  }

  const diffMs = endDate.getTime() - Date.now();
  if (diffMs <= 0) {
    return 0;
  }

  return Math.floor(diffMs / 1000);
};

const safeBigInt = (value?: string | null): bigint => {
  if (!value) {
    return BigInt(0);
  }

  try {
    return BigInt(value);
  } catch (error) {
    console.error("Failed to parse BigInt value", { value, error });
    return BigInt(0);
  }
};

const parseCountOrZero = (value?: string | null): number => {
  const parsed = parseCount(value);
  return parsed ?? 0;
};

const secondsToDate = (value?: string | null): Date => {
  const seconds = Number(value ?? "0");
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return new Date(0);
  }

  return new Date(seconds * 1000);
};

export interface DaoSidebarData {
  totalRaised: number | null;
  fundraisingGoal: number | null;
  progressPercentage: number | null;
  totalContributors: number | null;
  totalTokenClaimed: number | null;
  totalTokenClaimers: number | null;
  totalContributions: number | null;
  totalRefunds: number | null;
  totalRefundedAmount: number | null;
  endDate: Date | null;
  isGoalReached: boolean;
  isActive: boolean;
  aweRemaining: number | null;
  timeRemainingSeconds: number | null;
}

// Query keys for cache management
export const daoQueryKeys = {
  all: ["dao"] as const,
  byAddress: (address: string) => [...daoQueryKeys.all, "address", address] as const,
} as const;

/**
 * Hook to fetch DAO data by address
 * @param address DAO contract address
 * @param options TanStack Query options
 */
export const useDaoData = (
  address: string | undefined,
  options?: Omit<UseQueryOptions<DaoResponse, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: address ? daoQueryKeys.byAddress(address) : [],
    queryFn: async () => {
      if (!address) throw new Error("DAO address is required");

      const response = await subgraphService.getDaoByAddress(address);
      // Validate response with Zod schema while falling back to raw data on failure
      const parsedResult = daoResponseSchema.safeParse(response);

      if (!parsedResult.success) {
        console.error("DAO data validation failed:", parsedResult.error.flatten(), response);
        return response;
      }

      return parsedResult.data;
    },
    enabled: !!address && address.length === 42 && address.startsWith("0x"),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

/**
 * Hook to check if a DAO exists and is valid
 * @param address DAO contract address
 */
export const useDaoExists = (address: string | undefined) => {
  const { data, isLoading, error } = useDaoData(address, {
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    exists: !!data && !error,
    isLoading,
    dao: data,
    error,
  };
};

/**
 * Hook to get DAO fundraising progress
 * @param address DAO contract address
 */
export const useDaoFundraisingProgress = (address: string | undefined) => {
  const { data, isLoading, error } = useDaoData(address);

  const progress = data ? {
    totalRaised: BigInt(data.totalAweRaised),
    fundraisingGoal: BigInt(data.fundraisingGoal),
    totalContributors: parseInt(data.totalContributors),
    isGoalReached: data.isGoalReached,
    progressPercentage: data.fundraisingGoal !== "0"
      ? Number((BigInt(data.totalAweRaised) * BigInt(100)) / BigInt(data.fundraisingGoal))
      : 0,
    endTime: new Date(parseInt(data.endTime) * 1000),
    isActive: new Date() < new Date(parseInt(data.endTime) * 1000),
  } : null;

  return {
    progress,
    isLoading,
    error,
    dao: data,
  };
};

/**
 * Hook to derive sidebar-friendly DAO metrics
 * @param address DAO contract address
 */
export const useDaoSidebarData = (address: string | undefined) => {
  const queryResult = useDaoData(address);
  const sidebarData = useMemo(() => {
    const dao = queryResult.data;
    if (!dao) {
      return null;
    }

    const totalRaised = parseTokenAmount(dao.totalAweRaised);
    const fundraisingGoal = parseTokenAmount(dao.fundraisingGoal);
    const totalTokenClaimed = parseTokenAmount(dao.totalTokenClaimed);
    const totalRefundedAmount = parseTokenAmount(dao.totalRefundedAmount);

    const totalContributors = parseCount(dao.totalContributors);
    const totalTokenClaimers = parseCount(dao.totalTokenClaimers);
    const totalContributions = parseCount(dao.totalContributions);
    const totalRefunds = parseCount(dao.totalRefunds);

    const endDate = dao.endTime ? new Date(Number(dao.endTime) * 1000) : null;
    const progressPercentage = calculateProgressPercentage(
      totalRaised,
      fundraisingGoal,
      dao.isGoalReached
    );

    const aweRemaining =
      totalRaised !== null && fundraisingGoal !== null
        ? Math.max(fundraisingGoal - totalRaised, 0)
        : null;

    const timeRemainingSeconds = calculateTimeRemainingSeconds(endDate);
    const isActive = endDate ? Date.now() < endDate.getTime() : !dao.isGoalReached;

    return {
      totalRaised,
      fundraisingGoal,
      progressPercentage,
      totalContributors,
      totalTokenClaimed,
      totalTokenClaimers,
      totalContributions,
      totalRefunds,
      totalRefundedAmount,
      endDate,
      isGoalReached: dao.isGoalReached,
      isActive,
      aweRemaining,
      timeRemainingSeconds,
    } satisfies DaoSidebarData;
  }, [queryResult.data]);

  return {
    ...queryResult,
    sidebarData,
  };
};

/**
 * Hook to get DAO token information
 * @param address DAO contract address
 */
export const useDaoTokenInfo = (address: string | undefined) => {
  const { data, isLoading, error } = useDaoData(address);

  const token = data?.token ?? null;
  const tokenInfo = token && typeof token !== "string" ? {
    address: token.address,
    totalVolume: safeBigInt(token.totalVolume),
    totalVolumeUSD: safeBigInt(token.totalVolumeUSD),
    lpAddress: token.lpAddress,
    nftId: token.nftId ?? null,
    mintToDao: token.mintToDao ?? null,
  } : null;

  return {
    tokenInfo,
    isLoading,
    error,
    hasToken: !!tokenInfo,
  };
};

/**
 * Hook to get DAO contributors summary
 * @param address DAO contract address
 */
export const useDaoContributorsSummary = (address: string | undefined) => {
  const { data, isLoading, error } = useDaoData(address);

  const summary = data ? {
    totalContributors: parseInt(data.totalContributors),
    totalTokenClaimers: parseInt(data.totalTokenClaimers),
    totalContributions: parseInt(data.totalContributions),
    totalRefunds: parseInt(data.totalRefunds),
    totalRefundedAmount: safeBigInt(data.totalRefundedAmount),
    contributors: (data.contributors ?? [])
      .map((contributor, index) => {
        if (!contributor) {
          return null;
        }

        const address = contributor.contributor ?? contributor.dao;
        if (!address) {
          console.warn("Skipping contributor with missing address", contributor);
          return null;
        }

        return {
          id: contributor.id ?? `${address}:${index}`,
          address,
          totalContributed: safeBigInt(contributor.totalAweContributed),
          netContribution: safeBigInt(contributor.netContribution),
          contributionCount: parseCountOrZero(contributor.contributionCount),
          firstContributionAt: secondsToDate(contributor.firstContributionAt),
          lastActivityAt: secondsToDate(contributor.lastActivityAt),
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
  } : null;

  return {
    summary,
    isLoading,
    error,
  };
};