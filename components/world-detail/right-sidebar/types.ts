import type { UseDaoPoolDataReturn } from "@/libs/hooks/contracts";
import type { DaoSidebarData } from "@/libs/hooks/subgraph/use-dao-data";
import type { DaoPoolFormData, PoolInfo } from "@/libs/types/contracts";
import type { TokenStatus, TokenType } from "@/libs/types";

export interface EnterWorldSectionProps {
  onEnterWorld?: () => void;
  onConnectWallet?: () => void;
  isWalletConnected?: boolean;
  bannerUrl?: string;
  className?: string;
  tokenType?: TokenType;
}

export interface ContributionSyncPayload {
  amount: number;
  walletAddress?: string;
  txHash?: string;
  poolAddress?: string;
  timestamp: Date;
}

export interface ProgressSectionProps {
  currentValue?: number | null;
  targetValue?: number | null;
  progressPercentage?: number | null;
  commitValue?: string | null;
  balance?: string | null;
  contributionPercentage?: string | number | null;
  estimatedAllocation?: string | null;
  poolInfo?: PoolInfo;
  onContribute?: () => void;
  daoPoolData?: UseDaoPoolDataReturn;
  status?: TokenStatus;
  contractAweRefunded?: bigint;
  onContributionComplete?: (payload: ContributionSyncPayload) => void;
  optimisticRaisedAmount?: number;
  raisedOverride?: number | null;
  worldStatus?: TokenStatus | null;
}

export interface BondingCurveProgressProps {
  poolInfo?: PoolInfo;
  daoPoolFormData?: DaoPoolFormData;
  currentValue?: string;
  targetValue?: string;
  progressPercentage?: number;
  aweInBondingCurve?: string;
  onTransaction?: () => void;
  status?: TokenStatus;
}

export interface TokenInfoCard {
  id: string;
  title: string;
  value: number | null;
  type: "small" | "full-width";
  poolAddress?: string;
  displayValue?: string;
}

export interface BalanceGridProps {
  cards?: TokenInfoCard[];
  timeRemainingSeconds?: number | null;
  aweRemaining?: number | null;
}

export interface RightSidebarProps {
  enterWorldProps?: EnterWorldSectionProps;
  progressProps?: ProgressSectionProps;
  bondingCurveProps?: BondingCurveProgressProps;
  balanceProps?: BalanceGridProps;
  daoPoolFormData?: DaoPoolFormData;
  className?: string;
  daoPoolDataOverride?: UseDaoPoolDataReturn | null;
  worldStatus?: TokenStatus | null;
  graduationOverride?: boolean | null;
  sidebarDataOverride?: DaoSidebarData | null;
  onContributionComplete?: (payload: ContributionSyncPayload) => void;
  optimisticRaisedAmount?: number;
  raisedOverride?: number | null;
  totalVolume?: string;
  totalTraders?: string;
  launchedTime?: string;
  graduatedAt?: Date | null;
  tokenAddress?: string;
  marketCapUsd?: string;
}
