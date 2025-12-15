import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { useEffect, useCallback, useMemo, useRef } from "react";
import type { Hash } from "viem";
import { SUPPORTED_CHAINS, AWE_DAO_POOL_ABI } from "@/libs/constants";
import { useToast } from "@/libs/hooks/common";
import { handleWagmiError } from "@/libs/utils/contract-error-handler";
import { useDaoPoolData } from "./use-dao-pool-data";
import { useWriteContractStrict } from "./use-write-contract-strict";

// Query keys for cache management
export const daoRefundQueryKeys = {
  all: ["dao-refund"] as const,
  refunds: () => [...daoRefundQueryKeys.all, "refunds"] as const,
} as const;

// Types
export interface DaoRefundParams {
  poolAddress?: string;
}

interface DaoRefundResult {
  hash: Hash;
}

export function useDaoPoolRefund(poolAddress?: string) {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { address } = useAccount();
  const { success, error: toastError } = useToast();
  const { writeContractAsync } = useWriteContractStrict();
  const rejectionToastShown = useRef(false);

  // Get DAO pool data to check graduation status
  const { isGraduated, isLoading: isPoolDataLoading } = useDaoPoolData({
    poolAddress,
    enabled: !!poolAddress,
  });

  // Validation helper
  const validateRefund = useCallback((): void => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    if (!(Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId)) {
      throw new Error("Please switch to a supported network");
    }

    if (!poolAddress) {
      throw new Error("Pool address is required");
    }

    // Check if token has graduated (cannot refund from graduated pools)
    if (isGraduated) {
      throw new Error(
        "Cannot refund from graduated pools. This token has already reached its funding goal."
      );
    }
  }, [address, chainId, poolAddress, isGraduated]);

  // Main mutation
  const mutation = useMutation<DaoRefundResult, Error, void>({
    retry: false,
    mutationFn: async (): Promise<DaoRefundResult> => {
      validateRefund();
      rejectionToastShown.current = false;

      if (!poolAddress) {
        throw new Error("Pool address is required");
      }

      // Execute contract write for refund
      const hash = await writeContractAsync({
        address: poolAddress as `0x${string}`,
        abi: AWE_DAO_POOL_ABI,
        functionName: "refund",
        args: [],
        chainId: chainId,
      });

      return { hash };
    },

    onError: (error) => {
      console.error("DAO pool refund failed:", error);

      // Use enhanced wagmi error handling
      const enhancedError = handleWagmiError(error, "dao-pool", {
        showToast: false,
        onRetry: async () => {
          rejectionToastShown.current = false;
        },
      });

      // Handle user rejection specifically to avoid multiple toasts
      if (enhancedError.errorType === "USER_REJECTED") {
        if (!rejectionToastShown.current) {
          rejectionToastShown.current = true;
          toastError({
            title: "Transaction Cancelled",
            description: "You cancelled the transaction",
          });
        }
        return;
      }

      // For all other errors, show enhanced error message
      toastError({
        title:
          enhancedError.errorType === "UNAUTHORIZED"
            ? "Unauthorized"
            : enhancedError.errorType === "CONTRACT_REVERT"
            ? "Refund Failed"
            : enhancedError.errorType === "WRONG_NETWORK"
            ? "Wrong Network"
            : enhancedError.errorType === "INSUFFICIENT_NATIVE_TOKEN"
            ? "Insufficient ETH"
            : "Refund Failed",
        description: enhancedError.userGuidance,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: daoRefundQueryKeys.refunds(),
      });
    },
  });

  // Transaction receipt tracking
  const transactionHash = mutation.data?.hash;
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
    query: { enabled: !!transactionHash },
  });

  // Transaction confirmation effect
  useEffect(() => {
    if (isConfirmed && transactionHash) {
      queryClient.invalidateQueries({
        queryKey: daoRefundQueryKeys.all,
      });

      success({
        title: "Refund Successful",
        description: "Your AWE tokens have been refunded",
      });
    }
  }, [isConfirmed, transactionHash, success, queryClient]);

  // Error handling effect
  useEffect(() => {
    if (receiptError) {
      console.error("DAO refund transaction error:", receiptError);

      // Use enhanced wagmi error handling for receipt errors
      const enhancedError = handleWagmiError(receiptError, "dao-pool", {
        showToast: false,
      });

      // Don't show error toast for user rejections
      if (enhancedError.errorType === "USER_REJECTED") {
        return;
      }

      toastError({
        title:
          enhancedError.errorType === "TRANSACTION_TIMEOUT"
            ? "Transaction Timeout"
            : enhancedError.errorType === "RPC_ERROR"
            ? "Network Error"
            : "Transaction Failed",
        description: enhancedError.userGuidance,
      });
    }
  }, [receiptError, toastError]);

  // Computed status
  const status = useMemo(() => {
    if (mutation.isPending) return "preparing";
    if (transactionHash && isConfirming) return "pending";
    if (isConfirmed) return "success";

    // Check for user cancellation
    if (mutation.error?.message?.includes("User rejected")) {
      return "cancelled";
    }
    if (receiptError?.message?.includes("User rejected")) {
      return "cancelled";
    }

    // Check for other errors
    if (mutation.error || receiptError) return "error";
    return "idle";
  }, [
    mutation.isPending,
    mutation.error,
    transactionHash,
    isConfirming,
    isConfirmed,
    receiptError,
  ]);

  // Combined error
  const combinedError = useMemo(
    () => mutation.error || receiptError,
    [mutation.error, receiptError]
  );

  // Reset function
  const reset = useCallback(() => {
    mutation.reset();
    rejectionToastShown.current = false;
    queryClient.invalidateQueries({
      queryKey: daoRefundQueryKeys.all,
    });
  }, [mutation, queryClient]);

  return {
    // Core mutation methods
    refund: mutation.mutate,
    refundAsync: mutation.mutateAsync,
    reset,

    // State
    isRefunding: mutation.isPending,
    isConfirming,
    isConfirmed,
    isPoolDataLoading,

    // Data
    hash: transactionHash,
    error: combinedError,
    isGraduated,

    // Computed status
    status,

    // Validation helper
    validateRefund,
  } as const;
}
