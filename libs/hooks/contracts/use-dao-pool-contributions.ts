import { useReadContract, useChainId } from "wagmi";
import { formatUnits } from "viem";
import { AWE_DAO_POOL_ABI, SUPPORTED_CHAINS } from "@/libs/constants";
import { useMemo } from "react";

// Type for the contributions struct returned from contract
type ContributionsData = readonly [bigint, boolean, bigint] | undefined;

export interface UseDaoPoolContributionsParams {
  poolAddress?: string;
  userAddress?: string;
  enabled?: boolean;
}

export interface UseDaoPoolContributionsReturn {
  aweAmount: bigint | undefined;
  aweAmountFormatted: string;
  refunded: boolean | undefined;
  claimedTokenAmount: bigint | undefined;
  claimedTokenAmountFormatted: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useDaoPoolContributions = ({
  poolAddress,
  userAddress,
  enabled = true,
}: UseDaoPoolContributionsParams): UseDaoPoolContributionsReturn => {
  const chainId = useChainId();

  const isValidChain = (Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId);
  const queryEnabled = Boolean(
    enabled &&
      poolAddress &&
      poolAddress.length === 42 &&
      poolAddress.startsWith("0x") &&
      userAddress &&
      userAddress.length === 42 &&
      userAddress.startsWith("0x") &&
      isValidChain
  );

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: AWE_DAO_POOL_ABI,
    functionName: "contributions",
    args: [userAddress as `0x${string}`],
    query: {
      enabled: queryEnabled,
      refetchInterval: 60_000,
      retry: 2,
    },
  });

  // Extract values from the tuple result [aweAmount, refunded, claimedTokenAmount]
  const contributionsData = data as ContributionsData;
  const aweAmount = contributionsData?.[0];
  const refunded = contributionsData?.[1];
  const claimedTokenAmount = contributionsData?.[2];
  const aweAmountFormatted = useMemo(() => {
    if (!aweAmount) return "0";
    try {
      return formatUnits(aweAmount, 18);
    } catch {
      return "0";
    }
  }, [aweAmount]);

  const claimedTokenAmountFormatted = useMemo(() => {
    if (!claimedTokenAmount) return "0";
    try {
      return formatUnits(claimedTokenAmount, 18);
    } catch {
      return "0";
    }
  }, [claimedTokenAmount]);

  return {
    aweAmount,
    aweAmountFormatted,
    refunded,
    claimedTokenAmount,
    claimedTokenAmountFormatted,
    isLoading,
    isError,
    error,
    refetch,
  };
};
