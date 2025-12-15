import { useReadContract, useAccount, useChainId } from "wagmi";
import { formatUnits, erc20Abi } from "viem";
import { CONTRACT_ADDRESSES, SUPPORTED_CHAINS } from "@/libs/constants";
import { useMemo } from "react";
import { isNetworkError } from "@/libs/utils/retry";

export interface UseAweTokenBalanceReturn {
  balance: bigint | undefined;
  balanceFormatted: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useAweTokenBalance = (): UseAweTokenBalanceReturn => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const aweTokenAddress =
    CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.AWE_TOKEN;
  const isValidChain = (Object.values(SUPPORTED_CHAINS) as number[]).includes(
    chainId
  );
  const queryEnabled = Boolean(
    isConnected && address && aweTokenAddress && isValidChain
  );

  const {
    data: balance,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    address: aweTokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: queryEnabled,
      refetchInterval: queryEnabled ? 180_000 : false,
      retry: (failureCount, error) => {
        if (failureCount >= 5) return false;
        return isNetworkError(error);
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      retryOnMount: true,
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  });

  const balanceFormatted = useMemo(() => {
    if (!balance) return "0";
    try {
      return formatUnits(balance as bigint, 18);
    } catch {
      return "0";
    }
  }, [balance]);

  return {
    balance: balance as bigint,
    balanceFormatted,
    isLoading,
    isError,
    error,
    refetch,
  };
};
