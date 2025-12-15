"use client";

import React from "react";
import { cn } from "@/libs/utils/cn";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useInfiniteWorldCards } from "@/libs/hooks/home";
import { InfiniteGrid } from "@/components/common/infinite-grid";
import { useStaggerAnimation } from "@/libs/hooks/use-stagger-animation";
import AnimatedWorldCard from "./animated-world-card";

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
        "transition-all duration-300 relative cursor-pointer hover:opacity-90 mx-3 w-[calc(100% - 12px)]",
        className
      )}
      style={{
        border: "1px solid rgba(224, 224, 224, 0.2)",
        borderRadius: "10px",
      }}
    >
      <CardContent className="p-4">
        <div className="flex flex-row gap-4">
          {/* Image Skeleton - 138x138px */}
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: "138px",
              height: "138px",
              backgroundColor: "rgba(47, 56, 70, 0.5)",
              borderRadius: "8px",
            }}
          >
            <Skeleton
              className="w-full h-full"
              style={{
                backgroundColor: "rgba(47, 56, 70, 0.5)",
                borderRadius: "8px",
              }}
            />
          </div>

          {/* Content Skeleton */}
          <div className="flex flex-col justify-between flex-1 min-w-0 min-h-[138px]">
            {/* Title and Status */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                {/* Title */}
                <Skeleton
                  className="h-5 w-3/4"
                  style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
                />
                {/* Status Button */}
                <Skeleton
                  className="h-6 w-20 self-start"
                  style={{
                    backgroundColor: "rgba(47, 56, 70, 0.5)",
                    borderRadius: "32px",
                  }}
                />
              </div>
              {/* Date */}
              <Skeleton
                className="h-3 w-16"
                style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
              />
            </div>

            {/* Bottom section */}
            <div className="flex flex-col gap-3">
              {/* Categories */}
              <div className="flex flex-col gap-1">
                <Skeleton
                  className="h-3 w-12"
                  style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
                />
                <Skeleton
                  className="h-3 w-full"
                  style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <Skeleton
                  className="h-3 w-full"
                  style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
                />
                <Skeleton
                  className="h-3 w-4/5"
                  style={{ backgroundColor: "rgba(47, 56, 70, 0.5)" }}
                />
              </div>

              {/* World Address */}
              <Skeleton
                className="h-8 w-32 self-start"
                style={{
                  backgroundColor: "rgba(47, 56, 70, 0.5)",
                  borderRadius: "8px",
                }}
              />
            </div>
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

// Mobile-specific grid configuration
const MOBILE_GRID_CONFIG = {
  columns: { mobile: 1, tablet: 1, desktop: 1 },
  gap: "20px",
  maxWidth: "100%",
  gridClasses: "grid-cols-1",
};

export default function WorldCardsGrid({ className }: WorldCardsGridProps) {
  const worldCardsData = useInfiniteWorldCards();
  const { getStaggerDelay } = useStaggerAnimation({
    delayPerItem: 0.00001,
    maxDelay: 0.01,
    resetOnNewPage: true,
  });

  return (
    <InfiniteGrid
      useDataHook={() => worldCardsData}
      renderItem={(card, index, pageIndex) => (
        <AnimatedWorldCard
          key={card.id}
          card={card}
          priority={pageIndex === 0 && index < 2}
          pageIndex={pageIndex}
          staggerDelay={getStaggerDelay(index, pageIndex)}
        />
      )}
      renderSkeleton={(index) => (
        <WorldCardSkeleton key={`skeleton-${index}`} />
      )}
      gridConfig={MOBILE_GRID_CONFIG}
      pageSize={12}
      skeletonCount={12}
      emptyState={<EmptyState />}
      errorState={(error, retry) => (
        <ErrorState error={error.message} onRetry={retry} />
      )}
      className={className}
    />
  );
}
