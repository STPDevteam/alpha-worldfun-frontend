import { useReadContract, useChainId } from "wagmi";
import { AWE_BONDING_CURVE_POOL_ABI, SUPPORTED_CHAINS } from "@/libs/constants";

export interface UseBondingCurveGraduatedParams {
  poolAddress?: string;
  enabled?: boolean;
}

export interface UseBondingCurveGraduatedReturn {
  isGraduated: boolean | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useBondingCurveGraduated = ({
  poolAddress,
  enabled = true,
}: UseBondingCurveGraduatedParams): UseBondingCurveGraduatedReturn => {
  const chainId = useChainId();

  const isValidChain = (Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId);
  const queryEnabled = Boolean(
    enabled &&
      poolAddress &&
      poolAddress.length === 42 &&
      poolAddress.startsWith("0x") &&
      isValidChain
  );

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: AWE_BONDING_CURVE_POOL_ABI,
    functionName: "isGraduated",
    args: [],
    query: {
      enabled: queryEnabled,
      refetchInterval: 60_000, // Refetch every 1 minute
      retry: 2,
    },
  });

  return {
    isGraduated: data as boolean | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
};
