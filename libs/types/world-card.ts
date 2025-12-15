export enum TokenType {
  WORLD_IDEA_TOKEN = "WORLD_IDEA_TOKEN",
  WORLD_AGENT = "WORLD_AGENT",
  UTILITY_AGENT_TOKEN = "UTILITY_AGENT_TOKEN",
}

export enum TokenStatus {
  ON_GOING = "ON_GOING",
  LIVE = "LIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum FundraisingType {
  FIXED_PRICE = "FIXED_PRICE",
  BONDING_CURVE = "BONDING_CURVE",
}

export interface WorldCard {
  id: string;
  userId: string;
  tokenName?: string | null;
  tokenAddress?: string | null;
  poolAddress?: string | null;
  tokenImage?: string | null;
  bannerUrl?: string | null;
  tokenSymbol: string;
  description?: string | null;
  worldXHandler?: string | null;
  onchainProfileLink?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  tokenType: TokenType;
  status: TokenStatus;
  targetFundRaise?: string | null;
  fundraisingType: FundraisingType;
  agentId?: string | null;
  agentName?: string | null;
  xUrl?: string | null;
  telegramUrl?: string | null;
  discordUrl?: string | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  totalAweRaised?: string | null;

  //Todo: Subgraph properties (future phase - default for now)
  marketCap: string;
  marketCapUsd?: string | null;

  title: string;
  backgroundImage: string;
  worldContract: string;
  launchTime?: Date | null;
  graduatedAt?: Date | null;
}

export interface WorldCardFilters {
  status?: TokenStatus;
  tokenType?: TokenType;
  search?: string;
  tokenAddress?: string;
  userId?: string;
  page?: number;
  limit?: number;
  tokenizeOnly?: boolean;
}

export interface WorldCardsState {
  cards: WorldCard[];
  filteredCards: WorldCard[];
  filters: WorldCardFilters;
  isLoading: boolean;
  error: string | null;
}

export interface FundraiseParticipant {
  id: string;
  walletAddress: string;
  amount: number;
  percentage: number;
  timestamp: Date;
  tokenAmount?: number;
  txHash?: string;
  isPending?: boolean;
}

export interface FundraiseParticipantTableData {
  participants: FundraiseParticipant[];
  totalAmount: number;
  totalParticipants: number;
  currency: string;
}
