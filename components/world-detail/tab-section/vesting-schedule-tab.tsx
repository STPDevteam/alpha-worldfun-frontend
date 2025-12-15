"use client";

import { useState, useEffect } from "react";
import { useIsMobile } from "./hooks/useIsMobile";

// API data interfaces (kept for backward compatibility)
export interface VestingSeriesData {
  name: string;
  startDate: string | Date;
  tokenUnlocked: number;
  color: string;
}

export interface VestingApiData {
  publicSale: VestingSeriesData;
  liquidity: VestingSeriesData;
  community: VestingSeriesData;
  totalSupply: number;
}

// Sample vesting schedule data for Fixed Price with vesting
interface VestingScheduleRow {
  sequence: string;
  time: string;
  percentage: string;
  amount: number;
  tokenSymbol: string;
}

const sampleVestingData: VestingScheduleRow[] = [
  {
    sequence: "TGE",
    time: "25/06/2025",
    percentage: "35%",
    amount: 2000000,
    tokenSymbol: "SHARK",
  },
  {
    sequence: "1",
    time: "25/07/2025",
    percentage: "35%",
    amount: 2000000,
    tokenSymbol: "SHARK",
  },
  {
    sequence: "2",
    time: "25/08/2025",
    percentage: "20%",
    amount: 1200000,
    tokenSymbol: "SHARK",
  },
  {
    sequence: "3",
    time: "25/09/2025",
    percentage: "15%",
    amount: 900000,
    tokenSymbol: "SHARK",
  },
  {
    sequence: "4",
    time: "25/10/2025",
    percentage: "15%",
    amount: 900000,
    tokenSymbol: "SHARK",
  },
  {
    sequence: "5",
    time: "25/11/2025",
    percentage: "10%",
    amount: 600000,
    tokenSymbol: "SHARK",
  },
  {
    sequence: "6",
    time: "25/12/2025",
    percentage: "5%",
    amount: 300000,
    tokenSymbol: "SHARK",
  },
];

type Props = {
  // API data props (kept for backward compatibility)
  vestingData?: VestingApiData;
  // Fallback/demo props (kept for backward compatibility)
  total?: number;
  start?: string | Date;
  communityStart?: string | Date;
  end?: string | Date;
  // Display props (kept for backward compatibility)
  height?: number;
  dark?: boolean;
  // New prop for vesting schedule data
  vestingSchedule?: VestingScheduleRow[];
};

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export default function VestingScheduleTab({
  vestingData,
  total = 1_000_000_000,
  start = "2025-06-20",
  communityStart = "2025-06-28",
  end,
  height = 360,
  dark = true,
  vestingSchedule = sampleVestingData,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="w-full max-w-4xl">
        <div className="sm:min-w-[480px] md:min-w-full w-full">
          {/* Desktop/Tablet View - Table Layout */}
          <div
            className={`hidden sm:flex flex-row transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {/* Column 1: Sequence */}
            <div className="flex flex-col flex-shrink-0 w-16 md:w-20">
              {/* Header */}
              <div className="flex items-center justify-center px-3 py-[14px] border-b border-[#1F1F22] min-h-[49px]">
                <span className="text-[#828B8D] font-mono text-sm font-normal">
                  -
                </span>
              </div>
              {/* Data rows */}
              {vestingSchedule.map((row, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-center px-3 py-[14px] border-b border-[#1F1F22] min-h-[49px] 
                    transition-all duration-500 ease-out hover:bg-[#1A1A1D] hover:scale-[1.02] cursor-pointer
                    ${
                      isVisible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4"
                    }`}
                  style={{
                    transitionDelay: `${index * 80}ms`,
                  }}
                >
                  <span className="text-[#E0E0E0] font-mono text-sm font-normal transition-colors duration-200">
                    {row.sequence}
                  </span>
                </div>
              ))}
            </div>

            {/* Column 2: Time */}
            <div className="flex flex-col flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-start px-4 py-[14px] border-b border-[#1F1F22] min-h-[49px]">
                <span className="text-[#828B8D] font-mono text-sm font-normal">
                  Time
                </span>
              </div>
              {/* Data rows */}
              {vestingSchedule.map((row, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-start px-4 py-[14px] border-b border-[#1F1F22] min-h-[49px]
                    transition-all duration-500 ease-out hover:bg-[#1A1A1D] hover:scale-[1.02] cursor-pointer
                    ${
                      isVisible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4"
                    }`}
                  style={{
                    transitionDelay: `${index * 80 + 100}ms`,
                  }}
                >
                  <span className="text-[#E0E0E0] font-mono text-sm font-normal truncate transition-colors duration-200">
                    {row.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Column 3: Percentage */}
            <div className="flex flex-col flex-shrink-0 w-24 md:w-28">
              {/* Header */}
              <div className="flex items-center justify-end px-3 py-[14px] border-b border-[#1F1F22] min-h-[49px]">
                <span className="text-[#828B8D] font-mono text-sm font-normal">
                  Percentage
                </span>
              </div>
              {/* Data rows */}
              {vestingSchedule.map((row, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-end px-3 py-[14px] border-b border-[#1F1F22] min-h-[49px]
                    transition-all duration-500 ease-out hover:bg-[#1A1A1D] hover:scale-[1.02] cursor-pointer
                    ${
                      isVisible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-4"
                    }`}
                  style={{
                    transitionDelay: `${index * 80 + 200}ms`,
                  }}
                >
                  <span className="text-[#E0E0E0] font-mono text-sm font-normal transition-all duration-200 hover:text-[#00D4FF]">
                    {row.percentage}
                  </span>
                </div>
              ))}
            </div>

            {/* Column 4: Vesting Amount */}
            <div className="flex flex-col flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-end px-4 py-[14px] border-b border-[#1F1F22] min-h-[49px]">
                <span className="text-[#828B8D] font-mono text-sm font-normal">
                  Vesting Amount
                </span>
              </div>
              {/* Data rows */}
              {vestingSchedule.map((row, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-end px-4 py-[14px] border-b border-[#1F1F22] min-h-[49px] gap-2
                    transition-all duration-500 ease-out hover:bg-[#1A1A1D] hover:scale-[1.02] cursor-pointer
                    ${
                      isVisible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-4"
                    }`}
                  style={{
                    transitionDelay: `${index * 80 + 300}ms`,
                  }}
                >
                  <span className="text-[#E0E0E0] font-mono text-sm font-normal truncate transition-all duration-200 hover:text-[#00D4FF]">
                    {fmt(row.amount)}
                  </span>
                  <span className="text-[#828B8D] font-mono text-sm font-normal flex-shrink-0 transition-colors duration-200">
                    {row.tokenSymbol}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile View - Card Layout */}
          <div
            className={`sm:hidden space-y-2 px-1 transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            {vestingSchedule.map((row, index) => (
              <div
                key={index}
                className={`bg-[#0F0F10] border border-[#1F1F22] rounded-lg p-3 space-y-2 w-full max-w-full overflow-hidden
                  transition-all duration-600 ease-out hover:bg-[#1A1A1D] hover:border-[#2A2A2D] hover:scale-[1.02] 
                  hover:shadow-lg hover:shadow-[#00D4FF]/10 cursor-pointer transform-gpu
                  ${
                    isVisible
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-8 scale-95"
                  }`}
                style={{
                  transitionDelay: `${index * 120}ms`,
                }}
              >
                {/* Row header with sequence */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#828B8D] font-mono text-xs font-normal truncate max-w-[120px] transition-colors duration-200">
                    {row.sequence === "TGE" ? "TGE" : `Round ${row.sequence}`}
                  </span>
                  <span className="text-[#E0E0E0] font-mono text-sm font-normal flex-shrink-0 transition-all duration-200 hover:text-[#00D4FF] hover:scale-105">
                    {row.percentage}
                  </span>
                </div>

                {/* Time */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#828B8D] font-mono text-xs font-normal flex-shrink-0 transition-colors duration-200">
                    Date
                  </span>
                  <span className="text-[#E0E0E0] font-mono text-xs font-normal truncate max-w-[140px] text-right transition-all duration-200 hover:text-[#00D4FF]">
                    {row.time}
                  </span>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#828B8D] font-mono text-xs font-normal flex-shrink-0 transition-colors duration-200">
                    Amount
                  </span>
                  <div className="flex items-center gap-1 min-w-0 max-w-[160px]">
                    <span className="text-[#E0E0E0] font-mono text-xs font-normal truncate transition-all duration-200 hover:text-[#00D4FF] hover:scale-105">
                      {fmt(row.amount)}
                    </span>
                    <span className="text-[#828B8D] font-mono text-xs font-normal flex-shrink-0 transition-colors duration-200">
                      {row.tokenSymbol}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
