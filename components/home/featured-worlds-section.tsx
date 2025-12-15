"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFeaturedWorlds } from "@/libs/hooks/home/use-featured-worlds";
import { HorizontalScroll, type HorizontalScrollRef } from "@/components/common/horizontal-scroll";
import { FeaturedWorldCard } from "@/components/home/featured-world-card";
import { useAnimationSettings } from "@/libs/hooks/use-stagger-animation";
import { useResponsiveScrollAmount } from "@/libs/hooks/use-responsive-scroll-amount";
import { cn } from "@/libs/utils";

const ANIMATION_CONFIG = {
  entrance: {
    initial: { opacity: 0, x: -20, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
} as const;

// Skeleton card for loading state
function FeaturedWorldCardSkeleton() {
  return (
    <div className="w-[285px] md:w-[305px] h-[144px] border border-[rgba(224,224,224,0.1)] bg-[#09090A] overflow-hidden animate-pulse">
      {/* Top Section - 2 Column Layout */}
      <div className="flex">
        {/* Left Column - Image skeleton */}
        <div className="p-2">
          <div className="w-[80px] h-[80px] bg-[#1a1a1a] rounded-sm" />
        </div>

        {/* Right Column - Info skeleton */}
        <div className="flex-1 flex flex-col gap-2 py-2 pr-2 bg-[rgba(13,13,13,0.1)]">
          <div className="h-5 bg-[#1a1a1a] rounded w-3/4" />
          <div className="flex items-center gap-0.5 w-full h-2">
            <div className="h-full bg-[#1a1a1a] rounded-[1px] w-full" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 bg-[#1a1a1a] rounded w-16" />
            <div className="h-4 bg-[#1a1a1a] rounded w-12" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="px-2">
        <div className="w-full h-px bg-[rgba(255,255,255,0.18)]" />
      </div>

      {/* Description skeleton */}
      <div className="p-2 h-[44px]">
        <div className="h-3 bg-[#1a1a1a] rounded w-full mb-1" />
        <div className="h-3 bg-[#1a1a1a] rounded w-4/5" />
      </div>
    </div>
  );
}

export function FeaturedWorldsSection() {
  const { data: worlds, isLoading, error } = useFeaturedWorlds();
  const animationSettings = useAnimationSettings();
  const scrollRef = useRef<HorizontalScrollRef>(null);
  const scrollAmount = useResponsiveScrollAmount();
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  // Hide section if no data or error
  if (error || (!isLoading && (!worlds || worlds.length === 0))) {
    return null;
  }

  return (
    <div className="relative inline-block w-full">
      {/* Content */}
      <div
        className={cn(
          "relative bg-[#33333357] rounded-lg",
          "py-4 md:py-6",
          "max-w-[1440px]"
        )}
        style={{ zIndex: 0 }}
      >
        {/* Section Title with Navigation Buttons */}
        <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-6">
          <h2 className="!font-bdo-grotesk text-lg sm:text-2xl font-normal text-white">
            Featured Worlds/Agents
          </h2>

          {/* Navigation Buttons - 36x36px with 8px gap */}
          {!isLoading && worlds && worlds.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => scrollRef.current?.scrollLeft()}
                disabled={!scrollState.canScrollLeft}
                className={cn(
                  "w-9 h-9 rounded-lg",
                  "bg-[#373C3E66] hover:bg-black/80",
                  "flex items-center justify-center",
                  "transition-all duration-200",
                  "cursor-pointer",
                  "disabled:opacity-30 disabled:cursor-not-allowed"
                )}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => scrollRef.current?.scrollRight()}
                disabled={!scrollState.canScrollRight}
                className={cn(
                  "w-9 h-9 rounded-lg",
                  "bg-[#373C3E66] hover:bg-black/80",
                  "flex items-center justify-center",
                  "transition-all duration-200",
                  "cursor-pointer",
                  "disabled:opacity-30 disabled:cursor-not-allowed"
                )}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <HorizontalScroll
            items={Array.from({ length: 6 })}
            gap="1rem"
            scrollAmount={scrollAmount}
            contentPadding={{
              left: "1rem",
              right: "0.5rem",
            }}
            className="md:[&>div]:pl-6 md:[&>div]:pr-2"
            renderItem={(_, index) => <FeaturedWorldCardSkeleton key={index} />}
          />
        )}

        {/* Loaded State */}
        {!isLoading && worlds && worlds.length > 0 && (
          <HorizontalScroll
            ref={scrollRef}
            items={worlds}
            gap="1rem"
            scrollAmount={scrollAmount}
            contentPadding={{
              left: "1rem",
              right: "0.5rem",
            }}
            className="md:[&>div]:pl-6 md:[&>div]:pr-2"
            onScrollStateChange={setScrollState}
            renderItem={(world, index) => {
              if (!animationSettings.enabled) {
                return <FeaturedWorldCard key={world.id} world={world} />;
              }

              const delay = index * 0.08;

              return (
                <motion.div
                  key={world.id}
                  initial={ANIMATION_CONFIG.entrance.initial}
                  whileInView={ANIMATION_CONFIG.entrance.animate}
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
                  <FeaturedWorldCard world={world} />
                </motion.div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
