import { formatUnits } from "viem";
import {
  BondingCurveHistoryResponse,
  SubgraphBondingCurveBuy,
  SubgraphBondingCurveSell,
} from "@/libs/types/subgraph.types";

type TradeWithType = (SubgraphBondingCurveBuy | SubgraphBondingCurveSell) & {
  tradeType: "BUY" | "SELL";
};

export type ChartDataPoint = [number, number];
export const GRADUATION_THRESHOLD_AWE = 100000;

export const transformBondingCurveDataToChart = (
  historyData: BondingCurveHistoryResponse | undefined,
  awePriceUsd: number
): ChartDataPoint[] => {
  if (!historyData || !historyData.data || historyData.data.length === 0) {
    return [];
  }

  // Transform trades to chart data points
  const chartData: ChartDataPoint[] = historyData.data
    .map((trade) => {
      try {
        const aweAmount = Number(formatUnits(BigInt(trade.aweAmount), 18));
        const tokenAmount = Number(formatUnits(BigInt(trade.tokenAmount), 18));
        if (aweAmount <= 0 || tokenAmount <= 0) {
          console.warn("Invalid trade amounts:", {
            aweAmount,
            tokenAmount,
            trade,
          });
          return null;
        }

        let tradeType: "BUY" | "SELL";

        if ((trade as any).tradeType) {
          // If tradeType is provided in the data
          tradeType = (trade as any).tradeType;
          if (tradeType !== "BUY" && tradeType !== "SELL") {
            console.warn("Invalid trade type:", tradeType, trade);
            return null;
          }
        } else {
          // Infer trade type from data structure
          if ("buyer" in trade) {
            tradeType = "BUY";
          } else if ("seller" in trade) {
            tradeType = "SELL";
          } else {
            console.warn(
              "Cannot determine trade type from data structure:",
              trade
            );
            return null;
          }
        }

        const awePerToken = aweAmount / tokenAmount;
        const priceUSD = awePerToken * awePriceUsd;
        const timestamp = parseInt(trade.blockTimestamp) * 1000;

        return [timestamp, priceUSD] as ChartDataPoint;
      } catch (error) {
        console.warn("Error processing trade data:", error, trade);
        return null;
      }
    })
    .filter((point): point is ChartDataPoint => point !== null)
    .sort((a, b) => a[0] - b[0]); // Sort by timestamp ascending

  return chartData;
};

/**
 * Calculate the graduation price threshold based on bonding curve economics
 * This is a simplified calculation - in reality, this would depend on the bonding curve formula
 * @param currentMarketCap Current market cap in AWE
 * @param totalSupply Total token supply
 * @param awePriceUsd Current AWE price in USD (from Zustand store)
 * @returns The price threshold in USD for graduation visualization
 */
export const calculateGraduationPriceThreshold = (
  currentMarketCap: number = 0,
  totalSupply: number = 100_000_000_000, // 100B tokens (default from docs)
  awePriceUsd: number
): number => {
  const graduationMarketCap = GRADUATION_THRESHOLD_AWE;
  if (totalSupply === 0) return 0;
  const graduationPriceAWE = graduationMarketCap / totalSupply;
  const graduationPriceUSD = graduationPriceAWE * awePriceUsd;
  return graduationPriceUSD;
};

/**
 * Calculate dynamic visual map pieces based on graduation threshold
 * @param graduationThreshold The graduation price threshold
 * @returns Visual map configuration for the chart
 */
export const calculateVisualMapPieces = (graduationThreshold: number) => {
  return [
    {
      gt: 0,
      lte: graduationThreshold,
      color: "#E73420",
    },
    {
      gt: graduationThreshold,
      color: "#28A86E",
    },
  ];
};

/**
 * Get the earliest trade timestamp from chart data
 * @param chartData Array of chart data points
 * @returns The earliest timestamp or a default date
 */
export const getEarliestTimestamp = (chartData: ChartDataPoint[]): number => {
  if (chartData.length === 0) {
    return Date.now() - 30 * 24 * 60 * 60 * 1000;
  }

  return chartData[0][0];
};

/**
 * Calculate price statistics from chart data
 * @param chartData Array of chart data points
 */
export const calculatePriceStats = (chartData: ChartDataPoint[]) => {
  if (chartData.length === 0) {
    return {
      currentPrice: 0,
      highestPrice: 0,
      lowestPrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
    };
  }

  const prices = chartData.map((point) => point[1]);
  const currentPrice = prices[prices.length - 1];
  const previousPrice =
    prices.length > 1 ? prices[prices.length - 2] : currentPrice;
  const highestPrice = Math.max(...prices);
  const lowestPrice = Math.min(...prices);

  const priceChange = currentPrice - previousPrice;
  const priceChangePercent =
    previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

  return {
    currentPrice,
    highestPrice,
    lowestPrice,
    priceChange,
    priceChangePercent,
  };
};

/**
 * Filter chart data by time range (used with existing time filter functions)
 * @param chartData Array of chart data points
 * @param startTimestamp Start timestamp for filtering
 * @returns Filtered chart data
 */
export const filterChartDataByTimeRange = (
  chartData: ChartDataPoint[],
  startTimestamp: number
): ChartDataPoint[] => {
  return chartData.filter((point) => point[0] >= startTimestamp);
};

/**
 * Debug utility to analyze price calculation details for a single trade
 * Useful for verifying executed price methodology implementation
 * @param trade Raw trade data from subgraph
 * @param awePriceUsd Current AWE price in USD (from Zustand store)
 * @returns Detailed price calculation breakdown
 */
export const debugTradePrice = (
  trade: SubgraphBondingCurveBuy | SubgraphBondingCurveSell,
  awePriceUsd: number
) => {
  const aweAmount = Number(formatUnits(BigInt(trade.aweAmount), 18));
  const tokenAmount = Number(formatUnits(BigInt(trade.tokenAmount), 18));
  const awePerToken = aweAmount / tokenAmount;
  const priceUSD = awePerToken * awePriceUsd;

  // Determine trade type using the same logic as in the main transformation
  let tradeType: "BUY" | "SELL";
  if ((trade as any).tradeType) {
    tradeType = (trade as any).tradeType;
  } else {
    tradeType = "buyer" in trade ? "BUY" : "SELL";
  }

  return {
    tradeId: trade.id.substring(0, 10) + "...",
    tradeType,
    timestamp: new Date(parseInt(trade.blockTimestamp) * 1000).toISOString(),
    rawAmounts: {
      aweAmount: trade.aweAmount,
      tokenAmount: trade.tokenAmount,
    },
    normalizedAmounts: {
      aweAmount: aweAmount.toLocaleString(),
      tokenAmount: tokenAmount.toLocaleString(),
    },
    calculation: {
      formula: "aweAmount / tokenAmount",
      awePerToken: awePerToken.toExponential(6),
      priceUSD: priceUSD.toExponential(6),
      aweMarketPrice: awePriceUsd,
    },
  };
};

/**
 * Validate trade data for price calculation
 * @param trade Raw trade data from subgraph
 * @returns Validation result with error details
 */
export const validateTradeData = (
  trade: SubgraphBondingCurveBuy | SubgraphBondingCurveSell
) => {
  const errors: string[] = [];

  if (!trade.aweAmount || BigInt(trade.aweAmount) <= 0) {
    errors.push("Invalid or zero AWE amount");
  }

  if (!trade.tokenAmount || BigInt(trade.tokenAmount) <= 0) {
    errors.push("Invalid or zero token amount");
  }

  // Validate trade type using flexible detection
  const tradeType =
    (trade as any).tradeType || ("buyer" in trade ? "BUY" : "SELL");
  if (tradeType !== "BUY" && tradeType !== "SELL") {
    errors.push("Invalid or missing trade type");
  }

  if (!trade.blockTimestamp || parseInt(trade.blockTimestamp) <= 0) {
    errors.push("Invalid or missing block timestamp");
  }

  return {
    isValid: errors.length === 0,
    errors,
    tradeId: trade.id?.substring(0, 10) + "..." || "unknown",
  };
};
