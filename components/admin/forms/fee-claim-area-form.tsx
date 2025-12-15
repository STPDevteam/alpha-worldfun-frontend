"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/libs/utils/cn";
import { Text } from "@/components/ui";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import Image from "next/image";
import { TokenStatus } from "@/libs/types/world-card";
import {
  useAdminClaims,
  type PoolType,
} from "@/libs/hooks/contracts/use-admin-claims";

// Types and Interfaces
export interface FeeClaimAreaFormProps {
  className?: string;
  tokenStatus?: TokenStatus;
  poolAddress?: string;
  poolType?: PoolType;
  onClaimFees?: () => void;
}

interface FeeStatistics {
  totalEarned: {
    usd: number;
    awe: number;
  };
  unclaimed: {
    usd: number;
    awe: number;
  };
}

interface ChartDataPoint {
  timestamp: string;
  value: number;
  aweValue: number;
}

type TimePeriod = "1D" | "1W" | "1M" | "3M" | "1Y" | "All";

// Statistics Card Component
interface StatsCardProps {
  label: string;
  usdAmount: number;
  aweAmount: number;
  variant?: "default" | "highlight";
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  usdAmount,
  aweAmount,
}) => {
  return (
    <div className="flex flex-col gap-1 sm:gap-1.5">
      <div className="flex items-center gap-1">
        <Text
          className="text-[#656565] text-xs sm:text-sm"
          style={{ fontFamily: "DM Mono" }}
        >
          {label}
        </Text>
      </div>
      <div className="flex gap-1 items-end">
        <Text
          className="text-[#E0E0E0] text-lg sm:text-xl md:text-2xl font-medium items-center"
          style={{ fontFamily: "DM Mono" }}
        >
          ${usdAmount.toFixed(2)}
        </Text>
        <Text
          className="text-[#919191] text-xs"
          style={{ fontFamily: "DM Mono" }}
        >
          {aweAmount.toFixed(3)} AWE
        </Text>
      </div>
    </div>
  );
};

// Claim Button Component
const ClaimButton: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}> = ({ onClick, disabled, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "px-3 sm:px-5 py-2 rounded-[10px]",
        "bg-[#E0E0E0] text-[#010101]",
        "text-sm sm:text-base font-light",
        "hover:bg-[#E0E0E0]/90 transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "h-8 sm:h-10 min-w-[100px] sm:min-w-[120px] flex items-center justify-center gap-2 cursor-pointer"
      )}
      style={{ fontFamily: "DM Mono" }}
    >
      {loading ? (
        <>
          <div className="w-3 h-3 sm:w-4 sm:h-4 border-1 border-white border-t-transparent rounded-[10px] animate-spin" />
          <span className="hidden sm:inline">Claiming...</span>
          <span className="sm:hidden">...</span>
        </>
      ) : (
        <>
          <span className="sm:inline">CLAIM FEE</span>
        </>
      )}
    </button>
  );
};

// Time Filter Component
interface TimeFilterProps {
  selected: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({ selected, onChange }) => {
  const periods: TimePeriod[] = ["1D", "1W", "1M", "3M", "1Y", "All"];

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={cn(
            "px-2 sm:px-3 py-1 rounded-[6px] text-xs whitespace-nowrap",
            "transition-all duration-200 cursor-pointer",
            selected === period
              ? "text-white"
              : "text-[#424242] hover:text-white"
          )}
          style={{ fontFamily: "DM Mono" }}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

// No Data Component
const NoDataState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[268px] gap-1">
      <div className="w-[120px] h-[120px] relative">
        <Image
          src="/assets/images/no-data-chart-image.png"
          alt="No data"
          width={120}
          height={120}
          className="object-contain"
        />
      </div>
      <Text
        className="text-white text-base font-medium"
        style={{ fontFamily: "DM Mono" }}
      >
        No Data
      </Text>
      <Text
        className="text-[#5D5D5D] text-sm"
        style={{ fontFamily: "DM Mono" }}
      >
        No fee data yet. Your token hasn&apos;t earned any fees.
      </Text>
    </div>
  );
};

// Chart Component
interface FeeHistoryChartProps {
  data: ChartDataPoint[];
  height?: number;
  onHover?: (data: ChartDataPoint | null) => void;
}

// Helper Functions
const formatTimestamp = (index: number, period: TimePeriod): string => {
  const now = new Date();
  let date: Date;

  switch (period) {
    case "1D":
      date = new Date(now.getTime() - (23 - index) * 60 * 60 * 1000);
      return date.getHours().toString().padStart(2, "0") + ":00";
    case "1W":
      date = new Date(now.getTime() - (6 - index) * 24 * 60 * 60 * 1000);
      return date.toLocaleDateString("en-US", { weekday: "short" });
    case "1M":
      date = new Date(now.getTime() - (29 - index) * 24 * 60 * 60 * 1000);
      // Show only every 5th day or specific dates to avoid overcrowding
      if (index % 5 === 0 || index === 29) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
      return "";
    case "3M":
    case "1Y":
    case "All":
      date = new Date(now.getTime() - index * 7 * 24 * 60 * 60 * 1000);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    default:
      return index.toString();
  }
};

// Chart Configuration
const getChartOption = (data: ChartDataPoint[]): EChartsOption => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return {
    backgroundColor: "transparent",
    grid: {
      top: isMobile ? 5 : 10,
      left: isMobile ? 5 : 0,
      right: isMobile ? 5 : 0,
      bottom: isMobile ? 20 : 0,
    },
    xAxis: {
      type: "category",
      data: data.map((d) => d.timestamp),
      boundaryGap: false,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "#939393",
        fontSize: isMobile ? 10 : 12,
        fontFamily: "DM Mono",
        interval: isMobile ? "auto" : 0,
        hideOverlap: true,
        rotate: isMobile ? 45 : 0,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
      position: "right",
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "#939393",
        fontSize: isMobile ? 10 : 12,
        fontFamily: "DM Mono",
        formatter: (value: number) => {
          if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}k`;
          }
          return value.toString();
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#282828",
          type: "dashed" as const,
          dashOffset: 2,
        },
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#0E3263",
      borderColor: "#2A4D7C",
      borderWidth: 1,
      padding: isMobile ? 8 : 12,
      textStyle: {
        color: "#FFFFFF",
        fontFamily: "DM Mono",
        fontSize: isMobile ? 10 : 12,
      },
      axisPointer: {
        type: "cross",
        label: {
          show: false,
        },
        crossStyle: {
          color: "transparent",
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const data = params[0];
        const aweValue = (data.value * 0.00571).toFixed(3);
        return `
          <div style="font-family: DM Mono; font-size: ${
            isMobile ? "10px" : "12px"
          };">
            <div style="display: flex; justify-content: space-between; gap: ${
              isMobile ? "20px" : "55px"
            }; margin-bottom: 6px;">
              <span style="color: #FFFFFF;">24/07/2025</span>
              <span style="color: #AAAAAA;">${data.name}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 6px;">
              <span style="width: 6px; height: 6px; background: #E0E0E0; border-radius: 50%; display: inline-block;"></span>
              <span style="color: #AAAAAA;">Total Earned</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <span style="color: #FFFFFF; font-size: ${
                isMobile ? "12px" : "14px"
              }; font-weight: 500;">$${data.value.toFixed(4)}</span>
              <span style="color: #FFFFFF; font-size: ${
                isMobile ? "10px" : "12px"
              };">${aweValue} AWE</span>
            </div>
          </div>
        `;
      },
    },
    series: [
      {
        name: "Total Earned",
        type: "line",
        data: data.map((d) => d.value),
        smooth: true,
        symbol: "circle",
        symbolSize: isMobile ? 8 : 12,
        showSymbol: false,
        lineStyle: {
          color: "#1350A3",
          width: isMobile ? 1 : 1,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(12, 74, 158, 1)",
              },
              {
                offset: 1,
                color: "rgba(14, 50, 99, 0)",
              },
            ],
          },
          opacity: 0.4,
        },
        emphasis: {
          focus: "series",
          scale: false,
          itemStyle: {
            color: "#0E3263",
            borderColor: "#E0E0E0",
            borderWidth: 2,
            shadowBlur: 6,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          },
        },
      },
    ],
  };
};

const FeeHistoryChart: React.FC<FeeHistoryChartProps> = ({
  data,
  height = 240,
  onHover,
}) => {
  const chartRef = useRef<ReactECharts>(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        const echartsInstance = chartRef.current.getEchartsInstance();
        echartsInstance.resize();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chartOption = useMemo(() => getChartOption(data), [data]);

  const onChartEvents = useMemo(
    () => ({
      mouseover: (params: { componentType: string; dataIndex: number }) => {
        if (params.componentType === "series") {
          onHover?.(data[params.dataIndex]);
        }
      },
      mouseout: () => {
        onHover?.(null);
      },
    }),
    [data, onHover]
  );

  // Responsive height based on screen size
  const responsiveHeight =
    typeof window !== "undefined" && window.innerWidth < 640 ? 180 : height;

  return (
    <div className="relative w-full" style={{ height: responsiveHeight }}>
      <ReactECharts
        ref={chartRef}
        option={chartOption}
        style={{ height: "100%", width: "100%" }}
        onEvents={onChartEvents}
        opts={{ renderer: "canvas" }}
        notMerge={false}
        lazyUpdate={true}
      />
    </div>
  );
};

// Main Component
export const FeeClaimAreaForm: React.FC<FeeClaimAreaFormProps> = ({
  className,
  tokenStatus = TokenStatus.ON_GOING,
  poolAddress,
  poolType = "BONDING_CURVE",
  onClaimFees,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1D");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Use the admin claims hook with poolType to select correct ABI
  const { claimDexFees, isClaimingFees, isConfirming, status } = useAdminClaims(
    {
      poolAddress,
      poolType,
      enabled: !!poolAddress,
    }
  );

  // Determine if we should show data based on token status
  const hasData = useMemo(() => {
    return tokenStatus === TokenStatus.LIVE;
  }, [tokenStatus]);

  // Statistics that update based on hasData state
  const statistics: FeeStatistics = useMemo(
    () => ({
      totalEarned: { usd: hasData ? 56.27 : 0, awe: hasData ? 0.321 : 0 },
      unclaimed: { usd: hasData ? 56.27 : 0, awe: hasData ? 0.321 : 0 },
    }),
    [hasData]
  );

  // Generate mock data based on selected period
  useEffect(() => {
    const generateData = (period: TimePeriod): ChartDataPoint[] => {
      // Return empty array when hasData is false to show no-data state
      if (!hasData) {
        return [];
      }

      const points =
        period === "1D"
          ? 24
          : period === "1W"
          ? 7
          : period === "1M"
          ? 30
          : period === "3M"
          ? 90
          : period === "1Y"
          ? 365
          : 500;

      return Array.from({ length: points }, (_, i) => ({
        timestamp: formatTimestamp(i, period),
        value: Math.random() * 15000 + 5000,
        aweValue: Math.random() * 0.5,
      }));
    };

    setChartData(generateData(selectedPeriod));
  }, [selectedPeriod, hasData]);

  const handleClaimFees = async () => {
    try {
      await claimDexFees();
      onClaimFees?.();
    } catch (error) {
      console.error("Failed to claim DEX fees:", error);
    }
  };

  // Determine loading state from hook
  const isLoading = isClaimingFees || isConfirming;

  return (
    <div className={cn("space-y-3 sm:space-y-5", className)}>
      {/* Statistics Header */}
      <div className="relative rounded-lg p-[0.5px]">
        <div className="backdrop-blur-[100px] rounded-lg p-3 sm:p-[18px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4 sm:gap-0">
            {/*
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10 w-full sm:w-auto">
              <StatsCard
                label="Total Earned"
                usdAmount={statistics.totalEarned.usd}
                aweAmount={statistics.totalEarned.awe}
              />
              <StatsCard
                label="Unclaimed"
                usdAmount={statistics.unclaimed.usd}
                aweAmount={statistics.unclaimed.awe}
              />
            </div> */}
            <div className="w-full sm:w-auto flex justify-center items-center sm:justify-end">
              <ClaimButton
                onClick={handleClaimFees}
                disabled={statistics.unclaimed.usd === 0}
                loading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {/*
      <div className="relative rounded-lg p-[0.5px] bg-[#51515133]">
        <div className="bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] rounded-lg p-3 sm:p-[18px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-2 gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <Text
                className="text-white text-sm sm:text-base font-medium"
                style={{ fontFamily: "DM Mono" }}
              >
                Creator Fee History
              </Text>
            </div>
            {hasData && (
              <TimeFilter
                selected={selectedPeriod}
                onChange={setSelectedPeriod}
              />
            )}
          </div>
          {chartData.length > 0 ? (
            <FeeHistoryChart data={chartData} height={240} />
          ) : (
            <NoDataState />
          )}
        </div>
      </div> */}
    </div>
  );
};
