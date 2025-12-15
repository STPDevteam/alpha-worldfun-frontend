"use client";

import React from "react";
import { cn } from "@/libs/utils/cn";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useInfiniteWorldCards } from "@/libs/hooks/home";
import { InfiniteGrid } from "@/components/common/infinite-grid";
import { GRID_CONFIGS } from "@/libs/types/pagination";
import WorldCard from "./world-card";
import { motion } from "motion/react";
import { useAnimationSettings } from "@/libs/hooks/use-stagger-animation";

interface WorldCardsGridProps {
  className?: string;
}

interface WorldCardSkeletonProps {
  className?: string;
}

function WorldCardSkeleton({ className }: WorldCardSkeletonProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-[1316px] transition-all duration-300 relative border-t-[0.5px] border-t-[#646E71]",
        className
      )}
    >
      <CardContent className="p-0 relative">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-stretch gap-6 lg:gap-[127px] p-4 lg:pt-6 lg:pb-8 lg:px-0">
          {/* Left: title, status badge, date */}
          <div className="flex flex-col w-full lg:w-[287px] gap-2">
            <div className="flex flex-row items-center justify-between gap-4">
              <Skeleton
                className="h-4 w-1/2"
                style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
              />
              <Skeleton
                className="h-7 w-24 rounded-full"
                style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
              />
            </div>
            <Skeleton
              className="h-4 w-24"
              style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
            />
          </div>

          {/* Middle: description + copy address + categories */}
          <div className="flex flex-col lg:flex-row w-full lg:w-[645px] gap-8">
            <div className="flex flex-col w-full lg:w-[390px] gap-4">
              <div className="flex flex-col gap-2">
                <Skeleton
                  className="h-4 w-full"
                  style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
                />
                <Skeleton
                  className="h-4 w-5/6"
                  style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
                />
              </div>
              <div className="flex flex-row items-center rounded-lg border border-[#646E71b3] px-2 py-2 gap-2">
                <Skeleton
                  className="h-4 w-40"
                  style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
                />
                <Skeleton
                  className="h-4 w-4"
                  style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton
                className="h-4 w-24"
                style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
              />
              <Skeleton
                className="h-4 w-3/4"
                style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
              />
            </div>
          </div>

          {/* Right: image thumbnail */}
          <div className="relative overflow-hidden rounded-lg w-full lg:w-[138px] lg:h-[138px] mx-auto lg:mx-0">
            <Skeleton
              className="w-full h-[138px]"
              style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  className?: string;
}

function EmptyState({ className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="rounded-lg bg-gray-900 p-6 max-w-md">
        <h3 className="text-xl font-semibold text-white font-office-times-round mb-2">
          No worlds found
        </h3>
        <p className="text-gray-400 font-messina-sans">
          Try adjusting your filters or check back later for new worlds.
        </p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="rounded-lg bg-red-900/20 border border-red-800 p-6 max-w-md">
        <h3 className="text-xl font-semibold text-red-400 font-office-times-round mb-2">
          Error loading worlds
        </h3>
        <p className="text-gray-400 font-messina-sans mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-messina-sans font-medium transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export default function WorldCardsGrid({ className }: WorldCardsGridProps) {
  const worldCardsData = useInfiniteWorldCards();
  const animationSettings = useAnimationSettings();

  const ANIMATION_CONFIG = {
    entrance: {
      initial: { opacity: 0, y: 10, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.25, ease: "easeOut" as const },
    },
    hover: { scale: 1, y: 3 },
    tap: { scale: 0.98 },
  } as const;

  return (
    <InfiniteGrid
      useDataHook={() => worldCardsData}
      renderItem={(card, index, pageIndex) => {
        // Small stagger by index for a subtle cascading effect
        const delay = (index % 12) * 0.02;

        if (!animationSettings.enabled) {
          return (
            <WorldCard
              key={card.id}
              card={card}
              priority={pageIndex === 0 && index < 4}
              pageIndex={pageIndex}
            />
          );
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
            <WorldCard
              card={card}
              priority={pageIndex === 0 && index < 4}
              pageIndex={pageIndex}
            />
          </motion.div>
        );
      }}
      renderSkeleton={(index) => (
        <WorldCardSkeleton key={`skeleton-${index}`} />
      )}
      gridConfig={GRID_CONFIGS.WORLD_CARDS}
      skeletonCount={12}
      emptyState={<EmptyState />}
      errorState={(error, retry) => (
        <ErrorState error={error.message} onRetry={retry} />
      )}
      pageSize={12}
      className={className}
    />
  );
}
