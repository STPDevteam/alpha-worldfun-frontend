"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { formatUnits } from "viem";
import { cn } from "@/libs/utils";
import type { WorldCard } from "@/libs/types/world-card";
import { TokenStatus } from "@/libs/types/world-card";
import { DEFAULT_WORLD_IMAGE_SRC } from "@/libs/constants";
import { ProgressV2 } from "@/components/ui/progress-v2";

interface FeaturedWorldCardProps {
  world: WorldCard;
  className?: string;
}

export function FeaturedWorldCard({
  world,
  className,
}: FeaturedWorldCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    world.bannerUrl || DEFAULT_WORLD_IMAGE_SRC
  );

  const isGraduated = world.status === TokenStatus.LIVE;

  // Calculate progress percentage
  const calculateProgress = useCallback(() => {
    if (!world.totalAweRaised || !world.targetFundRaise) return 0;
    try {
      const current = Number(formatUnits(BigInt(world.totalAweRaised), 18));
      const target = Number(world.targetFundRaise);
      return Math.min((current / target) * 100, 100);
    } catch {
      return 0;
    }
  }, [world.totalAweRaised, world.targetFundRaise]);

  // Format AWE amount
  const formatAweAmount = useCallback((weiAmount?: string | null) => {
    if (!weiAmount) return "0";
    try {
      const amount = Number(formatUnits(BigInt(weiAmount), 18));
      if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
      }
      if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}k`;
      }
      return amount.toFixed(1);
    } catch {
      return "0";
    }
  }, []);

  // Format market cap (simplified - can be enhanced)
  const formatMarketCap = useCallback(() => {
    if (!world.totalAweRaised) return "$0";
    try {
      const aweAmount = Number(formatUnits(BigInt(world.totalAweRaised), 18));
      // Assuming 1 AWE = $1 for simplicity (adjust based on actual pricing)
      const marketCap = aweAmount;
      if (marketCap >= 1000000) {
        return `$${(marketCap / 1000000).toFixed(1)}M`;
      }
      if (marketCap >= 1000) {
        return `$${(marketCap / 1000).toFixed(1)}k`;
      }
      return `$${marketCap.toFixed(0)}`;
    } catch {
      return "$0";
    }
  }, [world.totalAweRaised]);

  const handleClick = () => {
    window.location.href = `/world/${world.id}`;
  };

  const handleImageError = () => {
    setImgSrc(DEFAULT_WORLD_IMAGE_SRC);
  };

  const progress = calculateProgress();

  return (
    <div
      className={cn(
        "w-[285px] md:w-[305px] h-[144px] cursor-pointer",
        "bg-[#09090A]",
        "border border-[rgba(224,224,224,0.1)]",
        "transition-transform hover:scale-[1.02] hover:-translate-y-0.5",
        className
      )}
      onClick={handleClick}
    >
      {/* Top Section - 2 Column Layout (Image + Info) */}
      <div className="flex">
        {/* Left Column - Image (80x80px) */}
        <div className="p-2">
          <div className="relative w-[80px] h-[80px]">
            <Image
              src={imgSrc}
              alt={world.tokenName || "World"}
              fill
              className="object-cover"
              onError={handleImageError}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
          </div>
        </div>

        {/* Right Column - Info Panel */}
        <div className="flex-1 flex flex-col gap-2 py-2 pr-2 bg-[rgba(13,13,13,0.1)]">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <h3 className="font-['BDO_Grotesk'] text-base font-normal leading-[1.4em] text-white line-clamp-1">
              {world.tokenName || world.tokenSymbol}
            </h3>
          </div>

          {/* Progress Bar - Only for non-graduated tokens */}
          {!isGraduated && <ProgressV2 value={progress} />}
          {/* Spacer for graduated tokens to maintain Market Cap position (24px progress + 8px gap) */}
          {isGraduated && <div className="h-[28px]" />}

          {/* Market Cap Stat */}
          <div className="flex items-center gap-1">
            <span className="font-['DM_Mono'] text-xs font-normal leading-[1.5em] text-[#828B8D]">
              Market Cap
            </span>
            <span className="font-['DM_Mono'] text-xs font-normal leading-[1.5em] text-[#E0E0E0]">
              {formatMarketCap()}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="px-2">
        <div className="w-full h-px bg-[rgba(255,255,255,0.18)]" />
      </div>

      {/* Description Section - Full Width - Fixed 44px */}
      <div className="p-2 h-[44px]">
        <p className="font-['DM_Mono'] text-xs font-normal leading-[1.302em] text-[rgba(255,255,255,0.45)] line-clamp-2">
          {world.description || "\u00A0"}
        </p>
      </div>
    </div>
  );
}
