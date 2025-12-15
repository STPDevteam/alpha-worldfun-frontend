import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import { type Hash } from "viem";

import { tokenService } from "@/libs/services/api/world-card.service";
import { useToast } from "../common";
import { useAuthStore } from "@/libs/stores";
import { FormDataType } from "@/components/launch-token/form/form-data-type";
import { useDaoPool } from "../contracts/use-dao-pool";
import { useBondingCurvePool } from "../contracts/use-bonding-curve-pool";
import { transformToContractParams } from "@/libs/utils/token-launch-transformations";
import { extractEvent } from "@/libs/utils/extract-event";
import { EVENT_EMITTER_ABI, TARGET_FUNDRAISE } from "@/libs/constants";
import { handleContractError } from "@/libs/utils/contract-error-handler";
import { useTokenAgentId } from "../contracts/use-token-agent-id";
import { clearAgentPersistence } from "@/libs/stores/agent-persistence.store";

// Query keys for cache management
export const launchTokenQueryKeys = {
  all: ["launch-token"] as const,
  tokens: () => [...launchTokenQueryKeys.all, "tokens"] as const,
} as const;

// Types
interface LaunchTokenData {
  success: boolean;
  txHash: Hash;
  tokenAddress: string;
  contractParams: any;
  backendData: any;
  fundraisingType: string;
  endDate?: Date; // For FIXED_PRICE fundraising
}

interface ContractResult {
  hash: Hash;
  tokenAddress?: string;
}

// Configuration constants
const TOKEN_ADDRESS_TIMEOUT = 60000; // 60 seconds
const EVENT_CHECK_INTERVAL = 100; // 100ms
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Token type mapping
const TOKEN_TYPE_MAPPING = {
  "world-idea": "WORLD_IDEA_TOKEN",
  "world-agent": "WORLD_AGENT",
  "utility-agent": "UTILITY_AGENT_TOKEN",
} as const;

export const useLaunchToken = () => {
  // Hooks
  const toast = useToast();
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();
  const userId = useAuthStore((state) => state.user)?.id;
  const daoPoolHook = useDaoPool();
  const bondingCurveHook = useBondingCurvePool();

  // State
  const [currentContractType, setCurrentContractType] = useState<
    "dao" | "bonding-curve" | null
  >(null);

  // Function to save token to backend with retry mechanism
  const saveTokenToBackend = useCallback(
    async (
      token: FormDataType,
      tokenAddress: string,
      poolAddress: string,
      endDate: Date,
      hash: Hash,
      maxRetries: number = 2
    ) => {
      if (
        !tokenAddress ||
        tokenAddress === ZERO_ADDRESS ||
        tokenAddress.length !== 42
      ) {
        throw new Error(
          "Cannot save token to backend: Invalid or missing token address. Transaction may have failed."
        );
      }

      let lastError: any;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          const tokenEntity =
            await tokenService.createTokenWithBlockchainConfirmation(
              token,
              tokenAddress,
              poolAddress,
              endDate,
              hash
            );

          return tokenEntity;
        } catch (error: any) {
          lastError = error;
          console.error(`Backend save attempt ${attempt + 1} failed:`, {
            tokenAddress,
            transactionHash: hash,
            error: error.message,
            attempt: attempt + 1,
            maxRetries: maxRetries + 1,
          });
        }
      }

      // All retries failed - log the error but don't save to localStorage
      console.error("Backend save failed after all retries", {
        tokenAddress,
        transactionHash: hash,
        error: lastError?.message,
        totalAttempts: maxRetries + 1,
      });

      // Re-throw with simple error message for user to retry
      throw new Error(
        `Unexpected error occurred. Please try submitting again.`
      );
    },
    []
  );

  // Execute contract transaction based on fundraising type
  const executeContractTransaction = useCallback(
    async (token: FormDataType): Promise<ContractResult> => {
      try {
        if (token.fundraisingType === "bonding-curve") {
          setCurrentContractType("bonding-curve");
          const result = await bondingCurveHook.createPoolAsync({
            name: token.name,
            symbol: token.symbol,
            agentId: token.agentId,
          });
          return { hash: result.hash };
        } else {
          setCurrentContractType("dao");
          const contractParams = transformToContractParams(token);
          const result = await daoPoolHook.createDaoPoolAsync(contractParams);
          return { hash: result.hash };
        }
      } catch (error: any) {
        console.error("Contract transaction failed:", error);

        // Check for user rejection and throw with specific message
        if (error.message?.includes("User rejected")) {
          const rejectionError = new Error("User rejected the transaction");
          rejectionError.name = "UserRejectedError";
          throw rejectionError;
        }

        throw error;
      }
    },
    [bondingCurveHook, daoPoolHook]
  );

  // Main mutation
  const mutation = useMutation<LaunchTokenData, Error, FormDataType>({
    retry: false,
    mutationFn: async (token: FormDataType): Promise<LaunchTokenData> => {
      try {
        // Step 1: Execute contract transaction and get hash
        const contractResult = await executeContractTransaction(token);
        const hash = contractResult.hash;

        // Step 2: Wait for transaction confirmation and extract token address directly
        if (!publicClient) {
          throw new Error("Public client not available");
        }

        // Wait for transaction confirmation first
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: hash as `0x${string}`,
          timeout: TOKEN_ADDRESS_TIMEOUT,
        });

        // Check if transaction was successful
        if (receipt.status === "reverted") {
          throw new Error(
            "Transaction was reverted. Please check your transaction parameters and try again."
          );
        }

        // Extract token address directly using the appropriate event
        const eventName =
          token.fundraisingType === "bonding-curve"
            ? "BondingCurveCreated"
            : "DaoCreated";
        const tokenCreatedEvent = (await extractEvent(
          publicClient,
          EVENT_EMITTER_ABI,
          receipt,
          eventName
        )) as any;

        const {
          pool: poolAddress,
          token: tokenAddress,
          endTime,
        } = tokenCreatedEvent?.args as any;

        // Extract endDate for FIXED_PRICE fundraising type
        let endDate: Date | undefined;
        if (token.fundraisingType === "fixed-price" && endTime) {
          endDate = new Date(Number(endTime) * 1000);
        }

        if (tokenAddress === ZERO_ADDRESS) {
          throw new Error(
            `Failed to extract token address from ${eventName} event. Transaction may have failed or used unexpected event structure.`
          );
        }

        // Final validation: Ensure we have a valid token address before proceeding
        if (
          !tokenAddress ||
          tokenAddress.length !== 42 ||
          !tokenAddress.startsWith("0x")
        ) {
          throw new Error(
            `Invalid token address format: ${tokenAddress}. Cannot proceed with token creation.`
          );
        }

        // Step 3: Prepare contract parameters for response
        const contractParams =
          token.fundraisingType === "bonding-curve"
            ? {
                name: token.name.trim(),
                symbol: token.symbol.trim().toUpperCase(),
              }
            : transformToContractParams(token);

        // Step 4: Save token metadata to backend with retry mechanism
        const backendTokenEntity = await saveTokenToBackend(
          token,
          tokenAddress,
          poolAddress,
          endDate || token.endDate || new Date(),
          hash
        );

        return {
          success: true,
          txHash: hash,
          tokenAddress,
          contractParams,
          backendData: backendTokenEntity,
          fundraisingType: token.fundraisingType || "fixed-price",
          endDate,
        };
      } catch (error: any) {
        throw error;
      }
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: launchTokenQueryKeys.tokens(),
      });
      const tokenTypeText =
        data.fundraisingType === "bonding-curve"
          ? "Bonding curve token"
          : "Fixed price token";
      toast.success({
        title: `${tokenTypeText} created successfully!`,
        description: `Token address: ${data.tokenAddress || "Pending"}`,
      });

      // Clear agent persistence after successful token creation
      clearAgentPersistence();
    },

    onError: (error: Error) => {
      // Use enhanced error handling
      const enhancedError = handleContractError(error, "token-factory", {
        showToast: false,
      });

      // Show error type and message
      toast.error({
        title: enhancedError.errorType
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        description: enhancedError.userGuidance,
      });
    },
  });

  // Get the current smart contract hook based on type
  const currentHook = useMemo(() => {
    return currentContractType === "dao"
      ? daoPoolHook
      : currentContractType === "bonding-curve"
      ? bondingCurveHook
      : null;
  }, [currentContractType, daoPoolHook, bondingCurveHook]);

  // Computed status
  const status = useMemo(() => {
    if (mutation.isPending && !currentHook) return "preparing";
    if (currentHook?.status) return currentHook.status;
    if (mutation.isSuccess) return "success";

    // Check for user cancellation first
    if (
      mutation.error?.message?.includes("User rejected") ||
      mutation.error?.name === "UserRejectedError"
    ) {
      return "cancelled";
    }

    // Check current hook error for cancellation
    if (
      currentHook &&
      "error" in currentHook &&
      (currentHook as any).error?.message?.includes("User rejected")
    ) {
      return "cancelled";
    }

    // Then check for other errors
    if (
      mutation.isError ||
      (currentHook && "error" in currentHook && (currentHook as any).error)
    )
      return "error";
    return "idle";
  }, [
    mutation.isPending,
    mutation.isSuccess,
    mutation.isError,
    mutation.error,
    currentHook,
  ]);

  // Combined error
  const combinedError = useMemo(
    () =>
      mutation.error ||
      (currentHook && "error" in currentHook
        ? (currentHook as any).error
        : null),
    [mutation.error, currentHook]
  );

  // Reset function
  const reset = useCallback(() => {
    mutation.reset();
    setCurrentContractType(null);
    daoPoolHook.reset();
    bondingCurveHook.reset();
    queryClient.invalidateQueries({ queryKey: launchTokenQueryKeys.tokens() });
  }, [mutation, daoPoolHook, bondingCurveHook, queryClient]);

  return {
    // Core mutation functions
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    reset,

    // State from the main mutation
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: combinedError,
    data: mutation.data,

    // Smart contract specific states (from current hook)
    isPreparing: currentHook?.isPreparing || false,
    isWaitingApproval: currentHook?.isWaitingApproval || false,
    isConfirming: currentHook?.isConfirming || false,
    isConfirmed: currentHook?.isConfirmed || false,

    // Contract data
    hash: currentHook?.hash,
    contractError:
      currentHook && "error" in currentHook ? (currentHook as any).error : null,

    // Combined status
    status,

    // Current contract type
    currentContractType,
  } as const;
};

// Export legacy hook for backward compatibility
export const useLaunchFixedPriceToken = useLaunchToken;
