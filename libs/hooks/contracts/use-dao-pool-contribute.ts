import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  usePublicClient,
} from "wagmi";
import { useEffect, useCallback, useMemo, useRef } from "react";
import type { Hash } from "viem";
import { parseUnits, erc20Abi, decodeErrorResult } from "viem";
import { SUPPORTED_CHAINS, CONTRACT_ADDRESSES } from "@/libs/constants";
import { AWE_DAO_POOL_ABI } from "@/libs/constants";
import { useToast } from "@/libs/hooks/common";
import {
  handleWagmiError,
  parseContractRevertReason,
} from "@/libs/utils/contract-error-handler";
import { useDaoPoolData } from "./use-dao-pool-data";
import { useWriteContractStrict } from "./use-write-contract-strict";

// Query keys for cache management
export const daoContributeQueryKeys = {
  all: ["dao-contribute"] as const,
  contributions: () =>
    [...daoContributeQueryKeys.all, "contributions"] as const,
} as const;

// Types
export interface DaoContributeParams {
  amount: number;
  poolAddress?: string;
  userBalance?: bigint;
}

interface DaoContributeResult {
  hash: Hash;
  params: DaoContributeParams;
}

export function useDaoPoolContribute(poolAddress?: string) {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { success, error: toastError } = useToast();
  const { writeContractAsync } = useWriteContractStrict();
  const rejectionToastShown = useRef(false);

  // Get DAO pool data to check graduation status
  const { isGraduated, isLoading: isPoolDataLoading } = useDaoPoolData({
    poolAddress,
    enabled: !!poolAddress,
  });

  // Validation helper
  const validateContribution = useCallback(
    (params: DaoContributeParams): void => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      if (!(Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId)) {
        throw new Error("Please switch to a supported network");
      }

      if (!params.amount || params.amount <= 0) {
        throw new Error("Contribution amount must be greater than 0");
      }

      // Check if token has graduated (cannot contribute to graduated pools)
      if (isGraduated) {
        throw new Error(
          "Cannot contribute to graduated pools. This token has already reached its funding goal."
        );
      }
    },
    [address, chainId, isGraduated]
  );

  // Main mutation
  const mutation = useMutation<DaoContributeResult, Error, DaoContributeParams>(
    {
      retry: false,
      mutationFn: async (
        params: DaoContributeParams
      ): Promise<DaoContributeResult> => {
        validateContribution(params);
        rejectionToastShown.current = false;
        const amountWei = parseUnits(params.amount.toString(), 18);
        // Get DAO pool address from params (required)
        const daoPoolAddress = params.poolAddress;
        if (!daoPoolAddress) {
          throw new Error("DAO pool address must be provided");
        }

        // Get AWE token address
        const aweTokenAddress =
          CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
            ?.AWE_TOKEN;
        if (!aweTokenAddress) {
          throw new Error("AWE token address not found for this chain");
        }

        // Step 1: Approve AWE tokens for the DAO pool
        const approveHash = await writeContractAsync({
          address: aweTokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          args: [daoPoolAddress as `0x${string}`, amountWei],
          chainId: chainId,
        });

        try {
          const hash = await writeContractAsync({
            address: daoPoolAddress as `0x${string}`,
            abi: AWE_DAO_POOL_ABI,
            functionName: "contribute",
            args: [[amountWei]],
            chainId: chainId,
          });

          return { hash, params };
        } catch (writeError: any) {
          console.error("Contract write failed:", writeError);

          // Parse the contract revert reason for a user-friendly message
          const errorString =
            writeError?.message || writeError?.toString() || "";
          const { userMessage } = parseContractRevertReason(errorString);

          console.error("Parsed error:", {
            userMessage,
            originalError: errorString,
          });

          // Throw error with user-friendly message
          throw new Error(userMessage);
        }
      },

      onError: (error) => {
        console.error("DAO pool contribution failed:", error);
        console.error("Error details:", {
          message: error.message,
          cause: (error as any)?.cause,
          data: (error as any)?.data,
          shortMessage: (error as any)?.shortMessage,
          metaMessages: (error as any)?.metaMessages,
        });

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

        const errorMessage = error.message;

        // Determine the title based on error type or content
        let errorTitle = "Contribution Failed";
        if (enhancedError.errorType === "INSUFFICIENT_FUNDS") {
          errorTitle = "Insufficient Balance";
        } else if (enhancedError.errorType === "INSUFFICIENT_NATIVE_TOKEN") {
          errorTitle = "Insufficient ETH";
        } else if (enhancedError.errorType === "UNSUPPORTED_CHAIN") {
          errorTitle = "Unsupported Network";
        } else if (enhancedError.errorType === "CHAIN_NOT_CONFIGURED") {
          errorTitle = "Network Not Added";
        } else if (enhancedError.errorType === "WRONG_NETWORK") {
          errorTitle = "Wrong Network";
        } else if (enhancedError.errorType === "TOKEN_NOT_FOUND") {
          errorTitle = "Token Not Found";
        } else if (enhancedError.errorType === "UNAUTHORIZED") {
          errorTitle = "Unauthorized";
        } else if (enhancedError.errorType === "CONTRACT_REVERT") {
          errorTitle = "Transaction Failed";
        }

        toastError({
          title: errorTitle,
          description: errorMessage || enhancedError.userGuidance,
        });
      },

      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: daoContributeQueryKeys.contributions(),
        });
        success({
          title: "Contribution Submitted",
          description: `Successfully contributed ${data.params.amount} AWE tokens`,
        });
      },
    }
  );

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
        queryKey: daoContributeQueryKeys.contributions(),
      });
    }
  }, [isConfirmed, transactionHash, success, queryClient]);

  // Error handling effect
  useEffect(() => {
    if (receiptError) {
      console.error("DAO contribution transaction error:", receiptError);

      // Use enhanced wagmi error handling for receipt errors
      const enhancedError = handleWagmiError(receiptError, "dao-pool", {
        showToast: true,
      });

      // Don't show error toast for user rejections
      if (enhancedError.errorType === "USER_REJECTED") {
        return;
      }
    }
  }, [receiptError, toastError]);

  // Computed status
  const status = useMemo(() => {
    if (mutation.isPending) return "preparing";
    if (transactionHash && isConfirming) return "pending";
    if (isConfirmed) return "success";
    if (mutation.error?.message?.includes("User rejected")) {
      return "cancelled";
    }
    if (receiptError?.message?.includes("User rejected")) {
      return "cancelled";
    }
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
      queryKey: daoContributeQueryKeys.contributions(),
    });
  }, [mutation, queryClient]);

  return {
    // Core mutation methods
    contribute: mutation.mutate,
    contributeAsync: mutation.mutateAsync,
    reset,

    // State
    isPreparing: mutation.isPending,
    isWaitingApproval: mutation.isPending,
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
    validateContribution,
  } as const;
}
