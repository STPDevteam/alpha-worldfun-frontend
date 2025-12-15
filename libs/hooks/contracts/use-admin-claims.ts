import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { useEffect, useCallback, useMemo, useRef } from "react";
import type { Hash } from "viem";
import {
  SUPPORTED_CHAINS,
  AWE_BONDING_CURVE_POOL_ABI,
  AWE_DAO_POOL_ABI,
} from "@/libs/constants";
import { useToast } from "@/libs/hooks/common";
import { handleWagmiError } from "@/libs/utils/contract-error-handler";

// Query keys for cache management
export const adminClaimsQueryKeys = {
  all: ["admin-claims"] as const,
  creatorReward: () => [...adminClaimsQueryKeys.all, "creator-reward"] as const,
  dexFees: () => [...adminClaimsQueryKeys.all, "dex-fees"] as const,
  status: (poolAddress?: string) =>
    [...adminClaimsQueryKeys.all, "status", poolAddress] as const,
} as const;

// Types
export type PoolType = "BONDING_CURVE" | "DAO_POOL";

export interface UseAdminClaimsParams {
  poolAddress?: string;
  poolType: PoolType;
  enabled?: boolean;
}

interface ClaimResult {
  hash: Hash;
  operation: "claim_creator_reward" | "claim_dex_fees";
}

export function useAdminClaims({
  poolAddress,
  poolType,
  enabled = true,
}: UseAdminClaimsParams) {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { address } = useAccount();
  const { success, error: toastError } = useToast();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Track rejection toasts
  const creatorRewardRejectionToastShown = useRef(false);
  const dexFeesRejectionToastShown = useRef(false);
  const mostRecentOperation = useRef<
    "claim_creator_reward" | "claim_dex_fees" | null
  >(null);

  // Select the correct ABI based on pool type
  const poolAbi =
    poolType === "BONDING_CURVE"
      ? AWE_BONDING_CURVE_POOL_ABI
      : AWE_DAO_POOL_ABI;

  // Validate query parameters
  const isValidChain = (Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId);
  const queryEnabled = Boolean(
    enabled &&
      poolAddress &&
      poolAddress.length === 42 &&
      poolAddress.startsWith("0x") &&
      isValidChain
  );

  // Read creatorClaimed status
  const {
    data: creatorClaimed,
    isLoading: isLoadingStatus,
    isError: isStatusError,
    error: statusError,
    refetch: refetchStatus,
  } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: poolAbi,
    functionName: "creatorClaimed",
    args: [],
    query: {
      enabled: queryEnabled,
      refetchInterval: false,
      retry: 2,
    },
  });

  // Validation helpers
  const validateClaimCreatorReward = useCallback(async (): Promise<void> => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    if (!(Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId)) {
      throw new Error("Please switch to a supported network");
    }

    if (!poolAddress) {
      throw new Error("Pool address is required");
    }

    if (!publicClient) {
      throw new Error("Network connection not available");
    }

    // Check if user is the creator
    try {
      const creator = await publicClient.readContract({
        address: poolAddress as `0x${string}`,
        abi: poolAbi,
        functionName: "creator",
      });

      if ((creator as string).toLowerCase() !== address.toLowerCase()) {
        throw new Error("Only the pool creator can claim this reward");
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Only the pool creator")
      ) {
        throw error;
      }
      throw new Error("Failed to verify pool creator");
    }
  }, [address, chainId, poolAddress, publicClient, poolAbi, creatorClaimed]);

  const validateClaimDexFees = useCallback(async (): Promise<void> => {
    if (!address) {
      throw new Error("Wallet not connected");
    }
    
    if (!(Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId)) {
      throw new Error("Please switch to a supported network");
    }

    if (!poolAddress) {
      throw new Error("Pool address is required");
    }

    if (!publicClient) {
      throw new Error("Network connection not available");
    }

    // Check if pool has graduated
    try {
      const isGraduated = await publicClient.readContract({
        address: poolAddress as `0x${string}`,
        abi: poolAbi,
        functionName: "isGraduated",
      });

      if (!isGraduated) {
        throw new Error("Pool must be graduated before claiming DEX fees");
      }

      // Check if user is the creator
      const creator = await publicClient.readContract({
        address: poolAddress as `0x${string}`,
        abi: poolAbi,
        functionName: "creator",
      });

      if ((creator as string).toLowerCase() !== address.toLowerCase()) {
        throw new Error("Only the pool creator can claim DEX fees");
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("must be graduated") ||
          error.message.includes("Only the pool creator"))
      ) {
        throw error;
      }
      throw new Error("Failed to validate pool state");
    }
  }, [address, chainId, poolAddress, publicClient, poolAbi]);

  // Get contract context for error handling
  const contractContext =
    poolType === "BONDING_CURVE" ? "bonding-curve" : "dao-pool";

  // Claim Creator Reward mutation
  const claimCreatorRewardMutation = useMutation<ClaimResult, Error, void>({
    retry: false,
    onMutate: () => {
      mostRecentOperation.current = "claim_creator_reward";
    },
    mutationFn: async (): Promise<ClaimResult> => {
      await validateClaimCreatorReward();

      creatorRewardRejectionToastShown.current = false;

      const hash = await writeContractAsync({
        address: poolAddress as `0x${string}`,
        abi: poolAbi,
        functionName: "claimCreatorReward",
        args: [],
        chainId: chainId,
      });

      return { hash, operation: "claim_creator_reward" };
    },

    onError: (error) => {
      console.error("Claim creator reward failed:", error);

      const enhancedError = handleWagmiError(error, contractContext, {
        showToast: false,
        onRetry: async () => {
          creatorRewardRejectionToastShown.current = false;
        },
      });

      if (enhancedError.errorType === "USER_REJECTED") {
        if (!creatorRewardRejectionToastShown.current) {
          creatorRewardRejectionToastShown.current = true;
          toastError({
            title: "Transaction Cancelled",
            description: "You cancelled the transaction",
          });
        }
        return;
      }

      toastError({
        title:
          enhancedError.errorType === "UNAUTHORIZED"
            ? "Unauthorized"
            : enhancedError.errorType === "CONTRACT_REVERT"
            ? "Claim Failed"
            : enhancedError.errorType === "WRONG_NETWORK"
            ? "Wrong Network"
            : "Claim Creator Reward Failed",
        description: enhancedError.userGuidance,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminClaimsQueryKeys.creatorReward(),
      });
      queryClient.invalidateQueries({
        queryKey: adminClaimsQueryKeys.status(poolAddress),
      });
    },
  });

  // Claim DEX Fees mutation
  const claimDexFeesMutation = useMutation<ClaimResult, Error, void>({
    retry: false,
    onMutate: () => {
      mostRecentOperation.current = "claim_dex_fees";
    },
    mutationFn: async (): Promise<ClaimResult> => {
      await validateClaimDexFees();

      dexFeesRejectionToastShown.current = false;

      const hash = await writeContractAsync({
        address: poolAddress as `0x${string}`,
        abi: poolAbi,
        functionName: "claimDexFees",
        args: [],
        chainId: chainId,
      });

      return { hash, operation: "claim_dex_fees" };
    },

    onError: (error) => {
      console.error("Claim DEX fees failed:", error);

      const enhancedError = handleWagmiError(error, contractContext, {
        showToast: false,
        onRetry: async () => {
          dexFeesRejectionToastShown.current = false;
        },
      });

      if (enhancedError.errorType === "USER_REJECTED") {
        if (!dexFeesRejectionToastShown.current) {
          dexFeesRejectionToastShown.current = true;
          toastError({
            title: "Transaction Cancelled",
            description: "You cancelled the transaction",
          });
        }
        return;
      }

      toastError({
        title:
          enhancedError.errorType === "UNAUTHORIZED"
            ? "Unauthorized"
            : enhancedError.errorType === "CONTRACT_REVERT"
            ? "Claim Failed"
            : enhancedError.errorType === "WRONG_NETWORK"
            ? "Wrong Network"
            : "Claim DEX Fees Failed",
        description: enhancedError.userGuidance,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminClaimsQueryKeys.dexFees(),
      });
      queryClient.invalidateQueries({
        queryKey: adminClaimsQueryKeys.status(poolAddress),
      });
    },
  });

  // Transaction receipt tracking
  const creatorRewardHash = claimCreatorRewardMutation.data?.hash;
  const dexFeesHash = claimDexFeesMutation.data?.hash;

  // Use the most recent transaction hash
  const activeTransactionHash = useMemo(() => {
    const mostRecent = mostRecentOperation.current;

    switch (mostRecent) {
      case "claim_creator_reward":
        return creatorRewardHash || dexFeesHash;
      case "claim_dex_fees":
        return dexFeesHash || creatorRewardHash;
      default:
        return creatorRewardHash || dexFeesHash;
    }
  }, [creatorRewardHash, dexFeesHash]);

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: activeTransactionHash,
    query: { enabled: !!activeTransactionHash },
  });

  // Transaction confirmation effect
  useEffect(() => {
    if (isConfirmed && activeTransactionHash) {
      queryClient.invalidateQueries({
        queryKey: adminClaimsQueryKeys.all,
      });

      // Refetch creator claimed status
      refetchStatus();

      const operation =
        claimCreatorRewardMutation.data?.operation ||
        claimDexFeesMutation.data?.operation;

      if (operation === "claim_creator_reward") {
        success({
          title: "Creator Reward Claimed",
          description: "Your creator reward has been successfully claimed",
        });
      } else if (operation === "claim_dex_fees") {
        success({
          title: "DEX Fees Claimed",
          description: "Your DEX fees have been successfully claimed",
        });
      }
    }
  }, [
    isConfirmed,
    activeTransactionHash,
    success,
    queryClient,
    claimCreatorRewardMutation.data,
    claimDexFeesMutation.data,
    refetchStatus,
  ]);

  // Error handling effect
  useEffect(() => {
    if (receiptError) {
      console.error("Admin claim transaction error:", receiptError);

      const enhancedError = handleWagmiError(receiptError, contractContext, {
        showToast: false,
      });

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
    if (claimCreatorRewardMutation.isPending || claimDexFeesMutation.isPending)
      return "preparing";
    if (activeTransactionHash && isConfirming) return "pending";
    if (isConfirmed) return "success";

    // Check for user cancellation
    if (
      claimCreatorRewardMutation.error?.message?.includes("User rejected") ||
      claimDexFeesMutation.error?.message?.includes("User rejected")
    ) {
      return "cancelled";
    }
    if (receiptError?.message?.includes("User rejected")) {
      return "cancelled";
    }

    // Check for other errors
    if (
      claimCreatorRewardMutation.error ||
      claimDexFeesMutation.error ||
      receiptError
    )
      return "error";
    return "idle";
  }, [
    claimCreatorRewardMutation.isPending,
    claimDexFeesMutation.isPending,
    claimCreatorRewardMutation.error,
    claimDexFeesMutation.error,
    activeTransactionHash,
    isConfirming,
    isConfirmed,
    receiptError,
  ]);

  // Combined error
  const combinedError = useMemo(
    () =>
      claimCreatorRewardMutation.error ||
      claimDexFeesMutation.error ||
      receiptError ||
      (isStatusError ? statusError : null),
    [
      claimCreatorRewardMutation.error,
      claimDexFeesMutation.error,
      receiptError,
      isStatusError,
      statusError,
    ]
  );

  // Reset function
  const reset = useCallback(() => {
    claimCreatorRewardMutation.reset();
    claimDexFeesMutation.reset();
    creatorRewardRejectionToastShown.current = false;
    dexFeesRejectionToastShown.current = false;
    mostRecentOperation.current = null;
    queryClient.invalidateQueries({
      queryKey: adminClaimsQueryKeys.all,
    });
  }, [claimCreatorRewardMutation, claimDexFeesMutation, queryClient]);

  return {
    // Read data
    creatorClaimed: creatorClaimed as boolean | undefined,
    isLoadingStatus,

    // Write operations
    claimCreatorReward: claimCreatorRewardMutation.mutateAsync,
    claimDexFees: claimDexFeesMutation.mutateAsync,

    // Transaction states
    isClaimingReward: claimCreatorRewardMutation.isPending,
    isClaimingFees: claimDexFeesMutation.isPending,
    isConfirming,
    isConfirmed,

    // Transaction data
    hash: activeTransactionHash,
    error: combinedError,
    status,

    // Utilities
    reset,
    refetch: refetchStatus,
  } as const;
}
