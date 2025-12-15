const API_BASE = "https://api.geckoterminal.com/api/v2";
const DEFAULT_HEADERS: HeadersInit = {
  accept: "application/json;version=20230302",
};

const getJson = async <T>(url: string, signal?: AbortSignal) => {
  const res = await fetch(url, { headers: DEFAULT_HEADERS, signal });
  if (!res.ok) {
    throw new Error(`GeckoTerminal request failed ${res.status}`);
  }
  return (await res.json()) as T;
};

/**
 * Fetch 24h volume and unique buyer/seller stats for a given pool.
 */
export const getPool24hMetrics = async (
  network: string,
  poolAddress: string,
  signal?: AbortSignal
) => {
  interface PoolResponse {
    data?: {
      attributes?: {
        volume_usd?: Record<string, string | number>;
        transactions?: Record<
          string,
          { buys?: string | number; sells?: string | number; buyers?: string | number; sellers?: string | number }
        >;
      };
    };
  }

  const json = await getJson<PoolResponse>(
    `${API_BASE}/networks/${network}/pools/${poolAddress}`,
    signal
  );

  const attrs = json?.data?.attributes ?? {};
  const volume24h = Number((attrs.volume_usd as Record<string, unknown>)?.h24 ?? 0);
  const buyers24h = Number(
    (attrs.transactions as Record<string, { buyers?: unknown; sellers?: unknown }> | undefined)?.h24?.buyers ?? 0
  );
  const sellers24h = Number(
    (attrs.transactions as Record<string, { buyers?: unknown; sellers?: unknown }> | undefined)?.h24?.sellers ?? 0
  );

  return {
    volume_usd_24h: volume24h,
    unique_buyers_24h: buyers24h,
    unique_sellers_24h: sellers24h,
    unique_traders_24h_estimated: buyers24h + sellers24h,
  };
};

/**
 * Aggregate daily candles to estimate total historical USD volume for a pool.
 */
export const getAllTimeVolumeUsd = async (
  network: string,
  poolAddress: string,
  signal?: AbortSignal
) => {
  interface OhlcvResponse {
    data?: {
      attributes?: {
        ohlcv_list?: number[][];
      };
    };
  }

  let totalVolume = 0;
  let before = Math.floor(Date.now() / 1000);

  while (true) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const url = new URL(
      `${API_BASE}/networks/${network}/pools/${poolAddress}/ohlcv/day`
    );
    url.searchParams.set("aggregate", "1");
    url.searchParams.set("limit", "1000");
    url.searchParams.set("currency", "usd");
    url.searchParams.set("before_timestamp", String(before));

    const json = await getJson<OhlcvResponse>(url.toString(), signal);
    const list = json?.data?.attributes?.ohlcv_list ?? [];

    if (list.length === 0) {
      break;
    }

    for (const [, , , , , volume] of list) {
      totalVolume += Number(volume ?? 0);
    }

    before = Math.floor(list[list.length - 1]?.[0] ?? 0) - 1;
    if (!before || before < 0) {
      break;
    }
  }

  return { total_volume_usd_all_time: totalVolume };
};

export const GECKO_DEFAULT_NETWORK = "base";
export const GECKO_HEADERS = DEFAULT_HEADERS; // Exported for testing/mocking if needed.
