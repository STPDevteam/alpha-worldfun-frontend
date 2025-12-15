"use client";

import { BuildWorldSection } from "@/components/home/build-world-section";
import { TabControlsV2 } from "@/components/ui/tab-controls-v2";
import { useWorldCardsFilters } from "@/libs/stores/world-cards-store";
import { cn } from "@/libs/utils";
import { useEffect, useState } from "react";
import { useInfiniteWorldCards } from "@/libs/hooks/home";
import { WorldCardV2 } from "@/components/home/world-card-v2";
import { InfiniteGrid } from "@/components/common/infinite-grid";
import { GRID_CONFIGS } from "@/libs/types/pagination";
import { motion } from "motion/react";
import { useAnimationSettings } from "@/libs/hooks/use-stagger-animation";
import type { WorldCard } from "@/libs/types/world-card";
import { TokenStatus } from "@/libs/types/world-card";

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
      [TokenStatus.LIVE]: "Live",
      [TokenStatus.ON_GOING]: "In progress",
      [TokenStatus.COMPLETED]: "Completed",
      [TokenStatus.CANCELLED]: "Cancelled",
    };
    return statusMap[status] || "Unknown";
  };

  // Parse target fundraise amount (assume USDC)
  const targetAmount = card.targetFundRaise
    ? parseFloat(card.targetFundRaise)
    : 60000;

  // TODO: Mock current amount - in production this would come from subgraph/blockchain
  const currentAmount = targetAmount * 0.65; // Example: 65% funded

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
    currency: "USDC",
    status: getStatusLabel(card.status),
    endDate: card.endDate, // Pass endDate directly for live countdown
  };
}

export default function Home() {
  const filters = useWorldCardsFilters();
  const [selectedTab, setSelectedTab] = useState<string>("All");
  const gridKey = `${filters.status || "all"}-${selectedTab}`;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [gridKey]);

  // Map tab selection to filter - to be implemented
  useEffect(() => {
    // TODO: Apply filters based on selected tab
    // This will update the filter store based on tab selection
    // Example: filters.setStatus(statusMap[selectedTab])
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

  const tabs = ["idea", "AGENT", "TOKEN", "All"];

  return (
    <main
      className={cn("min-h-screen",
        "flex flex-col gap-6 xl:gap-10",
        "px-4 md:px-15",
        "max-w-[1325px] mx-auto",
      )}
    >
      {/* Build World Section */}
      <BuildWorldSection />

      {/* Tab Controls Section - 24px gap below per Figma */}
      <section className="flex justify-end items-center">
        <TabControlsV2
          tabs={tabs}
          value={selectedTab}
          onValueChange={setSelectedTab}
        />
      </section>

      {/* World Cards Grid Section - 16px gap between cards per Figma */}
      <section className="w-full pb-12 -mt-5">
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
            <div
              key={`skeleton-${index}`}
              className="bg-[#0B0B0B] border border-[#252525] rounded-[4px] p-4 h-[380px] animate-pulse"
            />
          )}
          gridConfig={GRID_CONFIGS.WORLD_CARDS}
          skeletonCount={8}
          emptyState={
            <div className="col-span-full flex items-center justify-center py-16">
              <p className="text-white/45 font-['DM_Mono'] text-sm">
                No worlds found. Try a different filter.
              </p>
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
          className={cn(
            "grid",
            "gap-4",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}
        />
      </section>
    </main>
  );
}
