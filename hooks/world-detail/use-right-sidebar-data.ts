import { useMemo } from "react";
import { formatUnits } from "viem";
import type { WorldCard } from "@/libs/types/world-card";
import { FundraisingType, TokenStatus } from "@/libs/types/world-card";
import type { PoolInfo } from "@/libs/types/contracts";
import type {
  ProgressSectionProps,
  BalanceGridProps,
} from "@/components/world-detail/right-sidebar";
import type { useDaoFundraisingProgress } from "@/libs/hooks/subgraph/use-dao-data";
import type { useBondingCurveTradingStats } from "@/libs/hooks/subgraph/use-bonding-curve-data";

type DaoProgress = ReturnType<typeof useDaoFundraisingProgress>["progress"];
type BondingCurveStats = ReturnType<
  typeof useBondingCurveTradingStats
>["stats"];

type NumericLike = string | number | null | undefined;

interface UseRightSidebarDataParams {
  worldData: WorldCard | null;
  daoProgress?: DaoProgress;
  bondingStats?: BondingCurveStats;
  options?: {
    commitValue?: string | null;
    balance?: string | null;
    estimatedAllocation?: string | null;
    onContribute?: ProgressSectionProps["onContribute"];
  };
}

interface RightSidebarMetrics {
  raisedAmount: number | null;
  targetAmount: number | null;
  progressPercentage: number | null;
  contributionPercentage: number | null;
  aweRemaining: number | null;
  endDate: Date | null;
  countdownSeconds: number | null;
}

interface UseRightSidebarDataResult {
  progressProps: ProgressSectionProps;
  balanceProps: BalanceGridProps;
  metrics: RightSidebarMetrics;
}

const parseNumericValue = (value: string | null | undefined, fallback = 0) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseOptionalNumber = (value: NumericLike): number | null => {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

const safeDateConversion = (
  value: Date | string | null | undefined
): Date | null => {
  if (!value) return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const calculateCountdownSeconds = (endDate: Date | null): number | null => {
  if (!endDate) return null;
  const difference = endDate.getTime() - Date.now();
  if (difference <= 0) return 0;

  return Math.floor(difference / 1000);
};

type TokenMetricsType =
  | {
    type: "dao";
    raised: number;
    targetAmount: number;
    contributors: number;
    progressPercentage: number;
    isGoalReached: boolean;
    isActive: boolean;
    endTime: Date | null;
  }
  | {
    type: "bonding-curve";
    raised: number;
    targetAmount: number;
    contributors: number;
    progressPercentage: number;
    isGoalReached: boolean;
    isActive: boolean;
    endTime: Date | null;
  }
  | {
    type: "fallback";
    raised: number;
    targetAmount: number;
    contributors: number;
    progressPercentage: number;
    isGoalReached: boolean;
    isActive: boolean;
    endTime: Date | null;
  };

const buildTokenMetrics = (
  params: Pick<
    UseRightSidebarDataParams,
    "worldData" | "daoProgress" | "bondingStats"
  > & {
    fundraisingType: FundraisingType | undefined;
  }
): TokenMetricsType => {
  const { worldData, daoProgress, bondingStats, fundraisingType } = params;

  if (fundraisingType === FundraisingType.FIXED_PRICE && daoProgress) {
    return {
      type: "dao",
      raised: Number(formatUnits(daoProgress.totalRaised, 18)),
      targetAmount: Number(formatUnits(daoProgress.fundraisingGoal, 18)),
      contributors: daoProgress.totalContributors,
      progressPercentage: daoProgress.progressPercentage,
      isGoalReached: daoProgress.isGoalReached,
      isActive: daoProgress.isActive,
      endTime: safeDateConversion(daoProgress.endTime),
    };
  }

  if (fundraisingType === FundraisingType.BONDING_CURVE && bondingStats) {
    return {
      type: "bonding-curve",
      raised: Number(formatUnits(bondingStats.totalVolume, 18)),
      targetAmount: parseNumericValue(worldData?.targetFundRaise, 1_000_000),
      contributors: bondingStats.totalTraders,
      progressPercentage: bondingStats.isActive ? 50 : 100,
      isGoalReached: !bondingStats.isActive && !!bondingStats.graduatedAt,
      isActive: bondingStats.isActive,
      endTime:
        safeDateConversion(bondingStats.graduatedAt) ||
        safeDateConversion(worldData?.endDate),
    };
  }

  return {
    type: "fallback",
    raised: 342_750,
    targetAmount: parseNumericValue(worldData?.targetFundRaise, 1_000_000),
    contributors: 0,
    progressPercentage: 75,
    isGoalReached: false,
    isActive: true,
    endTime: safeDateConversion(worldData?.endDate),
  };
};

const buildPoolInfo = (worldData: WorldCard | null): PoolInfo => ({
  type: worldData?.fundraisingType,
  name: worldData?.title ?? worldData?.tokenName ?? "Unknown Pool",
  symbol: worldData?.tokenSymbol ?? undefined,
  address: worldData?.poolAddress ?? undefined,
  tokenAddress: worldData?.tokenAddress ?? undefined,
  tokenImage: worldData?.tokenImage ?? undefined,
});

export const useRightSidebarData = (
  params: UseRightSidebarDataParams
): UseRightSidebarDataResult => {
  const { worldData, daoProgress, bondingStats, options } = params;

  const fundraisingType = worldData?.fundraisingType;

  return useMemo(() => {
    const tokenMetrics = buildTokenMetrics({
      worldData,
      daoProgress,
      bondingStats,
      fundraisingType,
    });

    const worldRaisedRaw = parseOptionalNumber(worldData?.marketCap);
    const worldTargetRaw = parseOptionalNumber(worldData?.targetFundRaise);
    const metricsRaised = parseOptionalNumber(tokenMetrics.raised);
    const metricsTarget = parseOptionalNumber(tokenMetrics.targetAmount);

    const raisedAmount = worldRaisedRaw ?? metricsRaised;
    const targetAmount = worldTargetRaw ?? metricsTarget;

    const worldProgressPercentage =
      worldRaisedRaw !== null && worldTargetRaw !== null && worldTargetRaw > 0
        ? (worldRaisedRaw / worldTargetRaw) * 100
        : null;

    const metricsProgressPercentage = parseOptionalNumber(
      tokenMetrics.progressPercentage
    );

    const progressPercentageValue =
      worldProgressPercentage ?? metricsProgressPercentage;

    const contributionPercentageValue =
      worldProgressPercentage ??
      (metricsRaised !== null && metricsTarget !== null && metricsTarget > 0
        ? (metricsRaised / metricsTarget) * 100
        : null);

    const endDateFromWorld = safeDateConversion(worldData?.endDate);
    const resolvedEndDate = endDateFromWorld ?? tokenMetrics.endTime ?? null;

    const countdownSeconds = calculateCountdownSeconds(resolvedEndDate);

    const estimatedAllocationDisplay = options?.estimatedAllocation ?? "--";
    const balancePlaceholder = options?.balance ?? "--";

    const balanceCards = [
      {
        id: "raised",
        title: "Raised",
        value: raisedAmount,
        type: "small" as const,
      },
      {
        id: "team",
        title: "Team",
        value: 2, // 20%
        type: "small" as const,
      },
      {
        id: "lp",
        title: "LP",
        value: 18, // 18%
        type: "small" as const,
      },
      {
        id: "explore",
        title: "Explore",
        value: null,
        type: "small" as const,
        poolAddress: worldData?.poolAddress ?? undefined,
      },
    ];

    const contributionLabel =
      contributionPercentageValue === null ||
        Number.isNaN(contributionPercentageValue)
        ? null
        : contributionPercentageValue.toFixed(2);

    const progressProps: ProgressSectionProps = {
      currentValue: raisedAmount,
      targetValue: targetAmount,
      progressPercentage: progressPercentageValue,
      commitValue: options?.commitValue ?? null,
      balance: balancePlaceholder,
      contributionPercentage: contributionLabel,
      estimatedAllocation: estimatedAllocationDisplay,
      poolInfo: buildPoolInfo(worldData),
      onContribute: options?.onContribute,
      status: worldData?.status,
    };

    const balanceProps: BalanceGridProps = {
      cards: balanceCards,
      timeRemainingSeconds: countdownSeconds,
      aweRemaining: null,
    };

    const metrics: RightSidebarMetrics = {
      raisedAmount,
      targetAmount,
      progressPercentage: progressPercentageValue,
      contributionPercentage: contributionPercentageValue,
      aweRemaining: null,
      endDate: resolvedEndDate,
      countdownSeconds,
    };

    return {
      progressProps,
      balanceProps,
      metrics,
    };
  }, [
    worldData,
    daoProgress,
    bondingStats,
    fundraisingType,
    options?.commitValue,
    options?.balance,
    options?.estimatedAllocation,
    options?.onContribute,
  ]);
};
