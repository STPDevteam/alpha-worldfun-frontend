import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { type Address } from "viem";

import { AWE_BONDING_CURVE_POOL_ABI } from "@/libs/constants";
import { formatUnits } from "ethers";

export const bondingCurveTokenReserveQueryKeys = {
  all: ["bonding-curve-token-reserve"] as const,
  reserve: (poolAddress: Address | undefined) =>
    [...bondingCurveTokenReserveQueryKeys.all, poolAddress] as const,
};

export interface UseBondingCurveTokenReserveParams {
  poolAddress?: string;
  enabled?: boolean;
}

export function useBondingCurveTokenReserve({
  poolAddress,
  enabled = true,
}: UseBondingCurveTokenReserveParams) {
  const publicClient = usePublicClient();
  const enabledInternal = !!publicClient && !!poolAddress && enabled;

  return useQuery({
    queryKey: bondingCurveTokenReserveQueryKeys.reserve(
      poolAddress as `0x${string}`
    ),
    queryFn: async () => {
      const tokenReserve = await publicClient!.readContract({
        address: poolAddress as `0x${string}`,
        abi: AWE_BONDING_CURVE_POOL_ABI,
        functionName: "tokenReserve",
      });
      return tokenReserve as bigint;
    },
    enabled: enabledInternal,
    staleTime: 60000, // 1 minutes
    select: (tokenReserve) => {
      return {
        tokenReserveFormatted: formatUnits(tokenReserve, 18),
        tokenReserve,
      };
    },
  });
}
