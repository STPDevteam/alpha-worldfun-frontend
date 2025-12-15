import { useReadContract, useChainId } from "wagmi";
import { TOKEN_ABI, SUPPORTED_CHAINS } from "@/libs/constants";
import { useMemo } from "react";

export interface UseTokenAgentIdParams {
  tokenAddress?: string;
  enabled?: boolean;
}

export interface UseTokenAgentIdReturn {
  agentId: string | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useTokenAgentId = ({
  tokenAddress,
  enabled = true,
}: UseTokenAgentIdParams): UseTokenAgentIdReturn => {
  const chainId = useChainId();

  const isValidChain = (Object.values(SUPPORTED_CHAINS) as number[]).includes(
    chainId
  );
  const queryEnabled = Boolean(
    enabled &&
      tokenAddress &&
      tokenAddress.length === 42 &&
      tokenAddress.startsWith("0x") &&
      isValidChain
  );

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: "agentId",
    args: [],
    query: {
      enabled: queryEnabled,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      retry: 2,
    },
  });

  const agentId = useMemo(() => {
    return data as string | undefined;
  }, [data]);

  return {
    agentId,
    isLoading,
    isError,
    error,
    refetch,
  };
};
