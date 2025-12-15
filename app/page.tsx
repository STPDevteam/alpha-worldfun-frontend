"use client";

import { BuildWorldSection } from "@/components/home/build-world-section";
import { FeaturedWorldsSection } from "@/components/home/featured-worlds-section";
import { TabControlsV2 } from "@/components/ui/tab-controls-v2";
import { cn } from "@/libs/utils";
import { useEffect, useState } from "react";
import { useInfiniteWorldCards, useWorldCardsActions } from "@/libs/hooks/home";
import { WorldCardV2 } from "@/components/home/world-card-v2";
import { WorldCardV2Skeleton } from "@/components/home/world-card-v2-skeleton";
import { InfiniteGrid } from "@/components/common/infinite-grid";
import { GRID_CONFIGS } from "@/libs/types/pagination";
import { motion } from "motion/react";
import { useAnimationSettings } from "@/libs/hooks/use-stagger-animation";
import type { WorldCard } from "@/libs/types/world-card";
import { TokenStatus, TokenType } from "@/libs/types/world-card";
import { formatUnits } from "viem";
import { Text } from "@/components/ui/text";
import { useRouter, useSearchParams } from "next/navigation";

const TOKEN_TAB_CONFIG: Array<{
  label: string;
  tokenType?: TokenType;
  status?: TokenStatus;
}> = [
  { label: "WORLD IDEA", tokenType: TokenType.WORLD_IDEA_TOKEN },
  { label: "WORLD AGENT", tokenType: TokenType.WORLD_AGENT },
  { label: "UTILITY AGENT", tokenType: TokenType.UTILITY_AGENT_TOKEN },
  { label: "Graduated", status: TokenStatus.LIVE },
  { label: "All" }, // No filters
];

const TOKEN_FILTER_BY_TAB = new Map(
  TOKEN_TAB_CONFIG.map(({ label, tokenType, status }) => [
    label.toUpperCase(),
    { tokenType, status },
  ])
);

const TOKEN_TAB_LABELS = TOKEN_TAB_CONFIG.map(({ label }) => label);
const DEFAULT_TAB = "All";
const NORMALIZED_TAB_LOOKUP = new Map(
  TOKEN_TAB_LABELS.map((label) => [label.trim().toUpperCase(), label])
);

function resolveTabFromQuery(tabParam: string | null) {
  if (!tabParam) return DEFAULT_TAB;
  const normalized = tabParam.trim().toUpperCase();
  return NORMALIZED_TAB_LOOKUP.get(normalized) ?? DEFAULT_TAB;
}

// Adapter: Transform WorldCard API data to WorldCardV2 component props
function adaptWorldCardToV2Props(card: WorldCard) {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Created --/--/----";
    const d = typeof date === "string" ? new Date(date) : date;
    return `Created ${d.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })}`;
  };

  // TODO: Map status enum to label - refine as needed`
  const getStatusLabel = (status: TokenStatus) => {
    const statusMap = {
      [TokenStatus.LIVE]: "Graduated",
      [TokenStatus.ON_GOING]: "In progress",
      [TokenStatus.COMPLETED]: "Completed",
      [TokenStatus.CANCELLED]: "Expired",
    };
    return statusMap[status] || "Unknown";
  };

  // Parse target and current fundraise amounts (convert from Wei to AWE)
  const currentAmount = card.totalAweRaised
    ? Number(formatUnits(BigInt(card.totalAweRaised), 18))
    : 0;

  const targetAmount = card.targetFundRaise ? Number(card.targetFundRaise) : 0;

  return {
    id: card.id,
    title: card.tokenName || card.title || "Untitled World",
    createdDate: formatDate(card.launchTime || card.createdAt),
    thumbnailUrl:
      card.backgroundImage ||
      card.tokenImage ||
      "/assets/images/default-world.png",
    description: card.description || "No description available.",
    currentAmount,
    targetAmount,
    currency: "AWE",
    status: getStatusLabel(card.status),
    endDate: card.endDate, // Pass endDate directly for live countdown
    fundraisingType: card.fundraisingType,
  };
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const [selectedTab, setSelectedTab] = useState<string>(() =>
    resolveTabFromQuery(tabParam)
  );
  const { setFilters } = useWorldCardsActions();

  // Feature flag: Enable agent token filtering
  const enableAgentTokens =
    process.env.NEXT_PUBLIC_ENABLE_AGENT_TOKENS === "true";

  useEffect(() => {
    const resolvedTab = resolveTabFromQuery(tabParam);
    setSelectedTab((prev) => (prev === resolvedTab ? prev : resolvedTab));
  }, [tabParam]);

  // Apply filters based on selected tab
  useEffect(() => {
    const filters = TOKEN_FILTER_BY_TAB.get(selectedTab.trim().toUpperCase());
    if (filters) {
      setFilters(filters);
    } else {
      setFilters({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

  const worldCardsData = useInfiniteWorldCards();
  const animationSettings = useAnimationSettings();

  const ANIMATION_CONFIG = {
    entrance: {
      initial: { opacity: 0, y: 10, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.25, ease: "easeOut" as const },
    },
    hover: { scale: 1.02, y: -2 },
    tap: { scale: 0.98 },
  } as const;

  const handleTabChange = (value: string) => {
    setSelectedTab(value);

    const nextParams = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_TAB) {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", value.trim().toUpperCase());
    }

    const queryString = nextParams.toString();
    router.replace(queryString ? `/?${queryString}` : "/", { scroll: false });
  };

  return (
    <main
      className={cn(
        "flex flex-col gap-6 xl:gap-10",
        "px-4 md:px-6 lg:px-8 xl:px-0",
        "w-full max-w-[1325px] mx-auto"
      )}
    >
      {/* Build World Section */}
      <BuildWorldSection />

      {/* Featured Worlds Section */}
      <FeaturedWorldsSection />

      {/* Worlds Section */}
      <div className="flex flex-col gap-3 md:gap-4 lg:gap-5 xl:gap-6">
        {/* Agent Token Filter - Controlled by NEXT_PUBLIC_ENABLE_AGENT_TOKENS */}
        {enableAgentTokens && (
          <section className="flex justify-end items-center">
            <TabControlsV2
              tabs={TOKEN_TAB_LABELS}
              value={selectedTab}
              onValueChange={handleTabChange}
            />
          </section>
        )}

        {/* World Cards Grid Section - 16px gap between cards per Figma */}
        <section className="w-full pb-12">
          <InfiniteGrid
            useDataHook={() => worldCardsData}
            renderItem={(card, index) => {
              const delay = (index % 4) * 0.05;
              const v2Props = adaptWorldCardToV2Props(card);

              if (!animationSettings.enabled) {
                return <WorldCardV2 key={card.id} {...v2Props} />;
              }

              return (
                <motion.div
                  key={card.id}
                  initial={ANIMATION_CONFIG.entrance.initial}
                  whileInView={ANIMATION_CONFIG.entrance.animate}
                  whileHover={ANIMATION_CONFIG.hover}
                  whileTap={ANIMATION_CONFIG.tap}
                  viewport={animationSettings.viewport}
                  transition={{
                    ...ANIMATION_CONFIG.entrance.transition,
                    delay,
                  }}
                  style={{
                    willChange: animationSettings.willChange,
                    ...animationSettings.style,
                  }}
                >
                  <WorldCardV2 {...v2Props} />
                </motion.div>
              );
            }}
            renderSkeleton={(index) => (
              <WorldCardV2Skeleton key={`skeleton-${index}`} />
            )}
            gridConfig={GRID_CONFIGS.WORLD_CARDS}
            skeletonCount={8}
            emptyState={
              <div className="col-span-full flex items-start justify-center py-16">
                <Text variant="base" className="text-white/45">
                  No worlds found. Try a different filter.
                </Text>
              </div>
            }
            errorState={(error, retry) => (
              <div className="col-span-full flex flex-col items-center justify-center py-16 gap-4">
                <p className="text-red-400 font-['DM_Mono'] text-sm">
                  {error.message}
                </p>
                {retry && (
                  <button
                    onClick={retry}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded font-['DM_Mono'] text-xs transition-colors"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
            pageSize={8}
            className="grid gap-4"
          />
        </section>
      </div>
    </main>
  );
}
