import React from "react";
import {
  GECKO_DEFAULT_NETWORK,
  getAllTimeVolumeUsd,
  getPool24hMetrics,
} from "@/libs/geckoterminal";

const FALLBACK_POOL_ADDRESS = "0xaD6198206DeC2a63B55ec30ae8a358DE860b427D"; // TODO: remove fallback when backend supplies pool address

interface GeckoPoolMetricState {
  totalVolumeUSD?: string;
  totalTraders?: string;
  isLoading: boolean;
  error?: string;
}

const formatUsdCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    notation: "compact",
  }).format(value);

const formatNumberCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);

export const useGeckoTerminalPoolMetrics = (
  poolAddress?: string,
  network: string = GECKO_DEFAULT_NETWORK
) => {
  const [state, setState] = React.useState<GeckoPoolMetricState>({
    totalVolumeUSD: undefined,
    totalTraders: undefined,
    isLoading: true,
    error: undefined,
  });

  React.useEffect(() => {
    const controller = new AbortController();
    let isCancelled = false;

    const targetPool = (poolAddress || FALLBACK_POOL_ADDRESS).toLowerCase();

    const loadMetrics = async () => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: undefined,
      }));

      try {
        const [allTimeVolume, stats24h] = await Promise.all([
          getAllTimeVolumeUsd(network, targetPool, controller.signal),
          getPool24hMetrics(network, targetPool, controller.signal),
        ]);

        if (controller.signal.aborted || isCancelled) {
          return;
        }

        const totalVolumeUsd = formatUsdCompact(
          allTimeVolume?.total_volume_usd_all_time ?? 0
        );
        const totalTraderEstimate = formatNumberCompact(
          stats24h?.unique_traders_24h_estimated ?? 0
        );

        setState({
          totalVolumeUSD: totalVolumeUsd,
          totalTraders: totalTraderEstimate,
          isLoading: false,
          error: undefined,
        });
      } catch (error) {
        if (controller.signal.aborted || isCancelled) {
          return;
        }

        const message =
          error instanceof Error && error.name === "AbortError"
            ? undefined
            : error instanceof Error
            ? error.message
            : "Unexpected GeckoTerminal error";

        setState({
          totalVolumeUSD: undefined,
          totalTraders: undefined,
          isLoading: false,
          error: message,
        });
      }
    };

    loadMetrics();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [poolAddress, network]);

  return state;
};
