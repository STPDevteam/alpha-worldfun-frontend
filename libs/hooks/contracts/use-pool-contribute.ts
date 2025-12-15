import { useCallback, useMemo } from "react";
import { useDaoPoolContribute } from "./use-dao-pool-contribute";
import { useBondingCurveContribute } from "./use-bonding-curve-contribute";
import type { ContributeParams } from "@/libs/types/contracts";
import { FundraisingType } from "@/libs/types";

export interface UsePoolContributeReturn {
  contribute: (params: ContributeParams) => void;
  contributeAsync: (params: ContributeParams) => Promise<void>;
  isPreparing: boolean;
  isWaitingApproval: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  hash?: string;
  error?: Error | null;
  status: string;
  currentStep?: string;
  reset: () => void;
}

export function usePoolContribute(
  poolAddress?: string
): UsePoolContributeReturn {
  // Initialize both contribution hooks
  const daoContribute = useDaoPoolContribute(poolAddress);
  const bondingCurveContribute = useBondingCurveContribute();

  // Unified contribute function
  const contribute = useCallback(
    (params: ContributeParams) => {
      const { poolInfo, amount, userBalance } = params;

      if (!poolInfo.address) {
        throw new Error("Pool address is required");
      }

      if (poolInfo.type === FundraisingType.FIXED_PRICE) {
        daoContribute.contribute({
          amount,
          poolAddress: poolInfo.address,
          userBalance,
        });
      } else if (poolInfo.type === FundraisingType.BONDING_CURVE) {
        bondingCurveContribute.buy({
          aweAmount: amount.toString(),
          poolAddress: poolInfo.address,
        });
      } else {
        throw new Error(`Unsupported pool type: ${poolInfo.type}`);
      }
    },
    [daoContribute, bondingCurveContribute]
  );

  // Unified async contribute function
  const contributeAsync = useCallback(
    async (params: ContributeParams) => {
      const { poolInfo, amount, userBalance } = params;

      if (!poolInfo.address) {
        throw new Error("Pool address is required");
      }

      if (poolInfo.type === FundraisingType.FIXED_PRICE) {
        await daoContribute.contributeAsync({
          amount,
          poolAddress: poolInfo.address,
          userBalance,
        });
      } else if (poolInfo.type === FundraisingType.BONDING_CURVE) {
        await bondingCurveContribute.buy({
          aweAmount: amount.toString(),
          poolAddress: poolInfo.address,
        });
      } else {
        throw new Error(`Unsupported pool type: ${poolInfo.type}`);
      }
    },
    [daoContribute, bondingCurveContribute]
  );

  const activeHook = useMemo(() => {
    if (
      daoContribute.isPreparing ||
      daoContribute.isConfirming ||
      (daoContribute.hash && !daoContribute.isConfirmed)
    ) {
      return daoContribute;
    }
    if (
      bondingCurveContribute.isPreparing ||
      bondingCurveContribute.isConfirming ||
      (bondingCurveContribute.hash && !bondingCurveContribute.isConfirmed)
    ) {
      return bondingCurveContribute;
    }
    return daoContribute;
  }, [daoContribute, bondingCurveContribute]);

  // Unified reset function
  const reset = useCallback(() => {
    daoContribute.reset();
    bondingCurveContribute.reset();
  }, [daoContribute, bondingCurveContribute]);

  return {
    contribute,
    contributeAsync,
    isPreparing: activeHook.isPreparing,
    isWaitingApproval: activeHook.isWaitingApproval,
    isConfirming: activeHook.isConfirming,
    isConfirmed: activeHook.isConfirmed,
    hash: activeHook.hash ?? undefined,
    error: activeHook.error,
    status: activeHook.status,
    currentStep:
      "currentStep" in activeHook ? activeHook.currentStep : undefined,
    reset,
  };
}
