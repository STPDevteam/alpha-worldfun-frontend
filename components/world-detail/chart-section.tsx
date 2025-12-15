"use client";

import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
  useDeferredValue,
} from "react";
import * as echarts from "echarts";
import type { EChartsOption, DataZoomComponentOption } from "echarts";
import {
  TimeFilter,
  filterDataByTimeRangeTimestamp,
  transformToTimeData,
} from "@/libs/utils/date";
import { useBondingCurveHistory } from "@/libs/hooks/subgraph/use-trading-history";
import {
  transformBondingCurveDataToChart,
  calculateGraduationPriceThreshold,
  calculateVisualMapPieces,
  type ChartDataPoint,
} from "@/libs/utils/chart-transformations";
import { formatSmallNumberWithUI } from "@/libs/utils/format";
import {
  useAwePrice,
  useAwePriceActions,
  useAwePriceLoading,
} from "@/libs/stores";
import { Text } from "@/components/ui";
import Image from "next/image";

type TokenPriceDataPoint = [string, number];

const TIME_FILTERS: TimeFilter[] = ["1D", "7D", "1M", "1Y", "Max"];

const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const WEEK_IN_MS = 7 * DAY_IN_MS;
const MONTH_IN_MS = 30 * DAY_IN_MS;
const YEAR_IN_MS = 365 * DAY_IN_MS;

const FILTER_DURATION_MS: Record<Exclude<TimeFilter, "Max">, number> = {
  "1D": DAY_IN_MS,
  "7D": 7 * DAY_IN_MS,
  "1M": MONTH_IN_MS,
  "1Y": YEAR_IN_MS,
};

const getXAxisMinInterval = (filter: TimeFilter): number => {
  switch (filter) {
    case "1D":
      return HOUR_IN_MS;
    case "7D":
    case "1M":
      return DAY_IN_MS;
    case "1Y":
    case "Max":
      return WEEK_IN_MS;
    default:
      return DAY_IN_MS;
  }
};

const getXAxisSplitNumber = (filter: TimeFilter): number => {
  switch (filter) {
    case "1D":
      return 6;
    case "7D":
      return 7;
    case "1M":
      return 6;
    case "1Y":
    case "Max":
      return 5;
    default:
      return 6;
  }
};

// Base timestamp formatter without state
const formatChartTimestamp = (
  timestamp: number,
  filter: TimeFilter
): string => {
  const date = new Date(timestamp);
  let result = "";

  switch (filter) {
    case "1D":
      result =
        date.getHours().toString().padStart(2, "0") +
        ":" +
        date.getMinutes().toString().padStart(2, "0");
      break;
    case "7D":
      result = date.toLocaleDateString("en-US", { weekday: "short" });
      break;
    case "1M":
      result = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      break;
    case "1Y":
    case "Max":
      result = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      break;
    default:
      result = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      break;
  }

  return result;
};

// Base chart configuration (static parts that don't change)
const getBaseChartOptions = (): EChartsOption => ({
  backgroundColor: "#10101066",
  tooltip: {
    trigger: "axis",
    formatter: function (params: unknown) {
      if (!Array.isArray(params) || params.length === 0) return "";

      const param = params[0];
      const timestamp = param.axisValue;
      const price = param.value[1];

      // Format the date
      const date = new Date(timestamp).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Format the price as USD using SmallNumberDisplay pattern
      let formattedPrice: string;
      const formatted = formatSmallNumberWithUI(price);

      if (
        formatted.isSmallNumber &&
        formatted.leadingZeros &&
        formatted.leadingZeros > 0
      ) {
        formattedPrice = `$${formatted.wholeNumber}<span style="font-size: 0.7em; vertical-align: sub;">${formatted.leadingZeros}</span>${formatted.significantDigits}`;
      } else {
        formattedPrice = `$${formatted.wholeNumber}`;
      }

      return `${date}<br/>Price: ${formattedPrice}`;
    },
  },
  grid: {
    left: "3%",
    right: "3%",
    top: "3%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "time",
    minInterval: HOUR_IN_MS,
    splitNumber: 6,
    axisLabel: {
      show: true,
      fontFamily: "BDO Grotesk",
      fontWeight: 400,
      fontSize: 12,
      lineHeight: 16,
      color: "#FFFFFF",
      margin: 8,
      rotate: 0,
      hideOverlap: true,
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: "#333",
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: "#333",
      },
    },
    splitLine: {
      show: false,
    },
  },
  yAxis: {
    position: "right",
    axisLabel: {
      formatter: function (value: number) {
        if (value === 0) return "$0";

        // Format USD values using SmallNumberDisplay pattern
        const formatted = formatSmallNumberWithUI(value);

        if (
          formatted.isSmallNumber &&
          formatted.leadingZeros &&
          formatted.leadingZeros > 0
        ) {
          return `{a|$${formatted.wholeNumber}}{b|${formatted.leadingZeros}}{a|${formatted.significantDigits}}`;
        } else {
          return `$${formatted.wholeNumber}`;
        }
      },
      rich: {
        a: {
          fontSize: 12,
        },
        b: {
          fontSize: 8,
          verticalAlign: "bottom",
        },
      },
      fontFamily: "BDO Grotesk",
      fontWeight: 400,
      fontSize: 12,
      lineHeight: 16,
      color: "#555555",
    },
  },
  series: [
    {
      name: "Price (USD)",
      type: "line",
      data: [],
      lineStyle: {
        width: 2,
      },
      symbol: "none",
      markLine: {
        silent: true,
        symbol: "none",
        lineStyle: {
          color: "#333",
          type: "dashed",
        },
        label: {
          show: false,
        },
        data: [],
      },
    },
  ],
});

// No Data Component
const NoDataState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[340px] gap-1">
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
        className="text-[#5D5D5D] text-sm px-4 md:px-0"
        style={{ fontFamily: "DM Mono" }}
      >
        No trading data available yet. Start trading to see the price chart.
      </Text>
    </div>
  );
};

interface ChartSectionProps {
  bondingCurveAddress?: string;
  data?: TokenPriceDataPoint[];
  timeFilter?: TimeFilter;
  onTimeFilterChange?: (filter: TimeFilter) => void;
  showTrendLine?: boolean;
  splitChart?: boolean;
  loading?: boolean;
  error?: string;
  currentMarketCap?: number;
  totalSupply?: number;
  /**
   * Enable debug mode to log data processing information
   * @default false
   */
  debug?: boolean;
}

const ChartSectionComponent = ({
  bondingCurveAddress,
  data: externalData,
  timeFilter = "1M",
  onTimeFilterChange,
  showTrendLine = true,
  splitChart: _splitChart = false,
  loading: externalLoading = false,
  error: externalError,
  currentMarketCap = 0,
  totalSupply = 100_000_000_000,
  debug = false,
}: ChartSectionProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>(timeFilter);

  // Fetch AWE price from Zustand store with 3-day cache
  const awePrice = useAwePrice();
  const { fetchPrice } = useAwePriceActions();
  const awePriceLoading = useAwePriceLoading();

  // Auto-fetch AWE price on mount if not cached
  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
  } = useBondingCurveHistory(
    {
      bondingCurveAddress,
      limit: 1000,
    },
    {
      enabled: !!bondingCurveAddress,
      staleTime: 30 * 1000,
    }
  );

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!historyData || !awePrice) return [];
    return transformBondingCurveDataToChart(historyData, awePrice);
  }, [historyData, awePrice]);

  const graduationThreshold = useMemo(() => {
    if (!awePrice) return 0;
    return calculateGraduationPriceThreshold(
      currentMarketCap,
      totalSupply,
      awePrice
    );
  }, [currentMarketCap, totalSupply, awePrice]);

  const visualMapPieces = useMemo(
    () => calculateVisualMapPieces(graduationThreshold),
    [graduationThreshold]
  );

  const loading = externalLoading || historyLoading || awePriceLoading;
  const error = externalError || historyError?.message;
  useEffect(() => {
    setSelectedFilter(timeFilter);
  }, [timeFilter]);

  const baseTimeSeries = useMemo(() => {
    if (externalData && externalData.length) {
      return transformToTimeData(externalData).sort((a, b) => a[0] - b[0]);
    }

    if (chartData.length > 0) {
      return [...chartData].sort((a, b) => a[0] - b[0]);
    }

    return [];
  }, [externalData, chartData]);

  const seriesByFilter = useMemo(() => {
    return TIME_FILTERS.reduce((acc, filter) => {
      if (!baseTimeSeries.length) {
        acc[filter] = [];
        return acc;
      }

      acc[filter] =
        filter === "Max"
          ? baseTimeSeries
          : filterDataByTimeRangeTimestamp(baseTimeSeries, filter);

      return acc;
    }, {} as Record<TimeFilter, [number, number][]>);
  }, [baseTimeSeries]);

  const filteredData = useMemo(
    () => seriesByFilter[selectedFilter] ?? [],
    [seriesByFilter, selectedFilter]
  );

  const deferredData = useDeferredValue(filteredData);

  const domain = useMemo<{
    min: number | undefined;
    max: number | undefined;
  }>(() => {
    if (!baseTimeSeries.length) {
      return { min: undefined, max: undefined };
    }

    const earliest = baseTimeSeries[0][0];
    const latest = baseTimeSeries[baseTimeSeries.length - 1][0];

    if (selectedFilter === "Max") {
      if (earliest === latest) {
        return {
          min: earliest - DAY_IN_MS,
          max: latest + DAY_IN_MS,
        };
      }

      return { min: earliest, max: latest };
    }

    const duration = FILTER_DURATION_MS[selectedFilter];

    if (!duration) {
      if (earliest === latest) {
        return {
          min: earliest - DAY_IN_MS,
          max: latest + DAY_IN_MS,
        };
      }

      return { min: earliest, max: latest };
    }

    const max = latest;
    const min = max - duration;

    if (min >= max) {
      return {
        min: max - HOUR_IN_MS,
        max: max + HOUR_IN_MS,
      };
    }

    return { min, max };
  }, [baseTimeSeries, selectedFilter]);
  // Initialize chart once (only when container becomes available)
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) return;

    chartInstance.current = echarts.init(chartRef.current, "dark");

    const baseOptions = getBaseChartOptions();
    chartInstance.current.setOption(baseOptions);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!chartInstance.current) return;

    if (!loading && !error && deferredData.length > 0) {
      const resizeTimeout = setTimeout(() => {
        chartInstance.current?.resize();
      }, 0);

      return () => clearTimeout(resizeTimeout);
    }
  }, [loading, error, deferredData.length]);

  // Separate effect: Update chart data incrementally (no disposal/recreation)
  useEffect(() => {
    if (!chartInstance.current) return;

    // Handle empty data case - clear the chart
    if (!deferredData.length) {
      chartInstance.current.setOption(
        {
          series: [
            {
              data: [],
              markLine: {
                data: [],
              },
            },
          ],
          xAxis: {
            min: undefined,
            max: undefined,
          },
        },
        {
          notMerge: false,
          lazyUpdate: false,
        }
      );
      return;
    }

    const seriesData = deferredData.map(function (item: [number, number]) {
      return [item[0], item[1]];
    });

    const sliderZoom: DataZoomComponentOption = {
      type: "slider",
      show: false,
    };

    const insideZoom: DataZoomComponentOption = {
      type: "inside",
    };

    if (typeof domain.min === "number") {
      sliderZoom.startValue = domain.min;
      insideZoom.startValue = domain.min;
    }

    if (typeof domain.max === "number") {
      sliderZoom.endValue = domain.max;
      insideZoom.endValue = domain.max;
    }

    const shouldHighlightSinglePoint = deferredData.length === 1;

    // Incremental update: only update dynamic parts (data, filters, visualMap)
    const updateOptions: EChartsOption = {
      xAxis: {
        min: domain.min,
        max: domain.max,
        minInterval: getXAxisMinInterval(selectedFilter),
        splitNumber: getXAxisSplitNumber(selectedFilter),
        axisLabel: {
          hideOverlap: true,
          formatter: function (value: number) {
            return formatChartTimestamp(value, selectedFilter);
          },
        },
      },
      dataZoom: [sliderZoom, insideZoom],
      visualMap: {
        show: false,
        pieces: visualMapPieces,
        outOfRange: {
          color: "#999",
        },
      },
      series: [
        {
          name: "Price (USD)",
          type: "line",
          data: seriesData,
          lineStyle: {
            width: 2,
          },
          symbol: shouldHighlightSinglePoint ? "circle" : "none",
          showSymbol: shouldHighlightSinglePoint,
          symbolSize: shouldHighlightSinglePoint ? 10 : undefined,
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: {
              color: "#333",
              type: "dashed",
            },
            label: {
              show: false,
            },
            data: [
              {
                yAxis: graduationThreshold,
              },
            ],
          },
        },
      ],
    };

    // Use setOption without notMerge to incrementally update
    chartInstance.current.setOption(updateOptions, {
      notMerge: false, // Merge with existing options for smooth updates
      lazyUpdate: false, // Update immediately
    });
  }, [
    deferredData,
    selectedFilter,
    domain.min,
    domain.max,
    graduationThreshold,
    visualMapPieces,
  ]);

  // Cleanup effect: dispose chart when component unmounts
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  // Handle time filter changes
  const handleTimeFilterChange = useCallback(
    (filter: TimeFilter) => {
      setSelectedFilter(filter);

      if (onTimeFilterChange) {
        onTimeFilterChange(filter);
      }
    },
    [onTimeFilterChange]
  );

  return (
    <div className="w-full bg-[#10101066] border border-[#171717] rounded-2xl">
      <div className="mb-4 flex justify-between items-center ml-[18px] mt-[9.5px]">
        <div className="flex gap-8 p-2">
          {TIME_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => handleTimeFilterChange(filter)}
              className={`text-sm font-medium transition-colors duration-200 hover:text-white/80 cursor-pointer ${
                selectedFilter === filter ? "text-white" : "text-[#555555]"
              }`}
              style={{
                fontFamily:
                  "var(--font-messina), var(--font-inter), sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "1.286",
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Container wrapper for all states */}
      <div style={{ position: "relative", width: "100%", height: "340px" }}>
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: "100%",
            visibility:
              loading || error || !deferredData.length ? "hidden" : "visible",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />

        {/* Show loading state */}
        {loading && (
          <div
            className="flex items-center justify-center"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <div className="text-white font-mono">Loading chart data...</div>
          </div>
        )}

        {/* Show error state */}
        {!loading && error && (
          <div
            className="flex flex-col items-center justify-center"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <div className="text-red-400 font-mono mb-4">Error: {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#28A86E] text-white rounded hover:bg-[#22956B] font-mono"
            >
              Retry
            </button>
          </div>
        )}

        {/* Show no data state */}
        {!loading && !error && !deferredData.length && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <NoDataState />
          </div>
        )}
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders from parent
const ChartSection = React.memo(
  ChartSectionComponent,
  (prevProps, nextProps) => {
    // Custom comparison for performance optimization
    return (
      prevProps.bondingCurveAddress === nextProps.bondingCurveAddress &&
      prevProps.timeFilter === nextProps.timeFilter &&
      prevProps.showTrendLine === nextProps.showTrendLine &&
      prevProps.loading === nextProps.loading &&
      prevProps.error === nextProps.error &&
      prevProps.currentMarketCap === nextProps.currentMarketCap &&
      prevProps.totalSupply === nextProps.totalSupply &&
      prevProps.debug === nextProps.debug &&
      // Deep equality check for data array
      prevProps.data?.length === nextProps.data?.length &&
      prevProps.data?.[0]?.[0] === nextProps.data?.[0]?.[0] &&
      prevProps.data?.[prevProps.data.length - 1]?.[0] ===
        nextProps.data?.[nextProps.data.length - 1]?.[0]
    );
  }
);

ChartSection.displayName = "ChartSection";

export default ChartSection;
