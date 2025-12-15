import { useReadContract, useChainId } from "wagmi";
import { useMemo } from "react";
import {
  AWE_FACTORY_ABI,
  AWE_DAO_POOL_ABI,
  AWE_BONDING_CURVE_POOL_ABI,
  CONTRACT_ADDRESSES,
  SUPPORTED_CHAINS,
} from "@/libs/constants";
import { FundraisingType } from "@/libs/types";

export interface UseCreatorClaimUnlockTimeParams {
  poolAddress?: string;
  poolType?: FundraisingType;
  enabled?: boolean;
}

export interface UseCreatorClaimUnlockTimeReturn {
  unlockTimestamp: bigint | undefined;
  unlockDate: Date | undefined;
  isUnlocked: boolean;
  timeUntilUnlock: number | null; // seconds until unlock, null if already unlocked or data not available
  creatorClaimDelay: bigint | undefined;
  graduatedAt: bigint | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useCreatorClaimUnlockTime = ({
  poolAddress,
  poolType,
  enabled = true,
}: UseCreatorClaimUnlockTimeParams): UseCreatorClaimUnlockTimeReturn => {
  const chainId = useChainId();

  const isValidChain = (Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId);
  const factoryAddress =
    CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.FACTORY;

  // Determine which pool ABI to use based on pool type
  const poolAbi = useMemo(() => {
    if (poolType === FundraisingType.FIXED_PRICE) {
      return AWE_DAO_POOL_ABI;
    } else if (poolType === FundraisingType.BONDING_CURVE) {
      return AWE_BONDING_CURVE_POOL_ABI;
    }
    return AWE_DAO_POOL_ABI; // default
  }, [poolType]);

  const queryEnabled = Boolean(
    enabled &&
      poolAddress &&
      poolAddress.length === 42 &&
      poolAddress.startsWith("0x") &&
      factoryAddress &&
      isValidChain
  );

  // 1. Get creatorClaimDelay from Factory contract
  const {
    data: creatorClaimDelay,
    isLoading: isLoadingDelay,
    isError: isErrorDelay,
    error: errorDelay,
    refetch: refetchDelay,
  } = useReadContract({
    address: factoryAddress as `0x${string}`,
    abi: AWE_FACTORY_ABI,
    functionName: "creatorClaimDelay",
    query: {
      enabled: queryEnabled,
    },
  });

  // 2. Get graduatedAt from Pool contract
  const {
    data: graduatedAt,
    isLoading: isLoadingGraduatedAt,
    isError: isErrorGraduatedAt,
    error: errorGraduatedAt,
    refetch: refetchGraduatedAt,
  } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: poolAbi,
    functionName: "graduatedAt",
    query: {
      enabled: queryEnabled,
    },
  });

  // Calculate unlock timestamp: graduatedAt + creatorClaimDelay
  const unlockTimestamp = useMemo(() => {
    if (
      typeof graduatedAt === "bigint" &&
      typeof creatorClaimDelay === "bigint"
    ) {
      return graduatedAt + creatorClaimDelay;
    }
    return undefined;
  }, [graduatedAt, creatorClaimDelay]);

  // Convert unlock timestamp to Date
  const unlockDate = useMemo(() => {
    if (typeof unlockTimestamp === "bigint" && unlockTimestamp > BigInt(0)) {
      // Convert from seconds to milliseconds
      return new Date(Number(unlockTimestamp) * 1000);
    }
    return undefined;
  }, [unlockTimestamp]);

  // Check if unlock time has passed
  const isUnlocked = useMemo(() => {
    if (!unlockTimestamp || unlockTimestamp === BigInt(0)) {
      return false;
    }
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    return currentTimestamp >= unlockTimestamp;
  }, [unlockTimestamp]);

  // Calculate time until unlock in seconds
  const timeUntilUnlock = useMemo(() => {
    if (!unlockTimestamp || unlockTimestamp === BigInt(0)) {
      return null;
    }
    if (isUnlocked) {
      return null; // Already unlocked
    }
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const secondsRemaining = Number(unlockTimestamp - currentTimestamp);
    return secondsRemaining > 0 ? secondsRemaining : null;
  }, [unlockTimestamp, isUnlocked]);

  // Combined loading state
  const isLoading = isLoadingDelay || isLoadingGraduatedAt;

  // Combined error state
  const isError = isErrorDelay || isErrorGraduatedAt;
  const error = (errorDelay || errorGraduatedAt) as Error | null;

  // Refetch all data
  const refetch = () => {
    refetchDelay();
    refetchGraduatedAt();
  };

  return {
    unlockTimestamp,
    unlockDate,
    isUnlocked,
    timeUntilUnlock,
    creatorClaimDelay: creatorClaimDelay as bigint | undefined,
    graduatedAt: graduatedAt as bigint | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
};
