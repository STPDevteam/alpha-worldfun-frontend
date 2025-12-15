import { exceptionManager } from "../exception-manager.service";

// AWE token contract address on Base network
const AWE_TOKEN_CONTRACT_ADDRESS = "0x1b4617734c43f6159f3a70b7e06d883647512778";

export interface CoinGeckoTokenPrice {
  usd: number;
  usd_market_cap: number;
  usd_24h_vol: number;
  usd_24h_change: number;
  last_updated_at: number;
}

interface CoinGeckoResponse {
  [contractAddress: string]: CoinGeckoTokenPrice;
}

export class CoinGeckoApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = "CoinGeckoApiError";
  }
}

class CoinGeckoService {
  private baseURL =
    process.env.NEXT_PUBLIC_COIN_GECKO_API_URL ||
    "https://api.coingecko.com/api/v3";
  private apiKey = process.env.NEXT_PUBLIC_COIN_GECKO_API_KEY;

  /**
   * Fetch AWE token price data from CoinGecko
   * @returns AWE token price data including USD price, market cap, volume, and 24h change
   */
  async getAweTokenPrice(): Promise<CoinGeckoTokenPrice> {
    const endpoint = `/simple/token_price/base`;
    const params = new URLSearchParams({
      contract_addresses: AWE_TOKEN_CONTRACT_ADDRESS,
      vs_currencies: "usd",
      include_market_cap: "true",
      include_24hr_vol: "true",
      include_24hr_change: "true",
      include_last_updated_at: "true",
    });

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add API key to headers if available
      if (this.apiKey) {
        headers["x-cg-pro-api-key"] = this.apiKey;
      }

      const response = await fetch(`${this.baseURL}${endpoint}?${params}`, {
        headers,
        method: "GET",
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        const error = new CoinGeckoApiError(
          errorData.message ||
            errorData.error ||
            `CoinGecko API Error: ${response.statusText}`,
          response.status,
          errorData
        );

        exceptionManager.handleError(error, { showToast: false });
        throw error;
      }

      const data: CoinGeckoResponse = await response.json();

      // Extract AWE token data from response
      const aweData =
        data[AWE_TOKEN_CONTRACT_ADDRESS.toLowerCase()] ||
        data[AWE_TOKEN_CONTRACT_ADDRESS];

      if (!aweData) {
        const error = new CoinGeckoApiError(
          "AWE token data not found in CoinGecko response",
          404,
          data
        );
        exceptionManager.handleError(error, { showToast: false });
        throw error;
      }

      return aweData;
    } catch (error) {
      // Handle network errors and other non-response errors
      if (!(error instanceof CoinGeckoApiError)) {
        const wrappedError = new CoinGeckoApiError(
          error instanceof Error
            ? error.message
            : "Failed to fetch AWE token price",
          0,
          error
        );
        exceptionManager.handleError(wrappedError, { showToast: false });
        throw wrappedError;
      }
      throw error;
    }
  }
}

export const coinGeckoService = new CoinGeckoService();
