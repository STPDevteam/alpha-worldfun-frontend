// Frontend types matching backend subgraph response structures

// Base pagination interface
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Core subgraph entity types
export interface SubgraphToken {
  address: string;
  totalVolume: string;
  totalVolumeUSD: string;
  lpAddress?: string;
  nftId?: string | null;
  mintToDao?: string | null;
}

export interface SubgraphDaoContributor {
  id?: string;
  dao?: string;
  contributor?: string;
  totalAweContributed: string;
  lastContribution: string;
  lastContributedAt: string;
  totalTokenClaimed: string;
  lastTokenClaimed?: string | null;
  lastTokenClaimedAt?: string | null;
  totalRefunded: string;
  netContribution: string;
  contributionCount: string;
  refundCount: string;
  totalBought: string;
  totalSold: string;
  buyCount: string;
  sellCount: string;
  firstContributionAt: string;
  lastActivityAt: string;
}

export interface SubgraphDao {
  id: string;
  address: string;
  daoManager: string;
  supply: string;
  totalSale: string;
  fundraisingGoal: string;
  endTime: string;
  isGoalReached: boolean;
  createdAt?: string;
  totalAweRaised: string;
  totalContributors: string;
  totalTokenClaimed: string;
  totalTokenClaimers: string;
  totalContributions: string;
  totalRefunds: string;
  totalRefundedAmount: string;
  lpAddress?: string;
  nftId?: string | null;
  mintToDao?: string | null;
  token?: SubgraphToken | string | null;
  contributors: SubgraphDaoContributor[];
}

export interface SubgraphContributionHistory {
  id: string;
  contributorAddress: string;
  transactionHash: string;
  blockNumber: string;
  timestamp: string;
  amount: string;
  contributionType:
    | "CONTRIBUTION"
    | "REFUND"
    | "BONDING_CURVE_BUY"
    | "BONDING_CURVE_SELL"
    | "DAO_CLAIMED";
  totalContributionsAtTime: string;
  totalAweRaisedAtTime: string;
  contributorTotalAtTime: string;
}

export interface SubgraphBondingCurveTrader {
  id: string;
  bondingCurve?: string;
  trader: string;
  totalBought: string;
  totalSold: string;
  totalBuyVolume: string;
  totalSellVolume: string;
  buyCount: string;
  sellCount: string;
  firstTradeAt: string;
  lastTradeAt: string;
}

export interface SubgraphBondingCurve {
  id: string;
  pool: string;
  token: string;
  lpAddress?: string;
  totalBuys: string;
  totalSells: string;
  totalBuyVolume: string;
  totalSellVolume: string;
  totalTokensTraded: string;
  totalVolume: string;
  isActive: boolean;
  createdAt: string;
  graduatedAt?: string;
  traders?: SubgraphBondingCurveTrader[];
}

export interface SubgraphBondingCurveBuy {
  id: string;
  bondingCurve?: string;
  trader: string;
  buyer: string;
  aweAmount: string;
  tokenAmount: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface SubgraphBondingCurveSell {
  id: string;
  bondingCurve?: string;
  trader: string;
  seller: string;
  tokenAmount: string;
  aweAmount: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

// Query parameter types
export interface ContributionHistoryFilters {
  daoAddress?: string;
  contributorAddress?: string;
  page?: number;
  limit?: number;
}

export interface BondingCurveFilters {
  tokenAddress?: string;
  traderAddress?: string;
  page?: number;
  limit?: number;
}

export interface BondingCurveTradesFilters {
  bondingCurveAddress?: string;
  traderAddress?: string;
  tradeType?: "BUY" | "SELL";
  page?: number;
  limit?: number;
}

export interface BondingCurveHistoryFilters {
  bondingCurveAddress?: string;
  traderAddress?: string;
  tradeType?: "ALL" | "BUY" | "SELL";
  page?: number;
  limit?: number;
}

// Response type aliases for better readability
export type DaoResponse = SubgraphDao;
export type ContributionHistoryResponse =
  PaginatedResponse<SubgraphContributionHistory>;
export type BondingCurveResponse = PaginatedResponse<SubgraphBondingCurve>;
export type BondingCurveByPoolResponse = SubgraphBondingCurve;
export type BondingCurveTradesResponse = PaginatedResponse<
  SubgraphBondingCurveBuy | SubgraphBondingCurveSell
>;
export type BondingCurveHistoryResponse = PaginatedResponse<
  SubgraphBondingCurveBuy | SubgraphBondingCurveSell
>;

// Trade type enums
export enum TradeType {
  BUY = "BUY",
  SELL = "SELL",
}

export enum TradeHistoryType {
  ALL = "ALL",
  BUY = "BUY",
  SELL = "SELL",
}

export enum ContributionType {
  CONTRIBUTION = "CONTRIBUTION",
  REFUND = "REFUND",
  BONDING_CURVE_BUY = "BONDING_CURVE_BUY",
  BONDING_CURVE_SELL = "BONDING_CURVE_SELL",
  DAO_CLAIMED = "DAO_CLAIMED",
}
