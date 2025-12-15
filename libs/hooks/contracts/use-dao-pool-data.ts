import { useReadContracts, useChainId } from "wagmi";
import { formatUnits } from "viem";
import { AWE_DAO_POOL_ABI, SUPPORTED_CHAINS } from "@/libs/constants";
import { useMemo } from "react";

export interface UseDaoPoolDataParams {
  poolAddress?: string;
  enabled?: boolean;
}

export interface UseDaoPoolDataReturn {
  totalAweRaised: bigint | undefined;
  totalAweRaisedFormatted: string;
  totalAweRefunded: bigint | undefined;
  totalAweRefundedFormatted: string;
  remainingAweForRaising: bigint | undefined;
  remainingAweForRaisingFormatted: string;
  isGraduated: boolean | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useDaoPoolData = ({
  poolAddress,
  enabled = true,
}: UseDaoPoolDataParams): UseDaoPoolDataReturn => {
  const chainId = useChainId();

  const isValidChain = (Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId);
  const queryEnabled = Boolean(
    enabled &&
      poolAddress &&
      poolAddress.length === 42 &&
      poolAddress.startsWith("0x") &&
      isValidChain
  );

  const { data, isLoading, isError, error, refetch } = useReadContracts({
    contracts: [
      {
        address: poolAddress as `0x${string}`,
        abi: AWE_DAO_POOL_ABI,
        functionName: "totalAweRaised",
        args: [],
      },
      {
        address: poolAddress as `0x${string}`,
        abi: AWE_DAO_POOL_ABI,
        functionName: "totalAweRefunded",
        args: [],
      },
      {
        address: poolAddress as `0x${string}`,
        abi: AWE_DAO_POOL_ABI,
        functionName: "remainingAweForRaising",
        args: [],
      },
      {
        address: poolAddress as `0x${string}`,
        abi: AWE_DAO_POOL_ABI,
        functionName: "isGraduated",
        args: [],
      },
    ],
    query: {
      enabled: queryEnabled,
      staleTime: 60_000, // 1 minute - data stays fresh
      refetchInterval: 60_000, // Refetch every 1 minute
      refetchOnWindowFocus: false, // Disable refetch on window focus
      refetchOnMount: true, // Only fetch on mount
      retry: 2,
    },
  });

  const totalAweRaised = data?.[0]?.result as bigint | undefined;
  const totalAweRefunded = data?.[1]?.result as bigint | undefined;
  const remainingAweForRaising = data?.[2]?.result as bigint | undefined;
  const isGraduated = data?.[3]?.result as boolean | undefined;

  const totalAweRaisedFormatted = useMemo(() => {
    if (!totalAweRaised) return "0";
    try {
      return formatUnits(totalAweRaised, 18);
    } catch {
      return "0";
    }
  }, [totalAweRaised]);

  const totalAweRefundedFormatted = useMemo(() => {
    if (!totalAweRefunded) return "0";
    try {
      return formatUnits(totalAweRefunded, 18);
    } catch {
      return "0";
    }
  }, [totalAweRefunded]);

  const remainingAweForRaisingFormatted = useMemo(() => {
    if (!remainingAweForRaising) return "0";
    try {
      return formatUnits(remainingAweForRaising, 18);
    } catch {
      return "0";
    }
  }, [remainingAweForRaising]);

  return {
    totalAweRaised,
    totalAweRaisedFormatted,
    totalAweRefunded,
    totalAweRefundedFormatted,
    remainingAweForRaising,
    remainingAweForRaisingFormatted,
    isGraduated,
    isLoading,
    isError,
    error,
    refetch,
  };
};
