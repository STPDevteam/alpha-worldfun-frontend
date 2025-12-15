"use client";

import { useMemo } from "react";

import BondingCurveProgressSection from "./bonding-curve-progress-section";
import RightSidebarGraduate from "./right-sidebar-graduate";
import { BalanceGrid } from "./right-sidebar/balance-grid";
import { EnterWorldSection } from "./right-sidebar/enter-world-section";
import { ProgressSection } from "./right-sidebar/progress-section";
import { useDaoPoolData } from "@/libs/hooks/contracts";
import { useDaoSidebarData } from "@/libs/hooks/subgraph/use-dao-data";
import { determineDaoGraduation } from "@/libs/utils/determine-dao-graduation";
import { FundraisingType } from "@/libs/types";
import {
  clampPercentage,
  formatTokenAmount,
  toNumberOrNull,
} from "./right-sidebar/utils";
import type {
  BalanceGridProps,
  BondingCurveProgressProps,
  ContributionSyncPayload,
  EnterWorldSectionProps,
  ProgressSectionProps,
  RightSidebarProps,
} from "./right-sidebar/types";

const formatDateDisplay = (date: Date | null | undefined) => {
  if (!date) {
    return undefined;
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return undefined;
  }
};

const RightSidebar = ({
  enterWorldProps = {},
  progressProps = {},
  bondingCurveProps = {},
  balanceProps = {},
  daoPoolFormData,
  className = "",
  daoPoolDataOverride = null,
  worldStatus = null,
  graduationOverride = null,
  sidebarDataOverride = null,
  onContributionComplete,
  optimisticRaisedAmount = 0,
  raisedOverride = null,
  totalVolume,
  totalTraders,
  launchedTime,
  graduatedAt = null,
  tokenAddress,
  marketCapUsd,
}: RightSidebarProps) => {
  const showBondingCurve =
    progressProps.poolInfo?.type === FundraisingType.BONDING_CURVE;

  const poolAddress =
    progressProps.poolInfo?.type === FundraisingType.FIXED_PRICE
      ? progressProps.poolInfo?.address
      : undefined;

  const { sidebarData: fetchedSidebarData } = useDaoSidebarData(poolAddress);

  const shouldFetchDaoPoolData =
    !daoPoolDataOverride && !showBondingCurve && !!poolAddress;

  const internalDaoPoolData = useDaoPoolData({
    poolAddress,
    enabled: shouldFetchDaoPoolData,
  });

  const daoPoolData = daoPoolDataOverride ?? internalDaoPoolData;
  const sidebarData = sidebarDataOverride ?? fetchedSidebarData;

  const isWorldGraduated = useMemo(() => {
    if (typeof graduationOverride === "boolean") {
      return graduationOverride;
    }

    const statusBasedGraduation = determineDaoGraduation({
      fundraisingType: progressProps.poolInfo?.type,
      status: worldStatus,
    });

    if (statusBasedGraduation) {
      return true;
    }

    if (progressProps.poolInfo?.type === FundraisingType.FIXED_PRICE) {
      const currentRaised =
        sidebarData?.totalRaised ??
        toNumberOrNull(daoPoolData?.totalAweRaisedFormatted);
      const target =
        sidebarData?.fundraisingGoal ??
        toNumberOrNull(progressProps.targetValue);

      if (currentRaised !== null && target !== null && target > 0) {
        return currentRaised >= target;
      }
    }

    return false;
  }, [
    graduationOverride,
    progressProps.poolInfo?.type,
    progressProps.targetValue,
    worldStatus,
    sidebarData?.totalRaised,
    sidebarData?.fundraisingGoal,
    daoPoolData?.totalAweRaisedFormatted,
  ]);

  const graduateTotalVolume = useMemo(() => {
    if (totalVolume) {
      return totalVolume;
    }

    if (typeof daoPoolData?.totalAweRaisedFormatted === "string") {
      return daoPoolData.totalAweRaisedFormatted;
    }

    if (typeof sidebarData?.totalRaised === "number") {
      const formatted = formatTokenAmount(sidebarData.totalRaised);
      return formatted !== "--" ? formatted : undefined;
    }

    return undefined;
  }, [
    totalVolume,
    daoPoolData?.totalAweRaisedFormatted,
    sidebarData?.totalRaised,
  ]);

  const graduateTotalTraders = useMemo(() => {
    if (totalTraders) {
      return totalTraders;
    }

    if (
      typeof sidebarData?.totalContributors === "number" &&
      Number.isFinite(sidebarData.totalContributors)
    ) {
      try {
        return sidebarData.totalContributors.toLocaleString();
      } catch {
        return `${sidebarData.totalContributors}`;
      }
    }

    return undefined;
  }, [totalTraders, sidebarData?.totalContributors]);

  const graduateGraduatedTime = useMemo(
    () => formatDateDisplay(graduatedAt),
    [graduatedAt]
  );
  const resolvedProgressProps = useMemo<ProgressSectionProps>(() => {
    const base: ProgressSectionProps = { ...progressProps };
    const optimisticDelta =
      typeof optimisticRaisedAmount === "number" &&
      Number.isFinite(optimisticRaisedAmount)
        ? Math.max(optimisticRaisedAmount, 0)
        : 0;

    const overrideRaised =
      typeof raisedOverride === "number" && Number.isFinite(raisedOverride)
        ? Math.max(raisedOverride, 0)
        : null;

    if (!sidebarData) {
      return {
        ...base,
        currentValue:
          overrideRaised ?? toNumberOrNull(base.currentValue) ?? null,
        optimisticRaisedAmount: optimisticDelta,
        raisedOverride: overrideRaised,
      };
    }

    const baseCurrent = toNumberOrNull(base.currentValue);
    const baseTarget = (() => {
      const value = toNumberOrNull(base.targetValue);
      return value !== null && value > 0 ? value : null;
    })();
    const baseProgress = toNumberOrNull(base.progressPercentage);
    const baseContribution = toNumberOrNull(base.contributionPercentage);

    const sidebarCurrent = toNumberOrNull(sidebarData.totalRaised);
    const sidebarTargetRaw = toNumberOrNull(sidebarData.fundraisingGoal);
    const sidebarTarget =
      sidebarTargetRaw !== null && sidebarTargetRaw > 0
        ? sidebarTargetRaw
        : null;

    const resolvedCurrent =
      overrideRaised ?? sidebarCurrent ?? baseCurrent ?? null;
    const resolvedTarget = sidebarTarget ?? baseTarget ?? null;

    const sidebarProgress = toNumberOrNull(sidebarData.progressPercentage);
    const computedProgress = (() => {
      if (sidebarProgress !== null) {
        return clampPercentage(sidebarProgress);
      }

      if (
        resolvedCurrent !== null &&
        resolvedTarget !== null &&
        resolvedTarget > 0
      ) {
        return clampPercentage((resolvedCurrent / resolvedTarget) * 100);
      }

      return baseProgress;
    })();

    const resolvedContribution = computedProgress ?? baseContribution ?? null;

    return {
      ...base,
      currentValue: resolvedCurrent,
      targetValue: resolvedTarget,
      progressPercentage: computedProgress,
      contributionPercentage: resolvedContribution,
      optimisticRaisedAmount: optimisticDelta,
      raisedOverride: overrideRaised ?? resolvedCurrent ?? null,
    };
  }, [progressProps, sidebarData, optimisticRaisedAmount, raisedOverride]);

  const resolvedBalanceProps = useMemo<BalanceGridProps>(() => {
    const optimisticDelta =
      typeof optimisticRaisedAmount === "number" &&
      Number.isFinite(optimisticRaisedAmount)
        ? Math.max(optimisticRaisedAmount, 0)
        : 0;
    const overrideRaised =
      typeof raisedOverride === "number" && Number.isFinite(raisedOverride)
        ? Math.max(raisedOverride, 0)
        : null;

    if (!sidebarData) {
      const baseRaised = overrideRaised;
      if (baseRaised === null && optimisticDelta <= 0) {
        return balanceProps;
      }

      const raisedValueWithDelta = (() => {
        if (baseRaised !== null) {
          return baseRaised + optimisticDelta;
        }
        return optimisticDelta > 0 ? optimisticDelta : null;
      })();

      const incomingCards = balanceProps.cards ?? [];
      const adjustedCards = incomingCards.map((card) =>
        card.id === "raised"
          ? {
              ...card,
              value:
                typeof raisedValueWithDelta === "number"
                  ? raisedValueWithDelta
                  : card.value ?? null,
            }
          : card
      );

      const adjustedAweRemaining = (() => {
        if (
          typeof balanceProps.aweRemaining === "number" &&
          Number.isFinite(balanceProps.aweRemaining)
        ) {
          const next = balanceProps.aweRemaining - optimisticDelta;
          return next > 0 ? next : 0;
        }
        return balanceProps.aweRemaining ?? null;
      })();

      return {
        ...balanceProps,
        cards: adjustedCards,
        aweRemaining: adjustedAweRemaining,
      };
    }

    const raisedValue = sidebarData.totalRaised;

    const baseRaisedValue = (() => {
      if (overrideRaised !== null) {
        return overrideRaised;
      }
      if (typeof raisedValue === "number" && Number.isFinite(raisedValue)) {
        return raisedValue;
      }
      return null;
    })();

    const raisedValueWithDelta = (() => {
      if (baseRaisedValue !== null) {
        return baseRaisedValue + optimisticDelta;
      }

      if (optimisticDelta > 0) {
        return optimisticDelta;
      }

      return raisedValue ?? null;
    })();

    const incomingCards = balanceProps.cards;
    const cards = (() => {
      if (incomingCards && incomingCards.length > 0) {
        const hasRaisedCard = incomingCards.some(
          (card) => card.id === "raised"
        );
        const mappedCards = incomingCards.map((card) =>
          card.id === "raised"
            ? {
                ...card,
                value: raisedValueWithDelta,
              }
            : card
        );

        if (hasRaisedCard) {
          return mappedCards;
        }

        return [
          {
            id: "raised",
            title: "Raised",
            value: raisedValueWithDelta,
            type: "small" as const,
          },
          ...mappedCards,
        ];
      }

      return [
        {
          id: "raised",
          title: "Raised",
          value: raisedValueWithDelta,
          type: "small" as const,
        },
        {
          id: "team",
          title: "Team",
          value: null,
          type: "small" as const,
        },
        {
          id: "lp",
          title: "LP",
          value: null,
          type: "small" as const,
        },
      ];
    })();

    const parseFormattedValue = (formatted?: string | null) => {
      if (typeof formatted !== "string") {
        return null;
      }

      const trimmed = formatted.trim();
      if (!trimmed) {
        return null;
      }

      const parsed = Number.parseFloat(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const daoRemaining = (() => {
      const daoFormatted = daoPoolData?.remainingAweForRaisingFormatted;

      if (typeof daoPoolData?.remainingAweForRaising === "bigint") {
        const parsed = parseFormattedValue(daoFormatted);
        if (parsed !== null) {
          return parsed;
        }
      }

      if (daoPoolData?.isLoading === false) {
        const parsed = parseFormattedValue(daoFormatted);
        if (parsed !== null) {
          return parsed;
        }
      }

      if (
        typeof sidebarData.aweRemaining === "number" &&
        Number.isFinite(sidebarData.aweRemaining)
      ) {
        return sidebarData.aweRemaining;
      }

      if (
        typeof balanceProps.aweRemaining === "number" &&
        Number.isFinite(balanceProps.aweRemaining)
      ) {
        return balanceProps.aweRemaining;
      }

      return null;
    })();

    const fundraisingGoal = toNumberOrNull(sidebarData.fundraisingGoal);
    const aweRemainingFromGoal = (() => {
      if (
        fundraisingGoal !== null &&
        fundraisingGoal > 0 &&
        typeof raisedValueWithDelta === "number" &&
        Number.isFinite(raisedValueWithDelta)
      ) {
        const next = fundraisingGoal - raisedValueWithDelta;
        return next > 0 ? next : 0;
      }

      return null;
    })();

    const adjustedDaoRemaining = (() => {
      if (aweRemainingFromGoal !== null) {
        return aweRemainingFromGoal;
      }

      if (typeof daoRemaining === "number" && Number.isFinite(daoRemaining)) {
        const next = daoRemaining - optimisticDelta;
        return next > 0 ? next : 0;
      }

      return daoRemaining;
    })();

    return {
      ...balanceProps,
      cards,
      timeRemainingSeconds:
        sidebarData.timeRemainingSeconds ??
        balanceProps.timeRemainingSeconds ??
        null,
      aweRemaining: adjustedDaoRemaining,
    };
  }, [
    balanceProps,
    sidebarData,
    daoPoolData,
    optimisticRaisedAmount,
    raisedOverride,
  ]);

  if (isWorldGraduated) {
    return (
      <RightSidebarGraduate
        className={className}
        marketCapUsd={marketCapUsd}
        totalVolume={graduateTotalVolume}
        totalTraders={graduateTotalTraders}
        graduatedTime={graduateGraduatedTime}
        launchedTime={launchedTime}
        fundraisingType={progressProps.poolInfo?.type}
        poolAddress={progressProps.poolInfo?.address}
        bannerUrl={enterWorldProps.bannerUrl}
        toTokenAddress={tokenAddress || ""}
      />
    );
  }

  return (
    <div className={`flex flex-col gap-6 w-full ${className}`}>
      <EnterWorldSection {...enterWorldProps} />
      {showBondingCurve ? (
        <BondingCurveProgressSection
          {...bondingCurveProps}
          poolInfo={progressProps.poolInfo}
          daoPoolFormData={daoPoolFormData}
        />
      ) : (
        <div className="flex flex-col not-xl:flex-row md:gap-2 xl:gap-10 w-full">
          <div className="flex-1">
            <ProgressSection
              {...resolvedProgressProps}
              daoPoolData={daoPoolData}
              onContributionComplete={onContributionComplete}
              worldStatus={worldStatus}
            />
          </div>
          <div className="xl:flex-shrink-0">
            <BalanceGrid {...resolvedBalanceProps} />
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
export {
  EnterWorldSection,
  ProgressSection,
  BalanceGrid,
  BondingCurveProgressSection,
};
export type {
  EnterWorldSectionProps,
  ProgressSectionProps,
  BalanceGridProps,
  BondingCurveProgressProps,
  ContributionSyncPayload,
};
