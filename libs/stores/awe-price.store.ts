import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { coinGeckoService } from "@/libs/services/api/coingecko.service";

// 1 day in milliseconds
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 86400000ms

interface AwePriceState {
  price: number | null;
  marketCap: number | null;
  volume24h: number | null;
  change24h: number | null;
  lastUpdatedAt: number | null;
  isLoading: boolean;
  error: string | null;
  actions: {
    fetchPrice: () => Promise<void>;
    clearCache: () => void;
  };
}

const useAwePriceStore = create<AwePriceState>()(
  persist(
    (set, get) => ({
      price: null,
      marketCap: null,
      volume24h: null,
      change24h: null,
      lastUpdatedAt: null,
      isLoading: false,
      error: null,

      actions: {
        /**
         * Fetch AWE token price from CoinGecko
         * Automatically skips if cache is fresh (less than 1 day old)
         */
        fetchPrice: async () => {
          // Check if cache is still valid
          const state = get();
          const lastUpdate = state.lastUpdatedAt;

          if (lastUpdate && state.price !== null) {
            const cacheAge = Date.now() - lastUpdate;
            if (cacheAge < ONE_DAY_MS) {
              return;
            }
          }

          set({ isLoading: true, error: null });

          try {
            const data = await coinGeckoService.getAweTokenPrice();

            set({
              price: data.usd,
              marketCap: data.usd_market_cap,
              volume24h: data.usd_24h_vol,
              change24h: data.usd_24h_change,
              lastUpdatedAt: data.last_updated_at * 1000, // Convert to milliseconds
              isLoading: false,
              error: null,
            });

          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to fetch price";

            set({
              error: errorMessage,
              isLoading: false,
            });

            console.error("Failed to fetch AWE price:", error);
          }
        },

        /**
         * Clear cached price data
         * Forces a fresh fetch on next fetchPrice call
         */
        clearCache: () => {
          set({
            price: null,
            marketCap: null,
            volume24h: null,
            change24h: null,
            lastUpdatedAt: null,
            error: null,
          });
        },
      },
    }),
    {
      name: "awe-price-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist price data, not loading/error states
      partialize: (state) => ({
        price: state.price,
        marketCap: state.marketCap,
        volume24h: state.volume24h,
        change24h: state.change24h,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
    }
  )
);

// Atomic selector hooks - never export useStore directly
export const useAwePrice = () => useAwePriceStore((state) => state.price);
export const useAweMarketCap = () =>
  useAwePriceStore((state) => state.marketCap);
export const useAweVolume24h = () =>
  useAwePriceStore((state) => state.volume24h);
export const useAweChange24h = () =>
  useAwePriceStore((state) => state.change24h);
export const useAwePriceLastUpdated = () =>
  useAwePriceStore((state) => state.lastUpdatedAt);
export const useAwePriceLoading = () =>
  useAwePriceStore((state) => state.isLoading);
export const useAwePriceError = () => useAwePriceStore((state) => state.error);
export const useAwePriceActions = () =>
  useAwePriceStore((state) => state.actions);

// Composite hook for getting all price data at once (only when you need all values)
export const useAwePriceData = () =>
  useAwePriceStore((state) => ({
    price: state.price,
    marketCap: state.marketCap,
    volume24h: state.volume24h,
    change24h: state.change24h,
    lastUpdatedAt: state.lastUpdatedAt,
  }));
