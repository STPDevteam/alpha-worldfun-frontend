import { BaseApiService } from "./base.service";
import {
  DaoResponse,
  ContributionHistoryResponse,
  BondingCurveResponse,
  BondingCurveByPoolResponse,
  BondingCurveTradesResponse,
  BondingCurveHistoryResponse,
  ContributionHistoryFilters,
  BondingCurveFilters,
  BondingCurveTradesFilters,
  BondingCurveHistoryFilters,
} from "@/libs/types/subgraph.types";

export class SubgraphService extends BaseApiService {
  protected async subgraphRequest<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, options);
  }

  /**
   * Get DAO by address
   * @param address DAO contract address
   */
  async getDaoByAddress(address: string): Promise<DaoResponse> {
    if (!address || address.length !== 42 || !address.startsWith("0x")) {
      throw new Error("Invalid DAO address format");
    }

    return this.subgraphRequest<DaoResponse>(`/subgraph/daos/${address}`);
  }

  /**
   * Get contribution history with pagination and optional filters
   * @param filters Query filters for contribution history
   */
  async getContributionHistory(
    filters: ContributionHistoryFilters = {}
  ): Promise<ContributionHistoryResponse> {
    const params = new URLSearchParams();

    if (filters.daoAddress) params.append("daoAddress", filters.daoAddress);
    if (filters.contributorAddress)
      params.append("contributorAddress", filters.contributorAddress);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/subgraph/contribution-history${
      queryString ? `?${queryString}` : ""
    }`;

    return this.subgraphRequest<ContributionHistoryResponse>(endpoint);
  }

  /**
   * Get bonding curves with pagination and optional filters
   * @param filters Query filters for bonding curves
   */
  async getBondingCurves(
    filters: BondingCurveFilters = {}
  ): Promise<BondingCurveResponse> {
    const params = new URLSearchParams();

    if (filters.tokenAddress)
      params.append("tokenAddress", filters.tokenAddress);
    if (filters.traderAddress)
      params.append("traderAddress", filters.traderAddress);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/subgraph/bonding-curves${
      queryString ? `?${queryString}` : ""
    }`;

    return this.subgraphRequest<BondingCurveResponse>(endpoint);
  }

  /**
   * Get bonding curve by pool address
   * @param poolAddress Bonding curve pool address
   */
  async getBondingCurveByPool(
    poolAddress: string
  ): Promise<BondingCurveByPoolResponse> {
    if (
      !poolAddress ||
      poolAddress.length !== 42 ||
      !poolAddress.startsWith("0x")
    ) {
      throw new Error("Invalid pool address format");
    }

    return this.subgraphRequest<BondingCurveByPoolResponse>(
      `/subgraph/bonding-curves/${poolAddress}`
    );
  }

  /**
   * Get bonding curve trades (buys/sells) with pagination and filters
   * @param filters Query filters for bonding curve trades
   */
  async getBondingCurveTrades(
    filters: BondingCurveTradesFilters = {}
  ): Promise<BondingCurveTradesResponse> {
    const params = new URLSearchParams();

    if (filters.bondingCurveAddress)
      params.append("bondingCurveAddress", filters.bondingCurveAddress);
    if (filters.traderAddress)
      params.append("traderAddress", filters.traderAddress);
    if (filters.tradeType) params.append("tradeType", filters.tradeType);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/subgraph/bonding-curve-trades${
      queryString ? `?${queryString}` : ""
    }`;

    return this.subgraphRequest<BondingCurveTradesResponse>(endpoint);
  }

  /**
   * Get bonding curve trade history with pagination and filters
   * @param filters Query filters for bonding curve trade history
   */
  async getBondingCurveHistory(
    filters: BondingCurveHistoryFilters = {}
  ): Promise<BondingCurveHistoryResponse> {
    const params = new URLSearchParams();

    if (filters.bondingCurveAddress)
      params.append("bondingCurveAddress", filters.bondingCurveAddress);
    if (filters.traderAddress)
      params.append("traderAddress", filters.traderAddress);
    if (filters.tradeType) params.append("tradeType", filters.tradeType);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/subgraph/bonding-curve-history${
      queryString ? `?${queryString}` : ""
    }`;

    return this.subgraphRequest<BondingCurveHistoryResponse>(endpoint);
  }

  // Helper methods for common use cases

  /**
   * Get contribution history for a specific DAO
   */
  async getContributionHistoryByDao(
    daoAddress: string,
    page = 1,
    limit = 10
  ): Promise<ContributionHistoryResponse> {
    return this.getContributionHistory({ daoAddress, page, limit });
  }

  /**
   * Get contribution history for a specific contributor
   */
  async getContributionHistoryByContributor(
    contributorAddress: string,
    page = 1,
    limit = 10
  ): Promise<ContributionHistoryResponse> {
    return this.getContributionHistory({ contributorAddress, page, limit });
  }

  /**
   * Get bonding curves for a specific token
   */
  async getBondingCurvesByToken(
    tokenAddress: string,
    page = 1,
    limit = 10
  ): Promise<BondingCurveResponse> {
    return this.getBondingCurves({ tokenAddress, page, limit });
  }

  /**
   * Get bonding curve trades for a specific pool
   */
  async getBondingCurveTradesByPool(
    bondingCurveAddress: string,
    tradeType: "BUY" | "SELL" = "BUY",
    page = 1,
    limit = 10
  ): Promise<BondingCurveTradesResponse> {
    return this.getBondingCurveTrades({
      bondingCurveAddress,
      tradeType,
      page,
      limit,
    });
  }

  /**
   * Get bonding curve trade history for a specific trader
   */
  async getBondingCurveHistoryByTrader(
    traderAddress: string,
    tradeType: "ALL" | "BUY" | "SELL" = "ALL",
    page = 1,
    limit = 10
  ): Promise<BondingCurveHistoryResponse> {
    return this.getBondingCurveHistory({
      traderAddress,
      tradeType,
      page,
      limit,
    });
  }
}

// Export singleton instance
export const subgraphService = new SubgraphService();
