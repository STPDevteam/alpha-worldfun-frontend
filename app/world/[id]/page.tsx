"use client";

import React, { useCallback, useState } from "react";
import { formatUnits } from "viem";
import { useRouter } from "next/navigation";
import {
  BreadcrumbSection,
  OverviewSection,
  ChartSection,
  RightSidebar,
  MobileTabGroup,
  FundraiseParticipantsTable,
  TradingViewChart,
  FundraiseParticipantsTableMobile,
  FundraiseParticipantsTableSkeleton,
  BondingCurveProgressSection,
  RightSidebarGraduate,
  RightSidebarRefundClaim,
} from "@/components/world-detail";
import {
  ProgressSection,
  BalanceGrid,
  ContributionSyncPayload,
  EnterWorldSection,
} from "@/components/world-detail/right-sidebar";
//import { ProjectTabs } from "@/components/world-detail/tab-section";
import { TabContentAnimator } from "@/components/animations";
import { ArrowUpRightSharpIcon } from "@/components/ui/icons";
import { useWorldDetail } from "@/hooks/api/use-world-detail";
import { useAuth } from "@/libs/hooks/auth";
import { useNavigationLoadingStore } from "@/libs/stores";
import {
  FundraisingType,
  TokenStatus,
  type FundraiseParticipant,
} from "@/libs/types/world-card";
import {
  useDaoData,
  useDaoFundraisingProgress,
  useBondingCurveByPool,
  useBondingCurveTradingStats,
  useContributionHistoryByDao,
} from "@/libs/hooks/subgraph";
import {
  useDaoPoolData,
  useDaoPoolContributions,
  useBondingCurveGraduated,
  useTokenAgentId,
} from "@/libs/hooks/contracts";
import { useAccount } from "wagmi";
import { Text } from "@/components/ui";
import { transformContributionHistoryToParticipants } from "@/libs/utils/subgraph-transformations";
import { useRightSidebarData } from "@/hooks/world-detail/use-right-sidebar-data";
import { determineDaoGraduation } from "@/libs/utils/determine-dao-graduation";
import { useDaoSidebarData } from "@/libs/hooks/subgraph/use-dao-data";

import { useParams } from "next/navigation";
import { DEFAULT_WORLD_IMAGE_SRC } from "@/libs/constants";
import { useQueryClient } from "@tanstack/react-query";
import Decimal from "decimal.js";

interface OptimisticParticipant extends FundraiseParticipant {
  expiresAt: number;
}

const WorldDetailPage = () => {
  const router = useRouter();
  const params = useParams() as { id: string };
  const worldId = params.id;
  const queryClient = useQueryClient();

  const worldDetailQueryKey = React.useMemo(
    () => ["world-detail", worldId] as const,
    [worldId]
  );

  const invalidateWorldDetail = React.useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: worldDetailQueryKey,
    });
  }, [queryClient, worldDetailQueryKey]);
  const startNavigation = useNavigationLoadingStore(
    (state) => state.startNavigation
  );
  const handleAdminNavigation = useCallback(() => {
    const adminPath = `/admin/${worldId}`;
    startNavigation(adminPath);
    router.push(adminPath);
  }, [router, startNavigation, worldId]);
  // Fetch world data initially to get pool address
  const worldDataQuery = useWorldDetail(worldId);
  const worldDataInitial = worldDataQuery.data;

  // Get pool data to check isGraduated status based on token type
  const isDaoTokenInitial =
    worldDataInitial?.fundraisingType === FundraisingType.FIXED_PRICE;
  const isBondingCurveTokenInitial =
    worldDataInitial?.fundraisingType === FundraisingType.BONDING_CURVE;

  const daoPoolAddressInitial =
    isDaoTokenInitial && worldDataInitial?.poolAddress
      ? worldDataInitial.poolAddress
      : undefined;

  const bondingCurvePoolAddressInitial =
    isBondingCurveTokenInitial && worldDataInitial?.poolAddress
      ? worldDataInitial.poolAddress
      : undefined;

  const daoPoolDataInitial = useDaoPoolData({
    poolAddress: daoPoolAddressInitial,
    enabled: Boolean(isDaoTokenInitial && daoPoolAddressInitial),
  });

  const bondingCurveGraduatedInitial = useBondingCurveGraduated({
    poolAddress: bondingCurvePoolAddressInitial,
    enabled: Boolean(
      isBondingCurveTokenInitial && bondingCurvePoolAddressInitial
    ),
  });

  // Determine which isGraduated value to use based on token type
  const isGraduatedForRefetch = isDaoTokenInitial
    ? daoPoolDataInitial?.isGraduated
    : isBondingCurveTokenInitial
    ? bondingCurveGraduatedInitial?.isGraduated
    : undefined;

  // Fetch world data with isGraduated for conditional refetch
  const {
    data: worldData,
    isLoading,
    error,
  } = useWorldDetail(worldId, { isGraduated: isGraduatedForRefetch });

  const {
    user: currentUser,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuth();
  const isDaoToken = worldData?.fundraisingType === FundraisingType.FIXED_PRICE;
  const isBondingCurveToken =
    worldData?.fundraisingType === FundraisingType.BONDING_CURVE;

  const daoPoolAddress =
    isDaoToken && worldData?.poolAddress ? worldData.poolAddress : undefined;
  const daoPoolData = useDaoPoolData({
    poolAddress: daoPoolAddress,
    enabled: Boolean(isDaoToken && daoPoolAddress),
  });

  // Get user's wallet address
  const { address: userAddress, isConnected } = useAccount();

  // TODO:Remove in future
  // Get token agent ID
  const { agentId } = useTokenAgentId({
    tokenAddress: worldData?.tokenAddress ?? undefined,
    enabled: Boolean(worldData?.tokenAddress),
  });

  // Invalidate auth query when wallet connection changes to update isOwner
  React.useEffect(() => {
    if (isConnected && userAddress) {
      queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
    }
  }, [isConnected, userAddress, queryClient]);

  // Get user's contribution data for DAO tokens
  const {
    refunded: userRefunded,
    claimedTokenAmount: userClaimedAmount,
    aweAmountFormatted: userContribution,
  } = useDaoPoolContributions({
    poolAddress: daoPoolAddress,
    userAddress: userAddress,
    enabled: Boolean(isDaoToken && daoPoolAddress && userAddress),
  });

  // Check if user has claimed (claimedTokenAmount > 0)
  const userHasClaimed = userClaimedAmount && userClaimedAmount > 0;
  const userHasContributed = userContribution && Number(userContribution) > 0;

  // DAO data hooks (only active for FIXED_PRICE tokens)
  const { isLoading: daoLoading } = useDaoData(daoPoolAddress);
  const { progress: daoProgress, isLoading: daoProgressLoading } =
    useDaoFundraisingProgress(daoPoolAddress);
  // Bonding curve data hooks (only active for BONDING_CURVE tokens)
  const { stats: bondingStats, isLoading: bondingStatsLoading } =
    useBondingCurveTradingStats(
      isBondingCurveToken && worldData?.poolAddress
        ? worldData.poolAddress
        : undefined
    );
  const bondingCurveGraduateTotals = React.useMemo(() => {
    if (!bondingStats) {
      return {
        totalVolume: "--",
        totalTraders: "0",
      };
    }

    const totalVolume = formatUnits(bondingStats.totalVolume, 18);

    return {
      totalVolume,
      totalTraders: bondingStats.totalTraders.toString(),
    };
  }, [bondingStats]);
  const {
    data: contributionHistory,
    isLoading: contributionHistoryLoading,
    isFetching: contributionHistoryFetching,
    error: contributionHistoryError,
    refetch: refetchContributionHistory,
  } = useContributionHistoryByDao(daoPoolAddress, 1, 50);

  const lastContributionHistoryErrorRef = React.useRef<Error | null>(null);

  if (
    contributionHistoryError &&
    lastContributionHistoryErrorRef.current !== contributionHistoryError
  ) {
    console.error("Contribution history error:", contributionHistoryError);
    lastContributionHistoryErrorRef.current = contributionHistoryError;
  } else if (
    !contributionHistoryError &&
    lastContributionHistoryErrorRef.current
  ) {
    lastContributionHistoryErrorRef.current = null;
  }
  const { isLoading: bondingCurveLoading } = useBondingCurveByPool(
    isBondingCurveToken && worldData?.poolAddress
      ? worldData.poolAddress
      : undefined
  );

  const baseParticipantsData = React.useMemo(
    () => transformContributionHistoryToParticipants(contributionHistory),
    [contributionHistory]
  );

  const [optimisticParticipants, setOptimisticParticipants] = React.useState<
    OptimisticParticipant[]
  >([]);

  const activeOptimisticParticipants = React.useMemo(() => {
    if (!optimisticParticipants.length) {
      return [] as OptimisticParticipant[];
    }

    const now = Date.now();
    const actualHashes = new Set(
      baseParticipantsData.participants
        .map((participant) => participant.txHash)
        .filter((hash): hash is string => Boolean(hash))
    );

    return optimisticParticipants.filter((participant) => {
      if (participant.expiresAt <= now) {
        return false;
      }

      if (participant.txHash && actualHashes.has(participant.txHash)) {
        return false;
      }

      return true;
    });
  }, [baseParticipantsData, optimisticParticipants]);

  const optimisticRaisedTotal = React.useMemo(
    () =>
      activeOptimisticParticipants.reduce(
        (sum, participant) => sum + participant.amount,
        0
      ),
    [activeOptimisticParticipants]
  );

  const mergedParticipantsData = React.useMemo(() => {
    if (!activeOptimisticParticipants.length) {
      return baseParticipantsData;
    }

    const actualParticipants = baseParticipantsData.participants;
    const sanitizedOptimistic = activeOptimisticParticipants.map(
      ({ expiresAt, ...rest }) => {
        void expiresAt;
        return rest;
      }
    );
    const merged = [...sanitizedOptimistic, ...actualParticipants].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      ...baseParticipantsData,
      participants: merged,
      totalAmount: baseParticipantsData.totalAmount + optimisticRaisedTotal,
      totalParticipants:
        baseParticipantsData.totalParticipants + sanitizedOptimistic.length,
    };
  }, [
    activeOptimisticParticipants,
    baseParticipantsData,
    optimisticRaisedTotal,
  ]);

  React.useEffect(() => {
    if (!optimisticParticipants.length) {
      return;
    }

    const actualHashes = new Set(
      baseParticipantsData.participants
        .map((participant) => participant.txHash)
        .filter((hash): hash is string => Boolean(hash))
    );

    setOptimisticParticipants((prev) => {
      if (!prev.length) {
        return prev;
      }

      const now = Date.now();
      const next = prev.filter((participant) => {
        if (participant.expiresAt <= now) {
          return false;
        }

        if (participant.txHash && actualHashes.has(participant.txHash)) {
          return false;
        }

        return true;
      });

      return next.length === prev.length ? prev : next;
    });
  }, [baseParticipantsData, optimisticParticipants.length]);

  React.useEffect(() => {
    if (!optimisticParticipants.length) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setOptimisticParticipants((prev) => {
        if (!prev.length) {
          return prev;
        }

        const now = Date.now();
        const next = prev.filter((participant) => participant.expiresAt > now);
        return next.length === prev.length ? prev : next;
      });
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [optimisticParticipants.length]);

  const handleContributionComplete = React.useCallback(
    (payload: ContributionSyncPayload) => {
      const normalizedAmount = Number(payload.amount);
      if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
        return;
      }

      const timestamp =
        payload.timestamp instanceof Date
          ? payload.timestamp
          : new Date(payload.timestamp);

      setOptimisticParticipants((prev) => {
        const now = Date.now();
        const expiresAt = now + 60_000; // keep optimistic row for up to 60 seconds
        const baseId =
          payload.txHash ?? `${payload.walletAddress ?? "you"}-${now}`;
        const participantId = `optimistic-${baseId}`;

        const optimisticParticipant: OptimisticParticipant = {
          id: participantId,
          walletAddress: payload.walletAddress ?? "You",
          amount: normalizedAmount,
          percentage: 0,
          timestamp,
          tokenAmount: undefined,
          txHash: payload.txHash,
          isPending: true,
          expiresAt,
        };

        const next = prev.filter((participant) => {
          if (payload.txHash && participant.txHash) {
            return participant.txHash !== payload.txHash;
          }

          return participant.id !== participantId;
        });

        return [...next, optimisticParticipant];
      });

      void refetchContributionHistory({ throwOnError: false });
      invalidateWorldDetail();
    },
    [refetchContributionHistory, invalidateWorldDetail]
  );
  const hasPendingOptimisticParticipants = React.useMemo(
    () =>
      mergedParticipantsData.participants.some(
        (participant) => participant.isPending
      ),
    [mergedParticipantsData.participants]
  );

  const isContributionTableRefreshing =
    (contributionHistoryFetching && !contributionHistoryLoading) ||
    hasPendingOptimisticParticipants;

  const worldGraduationStatus = React.useMemo(() => {
    if (!worldData?.status) {
      return null;
    }

    return determineDaoGraduation({
      fundraisingType: worldData?.fundraisingType,
      status: worldData.status,
    });
  }, [worldData?.fundraisingType, worldData?.status]);

  const isWorldGraduated = worldGraduationStatus === true;

  const showTradingViewChart = isWorldGraduated;
  const showChartSection = isBondingCurveToken && !isWorldGraduated;
  const showFundraiseParticipants = isDaoToken;
  const worldTitle = worldData?.title || `Project Details - ${worldId}`;
  const isOwner = React.useMemo(() => {
    // Return false while auth is loading to prevent flashing
    if (isAuthLoading) {
      return false;
    }

    if (!worldData || !currentUser || !isAuthenticated) {
      return false;
    }

    return String(worldData.userId) === String(currentUser.id);
  }, [
    worldData?.userId,
    currentUser?.id,
    isAuthenticated,
    isAuthLoading,
    userAddress,
    isConnected,
  ]);

  // Mobile tab state management
  const [mobileActiveTab, setMobileActiveTab] = useState<"info" | "fundraise">(
    "fundraise"
  );

  const breadcrumbItems = [
    { label: "Discover Tokens", href: "/" },
    { label: worldTitle },
  ];

  const renderAdminPageButton = useCallback(
    () => (
      <button
        type="button"
        onClick={handleAdminNavigation}
        className="flex items-center gap-1 text-[#E0E0E0] text-sm leading-[18px] font-normal hover:text-white transition-colors whitespace-nowrap cursor-pointer
          md:ml-4 mr-3 md:mr-0"
        style={{ fontFamily: "DM Mono" }}
      >
        <span>Admin Page</span>
        <ArrowUpRightSharpIcon size={14} className="text-current" />
      </button>
    ),
    [handleAdminNavigation]
  );

  const handleTabChange = (tab: "info" | "fundraise") => {
    setMobileActiveTab(tab);
  };

  const { progressProps, balanceProps } = useRightSidebarData({
    worldData,
    daoProgress,
    bondingStats,
    options: {
      onContribute: () => {},
    },
  });

  const { sidebarData } = useDaoSidebarData(
    isDaoToken ? daoPoolAddress : undefined
  );

  const mobileBalanceProps = React.useMemo(() => {
    if (!sidebarData) {
      return balanceProps;
    }

    const raisedValue = sidebarData.totalRaised;

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
                value: raisedValue,
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
            value: raisedValue,
            type: "small" as const,
          },
          ...mappedCards,
        ];
      }

      return [
        {
          id: "raised",
          title: "Raised",
          value: raisedValue,
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

    return {
      ...balanceProps,
      cards,
      timeRemainingSeconds:
        sidebarData.timeRemainingSeconds ??
        balanceProps.timeRemainingSeconds ??
        null,
      aweRemaining: daoRemaining,
    };
  }, [balanceProps, sidebarData, daoPoolData]);

  const mobileBalancePropsWithOptimism = React.useMemo(() => {
    const raisedCard = mobileBalanceProps.cards?.find(
      (card) => card.id === "raised"
    );
    const raisedCardValue =
      typeof raisedCard?.value === "number" && Number.isFinite(raisedCard.value)
        ? raisedCard.value
        : null;

    const baseRaisedFromContributions = baseParticipantsData.totalAmount;
    const effectiveBaseRaised = Math.max(
      raisedCardValue ?? 0,
      Number.isFinite(baseRaisedFromContributions)
        ? baseRaisedFromContributions
        : 0
    );

    const raisedWithDelta = effectiveBaseRaised + optimisticRaisedTotal;

    const sourceCards = mobileBalanceProps.cards ?? [
      {
        id: "raised",
        title: "Raised",
        value: null,
        type: "small" as const,
      },
    ];

    const cards = sourceCards.map((card) =>
      card.id === "raised"
        ? {
            ...card,
            value: raisedWithDelta,
          }
        : card
    );

    const targetFromWorld = (() => {
      if (!worldData) {
        return null;
      }

      const parsed = Number(worldData.targetFundRaise ?? 0);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    })();

    const aweRemainingFromGoal = (() => {
      if (targetFromWorld !== null) {
        const remaining = targetFromWorld - raisedWithDelta;
        return remaining > 0 ? remaining : 0;
      }

      return null;
    })();

    const fallbackAweRemaining = (() => {
      if (
        typeof mobileBalanceProps.aweRemaining === "number" &&
        Number.isFinite(mobileBalanceProps.aweRemaining)
      ) {
        const baseRemaining = mobileBalanceProps.aweRemaining;
        const delta = optimisticRaisedTotal;
        const next = baseRemaining - delta;
        return next > 0 ? next : 0;
      }

      return mobileBalanceProps.aweRemaining ?? null;
    })();

    return {
      ...mobileBalanceProps,
      cards,
      aweRemaining: aweRemainingFromGoal ?? fallbackAweRemaining,
    };
  }, [
    mobileBalanceProps,
    baseParticipantsData.totalAmount,
    optimisticRaisedTotal,
    worldData,
  ]);

  const progressPropsWithDaoData = React.useMemo(() => {
    if (!isDaoToken) {
      return progressProps;
    }

    return {
      ...progressProps,
      daoPoolData,
    };
  }, [isDaoToken, progressProps, daoPoolData]);

  const daoPoolDataOverride = isDaoToken ? daoPoolData : null;
  const worldGraduationOverride = worldGraduationStatus;

  // Check if subgraph data is still loading
  const isSubgraphLoading = isDaoToken
    ? daoLoading || daoProgressLoading || contributionHistoryLoading
    : isBondingCurveToken
    ? bondingStatsLoading || bondingCurveLoading
    : false;

  const isInitialLoading = isLoading && !worldData;

  const socialLinks = React.useMemo(() => {
    if (!worldData) {
      return [];
    }

    const links: Array<{ type: string; url: string }> = [];
    const seen = new Set<string>();

    const normalizeUrl = (value?: string | null) => {
      if (!value) {
        return null;
      }

      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }

      if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
      }

      if (/^[a-z0-9]+:/i.test(trimmed)) {
        return trimmed;
      }

      if (trimmed.startsWith("www.")) {
        return `https://${trimmed}`;
      }

      return `https://${trimmed}`;
    };

    const addLink = (type: string, value?: string | null) => {
      const normalized = normalizeUrl(value);
      if (!normalized) {
        return;
      }

      const key = `${type}-${normalized.toLowerCase()}`;
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      links.push({ type, url: normalized });
    };

    if (worldData.xUrl) {
      addLink("twitter", worldData.xUrl);
    } else if (worldData.worldXHandler) {
      const handler = worldData.worldXHandler.trim();
      if (handler) {
        const formatted = handler.startsWith("http")
          ? handler
          : `https://x.com/${handler.replace(/^@/, "")}`;
        addLink("twitter", formatted);
      }
    }

    addLink("discord", worldData.discordUrl);
    addLink("telegram", worldData.telegramUrl);
    addLink("github", worldData.githubUrl);
    addLink("onchain-profile", worldData.onchainProfileLink);
    addLink("website", worldData.websiteUrl);

    return links;
  }, [worldData]);

  const isDaoMetricsLoading = Boolean(
    worldData && isDaoToken && isSubgraphLoading
  );
  const isBondingMetricsLoading = Boolean(
    worldData && isBondingCurveToken && isSubgraphLoading
  );

  // Show loading state - include subgraph loading
  if (isInitialLoading) {
    return (
      <div
        className="min-h-screen text-white flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, #101010 0%, #1F1F22 100%),linear-gradient(0deg, rgba(1, 1, 1, 0.53), rgba(1, 1, 1, 0.53))",
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading world details...</p>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatLaunchDate = (date: Date | null | undefined): string => {
    if (!date) return "TBD";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  // Format date specifically for RightSidebarGraduate component (e.g., "Jan 21 2025")
  const formatLaunchDateForGraduate = (
    date: Date | null | undefined
  ): string => {
    if (!date) return "TBD";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  // Show error state
  if (error) {
    return (
      <div
        className="min-h-screen text-white flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, #101010 0%, #1F1F22 100%),linear-gradient(0deg, rgba(1, 1, 1, 0.53), rgba(1, 1, 1, 0.53))",
        }}
      >
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading world details</p>
          <p className="text-white/60 text-sm">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "linear-gradient(180deg, #101010 0%, #1F1F22 100%),linear-gradient(0deg, rgba(1, 1, 1, 0.53), rgba(1, 1, 1, 0.53))",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 md:py-6 pt-5 pb-17 w-full flex flex-col">
        {/* Breadcrumb */}
        <div className="mb-11 hidden w-full items-center justify-between md:flex">
          <BreadcrumbSection items={breadcrumbItems} />
          {/* Admin Link - Only show if user owns this world */}
          {isOwner && renderAdminPageButton()}
        </div>

        {isOwner && (
          <div className="mb-6 flex w-full justify-end md:hidden">
            {renderAdminPageButton()}
          </div>
        )}

        {/* Main Content Layout */}
        <div className="flex flex-col xl:flex-row md:gap-6 xl:gap-[30px]">
          {/* Desktop Layout - Always visible on desktop */}
          <div className="hidden xl:flex md:flex-col xl:flex-row md:gap-6 xl:gap-[30px] w-full">
            {/* Left Column */}
            <div className="md:flex-1 space-y-6">
              {/* Overview Section */}
              <OverviewSection
                title={
                  worldData?.title || worldData?.tokenSymbol || "Loading..."
                }
                tokenSymbol={worldData?.tokenSymbol}
                launchDate={formatLaunchDate(
                  worldData?.createdAt // Use createdAt since tgeDate/startDate were removed
                )}
                description={
                  worldData?.description || "No description available."
                }
                tokenImage={worldData?.tokenImage || DEFAULT_WORLD_IMAGE_SRC}
                address={worldData?.tokenAddress || ""}
                socialLinks={socialLinks}
              />

              {showChartSection && (
                <ChartSection
                  bondingCurveAddress={
                    worldData?.poolAddress?.toLowerCase() || undefined
                  }
                  timeFilter={"7D"}
                  onTimeFilterChange={(filter) => {
                    // Handle time filter change
                  }}
                  showTrendLine={false}
                  splitChart={true}
                  loading={isBondingMetricsLoading}
                  currentMarketCap={Number(worldData?.marketCap || 0)}
                  totalSupply={100_000_000_000}
                />
              )}
              {showTradingViewChart && (
                <TradingViewChart
                  tokenAddress={
                    process.env.NEXT_PUBLIC_NETWORK === "testnet"
                      ? "0xcb7f520d18141e36956fe0b3a6bc3d4f11245521" // awe address
                      : worldData?.tokenAddress || ""
                  }
                />
              )}

              {showFundraiseParticipants && (
                <>
                  <Text className="text-white text-lg font-semibold mt-6">
                    Fundraise Participants
                  </Text>
                  {isDaoMetricsLoading ? (
                    <FundraiseParticipantsTableSkeleton />
                  ) : (
                    <FundraiseParticipantsTable
                      data={mergedParticipantsData}
                      isRefreshing={isContributionTableRefreshing}
                    />
                  )}
                </>
              )}
            </div>

            {/* Right Sidebar - Desktop */}
            <div className="xl:w-[447px] xl:flex-shrink-0 w-full">
              {(worldData?.status === TokenStatus.CANCELLED && isDaoToken) ||
              (isWorldGraduated &&
                isDaoToken &&
                userHasContributed &&
                !userHasClaimed) ? (
                <RightSidebarRefundClaim
                  poolAddress={daoPoolAddress}
                  daoPoolData={daoPoolData}
                  tokenImage={worldData?.tokenImage || DEFAULT_WORLD_IMAGE_SRC}
                  tokenSymbol={worldData?.tokenSymbol || "TOKEN"}
                  bannerUrl={worldData?.bannerUrl ?? undefined}
                  onRefundComplete={() => {
                    // Refetch contribution history after refund
                    void refetchContributionHistory({ throwOnError: false });
                  }}
                  onClaimComplete={() => {
                    // Refetch contribution history and invalidate user contributions to update UI state
                    void refetchContributionHistory({ throwOnError: false });

                    // Invalidate Wagmi queries for user contributions
                    queryClient.invalidateQueries({
                      queryKey: [
                        "readContract",
                        {
                          address: daoPoolAddress,
                          functionName: "contributions",
                        },
                      ],
                    });
                  }}
                />
              ) : worldData?.status === TokenStatus.LIVE &&
                isWorldGraduated &&
                isDaoToken &&
                userHasClaimed ? (
                // Show graduate sidebar when token graduated and user has claimed
                <RightSidebarGraduate
                  marketCapUsd={worldData?.marketCapUsd ?? undefined}
                  totalVolume={
                    isBondingCurveToken
                      ? bondingCurveGraduateTotals.totalVolume
                      : "--"
                  }
                  totalTraders={
                    isBondingCurveToken
                      ? bondingCurveGraduateTotals.totalTraders
                      : sidebarData?.totalContributors?.toString() || "0"
                  }
                  bannerUrl={worldData?.bannerUrl ?? undefined}
                  launchedTime={formatLaunchDateForGraduate(
                    worldData?.createdAt
                  )}
                  toTokenAddress={
                    process.env.NEXT_PUBLIC_NETWORK === "testnet"
                      ? "0xaD6198206DeC2a63B55ec30ae8a358DE860b427D"
                      : worldData?.tokenAddress || ""
                  }
                  poolAddress={worldData?.poolAddress ?? undefined}
                  fundraisingType={worldData?.fundraisingType}
                  graduatedTime={
                    worldData?.graduatedAt
                      ? formatLaunchDateForGraduate(worldData.graduatedAt)
                      : undefined
                  }
                />
              ) : (
                // Default sidebar for all other cases
                <RightSidebar
                  enterWorldProps={{
                    bannerUrl: worldData?.bannerUrl ?? undefined,
                    tokenType: worldData?.tokenType ?? undefined,
                  }}
                  progressProps={progressPropsWithDaoData}
                  balanceProps={balanceProps}
                  daoPoolDataOverride={daoPoolDataOverride}
                  worldStatus={worldData?.status ?? null}
                  graduationOverride={worldGraduationOverride}
                  sidebarDataOverride={sidebarData}
                  onContributionComplete={handleContributionComplete}
                  optimisticRaisedAmount={optimisticRaisedTotal}
                  raisedOverride={baseParticipantsData.totalAmount}
                  totalVolume={
                    isBondingCurveToken
                      ? bondingCurveGraduateTotals.totalVolume
                      : "--"
                  }
                  totalTraders={
                    isBondingCurveToken
                      ? bondingCurveGraduateTotals.totalTraders
                      : sidebarData?.totalContributors?.toString() || "0"
                  }
                  launchedTime={formatLaunchDateForGraduate(
                    worldData?.createdAt
                  )}
                  graduatedAt={
                    worldData?.graduatedAt
                      ? new Date(worldData.graduatedAt)
                      : undefined
                  }
                  tokenAddress={worldData?.tokenAddress || ""}
                  marketCapUsd={worldData?.marketCapUsd || ""}
                />
              )}
            </div>
          </div>

          {/* Mobile & tablet Layout - Tab-based conditional rendering */}
          <div
            className="xl:hidden flex flex-col space-y-6 gap-3 md:gap-6 lg:gap-10"
            style={{
              paddingBottom:
                "calc(var(--mobile-tab-group-height, 3rem) + 20px + env(safe-area-inset-bottom))",
            }}
          >
            {/* Overview Section - Always visible on mobile */}
            <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-6">
              <div className="md:w-3/5">
                <OverviewSection
                  title={
                    worldData?.title || worldData?.tokenSymbol || "Loading..."
                  }
                  tokenSymbol={worldData?.tokenSymbol}
                  launchDate={formatLaunchDate(
                    worldData?.createdAt // Use createdAt since tgeDate/startDate were removed
                  )}
                  description={
                    worldData?.description || "No description available."
                  }
                  tokenImage={worldData?.tokenImage || DEFAULT_WORLD_IMAGE_SRC}
                  address={worldData?.tokenAddress || ""}
                  socialLinks={socialLinks}
                />
              </div>
              <div className="md:w-2/5">
                <EnterWorldSection
                  bannerUrl={worldData?.bannerUrl ?? undefined}
                />
              </div>
            </div>

            {/* Conditional Content Based on Active Tab with Animation */}
            <TabContentAnimator tabKey={mobileActiveTab} className="space-y-6">
              {mobileActiveTab === "fundraise" ? (
                <>
                  {/* Trading Section with 20px top spacing */}
                  <div className="mt-5 mx-auto w-full justify-center">
                    {isBondingCurveToken ? (
                      isWorldGraduated ? (
                        <RightSidebarGraduate
                          marketCapUsd={worldData?.marketCapUsd ?? undefined}
                          totalVolume={
                            isBondingCurveToken
                              ? bondingCurveGraduateTotals.totalVolume
                              : "--"
                          }
                          totalTraders={
                            isBondingCurveToken
                              ? bondingCurveGraduateTotals.totalTraders
                              : sidebarData?.totalContributors?.toString() ||
                                "0"
                          }
                          bannerUrl={worldData?.bannerUrl ?? undefined}
                          launchedTime={formatLaunchDateForGraduate(
                            worldData?.createdAt
                          )}
                          toTokenAddress={
                            process.env.NEXT_PUBLIC_NETWORK === "testnet"
                              ? "0xaD6198206DeC2a63B55ec30ae8a358DE860b427D"
                              : worldData?.tokenAddress || ""
                          }
                          poolAddress={worldData?.poolAddress ?? undefined}
                          fundraisingType={FundraisingType.BONDING_CURVE}
                          graduatedTime={
                            worldData?.graduatedAt
                              ? formatLaunchDateForGraduate(
                                  worldData.graduatedAt
                                )
                              : undefined
                          }
                        />
                      ) : (
                        <BondingCurveProgressSection
                          poolInfo={progressProps.poolInfo}
                          currentValue={worldData?.marketCap || "0"}
                          targetValue={worldData?.targetFundRaise || "100000"}
                          progressPercentage={Decimal(worldData?.marketCap || 0)
                            .mul(100)
                            .div(worldData?.targetFundRaise || 100000)
                            .toDecimalPlaces(2, Decimal.ROUND_DOWN)
                            .toNumber()}
                          aweInBondingCurve={worldData?.marketCap || "0"}
                        />
                      )
                    ) : (
                      <>
                        {/* Show refund/claim component when:
                            1. Token is cancelled (ended) and user hasn't refunded
                            2. Token is graduated and user hasn't claimed */}
                        {(worldData?.status === TokenStatus.CANCELLED &&
                          isDaoToken) ||
                        (isWorldGraduated &&
                          isDaoToken &&
                          userHasContributed &&
                          !userHasClaimed) ? (
                          <RightSidebarRefundClaim
                            poolAddress={daoPoolAddress}
                            daoPoolData={daoPoolData}
                            bannerUrl={worldData?.bannerUrl ?? undefined}
                            onRefundComplete={() => {
                              // Refetch contribution history after refund
                              void refetchContributionHistory({
                                throwOnError: false,
                              });
                            }}
                            onClaimComplete={() => {
                              // Refetch contribution history and invalidate user contributions to update UI state
                              void refetchContributionHistory({
                                throwOnError: false,
                              });

                              // Invalidate Wagmi queries for user contributions
                              queryClient.invalidateQueries({
                                queryKey: [
                                  "readContract",
                                  {
                                    address: daoPoolAddress,
                                    functionName: "contributions",
                                  },
                                ],
                              });
                            }}
                          />
                        ) : isWorldGraduated &&
                          (userHasClaimed || !userHasContributed) ? (
                          // Show graduate sidebar when token graduated and user has claimed
                          <RightSidebarGraduate
                            marketCapUsd={worldData?.marketCapUsd ?? undefined}
                            totalVolume={
                              isBondingCurveToken
                                ? bondingCurveGraduateTotals.totalVolume
                                : "--"
                            }
                            totalTraders={
                              isBondingCurveToken
                                ? bondingCurveGraduateTotals.totalTraders
                                : sidebarData?.totalContributors?.toString() ||
                                  "0"
                            }
                            bannerUrl={worldData?.bannerUrl ?? undefined}
                            launchedTime={formatLaunchDateForGraduate(
                              worldData?.createdAt
                            )}
                            toTokenAddress={
                              process.env.NEXT_PUBLIC_NETWORK === "testnet"
                                ? "0xaD6198206DeC2a63B55ec30ae8a358DE860b427D"
                                : worldData?.tokenAddress || ""
                            }
                            poolAddress={worldData?.poolAddress ?? undefined}
                            fundraisingType={FundraisingType.FIXED_PRICE}
                            graduatedTime={
                              worldData?.graduatedAt
                                ? formatLaunchDateForGraduate(
                                    worldData.graduatedAt
                                  )
                                : undefined
                            }
                          />
                        ) : !isWorldGraduated ? (
                          // Show progress section when not graduated
                          <ProgressSection
                            {...progressPropsWithDaoData}
                            onContributionComplete={handleContributionComplete}
                            optimisticRaisedAmount={optimisticRaisedTotal}
                            raisedOverride={baseParticipantsData.totalAmount}
                          />
                        ) : null}
                      </>
                    )}
                  </div>
                </>
              ) : (
                // Info Tab: Show ChartSection, EnterWorldSection, and BalanceGrid
                <>
                  {showChartSection && (
                    <ChartSection
                      bondingCurveAddress={worldData?.poolAddress || undefined}
                      timeFilter={"7D"}
                      onTimeFilterChange={(filter) => {
                        // Handle time filter change
                      }}
                      showTrendLine={false}
                      splitChart={true}
                      loading={isBondingMetricsLoading}
                      currentMarketCap={Number(worldData?.marketCap || 0)}
                      totalSupply={100_000_000_000}
                    />
                  )}
                  {showTradingViewChart && (
                    <div className="md:mx-0 mx-3">
                      <TradingViewChart
                        tokenAddress={
                          process.env.NEXT_PUBLIC_NETWORK === "testnet"
                            ? "0xcb7f520d18141e36956fe0b3a6bc3d4f11245521" // awe address
                            : worldData?.tokenAddress || ""
                        }
                      />
                    </div>
                  )}
                  {!isWorldGraduated && !isBondingCurveToken && (
                    <BalanceGrid {...mobileBalancePropsWithOptimism} />
                  )}
                  {showFundraiseParticipants &&
                    (isDaoMetricsLoading ? (
                      <>
                        <div className="md:hidden">
                          <FundraiseParticipantsTableSkeleton variant="mobile" />
                        </div>
                        <div className="hidden md:block">
                          <FundraiseParticipantsTableSkeleton variant="desktop" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="md:hidden">
                          <FundraiseParticipantsTableMobile
                            data={mergedParticipantsData}
                            isRefreshing={isContributionTableRefreshing}
                          />
                        </div>
                        <div className="hidden md:block">
                          <FundraiseParticipantsTable
                            data={mergedParticipantsData}
                            isRefreshing={isContributionTableRefreshing}
                          />
                        </div>
                      </>
                    ))}
                </>
              )}
            </TabContentAnimator>
          </div>
        </div>
      </div>

      {/* Mobile Tab Group - Fixed Bottom */}
      <MobileTabGroup
        activeTab={mobileActiveTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default WorldDetailPage;
