import { Address, Hash } from "viem";
import { FundraisingType } from "./world-card";

// Vesting schedule structure
export interface VestingSchedule {
  date: bigint;
  endDate: bigint;
  unlockPercent: bigint;
  period: bigint;
}

// Pool creation parameters
export interface CreateBondingCurvePoolParams {
  name: string;
  symbol: string;
  agentId: string | undefined;
}

export interface CreateDaoPoolParams {
  name: string;
  symbol: string;
  agentId: string | undefined;
}

// Transaction status types
export type TransactionStatus =
  | "idle"
  | "preparing"
  | "waiting_approval"
  | "pending"
  | "success"
  | "error";

// Transaction result types
export interface TransactionResult {
  hash?: Hash;
  status: TransactionStatus;
  error?: Error;
}

// Pool creation events
export interface BondingCurveCreatedEvent {
  pool: Address;
  token: Address;
  creator: Address;
  name: string;
  symbol: string;
}

export interface DaoCreatedEvent {
  pool: Address;
  token: Address;
  creator: Address;
  name: string;
  symbol: string;
  tokenForSale: bigint;
  endTime: bigint;
}

// Hook return types
export interface UseCreateBondingCurvePoolReturn {
  createPool: (params: CreateBondingCurvePoolParams) => Promise<void>;
  status: TransactionStatus;
  hash?: Hash;
  error?: Error;
  reset: () => void;
}

export interface UseCreateDaoPoolReturn {
  createPool: (params: CreateDaoPoolParams) => Promise<void>;
  status: TransactionStatus;
  hash?: Hash;
  error?: Error;
  reset: () => void;
}

// Gas estimation types
export interface GasEstimation {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

// Pool creation form data
export interface BondingCurvePoolFormData {
  name: string;
  symbol: string;
}

export interface DaoPoolFormData {
  name: string;
  symbol: string;
  tokenForSale: string; // String for form input, converted to bigint later
  endTime: Date;
  vestingSchedules: {
    date: Date;
    endDate: Date;
    unlockPercent: number; // Percentage as number (0-100)
    period: number; // Period in days
  }[];
}

export interface PoolInfo {
  type: FundraisingType | undefined;
  name?: string;
  symbol?: string;
  address?: string;
  tokenAddress?: string;
  tokenImage?: string;
}

// Contribution parameters
export interface ContributeParams {
  poolInfo: PoolInfo;
  amount: number; // Float amount
  userBalance?: bigint;
}
