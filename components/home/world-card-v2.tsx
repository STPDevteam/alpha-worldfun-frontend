"use client";

import * as React from "react";
import { useCallback } from "react";
import { cn } from "@/libs/utils/index";
import { ProgressV2 } from "@/components/ui/progress-v2";
import { Text } from "../ui";
import Image from "next/image";
import { WorldCardService } from "@/libs/services/api/world-card.service";
import { useState } from "react";
import { useNavigationLoadingStore } from "@/libs/stores";
import { useCountdown } from "@/hooks/use-countdown";
import { FundraisingType } from "@/libs/types/world-card";
import { CardSpotlightOptimized } from "@/components/ui/card-spotlight-optimized";

interface WorldCardV2Props {
  /**
   * World ID for navigation
   */
  id: string;
  /**
   * Title of the world
   */
  title: string;
  /**
   * Creation date text (e.g., "Created 11/08/2026")
   */
  createdDate: string;
  /**
   * URL or path to the world thumbnail image
   */
  thumbnailUrl: string;
  /**
   * Description/overview text
   */
  description: string;
  /**
   * Current funded amount
   */
  currentAmount: number;
  /**
   * Target funding amount
   */
  targetAmount: number;
  /**
   * Currency symbol (e.g., "USDC")
   */
  currency?: string;
  /**
   * Current status text (e.g., "In progress")
   */
  status: string;
  /**
   * End date for countdown timer
   */
  endDate?: Date | string | null;
  /**
   * Time remaining text (e.g., "00d 13h 12m 17") - fallback if endDate is not provided
   * @deprecated Use endDate instead for live countdown
   */
  liveIn?: string;
  /**
   * Fundraising type (FIXED_PRICE or BONDING_CURVE)
   */
  fundraisingType?: FundraisingType;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Optional click handler for the "View World" button (use id navigation by default)
   */
  onViewWorld?: () => void;
}

export function WorldCardV2({
  id,
  title,
  createdDate,
  thumbnailUrl,
  description,
  currentAmount,
  targetAmount = 100000,
  currency = "AWE",
  status,
  endDate,
  liveIn,
  fundraisingType,
  className,
  onViewWorld,
}: WorldCardV2Props) {
  // Calculate funding percentage
  const percentage =
    targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    const floored = Math.floor(num * 100) / 100;
    const formatter =
      Number.isInteger(floored) === false
        ? new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : new Intl.NumberFormat("en-US");

    return formatter.format(floored);
  };

  const formatPercentage = (value: number): string => {
    const floored = Math.floor(value * 100) / 100;
    const formatted = floored.toFixed(2);
    return formatted.endsWith(".00") ? formatted.slice(0, -3) : formatted;
  };

  const displayPercentage = formatPercentage(percentage);
  const [imgSrc, setImgSrc] = useState<string>(thumbnailUrl);
  const normalizedEndDate = React.useMemo<Date | string | null>(() => {
    if (endDate === null || endDate === undefined) {
      return null;
    }

    const numericEndDate = Number(endDate);
    if (!Number.isNaN(numericEndDate) && numericEndDate === 0) {
      return null;
    }

    return endDate as Date | string;
  }, [endDate]);

  // Live countdown timer - updates every second
  const countdown = useCountdown({ endDate: normalizedEndDate });
  const displayTime =
    status === "Graduated"
      ? "Fund raise ended"
      : normalizedEndDate
      ? countdown.isEnded
        ? "Fund raise ended"
        : countdown.formattedTime
      : liveIn || "Fund raise ended";

  // Navigation loading integration
  const startNavigation = useNavigationLoadingStore(
    (state) => state.startNavigation
  );

  // Handle button click - navigate to world detail
  const handleViewWorld = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (onViewWorld) {
        onViewWorld();
      } else {
        startNavigation(`/world/${id}`);
        window.location.href = `/world/${id}`;
      }
    },
    [id, onViewWorld, startNavigation]
  );

  const cardContent = (
    <div
      className={cn(
        "flex flex-col items-end justify-end gap-[7px] self-stretch",
        "bg-[#121212] border border-[#212121] rounded-[4px] p-4",
        "lg:h-[365px]"
      )}
    >
      {/* Header Section */}
      <div className="flex flex-row justify-between items-start self-stretch gap-[7px] pb-3">
        {/* Title and Date */}
        <div className="flex flex-col justify-center gap-1 flex-1 min-w-0">
          <h3 className="text-white font-['BDOGrotesk'] font-medium text-base leading-[1.4] truncate">
            {title}
          </h3>
          <p className="text-white font-['DM_Mono'] font-medium text-xs leading-[1.302] whitespace-nowrap">
            {createdDate}
          </p>
        </div>

        {/* Thumbnail */}
        <div className="relative overflow-hidden rounded-lg w-[80px] h-[80px] flex-shrink-0">
          <Image
            src={imgSrc}
            alt={title}
            width={80}
            height={80}
            className="rounded-lg"
            unoptimized={imgSrc.toLowerCase().endsWith(".gif")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
            onError={() => {
              const defaultSrc = WorldCardService.getDefaultImageSrc();
              if (imgSrc !== defaultSrc) {
                setImgSrc(defaultSrc);
              }
            }}
          />
        </div>
      </div>

      {/* Description */}
      <Text
        className="text-white/45 font-medium text-xs
          leading-[1.302] h-12 self-stretch line-clamp-3"
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          WebkitLineClamp: 3,
          fontWeight: 500,
          WebkitBoxOrient: "vertical",
          display: "-webkit-box",
        }}
        preserveWhitespace={true}
      >
        {description}
      </Text>

      {/* Divider */}
      <div className="flex flex-col justify-center self-stretch gap-[10px] py-1 h-[21px]">
        <div className="w-full h-[0.74px] bg-white/63" />
      </div>

      {/* Funding Info */}
      <div className="flex flex-row justify-between items-center self-stretch">
        <Text
          variant="small"
          className="text-white leading-[1.333] whitespace-nowrap"
        >
          {formatNumber(currentAmount)} / {formatNumber(targetAmount)} {currency}
        </Text>
        <Text
          variant="small"
          className="text-white leading-[1.333] whitespace-nowrap"
        >
          {displayPercentage}%
        </Text>
      </div>

      {/* Progress Bar */}
      <ProgressV2 value={percentage} className="self-stretch" />

      {/* Status */}
      <div className="flex flex-row justify-between items-center self-stretch">
        <span className="text-white font-['DM_Mono'] font-normal text-xs leading-[1.333] whitespace-nowrap">
          Status
        </span>
        <span className="text-white font-['DM_Mono'] font-normal text-xs leading-[1.333] whitespace-nowrap">
          {fundraisingType === FundraisingType.BONDING_CURVE &&
          status === "Expired"
            ? "In progress"
            : status}
        </span>
      </div>

      {/* Live In - Live Countdown - Hidden for BONDING_CURVE tokens */}
      <div className="flex flex-row justify-between items-center self-stretch pb-4">
        <span className="text-white font-['DM_Mono'] font-normal text-xs leading-[1.333] whitespace-nowrap">
          Ends in
        </span>
        <span className="text-white font-['DM_Mono'] font-normal text-xs leading-[1.333] whitespace-nowrap">
          {fundraisingType !== FundraisingType.BONDING_CURVE
            ? displayTime
            : "N/A for bonding curve"}
        </span>
      </div>

      {/* View World Button - Isolated from effect layer */}
      <div
        className="relative z-[10] self-stretch"
        style={{ isolation: "isolate" }}
      >
        <button
          onClick={handleViewWorld}
          className={cn(
            "flex flex-row justify-center items-center w-full gap-[10px] p-[10px]",
            "bg-[rgba(75,75,75,0.18)] rounded-[2px]",
            "hover:bg-[rgba(75,75,75,0.28)] active:bg-[rgba(75,75,75,0.35)]",
            "transition-colors duration-200",
            "cursor-pointer",
            "backdrop-blur-sm",
            "border border-[#313131]"
          )}
        >
          <span className="text-white font-['DM_Mono'] font-medium text-xs leading-[1.302]">
            View World/Agent
          </span>
        </button>
      </div>
    </div>
  );

  // Wrap entire card with optimized spotlight effect
  return (
    <CardSpotlightOptimized
      cardId={id}
      radius={250}
      color="rgba(179, 128, 69, 0.025)"
      canvasColors={[
        [179, 128, 69],   // #B38045 - Main theme color
        [150, 107, 58],   // Darker variant for depth
      ]}
      animationSpeed={3}
      dotSize={2}
      className={className}
    >
      {cardContent}
    </CardSpotlightOptimized>
  );
}
