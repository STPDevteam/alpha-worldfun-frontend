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
export const daoClaimQueryKeys = {
  all: ["dao-claim"] as const,
  claims: () => [...daoClaimQueryKeys.all, "claims"] as const,
} as const;

// Types
export interface DaoClaimParams {
  poolAddress?: string;
}

interface DaoClaimResult {
  hash: Hash;
}

export function useDaoPoolClaim(poolAddress?: string) {
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
  const validateClaim = useCallback((): void => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    if (!(Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId)) {
      throw new Error("Please switch to a supported network");
    }

    if (!poolAddress) {
      throw new Error("Pool address is required");
    }

    // Check if token has graduated (can only claim from graduated pools)
    if (!isGraduated) {
      throw new Error(
        "Cannot claim from non-graduated pools. The token must reach its funding goal first."
      );
    }
  }, [address, chainId, poolAddress, isGraduated]);

  // Main mutation
  const mutation = useMutation<DaoClaimResult, Error, void>({
    retry: false,
    mutationFn: async (): Promise<DaoClaimResult> => {
      validateClaim();
      rejectionToastShown.current = false;

      if (!poolAddress || !address) {
        throw new Error("Pool address and user address are required");
      }

      // Execute contract write for claim
      const hash = await writeContractAsync({
        address: poolAddress as `0x${string}`,
        abi: AWE_DAO_POOL_ABI,
        functionName: "claim",
        args: [address as `0x${string}`],
        chainId: chainId,
      });

      return { hash };
    },

    onError: (error) => {
      console.error("DAO pool claim failed:", error);

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
            ? "Claim Failed"
            : enhancedError.errorType === "WRONG_NETWORK"
            ? "Wrong Network"
            : enhancedError.errorType === "INSUFFICIENT_NATIVE_TOKEN"
            ? "Insufficient ETH"
            : "Claim Failed",
        description: enhancedError.userGuidance,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: daoClaimQueryKeys.claims(),
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
        queryKey: daoClaimQueryKeys.all,
      });

      success({
        title: "Claim Successful",
        description: "Your tokens have been claimed successfully",
      });
    }
  }, [isConfirmed, transactionHash, success, queryClient]);

  // Error handling effect
  useEffect(() => {
    if (receiptError) {
      console.error("DAO claim transaction error:", receiptError);

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
      queryKey: daoClaimQueryKeys.all,
    });
  }, [mutation, queryClient]);

  return {
    // Core mutation methods
    claim: mutation.mutate,
    claimAsync: mutation.mutateAsync,
    reset,

    // State
    isClaiming: mutation.isPending,
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
    validateClaim,
  } as const;
}
