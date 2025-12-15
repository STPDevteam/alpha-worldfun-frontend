"use client";

import { useEffect, useState } from "react";
import { cn } from "@/libs/utils/cn";

export interface TradingViewWidgetOptions {
  container_id: string | HTMLElement;
  symbol: string;
  interval?: string | number;
  theme?: "light" | "dark";
  style?: string | number;
  locale?: string;
  width?: number | string;
  height?: number | string;
  [key: string]: unknown;
}

export interface TradingViewWidgetInstance {
  onChartReady?(cb: () => void): void;
  remove?(): void;
}

interface TradingViewChartProps {
  tokenAddress?: string | null;
}

const GECKOTERMINAL_BASE_URL = "https://www.geckoterminal.com/base/pools";

const buildGeckoTerminalUrl = (poolAddress?: string | null) => {
  const address = poolAddress?.trim()?.toLowerCase();

  if (!address) {
    return null;
  }

  const params = new URLSearchParams({
    embed: "1",
    info: "0",
    swaps: "0",
    light_chart: "0",
    chart_type: "market_cap",
    resolution: "15m",
    bg_color: "111827",
  });

  return `${GECKOTERMINAL_BASE_URL}/${address}?${params.toString()}`;
};

// Chart Skeleton Component
const ChartSkeleton = () => {
  return (
    <div className="absolute inset-0 bg-gray-900 rounded-lg overflow-hidden">
      {/* Header area with title and controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-6 w-32 bg-gray-800 rounded animate-pulse" />
          <div className="h-5 w-20 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-800 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-800 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>

      {/* Chart area */}
      <div className="relative h-full p-4">
        {/* Y-axis labels */}
        <div className="absolute left-4 top-20 bottom-12 flex flex-col justify-between">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 w-16 bg-gray-800 rounded animate-pulse" />
          ))}
        </div>

        {/* Chart lines - simulating candlesticks */}
        <div className="absolute left-24 right-4 top-20 bottom-12 flex items-end justify-around gap-1">
          {[...Array(20)].map((_, i) => {
            const height = Math.random() * 60 + 20;
            const delay = i * 50;
            return (
              <div
                key={i}
                className="flex-1 bg-gray-800 rounded-t animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDelay: `${delay}ms`,
                }}
              />
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="absolute left-24 right-4 bottom-4 flex justify-between">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 w-12 bg-gray-800 rounded animate-pulse" />
          ))}
        </div>

        {/* Loading indicator with modern animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-500 rounded-full animate-spin animation-delay-150" />
            </div>
            <div className="text-gray-500 text-sm font-medium animate-pulse">
              Loading chart...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TradingViewChart({
  tokenAddress: poolAddress,
}: TradingViewChartProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const geckoTerminalUrl = buildGeckoTerminalUrl(poolAddress);

  useEffect(() => {
    setIsLoaded(false);
  }, [geckoTerminalUrl]);

  const handleLoad = () => {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  };

  return (
    <div className="relative w-full h-[500px]">
      {/* Skeleton loader */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500 ease-in-out",
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <ChartSkeleton />
      </div>

      {/* Iframe */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500 ease-in-out",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      >
        <iframe
          id="geckoterminal-embed"
          title="GeckoTerminal Embed"
          src={geckoTerminalUrl || ""}
          allow="clipboard-write"
          className="h-full w-full"
          allowFullScreen
          onLoad={handleLoad}
        ></iframe>
      </div>
    </div>
  );
}
