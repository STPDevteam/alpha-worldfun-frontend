import {
  exceptionManager,
  type CategorizedError as ExceptionManagerError,
} from "@/libs/services/exception-manager.service";
import { chainSwitchService } from "@/libs/services/chain-switch.service";
import type { BaseError } from "viem";

/**
 * Get network name based on environment
 */
const getNetworkName = (): string => {
  const network = process.env.NEXT_PUBLIC_NETWORK || "testnet";
  return network === "mainnet" ? "Base" : "Base Sepolia";
};

/**
 * Get network display text for error messages
 */
const getNetworkDisplayText = (): {
  name: string;
  selectInstruction: string;
  addInstruction: string;
} => {
  const networkName = getNetworkName();
  return {
    name: networkName,
    selectInstruction: `Select ${networkName} from the list`,
    addInstruction: `Add ${networkName} network to your wallet first`,
  };
};

export type TransactionErrorType =
  | "INSUFFICIENT_FUNDS"
  | "INSUFFICIENT_GAS"
  | "USER_REJECTED"
  | "SIGNATURE_FAILED"
  | "BROADCAST_FAILED"
  | "SEQUENCE_MISMATCH"
  | "PAIR_EXISTS"
  | "UNKNOWN";

export type EnhancedTransactionErrorType =
  | "WALLET_NOT_CONNECTED"
  | "WALLET_LOCKED"
  | "WRONG_NETWORK"
  | "UNSUPPORTED_CHAIN"
  | "CHAIN_NOT_CONFIGURED"
  | "USER_REJECTED"
  | "INSUFFICIENT_FUNDS"
  | "INSUFFICIENT_GAS"
  | "INSUFFICIENT_NATIVE_TOKEN"
  | "TOKEN_NOT_FOUND"
  | "BALANCE_CHECK_FAILED"
  | "SEQUENCE_MISMATCH"
  | "TRANSACTION_TIMEOUT"
  | "SIGNATURE_FAILED"
  | "BROADCAST_FAILED"
  | "PAIR_EXISTS"
  | "PAIR_NOT_FOUND"
  | "SLIPPAGE_EXCEEDED"
  | "LIQUIDITY_TOO_LOW"
  | "PRICE_IMPACT_HIGH"
  | "NETWORK_CONGESTION"
  | "RPC_ERROR"
  | "TIMEOUT"
  | "CONTRACT_REVERT"
  | "INVARIANT_VIOLATION"
  | "UNAUTHORIZED"
  | "SESSION_VALIDATION_FAILED"
  | "SESSION_INCONSISTENT_STATE"
  | "SESSION_CONNECTION_LOST"
  | "SESSION_NETWORK_ERROR"
  | "SESSION_WALLET_LOCKED"
  | "SESSION_PING_TIMEOUT"
  | "UNKNOWN";

export type ErrorSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export interface ErrorRecoveryOptions {
  canRetry: boolean;
  retryAction?: () => Promise<void>;
  fallbackAction?: () => Promise<void>;
  userGuidance: string;
  documentationLink?: string;
  severity: ErrorSeverity;
  maxRetries?: number;
  retryDelay?: number;
}

export interface CategorizedError extends Error {
  errorType?: TransactionErrorType;
}

export interface EnhancedCategorizedError extends Error {
  errorType: EnhancedTransactionErrorType;
  severity: ErrorSeverity;
  context: string;
  retryable: boolean;
  recoveryOptions?: ErrorRecoveryOptions;
  userGuidance: string;
  timestamp: number;
  originalError?: Error;
}

export interface ErrorMessages {
  title: string;
  description: string;
}

export interface EnhancedErrorMessages {
  title: string;
  description: string;
  guidance: string;
  action?: string;
  recoverySteps?: string[];
  technicalDetails?: string;
}

const getErrorConfigurations = (): Record<
  EnhancedTransactionErrorType,
  {
    severity: ErrorSeverity;
    retryable: boolean;
    messages: EnhancedErrorMessages;
  }
> => {
  const networkText = getNetworkDisplayText();

  return {
    WALLET_NOT_CONNECTED: {
      severity: "ERROR",
      retryable: false,
      messages: {
        title: "Wallet not connected",
        description: "Please connect your wallet to continue",
        guidance: "Click the 'Connect Wallet' button to proceed",
        action: "Connect Wallet",
      },
    },
    WALLET_LOCKED: {
      severity: "ERROR",
      retryable: false,
      messages: {
        title: "Wallet is locked",
        description: "Please unlock your wallet to continue",
        guidance: "Open your wallet extension and enter your password",
        action: "Unlock Wallet",
      },
    },
    WRONG_NETWORK: {
      severity: "ERROR",
      retryable: false,
      messages: {
        title: "Wrong network",
        description: `Please switch to ${networkText.name}`,
        guidance: `Use your wallet to switch to ${networkText.name}`,
        action: "Switch Network",
      },
    },
    UNSUPPORTED_CHAIN: {
      severity: "ERROR",
      retryable: false,
      messages: {
        title: "Unsupported network",
        description: "This network is not supported by the application",
        guidance: `Please switch to ${networkText.name}`,
        action: "Switch Network",
        recoverySteps: [
          "Open your wallet",
          "Click on the network dropdown",
          networkText.selectInstruction,
          "Return to the application",
        ],
      },
    },
    CHAIN_NOT_CONFIGURED: {
      severity: "ERROR",
      retryable: false,
      messages: {
        title: "Network not configured",
        description: "This network is not configured in your wallet",
        guidance: networkText.addInstruction,
        action: "Add Network",
        recoverySteps: [
          "Open your wallet settings",
          `Add ${networkText.name} network manually`,
          "Switch to the new network",
          "Return to the application",
        ],
      },
    },
    INSUFFICIENT_NATIVE_TOKEN: {
      severity: "ERROR",
      retryable: false,
      messages: {
        title: "Insufficient ETH for gas",
        description: "You need ETH to pay for transaction fees",
        guidance: "Add ETH to your wallet to cover gas costs",
        action: "Add ETH",
        recoverySteps: [
          "Get ETH from a faucet or exchange",
          "Transfer ETH to your wallet",
          "Wait for confirmation",
          "Try the transaction again",
        ],
      },
    },
    TOKEN_NOT_FOUND: {
      severity: "ERROR",
      retryable: false,
      messages: {
        title: "Token not found",
        description: "The required token was not found in your wallet",
        guidance: "Make sure you have the correct token in your wallet",
        action: "Check Token",
        recoverySteps: [
          "Verify the token contract address",
          "Add the token to your wallet if needed",
          "Check if you're on the correct network",
          "Ensure you have a token balance",
        ],
      },
    },
    BALANCE_CHECK_FAILED: {
      severity: "WARNING",
      retryable: true,
      messages: {
        title: "Unable to check balance",
        description: "Failed to verify your token balance",
        guidance:
          "This might be a temporary network issue. Try again in a moment",
        action: "Retry",
      },
    },
    USER_REJECTED: {
      severity: "INFO",
      retryable: true,
      messages: {
        title: "Transaction cancelled",
        description: "You cancelled the transaction",
        guidance: "Try again when you're ready to proceed",
      },
    },
    INSUFFICIENT_FUNDS: {
      severity: "ERROR",
      retryable: false,
      messages: {
        title: "Insufficient balance",
        description: "You don't have enough funds for this transaction",
        guidance:
          "Add more funds to your wallet or reduce the transaction amount",
      },
    },
    INSUFFICIENT_GAS: {
      severity: "ERROR",
      retryable: true,
      messages: {
        title: "Insufficient gas",
        description: "Not enough gas to complete the transaction",
        guidance:
          "Increase gas limit or try again when network is less congested",
      },
    },
    SEQUENCE_MISMATCH: {
      severity: "WARNING",
      retryable: true,
      messages: {
        title: "Network sequence error",
        description: "Transaction sequence is out of order",
        guidance: "Wait a moment and try again",
      },
    },
    TRANSACTION_TIMEOUT: {
      severity: "WARNING",
      retryable: true,
      messages: {
        title: "Transaction timeout",
        description: "Transaction took too long to process",
        guidance: "Try again with higher gas price for faster processing",
      },
    },
    SIGNATURE_FAILED: {
      severity: "ERROR",
      retryable: true,
      messages: {
        title: "Signature failed",
        description: "Failed to sign the transaction",
        guidance: "Try signing the transaction again in your wallet",
      },
    },
    BROADCAST_FAILED: {
      severity: "ERROR",
      retryable: true,
      messages: {
        title: "Broadcast failed",
        description: "Failed to send transaction to network",
        guidance: "Check your internet connection and try again",
      },
    },
    PAIR_EXISTS: {
      severity: "INFO",
      retryable: false,
      messages: {
        title: "Trading pair exists",
        description: "This trading pair has already been created",
        guidance: "You can trade this pair or create a different one",
      },
    },
    PAIR_NOT_FOUND: {
      severity: "ERROR",
      retryable: false,
      messages: {
        title: "Trading pair not found",
        description: "This trading pair doesn't exist",
        guidance: "Create the trading pair first or check the token addresses",
      },
    },
    SLIPPAGE_EXCEEDED: {
      severity: "WARNING",
      retryable: true,
      messages: {
        title: "Slippage exceeded",
        description: "Price changed more than your slippage tolerance",
        guidance: "Increase slippage tolerance or try again",
      },
    },
    LIQUIDITY_TOO_LOW: {
      severity: "WARNING",
      retryable: false,
      messages: {
        title: "Insufficient liquidity",
        description: "Not enough liquidity for this trade size",
        guidance: "Reduce trade amount or add liquidity to the pool",
      },
    },
    PRICE_IMPACT_HIGH: {
      severity: "WARNING",
      retryable: true,
      messages: {
        title: "High price impact",
        description: "This trade will significantly affect the token price",
        guidance:
          "Consider reducing trade size or splitting into smaller trades",
      },
    },
    NETWORK_CONGESTION: {
      severity: "WARNING",
      retryable: true,
      messages: {
        title: "Network congested",
        description: "Network is experiencing high traffic",
        guidance: "Try again later or increase gas price for faster processing",
      },
    },
    RPC_ERROR: {
      severity: "ERROR",
      retryable: true,
      messages: {
        title: "Network error",
        description: "Failed to connect to blockchain network",
        guidance: "Check your internet connection and try again",
      },
    },
    TIMEOUT: {
      severity: "WARNING",
      retryable: true,
      messages: {
        title: "Request timeout",
        description: "Request took too long to complete",
        guidance: "Try again or check your network connection",
      },
    },
    CONTRACT_REVERT: {
      severity: "ERROR",
      retryable: false,
      messages: {
        title: "Contract error",
        description: "Smart contract rejected the transaction",
        guidance: "Check transaction parameters and contract conditions",
      },
    },
    INVARIANT_VIOLATION: {
      severity: "CRITICAL",
      retryable: false,
      messages: {
        title: "Invariant violation",
        description: "Transaction would violate pool invariants",
        guidance:
          "This transaction cannot be completed due to protocol constraints",
      },
    },
    UNAUTHORIZED: {
      severity: "ERROR",
      retryable: false,
      messages: {
        title: "Unauthorized",
        description: "You don't have permission for this action",
        guidance: "Make sure you're using the correct wallet address",
      },
    },
    SESSION_VALIDATION_FAILED: {
      severity: "ERROR",
      retryable: false,
      messages: {
        title: "Wallet Connection Expired",
        description:
          "Unable to validate wallet connection. Session may be stale.",
        guidance:
          "Please disconnect and reconnect your wallet to ensure secure connection.",
        action: "Reconnect Wallet",
      },
    },
    SESSION_INCONSISTENT_STATE: {
      severity: "WARNING",
      retryable: false,
      messages: {
        title: "Wallet Connection Issue Detected",
        description:
          "Your wallet connection is in an inconsistent state and needs to be reset",
        guidance:
          "We'll automatically clean up the connection. Please reconnect your wallet to continue.",
        action: "Reconnect Wallet",
        recoverySteps: [
          "Click 'Connect Wallet' button",
          "Select your wallet type",
          "Approve the connection request",
        ],
        technicalDetails:
          "Provider instance exists but session is missing - automatic cleanup performed",
      },
    },
    SESSION_CONNECTION_LOST: {
      severity: "ERROR",
      retryable: true,
      messages: {
        title: "Wallet Connection Lost",
        description:
          "Unable to communicate with your wallet. The connection may have timed out.",
        guidance: "Check that your wallet is open and try reconnecting.",
        action: "Reconnect Wallet",
        recoverySteps: [
          "Ensure your wallet extension is open and unlocked",
          "Check your internet connection",
          "Click 'Reconnect' to establish a new connection",
        ],
        technicalDetails: "Ping to wallet session failed or timed out",
      },
    },
    SESSION_NETWORK_ERROR: {
      severity: "ERROR",
      retryable: true,
      messages: {
        title: "Network Connection Issue",
        description:
          "Unable to connect to your wallet due to network problems.",
        guidance: "Check your internet connection and try again.",
        action: "Retry Connection",
        recoverySteps: [
          "Check your internet connection",
          "Disable VPN if active",
          "Try refreshing the page",
        ],
        technicalDetails:
          "Network connectivity issues preventing wallet communication",
      },
    },
    SESSION_WALLET_LOCKED: {
      severity: "ERROR",
      retryable: false,
      messages: {
        title: "Wallet Locked",
        description:
          "Your wallet extension appears to be locked or unavailable.",
        guidance:
          "Please unlock your wallet extension and try connecting again.",
        action: "Unlock Wallet",
        recoverySteps: [
          "Open your wallet extension",
          "Enter your wallet password",
          "Return to this page and reconnect",
        ],
        technicalDetails:
          "Wallet extension is locked or not responding to connection requests",
      },
    },
    SESSION_PING_TIMEOUT: {
      severity: "WARNING",
      retryable: true,
      messages: {
        title: "Wallet Not Responding",
        description:
          "Connection check to wallet did not receive response in time.",
        guidance:
          "Ensure wallet application is open and active, then try again.",
      },
    },
    UNKNOWN: {
      severity: "ERROR",
      retryable: true,
      messages: {
        title: "Unknown error",
        description: "An unexpected error occurred",
        guidance: "Please try again or contact support if the problem persists",
      },
    },
  };
};

export const getErrorMessages = (
  errorType?: TransactionErrorType,
  context?: string
): ErrorMessages => {
  const contextLabel = context || "transaction";

  switch (errorType) {
    case "INSUFFICIENT_FUNDS":
      return {
        title: `Insufficient balance to ${contextLabel}`,
        description: "Please add more funds to your wallet",
      };
    case "INSUFFICIENT_GAS":
      return {
        title: "Insufficient gas for transaction",
        description: "Please try again with more gas",
      };
    case "USER_REJECTED":
      return {
        title: "Transaction was cancelled",
        description: "You cancelled the transaction",
      };
    case "SIGNATURE_FAILED":
      return {
        title: "Signature failed",
        description: "Please try signing the transaction again",
      };
    case "BROADCAST_FAILED":
      return {
        title: "Failed to broadcast transaction",
        description: "Please check your connection and try again",
      };
    case "SEQUENCE_MISMATCH":
      return {
        title: "Network sequence error",
        description: "Please wait a moment and try again",
      };
    case "PAIR_EXISTS":
      return {
        title: "Trading pair already exists",
        description: "This token pair has already been created",
      };
    default:
      return {
        title: `Failed to ${contextLabel}`,
        description: "Please try again",
      };
  }
};

export const getEnhancedErrorMessages = (
  errorType: EnhancedTransactionErrorType,
  context?: string,
  errorContext?: string
): EnhancedErrorMessages => {
  const config = getErrorConfigurations()[errorType];
  const messages = { ...config.messages };

  if (context) {
    messages.title = messages.title.replace(/transaction/i, context);
  }

  if (errorContext && errorType === "SESSION_INCONSISTENT_STATE") {
    messages.description = `${messages.description} (${errorContext})`;
  }

  return messages;
};

export const getErrorConfiguration = (
  errorType: EnhancedTransactionErrorType
): { severity: ErrorSeverity; retryable: boolean } => {
  const config = getErrorConfigurations()[errorType];
  return {
    severity: config.severity,
    retryable: config.retryable,
  };
};

export const createEnhancedError = (
  message: string,
  errorType: EnhancedTransactionErrorType,
  context: string,
  errorContext?: string,
  originalError?: Error
): EnhancedCategorizedError => {
  const config = getErrorConfiguration(errorType);
  const errorMessages = getEnhancedErrorMessages(
    errorType,
    context,
    errorContext
  );

  const error = new Error(message) as EnhancedCategorizedError;
  error.errorType = errorType;
  error.severity = config.severity;
  error.context = context;
  error.retryable = config.retryable;
  error.userGuidance = errorMessages.guidance;
  error.timestamp = Date.now();
  error.originalError = originalError;

  return error;
};

export const categorizeTransactionError = (
  error: unknown,
  context: "bonding-curve" | "dao-pool" | "token-factory"
): EnhancedCategorizedError => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();
  const originalError = error instanceof Error ? error : undefined;

  // Check for wallet connection errors first
  if (
    lowerMessage.includes("wallet not connected") ||
    lowerMessage.includes("no wallet connected") ||
    lowerMessage.includes("please connect wallet")
  ) {
    return createEnhancedError(
      errorMessage,
      "WALLET_NOT_CONNECTED",
      context,
      undefined,
      originalError
    );
  }

  if (
    lowerMessage.includes("wallet is locked") ||
    lowerMessage.includes("unlock your wallet") ||
    lowerMessage.includes("wallet locked")
  ) {
    return createEnhancedError(
      errorMessage,
      "WALLET_LOCKED",
      context,
      undefined,
      originalError
    );
  }

  // Check for network-related errors
  if (
    lowerMessage.includes("unsupported chain") ||
    lowerMessage.includes("chain not supported") ||
    lowerMessage.includes("unsupported network") ||
    lowerMessage.includes("network not supported")
  ) {
    return createEnhancedError(
      errorMessage,
      "UNSUPPORTED_CHAIN",
      context,
      undefined,
      originalError
    );
  }

  if (
    lowerMessage.includes("chain not added") ||
    lowerMessage.includes("network not added") ||
    lowerMessage.includes("chain not configured") ||
    lowerMessage.includes("network not configured") ||
    lowerMessage.includes("unrecognized chain id")
  ) {
    return createEnhancedError(
      errorMessage,
      "CHAIN_NOT_CONFIGURED",
      context,
      undefined,
      originalError
    );
  }

  if (
    lowerMessage.includes("wrong network") ||
    lowerMessage.includes("incorrect network") ||
    lowerMessage.includes("switch network") ||
    lowerMessage.includes("please switch to") ||
    lowerMessage.includes("switch to a supported network")
  ) {
    return createEnhancedError(
      errorMessage,
      "WRONG_NETWORK",
      context,
      undefined,
      originalError
    );
  }

  // Check for gas and native token errors
  if (
    lowerMessage.includes("insufficient funds for gas") ||
    lowerMessage.includes("insufficient eth") ||
    lowerMessage.includes("not enough eth") ||
    lowerMessage.includes("insufficient native token") ||
    lowerMessage.includes("need eth for gas")
  ) {
    return createEnhancedError(
      errorMessage,
      "INSUFFICIENT_NATIVE_TOKEN",
      context,
      undefined,
      originalError
    );
  }

  // Check for token-specific errors
  if (
    lowerMessage.includes("token not found") ||
    lowerMessage.includes("token does not exist") ||
    lowerMessage.includes("invalid token") ||
    lowerMessage.includes("token address not found")
  ) {
    return createEnhancedError(
      errorMessage,
      "TOKEN_NOT_FOUND",
      context,
      undefined,
      originalError
    );
  }

  if (
    lowerMessage.includes("failed to check balance") ||
    lowerMessage.includes("balance check failed") ||
    lowerMessage.includes("cannot read balance")
  ) {
    return createEnhancedError(
      errorMessage,
      "BALANCE_CHECK_FAILED",
      context,
      undefined,
      originalError
    );
  }

  // Check for general insufficient funds (after specific checks)
  if (
    lowerMessage.includes("insufficient funds") ||
    lowerMessage.includes("insufficient balance") ||
    lowerMessage.includes("not enough balance")
  ) {
    return createEnhancedError(
      errorMessage,
      "INSUFFICIENT_FUNDS",
      context,
      undefined,
      originalError
    );
  }

  if (
    lowerMessage.includes("insufficient gas") ||
    lowerMessage.includes("out of gas")
  ) {
    return createEnhancedError(
      errorMessage,
      "INSUFFICIENT_GAS",
      context,
      undefined,
      originalError
    );
  }

  if (
    lowerMessage.includes("user rejected") ||
    lowerMessage.includes("user denied") ||
    lowerMessage.includes("cancelled")
  ) {
    return createEnhancedError(
      errorMessage,
      "USER_REJECTED",
      context,
      undefined,
      originalError
    );
  }

  if (
    lowerMessage.includes("sequence mismatch") ||
    lowerMessage.includes("account sequence")
  ) {
    return createEnhancedError(
      errorMessage,
      "SEQUENCE_MISMATCH",
      context,
      undefined,
      originalError
    );
  }

  if (
    lowerMessage.includes("signature failed") ||
    lowerMessage.includes("sign failed")
  ) {
    return createEnhancedError(
      errorMessage,
      "SIGNATURE_FAILED",
      context,
      undefined,
      originalError
    );
  }

  if (
    lowerMessage.includes("broadcast failed") ||
    lowerMessage.includes("failed to broadcast")
  ) {
    return createEnhancedError(
      errorMessage,
      "BROADCAST_FAILED",
      context,
      undefined,
      originalError
    );
  }

  if (lowerMessage.includes("timeout") || lowerMessage.includes("timed out")) {
    return createEnhancedError(
      errorMessage,
      "TRANSACTION_TIMEOUT",
      context,
      undefined,
      originalError
    );
  }

  if (context === "bonding-curve") {
    if (
      lowerMessage.includes("slippage") ||
      lowerMessage.includes("price changed")
    ) {
      return createEnhancedError(
        errorMessage,
        "SLIPPAGE_EXCEEDED",
        context,
        undefined,
        originalError
      );
    }

    if (
      lowerMessage.includes("pair not found") ||
      lowerMessage.includes("pool not found")
    ) {
      return createEnhancedError(
        errorMessage,
        "PAIR_NOT_FOUND",
        context,
        undefined,
        originalError
      );
    }

    if (
      lowerMessage.includes("insufficient liquidity") ||
      lowerMessage.includes("not enough liquidity")
    ) {
      return createEnhancedError(
        errorMessage,
        "LIQUIDITY_TOO_LOW",
        context,
        undefined,
        originalError
      );
    }

    if (
      lowerMessage.includes("pair exists") ||
      lowerMessage.includes("pool exists")
    ) {
      return createEnhancedError(
        errorMessage,
        "PAIR_EXISTS",
        context,
        undefined,
        originalError
      );
    }

    if (lowerMessage.includes("graduated")) {
      return createEnhancedError(
        errorMessage,
        "CONTRACT_REVERT",
        context,
        undefined,
        originalError
      );
    }
  }

  if (context === "dao-pool") {
    if (
      lowerMessage.includes("unauthorized") ||
      lowerMessage.includes("permission denied")
    ) {
      return createEnhancedError(
        errorMessage,
        "UNAUTHORIZED",
        context,
        undefined,
        originalError
      );
    }
  }

  if (context === "token-factory") {
    if (
      lowerMessage.includes("unauthorized") ||
      lowerMessage.includes("permission denied")
    ) {
      return createEnhancedError(
        errorMessage,
        "UNAUTHORIZED",
        context,
        undefined,
        originalError
      );
    }

    if (
      lowerMessage.includes("denom exists") ||
      lowerMessage.includes("subdenom already exists")
    ) {
      return createEnhancedError(
        errorMessage,
        "PAIR_EXISTS",
        context,
        undefined,
        originalError
      );
    }
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("connection")) {
    return createEnhancedError(
      errorMessage,
      "RPC_ERROR",
      context,
      undefined,
      originalError
    );
  }

  if (lowerMessage.includes("contract") || lowerMessage.includes("execute")) {
    return createEnhancedError(
      errorMessage,
      "CONTRACT_REVERT",
      context,
      undefined,
      originalError
    );
  }

  return createEnhancedError(
    errorMessage,
    "UNKNOWN",
    context,
    undefined,
    originalError
  );
};

export const handleContractError = (
  error: unknown,
  context: "bonding-curve" | "dao-pool" | "token-factory",
  options?: {
    showToast?: boolean;
    onRetry?: () => Promise<void>;
    onFallback?: () => Promise<void>;
    onChainError?: (error: EnhancedCategorizedError) => Promise<void>;
  }
): EnhancedCategorizedError => {
  const enhancedError = categorizeTransactionError(error, context);
  const { showToast = true, onRetry, onFallback, onChainError } = options || {};

  // Check if this is a chain-related error
  const isChainError =
    enhancedError.errorType === "WRONG_NETWORK" ||
    enhancedError.errorType === "UNSUPPORTED_CHAIN" ||
    enhancedError.errorType === "CHAIN_NOT_CONFIGURED";

  // Automatically handle chain errors
  if (isChainError) {
    if (onChainError) {
      onChainError(enhancedError).catch((err) => {
        console.error("Chain error handler failed:", err);
      });
    } else {
      chainSwitchService.handleChainError(enhancedError);
    }
  }

  // Add recovery options if provided
  if (onRetry && enhancedError.retryable) {
    enhancedError.recoveryOptions = {
      canRetry: true,
      retryAction: onRetry,
      fallbackAction: onFallback,
      userGuidance: enhancedError.userGuidance,
      severity: enhancedError.severity,
    };
  }

  // Use the existing exception manager for toast handling (skip if chain error and callback provided)
  if (showToast && !(isChainError && onChainError)) {
    const errorMessages = getEnhancedErrorMessages(
      enhancedError.errorType,
      context
    );
    exceptionManager.handleError(enhancedError.originalError || enhancedError, {
      showToast: true,
      customMessage: errorMessages.description,
    });
  }

  // Log enhanced error details
  console.error("[ContractErrorHandler]", {
    errorType: enhancedError.errorType,
    severity: enhancedError.severity,
    context: enhancedError.context,
    retryable: enhancedError.retryable,
    userGuidance: enhancedError.userGuidance,
    timestamp: enhancedError.timestamp,
    originalError: enhancedError.originalError,
  });

  return enhancedError;
};

/**
 * Enhanced error handler specifically for wagmi/viem errors with wallet-specific detection
 */
export const categorizeWagmiError = (
  error: unknown,
  context: "bonding-curve" | "dao-pool" | "token-factory"
): EnhancedCategorizedError => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();
  const originalError = error instanceof Error ? error : undefined;

  // Check for viem BaseError properties
  const isViemError = error && typeof error === "object" && "name" in error;
  const errorName = isViemError ? (error as any).name : "";
  const errorCode = isViemError ? (error as any).code : undefined;

  // Wagmi/Viem specific error patterns
  if (
    errorName === "ConnectorNotConnectedError" ||
    lowerMessage.includes("connector not connected")
  ) {
    return createEnhancedError(
      errorMessage,
      "WALLET_NOT_CONNECTED",
      context,
      undefined,
      originalError
    );
  }

  if (
    errorName === "ChainNotConfiguredError" ||
    lowerMessage.includes("chain not configured")
  ) {
    return createEnhancedError(
      errorMessage,
      "CHAIN_NOT_CONFIGURED",
      context,
      undefined,
      originalError
    );
  }

  if (
    errorName === "SwitchChainError" ||
    lowerMessage.includes("switch chain")
  ) {
    return createEnhancedError(
      errorMessage,
      "WRONG_NETWORK",
      context,
      undefined,
      originalError
    );
  }

  // Viem contract errors
  if (
    errorName === "ContractFunctionExecutionError" ||
    errorName === "EstimateGasExecutionError"
  ) {
    // Check for specific revert reasons in the error details
    if (lowerMessage.includes("insufficient allowance")) {
      return createEnhancedError(
        `Insufficient token allowance: ${errorMessage}`,
        "INSUFFICIENT_FUNDS",
        context,
        "Token approval required",
        originalError
      );
    }

    if (lowerMessage.includes("insufficient balance")) {
      return createEnhancedError(
        `Insufficient token balance: ${errorMessage}`,
        "INSUFFICIENT_FUNDS",
        context,
        "Not enough tokens",
        originalError
      );
    }

    if (lowerMessage.includes("execution reverted")) {
      return createEnhancedError(
        errorMessage,
        "CONTRACT_REVERT",
        context,
        "Contract execution failed",
        originalError
      );
    }
  }

  // Gas estimation errors
  if (
    errorName === "EstimateGasExecutionError" ||
    lowerMessage.includes("gas estimation failed")
  ) {
    if (lowerMessage.includes("insufficient funds")) {
      return createEnhancedError(
        errorMessage,
        "INSUFFICIENT_NATIVE_TOKEN",
        context,
        "Not enough ETH for gas",
        originalError
      );
    }
  }

  // RPC errors
  if (
    errorCode === -32000 ||
    errorCode === -32603 ||
    lowerMessage.includes("rpc error")
  ) {
    return createEnhancedError(
      errorMessage,
      "RPC_ERROR",
      context,
      "Network connection issue",
      originalError
    );
  }

  // User rejection (code 4001 is standard)
  if (
    errorCode === 4001 ||
    lowerMessage.includes("user rejected") ||
    lowerMessage.includes("user denied")
  ) {
    return createEnhancedError(
      errorMessage,
      "USER_REJECTED",
      context,
      undefined,
      originalError
    );
  }

  // Chain ID mismatch errors
  if (
    lowerMessage.includes("chain mismatch") ||
    lowerMessage.includes("expected chain id")
  ) {
    return createEnhancedError(
      errorMessage,
      "WRONG_NETWORK",
      context,
      "Network mismatch detected",
      originalError
    );
  }

  // Fallback to general categorization
  return categorizeTransactionError(error, context);
};

/**
 * Parse contract-specific revert reasons for user-friendly messages
 */
export const parseContractRevertReason = (
  errorMessage: string
): {
  reason: string;
  userMessage: string;
} => {
  // Common DAO Pool contract errors
  if (
    errorMessage.includes("Ended()") ||
    errorMessage.includes("Error: Ended")
  ) {
    return {
      reason: "Ended",
      userMessage:
        "The fundraising period has ended. No more contributions are accepted.",
    };
  }

  if (
    errorMessage.includes("Cancelled()") ||
    errorMessage.includes("Error: Cancelled")
  ) {
    return {
      reason: "Cancelled",
      userMessage:
        "This fundraising has been cancelled. Contributions are no longer accepted.",
    };
  }

  if (
    errorMessage.includes("Graduated()") ||
    errorMessage.includes("Error: Graduated")
  ) {
    return {
      reason: "Graduated",
      userMessage:
        "This token has already graduated to the DEX. You can now trade it on Aerodrome.",
    };
  }

  if (
    errorMessage.includes("InsufficientAllocation()") ||
    errorMessage.includes("insufficient allocation")
  ) {
    return {
      reason: "InsufficientAllocation",
      userMessage: "The amount exceeds the remaining fundraising allocation.",
    };
  }

  if (
    errorMessage.includes("BelowMinimum()") ||
    errorMessage.includes("below minimum")
  ) {
    return {
      reason: "BelowMinimum",
      userMessage: "The contribution amount is below the minimum required.",
    };
  }

  if (
    errorMessage.includes("ExceedsMaximum()") ||
    errorMessage.includes("exceeds maximum")
  ) {
    return {
      reason: "ExceedsMaximum",
      userMessage:
        "The contribution amount exceeds the maximum allowed per wallet.",
    };
  }

  if (
    errorMessage.includes("NotStarted()") ||
    errorMessage.includes("not started")
  ) {
    return {
      reason: "NotStarted",
      userMessage:
        "The fundraising period has not started yet. Please wait for it to begin.",
    };
  }

  if (
    errorMessage.includes("AlreadyRefunded()") ||
    errorMessage.includes("already refunded")
  ) {
    return {
      reason: "AlreadyRefunded",
      userMessage: "Your contribution has already been refunded.",
    };
  }

  if (
    errorMessage.includes("NoContribution()") ||
    errorMessage.includes("no contribution")
  ) {
    return {
      reason: "NoContribution",
      userMessage: "You have not made any contributions to this pool.",
    };
  }

  if (
    errorMessage.includes("NotAuthorized()") ||
    errorMessage.includes("not authorized")
  ) {
    return {
      reason: "NotAuthorized",
      userMessage: "You are not authorized to perform this action.",
    };
  }

  if (
    errorMessage.includes("InvalidAmount()") ||
    errorMessage.includes("invalid amount")
  ) {
    return {
      reason: "InvalidAmount",
      userMessage:
        "The contribution amount is invalid. Please enter a valid amount.",
    };
  }

  if (
    errorMessage.includes("PoolFull()") ||
    errorMessage.includes("pool full")
  ) {
    return {
      reason: "PoolFull",
      userMessage:
        "The fundraising goal has been reached. No more contributions are accepted.",
    };
  }

  // Token/Balance errors
  if (
    errorMessage.includes("InsufficientBalance") ||
    errorMessage.includes("insufficient balance")
  ) {
    return {
      reason: "InsufficientBalance",
      userMessage: "You don't have enough AWE tokens for this contribution.",
    };
  }

  if (
    errorMessage.includes("InsufficientAllowance") ||
    errorMessage.includes("insufficient allowance")
  ) {
    return {
      reason: "InsufficientAllowance",
      userMessage:
        "Token approval is required. Please approve the contract to spend your AWE tokens.",
    };
  }

  // Generic execution revert
  if (errorMessage.includes("execution reverted")) {
    return {
      reason: "ExecutionReverted",
      userMessage:
        "The transaction cannot be executed. Please check the pool status and your balance.",
    };
  }

  // Default case
  return {
    reason: "Unknown",
    userMessage:
      "The transaction failed. Please try again or contact support if the issue persists.",
  };
};

/**
 * Comprehensive wagmi transaction error handler
 */
export const handleWagmiError = (
  error: unknown,
  context: "bonding-curve" | "dao-pool" | "token-factory",
  options?: {
    showToast?: boolean;
    onRetry?: () => Promise<void>;
    onFallback?: () => Promise<void>;
    onChainError?: (error: EnhancedCategorizedError) => Promise<void>;
  }
): EnhancedCategorizedError => {
  const enhancedError = categorizeWagmiError(error, context);
  const { showToast = true, onRetry, onFallback, onChainError } = options || {};

  // Check if this is a chain-related error
  const isChainError =
    enhancedError.errorType === "WRONG_NETWORK" ||
    enhancedError.errorType === "UNSUPPORTED_CHAIN" ||
    enhancedError.errorType === "CHAIN_NOT_CONFIGURED";

  // Automatically handle chain errors
  if (isChainError) {
    if (onChainError) {
      onChainError(enhancedError).catch((err) => {
        console.error("Chain error handler failed:", err);
      });
    } else {
      chainSwitchService.handleChainError(enhancedError);
    }
  }

  // Add recovery options if provided
  if (onRetry && enhancedError.retryable) {
    enhancedError.recoveryOptions = {
      canRetry: true,
      retryAction: onRetry,
      fallbackAction: onFallback,
      userGuidance: enhancedError.userGuidance,
      severity: enhancedError.severity,
    };
  }

  // Use the existing exception manager for toast handling (skip if chain error and callback provided)
  if (showToast && !(isChainError && onChainError)) {
    const errorMessages = getEnhancedErrorMessages(
      enhancedError.errorType,
      context
    );
    exceptionManager.handleError(enhancedError.originalError || enhancedError, {
      showToast: true,
      customMessage: errorMessages.description,
    });
  }

  // Log enhanced error details
  console.error("[WagmiErrorHandler]", {
    errorType: enhancedError.errorType,
    severity: enhancedError.severity,
    context: enhancedError.context,
    retryable: enhancedError.retryable,
    userGuidance: enhancedError.userGuidance,
    timestamp: enhancedError.timestamp,
    originalError: enhancedError.originalError,
  });

  return enhancedError;
};

/**
 * Check if error requires chain switching and return metadata
 */
export const shouldSwitchChain = (
  error: EnhancedCategorizedError
): {
  shouldSwitch: boolean;
  errorType: EnhancedTransactionErrorType;
  message: string;
} => {
  const shouldSwitch =
    error.errorType === "WRONG_NETWORK" ||
    error.errorType === "UNSUPPORTED_CHAIN" ||
    error.errorType === "CHAIN_NOT_CONFIGURED";

  return {
    shouldSwitch,
    errorType: error.errorType,
    message: shouldSwitch ? error.userGuidance : "",
  };
};
