import { useReadContract, useAccount, useChainId } from "wagmi";
import { formatUnits, erc20Abi } from "viem";
import { useMemo } from "react";
import { isNetworkError } from "@/libs/utils/retry";

export interface UseTokenBalanceParams {
  tokenAddress?: string;
  decimals?: number;
}

export interface UseTokenBalanceReturn {
  balance: bigint | undefined;
  balanceFormatted: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useTokenBalance = ({
  tokenAddress,
  decimals = 18,
}: UseTokenBalanceParams): UseTokenBalanceReturn => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const queryEnabled = Boolean(isConnected && address && tokenAddress);

  const {
    data: balance,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: queryEnabled,
      staleTime: 30_000,
      refetchInterval: queryEnabled ? 60_000 : false,
      retry: (failureCount, error) => {
        if (failureCount >= 5) return false;
        return isNetworkError(error);
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      retryOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  });

  const balanceFormatted = useMemo(() => {
    if (!balance) return "0";
    try {
      return formatUnits(balance as bigint, decimals);
    } catch {
      return "0";
    }
  }, [balance, decimals]);

  return {
    balance: balance as bigint,
    balanceFormatted,
    isLoading,
    isError,
    error,
    refetch,
  };
};
