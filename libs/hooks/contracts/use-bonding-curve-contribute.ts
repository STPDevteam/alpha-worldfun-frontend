import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  usePublicClient,
} from "wagmi";
import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import type { Hash } from "viem";
import { parseUnits, erc20Abi } from "viem";
import {
  SUPPORTED_CHAINS,
  CONTRACT_ADDRESSES,
  EVENT_EMITTER_ABI,
} from "@/libs/constants";
import { AWE_BONDING_CURVE_POOL_ABI } from "@/libs/constants";
import { useToast } from "@/libs/hooks/common";
import { extractEvent } from "@/libs/utils/extract-event";
import {
  handleContractError,
  handleWagmiError,
} from "@/libs/utils/contract-error-handler";
import { useWriteContractStrict } from "./use-write-contract-strict";
// Fee calculation imports removed

// Query keys for cache management
export const bondingCurveContributeQueryKeys = {
  all: ["bonding-curve-contribute"] as const,
  contributions: () =>
    [...bondingCurveContributeQueryKeys.all, "contributions"] as const,
} as const;

// Common error handler for all trade types
const handleTradingError = (
  error: unknown,
  tradeType: "buy" | "sell"
): Error => {
  // Handle specific contract errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Common contract errors
    if (message.includes("graduated")) {
      return new Error(
        tradeType === "buy"
          ? "Pool has already graduated - no more tokens available for purchase"
          : "Pool has already graduated - selling is no longer available"
      );
    }

    if (message.includes("slippagetoleranceexceeded")) {
      return new Error(
        "Price moved unfavorably. Please try again with a larger slippage tolerance"
      );
    }

    if (message.includes("insufficienttokenbalance")) {
      return new Error(
        tradeType === "buy"
          ? "Pool has insufficient token balance to fulfill this purchase"
          : "You have insufficient token balance to fulfill this sell"
      );
    }

    if (message.includes("execution reverted")) {
      return new Error(
        tradeType === "buy"
          ? "Purchase transaction was rejected by the contract. The pool may have graduated or there may be insufficient liquidity"
          : "Sell transaction was rejected by the contract. The pool may have graduated or there may be insufficient liquidity"
      );
    }

    if (message.includes("insufficient") && message.includes("balance")) {
      return error; // Return original insufficient balance errors as-is
    }

    if (message.includes("user rejected") || message.includes("user denied")) {
      return new Error("Transaction cancelled by user");
    }
  }

  // Return generic error for unknown issues
  return error instanceof Error ? error : new Error("Transaction failed");
};

// Types
export interface BondingCurveBuyParams {
  aweAmount: string;
  poolAddress: string;
}

export interface BondingCurveBuyExactOutParams {
  tokenAmount: string;
  poolAddress: string;
  maxAweAmount?: string; // Optional - will be calculated if not provided
}

export interface BondingCurveSellParams {
  tokenAmount: string;
  poolAddress: string;
  tokenAddress: string;
}

export interface BondingCurveSellExactOutParams {
  aweAmount: string;
  poolAddress: string;
  tokenAddress: string;
  maxTokenAmount?: string; // Optional - will be calculated if not provided
}

interface BondingCurveContributeResult {
  hash: Hash;
  operation: "buy" | "buy_exact_out" | "sell" | "sell_exact_out";
  params:
    | BondingCurveBuyParams
    | BondingCurveBuyExactOutParams
    | BondingCurveSellParams
    | BondingCurveSellExactOutParams;
  step?: "approval" | "purchase";
}

type ActiveTransaction = {
  hash: Hash;
  operation: BondingCurveContributeResult["operation"];
};

export function useBondingCurveContribute() {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { address } = useAccount();
  const { success, error: toastError } = useToast();
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContractStrict();
  const TOKEN_ADDRESS_TIMEOUT = 60000;

  // Track if we've already shown a rejection toast for buy/sell operations
  const buyRejectionToastShown = useRef(false);
  const sellRejectionToastShown = useRef(false);
  const lastConfirmedHashRef = useRef<Hash | null>(null);
  const [activeTransaction, setActiveTransaction] =
    useState<ActiveTransaction | null>(null);
  // Get AWE token address for approvals
  const aweTokenAddress = useMemo(() => {
    return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
      ?.AWE_TOKEN;
  }, [chainId]);

  // Validation helpers
  const validateBuy = useCallback(
    async (params: BondingCurveBuyParams): Promise<void> => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      if (!(Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId)) {
        throw new Error("Please switch to a supported network");
      }

      if (!params.aweAmount || parseFloat(params.aweAmount) <= 0) {
        throw new Error("AWE amount must be greater than 0");
      }

      if (!params.poolAddress) {
        throw new Error("Pool address is required");
      }

      if (!aweTokenAddress) {
        throw new Error("AWE token address not found for this chain");
      }

      if (!publicClient) {
        throw new Error("Network connection not available");
      }

      // Check user's AWE token balance
      try {
        const balance = await publicClient.readContract({
          address: aweTokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address],
        });

        const requiredAmount = parseUnits(params.aweAmount, 18);
        if (balance < requiredAmount) {
          throw new Error(
            `Insufficient AWE balance. Required: ${
              parseFloat(requiredAmount.toString()) / 1e18
            } AWE, Available: ${parseFloat(balance.toString()) / 1e18} AWE`
          );
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("Insufficient")) {
          throw error;
        }

        throw new Error("Failed to check AWE token balance");
      }

      // Validate pool address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(params.poolAddress)) {
        throw new Error("Invalid pool address format");
      }
    },
    [address, chainId, aweTokenAddress, publicClient]
  );

  const validateBuyExactOut = useCallback(
    async (params: BondingCurveBuyExactOutParams): Promise<void> => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      if (!(Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId)) {
        throw new Error("Please switch to a supported network");
      }

      if (!params.tokenAmount || parseFloat(params.tokenAmount) <= 0) {
        throw new Error("Token amount must be greater than 0");
      }

      if (!params.poolAddress) {
        throw new Error("Pool address is required");
      }

      if (!aweTokenAddress) {
        throw new Error("AWE token address not found for this chain");
      }

      if (!publicClient) {
        throw new Error("Network connection not available");
      }

      // Validate pool address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(params.poolAddress)) {
        throw new Error("Invalid pool address format");
      }
    },
    [address, chainId, aweTokenAddress, publicClient]
  );

  const validateSell = useCallback(
    (params: BondingCurveSellParams): void => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      if (!(Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId)) {
        throw new Error("Please switch to a supported network");
      }

      if (!params.tokenAmount || parseFloat(params.tokenAmount) <= 0) {
        throw new Error("Token amount must be greater than 0");
      }

      if (!params.poolAddress) {
        throw new Error("Pool address is required");
      }
    },
    [address, chainId]
  );

  const validateSellExactOut = useCallback(
    async (params: BondingCurveSellExactOutParams): Promise<void> => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      if (!(Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId)) {
        throw new Error("Please switch to a supported network");
      }

      if (!params.aweAmount || parseFloat(params.aweAmount) <= 0) {
        throw new Error("AWE amount must be greater than 0");
      }

      if (!params.poolAddress) {
        throw new Error("Pool address is required");
      }

      if (!publicClient) {
        throw new Error("Network connection not available");
      }

      // Validate pool address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(params.poolAddress)) {
        throw new Error("Invalid pool address format");
      }
    },
    [address, chainId, publicClient]
  );

  const getAllowance = (
    client: NonNullable<typeof publicClient>,
    options: {
      ownerAddress: string;
      tokenAddress: string;
      poolAddress: string;
      blockNumber?: bigint;
    }
  ) => {
    const { tokenAddress, poolAddress, ownerAddress, blockNumber } = options;
    return client.readContract({
      blockNumber,
      blockTag: blockNumber ? undefined : "finalized", // Only use finalized if no specific block
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "allowance",
      args: [ownerAddress as `0x${string}`, poolAddress as `0x${string}`],
    });
  };

  // Buy mutation
  const buyMutation = useMutation<
    BondingCurveContributeResult,
    Error,
    BondingCurveBuyParams
  >({
    retry: false,
    mutationFn: async (
      params: BondingCurveBuyParams
    ): Promise<BondingCurveContributeResult> => {
      await validateBuy(params);

      // Reset rejection toast flag for new buy attempt
      buyRejectionToastShown.current = false;

      // Convert amounts to wei (18 decimals)
      const aweAmountWei = parseUnits(params.aweAmount, 18);

      const poolApprovalHash = await writeContractAsync({
        address: aweTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [params.poolAddress as `0x${string}`, aweAmountWei],
        chainId: chainId,
      });

      if (!publicClient) {
        throw new Error("Public client not available");
      }

      const poolApprovalReceipt = await publicClient.waitForTransactionReceipt({
        hash: poolApprovalHash,
      });

      if (poolApprovalReceipt.status !== "success") {
        throw new Error("Pool approval failed");
      }

      // Check if pool has graduated
      let isGraduated: boolean, tokenReserve: bigint, expectedTokenOut: bigint;
      try {
        [isGraduated, tokenReserve, expectedTokenOut] = await Promise.all([
          publicClient.readContract({
            address: params.poolAddress as `0x${string}`,
            abi: AWE_BONDING_CURVE_POOL_ABI,
            functionName: "isGraduated",
          }) as Promise<boolean>,
          publicClient.readContract({
            address: params.poolAddress as `0x${string}`,
            abi: AWE_BONDING_CURVE_POOL_ABI,
            functionName: "tokenReserve",
          }) as Promise<bigint>,
          publicClient.readContract({
            address: params.poolAddress as `0x${string}`,
            abi: AWE_BONDING_CURVE_POOL_ABI,
            functionName: "getAmountOut",
            args: [aweAmountWei, false],
          }) as Promise<bigint>,
        ]);

        if (isGraduated) {
          throw new Error(
            "Pool has already graduated - no more tokens available for purchase"
          );
        }

        if (tokenReserve === BigInt(0)) {
          throw new Error("No tokens remaining for sale");
        }

        // Verify AWE allowance after approval
        const allowance = await getAllowance(publicClient, {
          tokenAddress: aweTokenAddress,
          ownerAddress: address!, // validateBuy already validate this
          poolAddress: params.poolAddress,
          blockNumber: poolApprovalReceipt.blockNumber,
        });

        if (allowance < aweAmountWei) {
          throw new Error("Insufficient allowance after approval step");
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes("graduated") ||
            error.message.includes("remaining") ||
            error.message.includes("exceeds") ||
            error.message.includes("allowance"))
        ) {
          throw error;
        }
        console.error("Pre-flight check failed:", error);
        throw new Error("Failed to validate pool state before purchase");
      }

      // Calculate minimum token output with 1% slippage tolerance
      const minTokenOut = (expectedTokenOut * BigInt(99)) / BigInt(100);

      let hash: Hash;
      try {
        hash = await writeContractAsync({
          address: params.poolAddress as `0x${string}`,
          abi: AWE_BONDING_CURVE_POOL_ABI,
          functionName: "buy_exact_in",
          args: [aweAmountWei, minTokenOut],
          chainId: chainId,
        });
      } catch (error) {
        console.error("Contract call failed:", error);
        throw handleTradingError(error, "buy");
      }

      setActiveTransaction({
        hash,
        operation: "buy",
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: TOKEN_ADDRESS_TIMEOUT,
      });

      // Check if transaction was successful
      if (receipt.status === "reverted") {
        throw new Error(
          "Transaction was reverted. Please check your transaction parameters and try again."
        );
      }

      const tokenCreatedEvent = (await extractEvent(
        publicClient,
        EVENT_EMITTER_ABI,
        receipt,
        "BondingCurveBuy"
      )) as any;

      return { hash, operation: "buy", params };
    },

    onError: (error) => {
      console.error("Bonding curve buy failed:", error);
      handleWagmiError(error, "bonding-curve", {
        showToast: true,
        onRetry: async () => {
          buyRejectionToastShown.current = false;
        },
      });
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: bondingCurveContributeQueryKeys.contributions(),
      });
    },
  });

  // Buy Exact Out mutation
  const buyExactOutMutation = useMutation<
    BondingCurveContributeResult,
    Error,
    BondingCurveBuyExactOutParams
  >({
    retry: false,
    mutationFn: async (
      params: BondingCurveBuyExactOutParams
    ): Promise<BondingCurveContributeResult> => {
      await validateBuyExactOut(params);

      // Reset rejection toast flag for new buy exact out attempt
      buyRejectionToastShown.current = false;

      // Convert amounts to wei (18 decimals)
      const tokenAmountWei = parseUnits(params.tokenAmount, 18);

      if (!publicClient) {
        throw new Error("Public client not available");
      }

      // Check if pool has graduated and get required AWE amount
      let isGraduated: boolean, tokenReserve: bigint, requiredAweAmount: bigint;
      try {
        [isGraduated, tokenReserve, requiredAweAmount] = await Promise.all([
          publicClient.readContract({
            address: params.poolAddress as `0x${string}`,
            abi: AWE_BONDING_CURVE_POOL_ABI,
            functionName: "isGraduated",
          }) as Promise<boolean>,
          publicClient.readContract({
            address: params.poolAddress as `0x${string}`,
            abi: AWE_BONDING_CURVE_POOL_ABI,
            functionName: "tokenReserve",
          }) as Promise<bigint>,
          publicClient.readContract({
            address: params.poolAddress as `0x${string}`,
            abi: AWE_BONDING_CURVE_POOL_ABI,
            functionName: "getAmountIn",
            args: [tokenAmountWei, false],
          }) as Promise<bigint>,
        ]);

        if (isGraduated) {
          throw new Error(
            "Pool has already graduated - no more tokens available for purchase"
          );
        }

        if (tokenReserve === BigInt(0)) {
          throw new Error("No tokens remaining for sale");
        }

        // Check user's AWE token balance
        const userBalance = await publicClient.readContract({
          address: aweTokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        });

        if (userBalance < requiredAweAmount) {
          throw new Error(
            `Insufficient AWE balance. Required: ${
              parseFloat(requiredAweAmount.toString()) / 1e18
            } AWE, Available: ${parseFloat(userBalance.toString()) / 1e18} AWE`
          );
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes("graduated") ||
            error.message.includes("remaining") ||
            error.message.includes("exceeds") ||
            error.message.includes("Insufficient"))
        ) {
          throw error;
        }
        console.error("Pre-flight check failed:", error);
        throw new Error("Failed to validate pool state before purchase");
      }

      // Calculate maximum AWE amount with 1% slippage tolerance
      const maxAweAmount = params.maxAweAmount
        ? parseUnits(params.maxAweAmount, 18)
        : (requiredAweAmount * BigInt(10100)) / BigInt(10000);
      const poolApprovalHash = await writeContractAsync({
        address: aweTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [params.poolAddress as `0x${string}`, maxAweAmount],
        chainId: chainId,
      });

      const poolApprovalReceipt = await publicClient.waitForTransactionReceipt({
        hash: poolApprovalHash,
      });

      if (poolApprovalReceipt.status !== "success") {
        throw new Error("Pool approval failed");
      }

      // Verify AWE allowance after approval
      const allowance = await getAllowance(publicClient, {
        tokenAddress: aweTokenAddress,
        ownerAddress: address!,
        poolAddress: params.poolAddress,
        blockNumber: poolApprovalReceipt.blockNumber,
      });

      if (allowance < maxAweAmount) {
        throw new Error("Insufficient allowance after approval step");
      }

      let hash: Hash;
      try {
        hash = await writeContractAsync({
          address: params.poolAddress as `0x${string}`,
          abi: AWE_BONDING_CURVE_POOL_ABI,
          functionName: "buy_exact_out",
          args: [tokenAmountWei, maxAweAmount],
          chainId: chainId,
        });
      } catch (error) {
        console.error("Buy exact out contract call failed:", error);
        throw handleTradingError(error, "buy");
      }

      setActiveTransaction({
        hash,
        operation: "buy_exact_out",
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: TOKEN_ADDRESS_TIMEOUT,
      });

      // Check if transaction was successful
      if (receipt.status === "reverted") {
        throw new Error(
          "Transaction was reverted. Please check your transaction parameters and try again."
        );
      }

      const tokenCreatedEvent = (await extractEvent(
        publicClient,
        EVENT_EMITTER_ABI,
        receipt,
        "BondingCurveBuy"
      )) as any;

      return { hash, operation: "buy_exact_out", params };
    },

    onError: (error) => {
      console.error("Bonding curve buy exact out failed:", error);

      // Use enhanced wagmi error handling
      const enhancedError = handleWagmiError(error, "bonding-curve", {
        showToast: false, // We'll handle toast manually to avoid duplication
        onRetry: async () => {
          // Retry logic can be implemented here if needed
          buyRejectionToastShown.current = false;
        },
      });

      // Handle user rejection specifically to avoid multiple toasts
      if (enhancedError.errorType === "USER_REJECTED") {
        if (!buyRejectionToastShown.current) {
          buyRejectionToastShown.current = true;
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
          enhancedError.errorType === "INSUFFICIENT_FUNDS"
            ? "Insufficient Balance"
            : enhancedError.errorType === "INSUFFICIENT_NATIVE_TOKEN"
            ? "Insufficient ETH"
            : enhancedError.errorType === "UNSUPPORTED_CHAIN"
            ? "Unsupported Network"
            : enhancedError.errorType === "CHAIN_NOT_CONFIGURED"
            ? "Network Not Added"
            : enhancedError.errorType === "WRONG_NETWORK"
            ? "Wrong Network"
            : enhancedError.errorType === "TOKEN_NOT_FOUND"
            ? "Token Not Found"
            : enhancedError.errorType === "SIGNATURE_FAILED"
            ? "Signature Failed"
            : enhancedError.errorType === "CONTRACT_REVERT"
            ? "Transaction Failed"
            : enhancedError.errorType === "RPC_ERROR"
            ? "Network Error"
            : "Purchase Failed",
        description: enhancedError.userGuidance,
      });
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: bondingCurveContributeQueryKeys.contributions(),
      });
      const params = data.params as BondingCurveBuyExactOutParams;
    },
  });

  // Sell Exact Out mutation
  const sellExactOutMutation = useMutation<
    BondingCurveContributeResult,
    Error,
    BondingCurveSellExactOutParams
  >({
    retry: false,
    mutationFn: async (
      params: BondingCurveSellExactOutParams
    ): Promise<BondingCurveContributeResult> => {
      await validateSellExactOut(params);
      sellRejectionToastShown.current = false;

      // Convert amounts to wei (18 decimals)
      const aweAmountWei = parseUnits(params.aweAmount, 18);

      if (!publicClient) {
        throw new Error("Public client not available");
      }

      // Check if pool has graduated and get required TOKEN amount
      let isGraduated: boolean,
        tokenReserve: bigint,
        requiredTokenAmount: bigint;
      try {
        [isGraduated, tokenReserve, requiredTokenAmount] = await Promise.all([
          publicClient.readContract({
            address: params.poolAddress as `0x${string}`,
            abi: AWE_BONDING_CURVE_POOL_ABI,
            functionName: "isGraduated",
          }) as Promise<boolean>,
          publicClient.readContract({
            address: params.poolAddress as `0x${string}`,
            abi: AWE_BONDING_CURVE_POOL_ABI,
            functionName: "tokenReserve",
          }) as Promise<bigint>,
          publicClient.readContract({
            address: params.poolAddress as `0x${string}`,
            abi: AWE_BONDING_CURVE_POOL_ABI,
            functionName: "getAmountIn",
            args: [aweAmountWei, true],
          }) as Promise<bigint>,
        ]);
        if (isGraduated) {
          throw new Error(
            "Pool has already graduated - selling is no longer available"
          );
        }

        // Use provided token address instead of fetching from contract
        const tokenAddress = params.tokenAddress as `0x${string}`;

        // Check user's token balance
        const userTokenBalance = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        });

        if (userTokenBalance < requiredTokenAmount) {
          throw new Error(
            `Insufficient token balance. Required: ${
              parseFloat(requiredTokenAmount.toString()) / 1e18
            } TOKEN, Available: ${
              parseFloat(userTokenBalance.toString()) / 1e18
            } TOKEN`
          );
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes("graduated") ||
            error.message.includes("Insufficient"))
        ) {
          throw error;
        }
        console.error("Pre-flight check failed:", error);
        throw new Error("Failed to validate pool state before sell");
      }

      // Calculate maximum TOKEN amount with 1% slippage tolerance
      const maxTokenAmount = params.maxTokenAmount
        ? parseUnits(params.maxTokenAmount, 18)
        : (requiredTokenAmount * BigInt(101)) / BigInt(100);

      // Use provided token address for approval
      const tokenAddress = params.tokenAddress as `0x${string}`;

      const poolApprovalHash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [params.poolAddress as `0x${string}`, maxTokenAmount],
        chainId: chainId,
      });

      const poolApprovalReceipt = await publicClient.waitForTransactionReceipt({
        hash: poolApprovalHash,
      });

      if (poolApprovalReceipt.status !== "success") {
        throw new Error("Pool approval failed");
      }

      // Verify TOKEN allowance after approval
      const allowance = await getAllowance(publicClient, {
        tokenAddress: tokenAddress,
        ownerAddress: address!,
        poolAddress: params.poolAddress,
        blockNumber: poolApprovalReceipt.blockNumber,
      });

      if (allowance < maxTokenAmount) {
        throw new Error("Insufficient allowance after approval step");
      }

      let hash: Hash;
      try {
        hash = await writeContractAsync({
          address: params.poolAddress as `0x${string}`,
          abi: AWE_BONDING_CURVE_POOL_ABI,
          functionName: "sell_exact_out",
          args: [aweAmountWei, maxTokenAmount],
          chainId: chainId,
        });
      } catch (error) {
        console.error("Sell exact out contract call failed:", error);
        throw handleTradingError(error, "sell");
      }

      setActiveTransaction({
        hash,
        operation: "sell_exact_out",
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: TOKEN_ADDRESS_TIMEOUT,
      });

      // Check if transaction was successful
      if (receipt.status === "reverted") {
        throw new Error(
          "Transaction was reverted. Please check your transaction parameters and try again."
        );
      }

      const tokenSoldEvent = (await extractEvent(
        publicClient,
        EVENT_EMITTER_ABI,
        receipt,
        "BondingCurveSell"
      )) as any;

      return { hash, operation: "sell_exact_out", params };
    },

    onError: (error) => {
      console.error("Bonding curve sell exact out failed:", error);

      // Use enhanced wagmi error handling
      const enhancedError = handleWagmiError(error, "bonding-curve", {
        showToast: false, // We'll handle toast manually to avoid duplication
        onRetry: async () => {
          // Retry logic can be implemented here if needed
          sellRejectionToastShown.current = false;
        },
      });

      // Handle user rejection specifically to avoid multiple toasts
      if (enhancedError.errorType === "USER_REJECTED") {
        if (!sellRejectionToastShown.current) {
          sellRejectionToastShown.current = true;
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
          enhancedError.errorType === "INSUFFICIENT_FUNDS"
            ? "Insufficient Balance"
            : enhancedError.errorType === "INSUFFICIENT_NATIVE_TOKEN"
            ? "Insufficient ETH"
            : enhancedError.errorType === "UNSUPPORTED_CHAIN"
            ? "Unsupported Network"
            : enhancedError.errorType === "CHAIN_NOT_CONFIGURED"
            ? "Network Not Added"
            : enhancedError.errorType === "WRONG_NETWORK"
            ? "Wrong Network"
            : enhancedError.errorType === "TOKEN_NOT_FOUND"
            ? "Token Not Found"
            : enhancedError.errorType === "SIGNATURE_FAILED"
            ? "Signature Failed"
            : enhancedError.errorType === "CONTRACT_REVERT"
            ? "Transaction Failed"
            : enhancedError.errorType === "RPC_ERROR"
            ? "Network Error"
            : "Sell Failed",
        description: enhancedError.userGuidance,
      });
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: bondingCurveContributeQueryKeys.contributions(),
      });
    },
  });

  // Sell mutation (Sell Exact In)
  const sellMutation = useMutation<
    BondingCurveContributeResult,
    Error,
    BondingCurveSellParams
  >({
    retry: false,
    mutationFn: async (
      params: BondingCurveSellParams
    ): Promise<BondingCurveContributeResult> => {
      validateSell(params);

      // Reset rejection toast flag for new sell attempt
      sellRejectionToastShown.current = false;

      // Convert amounts to wei (18 decimals)
      const tokenAmountWei = parseUnits(params.tokenAmount, 18);

      if (!publicClient) {
        throw new Error("Public client not available");
      }

      // Check if pool has graduated and get expected AWE output
      let isGraduated: boolean, tokenReserve: bigint, expectedAweOut: bigint;
      try {
        [isGraduated, tokenReserve, expectedAweOut] = await Promise.all([
          publicClient.readContract({
            address: params.poolAddress as `0x${string}`,
            abi: AWE_BONDING_CURVE_POOL_ABI,
            functionName: "isGraduated",
          }) as Promise<boolean>,
          publicClient.readContract({
            address: params.poolAddress as `0x${string}`,
            abi: AWE_BONDING_CURVE_POOL_ABI,
            functionName: "tokenReserve",
          }) as Promise<bigint>,
          publicClient.readContract({
            address: params.poolAddress as `0x${string}`,
            abi: AWE_BONDING_CURVE_POOL_ABI,
            functionName: "getAmountOut",
            args: [tokenAmountWei, true],
          }) as Promise<bigint>,
        ]);

        if (isGraduated) {
          throw new Error(
            "Pool has already graduated - selling is no longer available"
          );
        }

        // Use provided token address for token balance check
        const tokenAddress = params.tokenAddress as `0x${string}`;

        const userTokenBalance = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        });

        if (userTokenBalance < tokenAmountWei) {
          throw new Error(
            `Insufficient token balance. Required: ${
              parseFloat(tokenAmountWei.toString()) / 1e18
            } TOKEN, Available: ${
              parseFloat(userTokenBalance.toString()) / 1e18
            } TOKEN`
          );
        }

        // Step 1: Approve TOKEN for the bonding curve pool
        const poolApprovalHash = await writeContractAsync({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [params.poolAddress as `0x${string}`, tokenAmountWei],
          chainId: chainId,
        });

        const poolApprovalReceipt =
          await publicClient.waitForTransactionReceipt({
            hash: poolApprovalHash,
          });

        if (poolApprovalReceipt.status !== "success") {
          throw new Error("Pool approval failed");
        }

        // Verify TOKEN allowance after approval
        const allowance = await getAllowance(publicClient, {
          tokenAddress: tokenAddress,
          ownerAddress: address!,
          poolAddress: params.poolAddress,
          blockNumber: poolApprovalReceipt.blockNumber,
        });

        if (allowance < tokenAmountWei) {
          throw new Error("Insufficient allowance after approval step");
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes("graduated") ||
            error.message.includes("Insufficient") ||
            error.message.includes("allowance"))
        ) {
          throw error;
        }
        console.error("Pre-flight check failed:", error);
        throw new Error("Failed to validate pool state before sell");
      }

      // Calculate minimum AWE output with 1% slippage tolerance
      const minAweOut = (expectedAweOut * BigInt(99)) / BigInt(100);

      let hash: Hash;
      try {
        hash = await writeContractAsync({
          address: params.poolAddress as `0x${string}`,
          abi: AWE_BONDING_CURVE_POOL_ABI,
          functionName: "sell_exact_in",
          args: [tokenAmountWei, minAweOut],
          chainId: chainId,
        });
      } catch (error) {
        console.error("Sell exact in contract call failed:", error);
        throw handleTradingError(error, "sell");
      }

      setActiveTransaction({
        hash,
        operation: "sell",
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: TOKEN_ADDRESS_TIMEOUT,
      });

      // Check if transaction was successful
      if (receipt.status === "reverted") {
        throw new Error(
          "Transaction was reverted. Please check your transaction parameters and try again."
        );
      }

      const tokenSoldEvent = (await extractEvent(
        publicClient,
        EVENT_EMITTER_ABI,
        receipt,
        "BondingCurveSell"
      )) as any;

      return { hash, operation: "sell", params };
    },

    onError: (error) => {
      console.error("Bonding curve sell failed:", error);

      // Use enhanced wagmi error handling
      const enhancedError = handleWagmiError(error, "bonding-curve", {
        showToast: false,
        onRetry: async () => {
          sellRejectionToastShown.current = false;
        },
      });

      // Handle user rejection specifically to avoid multiple toasts
      if (enhancedError.errorType === "USER_REJECTED") {
        if (!sellRejectionToastShown.current) {
          sellRejectionToastShown.current = true;
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
          enhancedError.errorType === "INSUFFICIENT_FUNDS"
            ? "Insufficient Balance"
            : enhancedError.errorType === "INSUFFICIENT_NATIVE_TOKEN"
            ? "Insufficient ETH"
            : enhancedError.errorType === "UNSUPPORTED_CHAIN"
            ? "Unsupported Network"
            : enhancedError.errorType === "CHAIN_NOT_CONFIGURED"
            ? "Network Not Added"
            : enhancedError.errorType === "WRONG_NETWORK"
            ? "Wrong Network"
            : enhancedError.errorType === "TOKEN_NOT_FOUND"
            ? "Token Not Found"
            : enhancedError.errorType === "SIGNATURE_FAILED"
            ? "Signature Failed"
            : enhancedError.errorType === "CONTRACT_REVERT"
            ? "Transaction Failed"
            : enhancedError.errorType === "RPC_ERROR"
            ? "Network Error"
            : "Sell Failed",
        description: enhancedError.userGuidance,
      });
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: bondingCurveContributeQueryKeys.contributions(),
      });
    },
  });

  const activeTransactionHash = activeTransaction?.hash ?? null;
  const activeOperation = activeTransaction?.operation ?? null;

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: activeTransactionHash ?? undefined,
    query: { enabled: !!activeTransactionHash },
  });

  // Transaction confirmation effect
  useEffect(() => {
    if (isConfirmed && activeTransactionHash) {
      if (lastConfirmedHashRef.current === activeTransactionHash) {
        return;
      }

      lastConfirmedHashRef.current = activeTransactionHash;

      queryClient.invalidateQueries({
        queryKey: bondingCurveContributeQueryKeys.contributions(),
      });

      if (activeOperation === "buy" || activeOperation === "buy_exact_out") {
        success({
          title: "Purchase Confirmed",
          description:
            "Your token purchase has been confirmed on the blockchain",
        });
      } else if (
        activeOperation === "sell" ||
        activeOperation === "sell_exact_out"
      ) {
        success({
          title: "Sell Confirmed",
          description: "Your token sale has been confirmed on the blockchain",
        });
      }
    }
  }, [
    isConfirmed,
    activeTransactionHash,
    success,
    queryClient,
    activeOperation,
  ]);

  // Error handling effect
  useEffect(() => {
    if (receiptError) {
      console.error("Bonding curve transaction error:", receiptError);

      // Use enhanced wagmi error handling for receipt errors
      const enhancedError = handleWagmiError(receiptError, "bonding-curve", {
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
    if (
      buyMutation.isPending ||
      buyExactOutMutation.isPending ||
      sellMutation.isPending ||
      sellExactOutMutation.isPending
    )
      return "preparing";
    if (activeTransactionHash && isConfirming) return "pending";
    if (isConfirmed) return "success";

    // Check for user cancellation first
    if (
      buyMutation.error?.message?.includes("User rejected") ||
      buyExactOutMutation.error?.message?.includes("User rejected") ||
      sellMutation.error?.message?.includes("User rejected") ||
      sellExactOutMutation.error?.message?.includes("User rejected")
    ) {
      return "cancelled";
    }
    if (receiptError?.message?.includes("User rejected")) {
      return "cancelled";
    }

    // Then check for other errors
    if (
      buyMutation.error ||
      buyExactOutMutation.error ||
      sellMutation.error ||
      sellExactOutMutation.error ||
      receiptError
    )
      return "error";
    return "idle";
  }, [
    buyMutation.isPending,
    buyExactOutMutation.isPending,
    sellMutation.isPending,
    sellExactOutMutation.isPending,
    buyMutation.error,
    buyExactOutMutation.error,
    sellMutation.error,
    sellExactOutMutation.error,
    activeTransactionHash,
    isConfirming,
    isConfirmed,
    receiptError,
  ]);

  // Get current step description for UI
  const currentStep = useMemo(() => {
    if (buyMutation.isPending || buyExactOutMutation.isPending)
      return "Approving AWE tokens...";
    if (sellMutation.isPending || sellExactOutMutation.isPending)
      return "Approving tokens...";
    if (activeTransactionHash && isConfirming)
      return "Confirming transaction...";
    if (isConfirmed) return "Transaction completed!";
    if (
      buyMutation.error ||
      buyExactOutMutation.error ||
      sellMutation.error ||
      sellExactOutMutation.error ||
      receiptError
    )
      return "Transaction failed";
    return "Ready to transact";
  }, [
    buyMutation.isPending,
    buyExactOutMutation.isPending,
    sellMutation.isPending,
    sellExactOutMutation.isPending,
    buyMutation.error,
    buyExactOutMutation.error,
    sellMutation.error,
    sellExactOutMutation.error,
    activeTransactionHash,
    isConfirming,
    isConfirmed,
    receiptError,
  ]);

  // Combined error
  const combinedError = useMemo(
    () =>
      buyMutation.error ||
      buyExactOutMutation.error ||
      sellMutation.error ||
      sellExactOutMutation.error ||
      receiptError,
    [
      buyMutation.error,
      buyExactOutMutation.error,
      sellMutation.error,
      sellExactOutMutation.error,
      receiptError,
    ]
  );

  // Reset function
  const reset = useCallback(() => {
    buyMutation.reset();
    buyExactOutMutation.reset();
    sellMutation.reset();
    sellExactOutMutation.reset();
    buyRejectionToastShown.current = false;
    sellRejectionToastShown.current = false;
    setActiveTransaction(null);
    lastConfirmedHashRef.current = null;
    queryClient.invalidateQueries({
      queryKey: bondingCurveContributeQueryKeys.contributions(),
    });
  }, [
    buyMutation,
    buyExactOutMutation,
    sellMutation,
    sellExactOutMutation,
    setActiveTransaction,
    queryClient,
  ]);

  // Buy and sell methods
  const buy = useCallback(
    (params: BondingCurveBuyParams) => {
      return buyMutation.mutateAsync(params);
    },
    [buyMutation]
  );

  const sell = useCallback(
    (params: BondingCurveSellParams) => {
      return sellMutation.mutateAsync(params);
    },
    [sellMutation]
  );

  const sellExactOut = useCallback(
    (params: BondingCurveSellExactOutParams) => {
      return sellExactOutMutation.mutateAsync(params);
    },
    [sellExactOutMutation]
  );

  const buyExactOut = useCallback(
    (params: BondingCurveBuyExactOutParams) => {
      return buyExactOutMutation.mutateAsync(params);
    },
    [buyExactOutMutation]
  );

  return {
    // Core operation methods
    buy,
    buyExactOut,
    sell,
    sellExactOut,
    reset,

    // Legacy method for backward compatibility
    buyTokens: buyMutation.mutate,
    buyTokensAsync: buyMutation.mutateAsync,

    // State
    isPreparing:
      buyMutation.isPending ||
      buyExactOutMutation.isPending ||
      sellMutation.isPending ||
      sellExactOutMutation.isPending,
    isWaitingApproval:
      buyMutation.isPending ||
      buyExactOutMutation.isPending ||
      sellMutation.isPending ||
      sellExactOutMutation.isPending,
    isConfirming,
    isConfirmed,

    // Data
    hash: activeTransactionHash,
    error: combinedError,

    // Computed status
    status,
    currentStep,

    // Validation helpers
    validateBuy,
    validateBuyExactOut,
    validateSell,
    validateSellExactOut,
  } as const;
}
