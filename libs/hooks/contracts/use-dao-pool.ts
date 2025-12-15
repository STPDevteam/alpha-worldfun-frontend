import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { useEffect, useCallback, useMemo, useRef } from "react";
import type { Hash } from "viem";
import {
  CONTRACT_ADDRESSES,
  FACTORY_ABI,
  SUPPORTED_CHAINS,
} from "@/libs/constants";
import type { CreateDaoPoolParams, VestingSchedule } from "@/libs/types";
import { useToast } from "@/libs/hooks/common";
import { handleContractError } from "@/libs/utils/contract-error-handler";
import { useWriteContractStrict } from "./use-write-contract-strict";

// Query keys for cache management
export const daoPoolQueryKeys = {
  all: ["dao-pool"] as const,
  pools: () => [...daoPoolQueryKeys.all, "pools"] as const,
} as const;

// Types
interface DaoPoolResult {
  hash: Hash;
  params: CreateDaoPoolParams;
}

export function useDaoPool() {
  // Hooks
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { success, error: toastError } = useToast();
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContractStrict();
  const rejectionToastShown = useRef(false);

  // Contract validation helper
  const validateContractSetup = useCallback((): `0x${string}` => {
    if (!(Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId)) {
      throw new Error("Please switch to a supported network");
    }

    const factoryAddress =
      CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.FACTORY;
    if (!factoryAddress) {
      throw new Error(`Factory contract not deployed on chain ${chainId}`);
    }

    return factoryAddress as `0x${string}`;
  }, [chainId]);

  // Main mutation
  const mutation = useMutation<DaoPoolResult, Error, CreateDaoPoolParams>({
    retry: false,
    mutationFn: async (params: CreateDaoPoolParams): Promise<DaoPoolResult> => {
      const factoryAddress = validateContractSetup();
      rejectionToastShown.current = false;
      const hash = await writeContractAsync({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: "createDaoPool",
        args: [
          params.name.trim(),
          params.symbol.trim().toUpperCase(),
          params.agentId?.trim() || "",
        ],
        chainId: chainId,
      });

      if (!publicClient) {
        throw new Error("Public client not available");
      }

      const poolApprovalReceipt = await publicClient.waitForTransactionReceipt({
        hash: hash,
      });

      if (poolApprovalReceipt.status !== "success") {
        throw new Error(
          "DAO token creation failed: ",
          (poolApprovalReceipt?.status as ErrorOptions) || "Transaction failed"
        );
      }

      return { hash, params };
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: daoPoolQueryKeys.pools() });
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
      queryClient.invalidateQueries({ queryKey: daoPoolQueryKeys.pools() });
    }
  }, [isConfirmed, transactionHash, success, queryClient]);

  // Error handling effect
  useEffect(() => {
    if (receiptError) {
      console.error("DAO transaction error:", receiptError);

      // Use enhanced error handling for receipt errors
      const enhancedError = handleContractError(receiptError, "dao-pool", {
        showToast: false, // Handle manually to avoid duplication
      });

      // Don't show error toast for user rejections
      if (enhancedError.errorType === "USER_REJECTED") {
        return;
      }

      toastError({
        title: enhancedError.errorType
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        description: enhancedError.message,
      });
    }
  }, [receiptError, toastError]);

  // Computed status
  const status = useMemo(() => {
    if (mutation.isPending) return "preparing";
    if (transactionHash && isConfirming) return "pending";
    if (isConfirmed) return "success";

    // Check for user cancellation first
    if (mutation.error?.message?.includes("User rejected")) {
      return "cancelled";
    }
    if (receiptError?.message?.includes("User rejected")) {
      return "cancelled";
    }

    // Then check for other errors
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
    rejectionToastShown.current = false; // Reset rejection toast flag
    queryClient.invalidateQueries({ queryKey: daoPoolQueryKeys.pools() });
  }, [mutation, queryClient]);

  return {
    // Core mutation methods
    createDaoPool: mutation.mutate,
    createDaoPoolAsync: mutation.mutateAsync,
    reset,

    // State
    isPreparing: mutation.isPending,
    isWaitingApproval: mutation.isPending,
    isConfirming,
    isConfirmed,

    // Data
    hash: transactionHash,
    error: combinedError,

    // Computed status
    status,
  } as const;
}
