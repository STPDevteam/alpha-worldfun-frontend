import { useReadContract, useChainId } from "wagmi";
import { formatUnits } from "viem";
import { AWE_BONDING_CURVE_POOL_ABI, SUPPORTED_CHAINS } from "@/libs/constants";
import { useMemo } from "react";

export interface UseBondingCurveAweReserveParams {
  poolAddress?: string;
  enabled?: boolean;
}

export interface UseBondingCurveAweReserveReturn {
  aweReserve: bigint | undefined;
  aweReserveFormatted: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useBondingCurveAweReserve = ({
  poolAddress,
  enabled = true,
}: UseBondingCurveAweReserveParams): UseBondingCurveAweReserveReturn => {
  const chainId = useChainId();

  const isValidChain = (Object.values(SUPPORTED_CHAINS) as number[]).includes(
    chainId
  );
  const queryEnabled = Boolean(
    enabled &&
      poolAddress &&
      poolAddress.length === 42 &&
      poolAddress.startsWith("0x") &&
      isValidChain
  );

  const {
    data: aweReserve,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: AWE_BONDING_CURVE_POOL_ABI,
    functionName: "aweReserve",
    args: [], // aweReserve takes no arguments
    query: {
      enabled: queryEnabled,
      staleTime: 30_000, // 30 seconds
      refetchInterval: queryEnabled ? 60_000 : false, // 60 seconds
      retry: 2,
    },
  });

  const aweReserveFormatted = useMemo(() => {
    if (!aweReserve) return "0";
    try {
      return formatUnits(aweReserve as bigint, 18);
    } catch {
      return "0";
    }
  }, [aweReserve]);

  return {
    aweReserve: aweReserve as bigint,
    aweReserveFormatted,
    isLoading,
    isError,
    error,
    refetch,
  };
};
