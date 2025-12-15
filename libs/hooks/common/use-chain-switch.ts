import { useCallback, useEffect } from "react";
import { useSwitchChain } from "wagmi";
import { useToast } from "./use-toast";
import { SUPPORTED_CHAINS } from "@/libs/constants";
import { chainSwitchService } from "@/libs/services/chain-switch.service";
import type { EnhancedCategorizedError } from "@/libs/utils/contract-error-handler";

export interface UseChainSwitchReturn {
  switchToSupportedChain: (
    preferredChainId?: number
  ) => Promise<{ success: boolean; error?: Error }>;
  handleChainError: (
    error: EnhancedCategorizedError
  ) => Promise<{ success: boolean; error?: Error }>;
  isSwitching: boolean;
}

/**
 * Hook to handle chain switching with user-friendly error messages
 */
export function useChainSwitch(): UseChainSwitchReturn {
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { error: toastError, success: toastSuccess } = useToast();

  /**
   * Switch to a supported chain with toast notifications
   */
  const switchToSupportedChain = useCallback(
    async (
      preferredChainId?: number
    ): Promise<{ success: boolean; error?: Error }> => {
      try {
        // Use preferred chain or default to BASE_SEPOLIA
        const targetChainId = preferredChainId || SUPPORTED_CHAINS.BASE_SEPOLIA;

        await switchChainAsync({ chainId: targetChainId });

        toastSuccess({
          title: "Network Switched",
          description: "Successfully switched to the correct network",
        });

        return { success: true };
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to switch network");

        // Check if user rejected the switch
        if (error.message.toLowerCase().includes("user rejected")) {
          toastError({
            title: "Network Switch Cancelled",
            description: "You cancelled the network switch",
          });
        } else {
          toastError({
            title: "Network Switch Failed",
            description:
              error.message ||
              "Failed to switch network. Please switch manually in your wallet.",
          });
        }

        return { success: false, error };
      }
    },
    [switchChainAsync, toastError, toastSuccess]
  );

  /**
   * Handle a chain-related error by prompting the user to switch
   */
  const handleChainError = useCallback(
    async (
      error: EnhancedCategorizedError
    ): Promise<{ success: boolean; error?: Error }> => {
      const isChainError =
        error.errorType === "WRONG_NETWORK" ||
        error.errorType === "UNSUPPORTED_CHAIN" ||
        error.errorType === "CHAIN_NOT_CONFIGURED";

      if (!isChainError) {
        return {
          success: false,
          error: new Error("Not a chain-related error"),
        };
      }

      toastError({
        title:
          error.errorType === "WRONG_NETWORK"
            ? "Wrong Network"
            : error.errorType === "UNSUPPORTED_CHAIN"
            ? "Unsupported Network"
            : "Network Not Configured",
        description: error.userGuidance,
      });

      const result = await switchToSupportedChain();

      return result;
    },
    [toastError, switchToSupportedChain]
  );

  // Register the chain error handler with the service on mount
  useEffect(() => {
    // Wrap handler to match service signature (Promise<void>)
    const serviceHandler = async (
      error: EnhancedCategorizedError
    ): Promise<void> => {
      await handleChainError(error);
    };

    chainSwitchService.register(serviceHandler);

    return () => {
      chainSwitchService.unregister();
    };
  }, [handleChainError]);

  return {
    switchToSupportedChain,
    handleChainError,
    isSwitching,
  };
}
