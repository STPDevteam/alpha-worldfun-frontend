"use client";

import React from "react";
import { motion } from "motion/react";
import { FundraisingType } from "@/libs/types/world-card";
import { Button } from "../ui";
import { ProgressV2 } from "../ui/progress-v2";
import { BalanceGrid } from "./right-sidebar/balance-grid";
import { EnterWorldSection } from "./right-sidebar";

interface StatisticCardData {
  title: string;
  value: string;
  type?: "stat" | "explore";
  poolAddress?: string;
}

interface RightSidebarGraduateProps {
  /** Market capitalization in USD */
  marketCapUsd?: string;
  /** Total volume traded */
  totalVolume?: string;
  /** Total number of traders */
  totalTraders?: string;
  /** Launch date timestamp */
  launchedTime?: string;
  /** Graduation date timestamp */
  graduatedTime?: string;
  /** Handler for trade on aerodrome button */
  onTradeAerodrome?: () => void;
  /** Token address for the 'to' parameter in Aerodrome swap URL */
  toTokenAddress?: string;
  /** Custom statistics cards data */
  statisticsCards?: StatisticCardData[];
  /** Custom className for styling */
  className?: string;
  /** Banner URL for Enter World section */
  bannerUrl?: string;
  /** Fundraising type for statistics conditional rendering */
  fundraisingType?: FundraisingType;
  /** Pool address for explorer link */
  poolAddress?: string;
}

/**
 * Right sidebar component for graduated tokens showing completion status,
 * trade button, and key statistics
 */
const RightSidebarGraduate = ({
  marketCapUsd = "0",
  totalVolume = "0",
  totalTraders = "0",
  launchedTime,
  graduatedTime = "--",
  onTradeAerodrome,
  toTokenAddress = "",
  statisticsCards,
  className = "",
  bannerUrl,
  fundraisingType,
  poolAddress,
}: RightSidebarGraduateProps) => {
  // Use custom statistics or default ones
  const defaultStatistics: StatisticCardData[] = [
    { title: "Market Cap", value: marketCapUsd, type: "stat" },
    { title: "Total Volume", value: totalVolume, type: "stat" },
    { title: "Total Traders", value: totalTraders, type: "stat" },
  ];
  const baseStatistics = statisticsCards || defaultStatistics;

  const filteredStatistics =
    fundraisingType === FundraisingType.FIXED_PRICE
      ? baseStatistics.filter(
          (stat) => stat.title.toLowerCase() !== "total volume"
        )
      : baseStatistics;

  const hasExploreCard = filteredStatistics.some(
    (stat) =>
      stat.type === "explore" || stat.title.toLowerCase() === "explore"
  );

  const statistics = hasExploreCard
    ? filteredStatistics
    : [
        ...filteredStatistics,
        {
          title: "Explore",
          value: "View",
          type: "explore",
          poolAddress,
        },
      ];

  // Add time information cards
  const allCards = [
    ...statistics,
    {
      title: "Launched Time",
      value: launchedTime || "--",
      type: "full-width" as const,
      displayValue: launchedTime || "--",
    },
    {
      title: "Graduated Time",
      value: graduatedTime,
      type: "full-width" as const,
      displayValue: graduatedTime || "--",
    },
  ];

  const handleTradeClick = () => {
    if (onTradeAerodrome) {
      onTradeAerodrome();
    } else {
      // Default behavior - open Aerodrome swap link
      const fromTokenAddress = "0x1b4617734c43f6159f3a70b7e06d883647512778"; // awe address
      const aerodromeUrl = `https://aerodrome.finance/swap?from=${fromTokenAddress}&to=${toTokenAddress}&chain0=8453&chain1=8453`;
      window.open(aerodromeUrl, "_blank", "noopener,noreferrer");
    }
  };

  const baseDelay = 0.12;
  const sectionDelayStep = 0.12;
  const progressDelay = baseDelay;
  const buttonDelay = baseDelay + sectionDelayStep;
  const statsDelay = baseDelay + sectionDelayStep * 2;

  return (
    <div className={`flex flex-col gap-6 w-full ${className}`}>
      {/* Enter World Section */}
      <EnterWorldSection bannerUrl={bannerUrl} className="hidden xl:block" />

      {/* Graduate Stats Section */}
      <motion.div
        className="flex flex-col justify-center items-center
        gap-4
        w-[calc(100%-1.5rem)] xl:w-[447px] px-4 py-4 mx-auto
        rounded-lg border backdrop-blur-[100px]"
        style={{
          borderImage:
            "linear-gradient(148deg, rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 30%, rgba(153, 153, 153, 0.2) 97%) 1",
          border: "0.5px solid rgba(255, 255, 255, 0.2)",
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Progress Section */}
        <motion.div
          className="flex flex-col gap-[14px] w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: progressDelay }}
        >
          {/* Progress Header */}
          <div className="flex flex-row justify-between items-center w-full">
            <span
              className="text-[#FFFFFF] text-[14px] font-normal leading-[24px]"
              style={{ fontFamily: "DM Mono" }}
            >
              Fundraise Progress
            </span>
            <span
              className="text-[#FFFFFF] text-[16px] font-normal leading-[24px]"
              style={{ fontFamily: "DM Mono" }}
            >
              100%
            </span>
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: progressDelay + 0.08,
            }}
          >
            <ProgressV2
              value={100}
              inactiveColor="rgba(224,224,224,0.2)"
              segmentHeight={24}
              segmentWidth={8}
            />
          </motion.div>

          {/* Graduation Message */}
          <p
            className="text-[#FFFFFF] text-[12px] font-normal leading-[20px] w-full"
            style={{ fontFamily: "DM Mono" }}
          >
            Project has graduated! Aerodrome pool seeded.
          </p>
        </motion.div>

        {/* Trade on Aerodrome Button */}
        <motion.div
          className="w-full h-[62px] border border-[rgba(224,224,224,0.2)] rounded-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: buttonDelay }}
        >
          <Button
            onClick={handleTradeClick}
            className="w-full h-full bg-transparent hover:bg-[rgba(255,255,255,0.05)] text-[#E0E0E0] text-[14px] font-medium leading-[22px] tracking-[-0.01em] border-none flex items-center justify-center gap-2 transition-colors"
            style={{ fontFamily: "DM Mono" }}
          >
            <span>Trade on Aerodrome</span>
            {/* External link icon */}
            <div className="w-4 h-4 flex items-center justify-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[rgba(255,255,255,0.2)]"
              >
                <path
                  d="M3 1.5H10.5V9M10.5 1.5L1.5 10.5M10.5 1.5H6.75"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Button>
        </motion.div>

        {/* Statistics and Time Cards Grid */}
        <motion.div
          className="w-full -mx-3 md:mx-0"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: statsDelay }}
        >
          <BalanceGrid
            cards={allCards.map(stat => ({
              id: stat.title.toLowerCase().replace(/\s+/g, '-'),
              title: stat.title,
              value: stat.type === 'explore' ? null : parseFloat(stat.value) || null,
              type: stat.type === 'full-width' ? 'full-width' : 'small',
              poolAddress: ('poolAddress' in stat ? stat.poolAddress : undefined) ?? poolAddress,
              displayValue: 'displayValue' in stat ? stat.displayValue : undefined,
            }))}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RightSidebarGraduate;
export type { RightSidebarGraduateProps, StatisticCardData };
