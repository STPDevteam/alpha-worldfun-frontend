"use client";

import { useAccount } from "wagmi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Text } from "../ui";
import { ProgressV2 } from "../ui/progress-v2";
import Image from "next/image";
import { useAweTokenBalance, useTokenBalance } from "@/libs/hooks/wallet";
import { useWalletConnectButton } from "@/libs/hooks/wallet/use-wallet-connect-button";
import { useBondingCurveContribute } from "@/libs/hooks/contracts/use-bonding-curve-contribute";
import {
  useBondingCurvePrice,
  useBondingCurvePriceQuery,
  type TradingMode,
} from "@/libs/hooks/contracts/use-bonding-curve-price";
import {
  useBondingCurveAweReserve,
  useBondingCurveTokenReserve,
  useGetContractAmount,
} from "@/libs/hooks/contracts";
import { useToast } from "@/libs/hooks/common";
import { useQueryClient } from "@tanstack/react-query";
import { tradingHistoryQueryKeys } from "@/libs/hooks/subgraph";
import { BaseDecimalInput } from "../common/base-decimal-input";
import SmallNumberDisplay from "../common/small-number-display";
import { ArrowReloadHorizontalSharp } from "../icons/arrow-reload-horizontal-sharp";
import ArrowSwapSvg from "../icons/arrow-swap-svg";
import type { PoolInfo, DaoPoolFormData } from "@/libs/types/contracts";
import { useResponsive } from "@/hooks/use-responsive";
import { useAdaptiveFontSize } from "@/hooks/use-adaptive-font-size";
import { formatFeePercentage } from "@/libs/utils/fee-calculations";
import { Decimal } from "decimal.js";
import { FixedNumber, parseUnits } from "ethers";
// Fee calculation imports removed

const TARGET_GRADUATION_CAP = 100000; // 100,000 AWE

const TOKEN_FOR_SALE = "79310000000";

// Quick selection amounts
const QUICK_AMOUNTS = [1000, 2000, 3000];

// Quick selection percentages for sell tab
const QUICK_PERCENTAGES = [25, 50, 75];

// Utility function to format numbers with K/M/B/T suffixes (for buttons only)
const formatNumberSummary = (num: number): string => {
  if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};

// Mobile-optimized balance display with better precision
const formatBalanceForMobile = (value: string): string => {
  const numValue = Number(value.replace(/,/g, ""));
  if (isNaN(numValue)) return value;

  // For very large numbers, show more precision to avoid misleading rounding
  if (numValue >= 1e12) {
    const trillions = numValue / 1e12;
    return `${trillions.toFixed(trillions >= 100 ? 1 : 2)}T`;
  }
  if (numValue >= 1e9) {
    const billions = numValue / 1e9;
    return `${billions.toFixed(billions >= 100 ? 1 : 2)}B`;
  }
  if (numValue >= 1e6) {
    const millions = numValue / 1e6;
    return `${millions.toFixed(millions >= 100 ? 1 : 2)}M`;
  }
  if (numValue >= 1e3) {
    const thousands = numValue / 1e3;
    return `${thousands.toFixed(thousands >= 100 ? 1 : 2)}K`;
  }
  return numValue.toLocaleString();
};

// Trading Section Component Interfaces
interface TradingInputSectionProps {
  label: string;
  balance: string;
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder: string;
  tokenImage: string;
  tokenSymbol: string;
  tokenAlt: string;
  showQuickSelection: boolean;
  quickAmounts: number[];
  quickPercentages: number[];
  onQuickAmount: (amount: number) => void;
  onQuickPercentage: (percentage: number) => void;
  onMaxAmount: () => void;
  onClick?: () => void;
  activeTab: "buy" | "sell";
  tradingMode: TradingMode;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

interface TradingOutputSectionProps {
  label: string;
  balance: string;
  value: string | null;
  tokenImage: string;
  tokenSymbol: string;
  tokenAlt: string;
  showQuickSelection?: boolean;
  quickAmounts?: number[];
  quickPercentages?: number[];
  onQuickAmount?: (amount: number) => void;
  onQuickPercentage?: (percentage: number) => void;
  onMaxAmount?: () => void;
  onClick?: () => void;
  activeTab?: "buy" | "sell";
  tradingMode?: TradingMode;
}

// Trading Input Section Component
const TradingInputSection = ({
  label,
  balance,
  value,
  onChange,
  placeholder,
  tokenImage,
  tokenSymbol,
  tokenAlt,
  showQuickSelection,
  quickAmounts,
  quickPercentages,
  onQuickAmount,
  onQuickPercentage,
  onMaxAmount,
  onClick,
  activeTab,
  tradingMode,
  inputRef,
}: TradingInputSectionProps) => {
  const { isMobile } = useResponsive();
  const displayBalance = isMobile ? formatBalanceForMobile(balance) : balance;

  // Adaptive font size for input to prevent overflow
  const {
    fontSize,
    inputRef: adaptiveInputRef,
    containerRef,
  } = useAdaptiveFontSize({
    value: value || "",
    baseFontSize: 18,
    minFontSize: 12,
    containerPadding: 80, // Account for token symbol and icon on the right
    placeholder,
  });

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center self-stretch gap-2 p-4 max-h-[400px] md:max-h-none overflow-visible"
      style={{
        borderRadius: "10px",
        border: "1px solid rgba(224,224,224,0.2)",
      }}
    >
      {/* Balance Header */}
      <div className="flex flex-row justify-between items-center self-stretch w-full">
        <span
          className="text-[#FFFFFF] text-[14px] font-medium leading-[2] truncate"
          style={{ fontFamily: "DM Mono" }}
        >
          {label}
        </span>
        <span
          className="text-[#FFFFFF] text-[14px] font-medium leading-[2] text-right whitespace-nowrap"
          style={{ fontFamily: "DM Mono" }}
        >
          <span className="text-[#777272]">Balance</span> {displayBalance}
        </span>
      </div>

      {/* Input Row */}
      <div
        ref={containerRef}
        className="flex flex-row justify-between self-stretch items-center w-full min-w-0"
      >
        <BaseDecimalInput
          ref={(el) => {
            // Merge refs: inputRef from parent and adaptiveInputRef from hook
            if (inputRef) {
              inputRef.current = el;
            }
            adaptiveInputRef.current = el;
          }}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="bg-transparent border-none font-medium leading-[1.556] placeholder:text-[#777272] focus:outline-none p-0 h-auto flex-1 text-[#FFFFFF] transition-all duration-150"
          style={{
            fontFamily: "DM Mono",
            fontSize: `${fontSize}px`,
          }}
          maxDecimals={18}
          disabled={false}
          enableCommaFormatting={true}
        />
        <div className="flex flex-row items-center gap-2 h-6 rounded-full justify-end min-w-0">
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <Image
              src={tokenImage}
              alt={tokenAlt}
              width={24}
              height={24}
              className="w-6 h-6 object-cover"
              style={{
                maxWidth: "24px",
                maxHeight: "24px",
                width: "24px",
                height: "24px",
              }}
            />
          </div>
          <span
            className="text-[#FFFFFF] text-[12px] font-medium leading-[1.167] truncate max-w-[80px] md:max-w-none"
            style={{ fontFamily: "DM Mono" }}
          >
            {tokenSymbol}
          </span>
        </div>
      </div>

      {/* Quick Selection Buttons */}
      {showQuickSelection && (
        <div className="flex flex-row justify-stretch items-stretch self-stretch gap-2 w-full">
          {/* Show different buttons based on active tab only (not trading mode) */}
          {activeTab === "buy"
            ? // Buy tab: Show fixed amounts
              quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => onQuickAmount(amount)}
                  className="flex flex-row justify-center items-center gap-2 p-1.5 px-2 w-full bg-[#232323] border border-[#2F2F2F] rounded-md cursor-pointer hover:bg-[#171717]"
                >
                  <span
                    className="text-[#ADADAD] text-[12px] font-normal leading-[1.333] hover:text-white"
                    style={{ fontFamily: "Manrope" }}
                  >
                    {isMobile ? formatNumberSummary(amount) : `${amount} AWE`}
                  </span>
                </button>
              ))
            : // Sell tab: Show percentages
              quickPercentages.map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => onQuickPercentage(percentage)}
                  className="flex flex-row justify-center items-center gap-2 p-1.5 px-2 w-full bg-[#232323] border border-[#2F2F2F] rounded-md cursor-pointer hover:bg-[#171717]"
                >
                  <span
                    className="text-[#ADADAD] text-[12px] font-normal leading-[1.333] hover:text-white"
                    style={{ fontFamily: "Manrope" }}
                  >
                    {percentage}%
                  </span>
                </button>
              ))}
          <button
            onClick={onMaxAmount}
            className="flex flex-row justify-center items-center gap-2 p-1.5 px-2 w-full bg-[#0E3263] rounded-md cursor-pointer hover:bg-[#192330]"
          >
            <span
              className="text-[#E0E0E0] text-[12px] font-normal leading-[1.333] hover:text-white"
              style={{ fontFamily: "Manrope" }}
            >
              MAX
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

// Trading Output Section Component
const TradingOutputSection = ({
  label,
  balance,
  value,
  tokenImage,
  tokenSymbol,
  tokenAlt,
  showQuickSelection = false,
  quickAmounts = [],
  quickPercentages = [],
  onQuickAmount,
  onQuickPercentage,
  onMaxAmount,
  onClick,
  activeTab = "buy",
  tradingMode = "exactIn",
}: TradingOutputSectionProps) => {
  const { isMobile } = useResponsive();
  const displayBalance = isMobile ? formatBalanceForMobile(balance) : balance;

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center self-stretch gap-2 p-4 max-h-[300px] md:max-h-none overflow-visible"
      style={{
        borderRadius: "10px",
        border: "1px solid rgba(224,224,224,0.2)",
      }}
    >
      {/* Balance Header */}
      <div className="flex flex-row justify-between items-center self-stretch w-full">
        <span
          className="text-[#FFFFFF] text-[14px] font-medium leading-[2] truncate"
          style={{ fontFamily: "DM Mono" }}
        >
          {label}
        </span>
        <span
          className="text-[#FFFFFF] text-[14px] font-medium leading-[2] text-right whitespace-nowrap"
          style={{ fontFamily: "DM Mono" }}
        >
          <span className="text-[#777272]">Balance</span> {displayBalance}
        </span>
      </div>

      {/* Output Row - Always Calculated/Read-only */}
      <div className="flex flex-row justify-between self-stretch items-center w-full">
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <SmallNumberDisplay
            value={value}
            className="bg-transparent border-none text-[18px] font-medium leading-[1.556] text-[#777272] whitespace-nowrap"
            smallTextClass="text-[9px] text-[#565656]"
            style={{ fontFamily: "DM Mono" }}
          />
        </div>
        <div className="flex flex-row items-center h-6 rounded-full gap-2 min-w-0">
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <Image
              src={tokenImage}
              alt={tokenAlt}
              width={24}
              height={24}
              className="w-6 h-6 object-cover text-[#E0E0E0]"
              style={{
                maxWidth: "24px",
                maxHeight: "24px",
                width: "24px",
                height: "24px",
              }}
            />
          </div>
          <span
            className="text-[#FFFFFF] text-[12px] font-medium leading-[1.167] truncate max-w-[80px] md:max-w-none"
            style={{ fontFamily: "DM Mono" }}
          >
            {tokenSymbol}
          </span>
        </div>
      </div>

      {/* Quick Selection Buttons - Always shown but disabled for output */}
      {showQuickSelection && (
        <div className="flex flex-row justify-stretch items-stretch self-stretch gap-2 w-full">
          {/* Show different buttons based on active tab only (not trading mode) */}
          {activeTab === "buy"
            ? // Buy tab: Show fixed amounts (disabled)
              quickAmounts.map((amount) => (
                <button
                  key={amount}
                  disabled={true}
                  className="flex flex-row justify-center items-center gap-2 p-1.5 px-2 w-full bg-[#232323] border border-[#2F2F2F] rounded-md opacity-50 cursor-not-allowed"
                >
                  <span
                    className="text-[#ADADAD] text-[12px] font-normal leading-[1.333]"
                    style={{ fontFamily: "Manrope" }}
                  >
                    {isMobile ? formatNumberSummary(amount) : `${amount} AWE`}
                  </span>
                </button>
              ))
            : // Sell tab: Show percentages (disabled)
              quickPercentages.map((percentage) => (
                <button
                  key={percentage}
                  disabled={true}
                  className="flex flex-row justify-center items-center gap-2 p-1.5 px-2 w-full bg-[#232323] border border-[#2F2F2F] rounded-md opacity-50 cursor-not-allowed"
                >
                  <span
                    className="text-[#ADADAD] text-[12px] font-normal leading-[1.333]"
                    style={{ fontFamily: "Manrope" }}
                  >
                    {percentage}%
                  </span>
                </button>
              ))}
          <button
            disabled={true}
            className="flex flex-row justify-center items-center gap-2 p-1.5 px-2 w-full bg-[#0E3263] rounded-md opacity-50 cursor-not-allowed"
          >
            <span
              className="text-[#E0E0E0] text-[12px] font-normal leading-[1.333]"
              style={{ fontFamily: "Manrope" }}
            >
              MAX
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

// Helper Functions for Trading Props
const getTradingInputLabel = (
  activeTab: "buy" | "sell",
  tradingMode: TradingMode,
  tokenSymbol?: string
): string => {
  const symbol = tokenSymbol || "TOKEN";
  if (activeTab === "buy") {
    return tradingMode === "exactIn" ? "Spend AWE" : `Receive ${symbol}`;
  } else {
    return tradingMode === "exactIn" ? `Sell ${symbol}` : "Receive AWE";
  }
};

const getTradingOutputLabel = (
  activeTab: "buy" | "sell",
  tradingMode: TradingMode,
  tokenSymbol?: string
): string => {
  const symbol = tokenSymbol || "TOKEN";
  if (activeTab === "buy") {
    return tradingMode === "exactIn" ? `Receive ${symbol}` : "Spend AWE";
  } else {
    return tradingMode === "exactIn" ? "Receive AWE" : `Sell ${symbol}`;
  }
};

const getTradingInputBalance = (
  activeTab: "buy" | "sell",
  tradingMode: TradingMode,
  displayBalance: string,
  tokenDisplayBalance: string
): string => {
  if (activeTab === "buy") {
    return tradingMode === "exactIn" ? displayBalance : tokenDisplayBalance;
  } else {
    return tradingMode === "exactIn" ? tokenDisplayBalance : displayBalance;
  }
};

const getTradingOutputBalance = (
  activeTab: "buy" | "sell",
  tradingMode: TradingMode,
  displayBalance: string,
  tokenDisplayBalance: string
): string => {
  if (activeTab === "buy") {
    return tradingMode === "exactIn" ? tokenDisplayBalance : displayBalance;
  } else {
    return tradingMode === "exactIn" ? displayBalance : tokenDisplayBalance;
  }
};

const getTradingInputTokenImage = (
  activeTab: "buy" | "sell",
  tradingMode: TradingMode,
  tokenImage?: string
): string => {
  if (activeTab === "buy") {
    return tradingMode === "exactIn"
      ? "/icons/awe-logo.svg"
      : tokenImage || "/icons/awe-logo.svg";
  } else {
    return tradingMode === "exactIn"
      ? tokenImage || "/icons/awe-logo.svg"
      : "/icons/awe-logo.svg";
  }
};

const getTradingOutputTokenImage = (
  activeTab: "buy" | "sell",
  tradingMode: TradingMode,
  tokenImage?: string
): string => {
  if (activeTab === "buy") {
    return tradingMode === "exactIn"
      ? tokenImage || "/icons/awe-logo.svg"
      : "/icons/awe-logo.svg";
  } else {
    return tradingMode === "exactIn"
      ? "/icons/awe-logo.svg"
      : tokenImage || "/icons/awe-logo.svg";
  }
};

const getTradingInputTokenSymbol = (
  activeTab: "buy" | "sell",
  tradingMode: TradingMode,
  tokenSymbol?: string
): string => {
  if (activeTab === "buy") {
    return tradingMode === "exactIn" ? "AWE" : tokenSymbol || "TOKEN";
  } else {
    return tradingMode === "exactIn" ? tokenSymbol || "TOKEN" : "AWE";
  }
};

const getTradingOutputTokenSymbol = (
  activeTab: "buy" | "sell",
  tradingMode: TradingMode,
  tokenSymbol?: string
): string => {
  if (activeTab === "buy") {
    return tradingMode === "exactIn" ? tokenSymbol || "TOKEN" : "AWE";
  } else {
    return tradingMode === "exactIn" ? "AWE" : tokenSymbol || "TOKEN";
  }
};

const getTradingInputTokenAlt = (
  activeTab: "buy" | "sell",
  tradingMode: TradingMode,
  tokenSymbol?: string
): string => {
  if (activeTab === "buy") {
    return tradingMode === "exactIn" ? "AWE" : tokenSymbol || "TOKEN";
  } else {
    return tradingMode === "exactIn" ? tokenSymbol || "TOKEN" : "AWE";
  }
};

const getTradingOutputTokenAlt = (
  activeTab: "buy" | "sell",
  tradingMode: TradingMode,
  tokenSymbol?: string
): string => {
  if (activeTab === "buy") {
    return tradingMode === "exactIn" ? tokenSymbol || "TOKEN" : "AWE";
  } else {
    return tradingMode === "exactIn" ? "AWE" : tokenSymbol || "TOKEN";
  }
};

const shouldShowQuickSelection = (
  activeTab: "buy" | "sell",
  tradingMode: TradingMode
): boolean => {
  // Always show quick selection buttons
  return true;
};

interface BondingCurveProgressSectionProps {
  poolInfo?: PoolInfo;
  daoPoolFormData?: DaoPoolFormData;
  currentValue?: string;
  targetValue?: string;
  progressPercentage?: number;
  aweInBondingCurve?: string;
  onTransaction?: () => void;
}

const BondingCurveProgressSection = ({
  poolInfo,
  daoPoolFormData,
  currentValue = "0",
  targetValue = "1000000",
  progressPercentage: propProgressPercentage = 80, // unused
  aweInBondingCurve = "4.898",
  onTransaction,
}: BondingCurveProgressSectionProps) => {
  // Hooks - must be declared first
  const { isConnected } = useAccount();
  const { handleConnectWallet } = useWalletConnectButton();
  const queryClient = useQueryClient();

  const {
    balanceFormatted,
    isLoading: isBalanceLoading,
    refetch: refetchAweBalance,
  } = useAweTokenBalance();
  const {
    balanceFormatted: tokenBalanceFormatted,
    isLoading: isTokenBalanceLoading,
    refetch: refetchTokenBalance,
  } = useTokenBalance({ tokenAddress: poolInfo?.tokenAddress || "" });

  // Contract-based AWE reserve hook
  const {
    aweReserveFormatted: contractAweReserve,
    isLoading: isAweReserveLoading,
    refetch: refetchAweReserve,
  } = useBondingCurveAweReserve({
    poolAddress: poolInfo?.address,
    enabled: !!poolInfo?.address,
  });

  const { error: toastError } = useToast();

  // Use contract-based AWE reserve as primary source, fallback to prop currentValue
  const effectiveCurrentValue = useMemo(() => {
    return contractAweReserve ? contractAweReserve : currentValue;
  }, [contractAweReserve, isAweReserveLoading, currentValue]);

  const formattedEffectiveCurrentValue = useMemo(() => {
    const flooredValue = Decimal(effectiveCurrentValue)
      .toDecimalPlaces(18, Decimal.ROUND_DOWN)
      .toNumber();
    return flooredValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [effectiveCurrentValue]);

  const realProgressPercentage = useMemo(() => {
    return Decimal(effectiveCurrentValue)
      .mul(100)
      .div(TARGET_GRADUATION_CAP)
      .toString();
  }, [effectiveCurrentValue]);

  // Unsafe progress percentage, must cap at 99.99 to avoid premature rounding to 100
  const progressPercentage = useMemo(() => {
    if (Decimal(effectiveCurrentValue).gte(TARGET_GRADUATION_CAP)) return 100;
    const percentage = Decimal(realProgressPercentage);
    if (percentage.gt(99.99)) return 99.99;
    return percentage.toNumber();
  }, [realProgressPercentage, effectiveCurrentValue]);

  // Unsafe formatted progress percentage, must cap at 99.99 to sync with progressPercentage
  const formattedProgressPercentage = useMemo(() => {
    if (Decimal(effectiveCurrentValue).gte(TARGET_GRADUATION_CAP))
      return "100.00";
    const percentage = Decimal(realProgressPercentage);
    if (percentage.gt(99.99)) return "99.99";
    return percentage.toDecimalPlaces(2, Decimal.ROUND_DOWN).toString();
  }, [realProgressPercentage, effectiveCurrentValue]);

  // Calculate maximum AWE that can be added before graduation
  const maxAllowedInput = useMemo(() => {
    const remaining = Decimal(TARGET_GRADUATION_CAP).sub(effectiveCurrentValue);
    return remaining.toString();
  }, [effectiveCurrentValue]);

  // State
  const [inputAmount, setInputAmountInternal] = useState<string | undefined>(
    undefined
  );

  const handleInputChange = (value: string | undefined) => {
    setInputAmountInternal(value);
  };

  const setInputAmount = useCallback((value: string | undefined) => {
    setInputAmountInternal(value);
  }, []);

  const [tradingMode, setTradingMode] = useState<TradingMode>("exactIn");
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce state for swap toggle
  const [isToggleDebouncing, setIsToggleDebouncing] = useState(false);

  // State for exchange ratio flip
  const [isRatioFlipped, setIsRatioFlipped] = useState(false);

  // Swap direction logic for buy and sell operations
  // Buy operations (AWE → TOKEN): swapToAwe = false
  // Sell operations (TOKEN → AWE): swapToAwe = true
  const swapToAwe = activeTab === "sell";

  const {
    contractAmount,
    isLoadingContractAmount,
    refetchMaxPossibleAweOutput,
    refetchMaxPossibleAweInput,
    refetchTokenReserve,
  } = useGetContractAmount({
    poolAddress: poolInfo?.address,
    inputAmount,
    maxAweInputAmount: maxAllowedInput,
    swapToAwe,
    mode: tradingMode,
  });

  // Price calculation hook for transaction
  const {
    calculatedAmount: rawCalculatedAmount,
    calculatedAmountFormatted,
    isLoading: isPriceLoading,
    exchangeRate,
    exchangeRateValue,
    refetch: refetchPrice,
  } = useBondingCurvePrice({
    amount: contractAmount,
    mode: tradingMode,
    swapToAwe: swapToAwe,
    poolAddress: poolInfo?.address,
    enabled: !!poolInfo?.address && !!contractAmount,
  });

  // Separate hook to always fetch exchange rate for display (using 1 AWE as base)
  const {
    exchangeRateValue: displayExchangeRateValue,
    isLoading: isDisplayRateLoading,
    refetch: refetchDisplayRate,
  } = useBondingCurvePrice({
    amount: "1", // Always use 1 AWE as base for exchange rate display
    mode: "exactIn",
    swapToAwe: false, // Always calculate AWE -> TOKEN for consistent display
    poolAddress: poolInfo?.address,
    enabled: !!poolInfo?.address,
  });

  // Transaction hooks
  const {
    buy,
    buyExactOut,
    sell,
    sellExactOut,
    isPreparing,
    isConfirming,
    isConfirmed,
    error: transactionError,
    currentStep,
  } = useBondingCurveContribute();

  // Balance display
  const displayBalance = isBalanceLoading
    ? "Loading..."
    : balanceFormatted
    ? Number(balanceFormatted).toLocaleString()
    : "0";

  const tokenDisplayBalance = isTokenBalanceLoading
    ? "Loading..."
    : tokenBalanceFormatted
    ? Number(tokenBalanceFormatted).toLocaleString()
    : "0";

  // Reset form function
  const resetForm = useCallback(() => {
    setInputAmount(undefined);
    setTradingMode("exactIn");
  }, []);

  // Reset form when tab changes and refetch exchange rate
  useEffect(() => {
    resetForm();
    refetchDisplayRate();
  }, [activeTab, resetForm, refetchDisplayRate]);

  // Reset form when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      resetForm();
      // Invalidate balances and AWE reserve after successful transaction
      refetchAweBalance();
      refetchTokenBalance();
      refetchAweReserve();
      refetchTokenReserve();
      refetchMaxPossibleAweInput();
      refetchMaxPossibleAweOutput();

      // Invalidate trading history data after 5 seconds to allow blockchain to update
      const timer = setTimeout(() => {
        if (poolInfo?.address) {
          // Invalidate bonding curve history queries for this pool
          queryClient.invalidateQueries({
            queryKey: tradingHistoryQueryKeys.historyByFilters({
              bondingCurveAddress: poolInfo.address,
            }),
          });

          // Also invalidate general trading history queries
          queryClient.invalidateQueries({
            queryKey: tradingHistoryQueryKeys.history,
          });
        }
      }, 5000); // 5 second delay

      return () => clearTimeout(timer);
    }
  }, [
    isConfirmed,
    resetForm,
    refetchAweBalance,
    refetchTokenBalance,
    refetchAweReserve,
    queryClient,
    poolInfo?.address,
  ]);

  // Refetch exchange rate when input amount changes
  useEffect(() => {
    if (inputAmount !== undefined && Decimal(inputAmount).gt(0)) {
      // Debounce the refetch to avoid too many API calls
      const timer = setTimeout(() => {
        refetchDisplayRate();
        if (contractAmount) {
          refetchPrice(); // Also refetch the price calculation for the entered amount
        }
      }, 300); // 300ms debounce

      return () => clearTimeout(timer);
    }
  }, [inputAmount, contractAmount, refetchDisplayRate, refetchPrice]);

  // Mode toggle function - toggles between exact in and exact out
  const handleModeToggle = useCallback(() => {
    if (isToggleDebouncing) return;
    setIsToggleDebouncing(true);
    setInputAmount(undefined);
    setTradingMode((prev) => (prev === "exactIn" ? "exactOut" : "exactIn"));
    refetchDisplayRate(); // Refetch exchange rate when mode changes
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    setTimeout(() => {
      setIsToggleDebouncing(false);
    }, 300);
  }, [isToggleDebouncing, refetchDisplayRate]);

  const handleQuickAmount = useCallback(
    (amount: number) => {
      setInputAmount(amount.toString());
      setTimeout(() => {
        refetchDisplayRate();
      }, 100);
    },
    [refetchDisplayRate, setInputAmount]
  );

  // Percentage amount selection for sell tab
  const handleQuickPercentage = useCallback(
    (_percentage: number) => {
      const percentage = _percentage.toString();
      const balance = FixedNumber.fromString(tokenBalanceFormatted, 18);
      if (balance.gt(FixedNumber.fromValue(0))) {
        const percent = FixedNumber.fromValue(parseUnits(percentage, 2));
        const value = balance.mul(percent).div(FixedNumber.fromValue(10000));
        setInputAmount(value._value);
        setTimeout(() => {
          refetchDisplayRate();
        }, 100);
      }
    },
    [tokenBalanceFormatted, refetchDisplayRate, setInputAmount]
  );

  // Max amount selection - sets the input field to max balance
  const handleMaxAmount = useCallback(() => {
    const isInputtingAWE =
      (activeTab === "buy" && tradingMode === "exactIn") ||
      (activeTab === "sell" && tradingMode === "exactOut");
    const maxBalance = isInputtingAWE
      ? balanceFormatted
      : tokenBalanceFormatted;
    if (Decimal(maxBalance).gt(0)) {
      setInputAmount(maxBalance);
      setTimeout(() => {
        refetchDisplayRate();
      }, 100);
    }
  }, [
    activeTab,
    tradingMode,
    balanceFormatted,
    tokenBalanceFormatted,
    refetchDisplayRate,
    setInputAmount,
  ]);

  // Handle exchange ratio flip
  const handleRatioFlip = useCallback(() => {
    setIsRatioFlipped((prev) => !prev);
  }, []);

  const handleToggleTab = useCallback(() => {
    setActiveTab((prev) => (prev === "buy" ? "sell" : "buy"));
  }, [setActiveTab]);

  // Get exchange ratio display based on flip state
  const getExchangeRatioDisplay = useCallback(() => {
    // Use displayExchangeRateValue (always available) instead of exchangeRateValue (only when input exists)
    const rateValue = displayExchangeRateValue;

    if (!rateValue || isDisplayRateLoading) {
      return {
        base: "1 AWE",
        equals: "0",
        quote: daoPoolFormData?.symbol || poolInfo?.symbol || "TOKEN",
      };
    }

    const tokenSymbol = daoPoolFormData?.symbol || poolInfo?.symbol || "TOKEN";

    // Determine the natural ratio based on trading context
    let shouldShowAweFirst = false;

    if (activeTab === "buy") {
      shouldShowAweFirst = tradingMode === "exactIn";
    } else {
      shouldShowAweFirst = tradingMode === "exactOut";
    }

    // Apply flip if user clicked the button
    const showAweFirst = isRatioFlipped
      ? !shouldShowAweFirst
      : shouldShowAweFirst;

    if (showAweFirst) {
      return {
        base: "1 AWE",
        equals: rateValue.toString(),
        quote: tokenSymbol,
      };
    } else {
      return {
        base: `1 ${tokenSymbol}`,
        equals: (1 / rateValue).toString(),
        quote: "AWE",
      };
    }
  }, [
    displayExchangeRateValue,
    isDisplayRateLoading,
    activeTab,
    tradingMode,
    isRatioFlipped,
    daoPoolFormData?.symbol,
    poolInfo?.symbol,
  ]);

  // Button click handling - either connect wallet or traP:1nsaction
  const handleButtonClick = useCallback(async () => {
    if (!isConnected) {
      await handleConnectWallet();
      return;
    }

    if (!poolInfo?.address) {
      toastError({
        title: "Invalid Transaction",
        description: "Pool is not available",
      });
      return;
    }

    if (!inputAmount || Decimal(inputAmount).lte(0)) {
      toastError({
        title: "Invalid Transaction",
        description: "Please enter an amount",
      });
      return;
    }

    const transactionAmount = inputAmount;

    // if (
    //   activeTab === "buy" &&
    //   tradingMode === "exactOut" &&
    //   rawCalculatedAmount
    // ) {
    //   const calculatedAweAmount = Decimal(rawCalculatedAmount);
    // if (
    //   !calculatedAweAmount.isNaN() &&
    //   calculatedAweAmount.gt(maxAllowedInput)
    // ) {
    //   toastError({
    //     title: "Graduation Limit Exceeded",
    //     description: `This transaction would require ${calculatedAweAmount.toLocaleString()} AWE, but only ${maxAllowedInput.toLocaleString()} AWE remaining until graduation limit (100,000 AWE total).`,
    //   });
    //   return;
    // }
    // }

    try {
      if (activeTab === "buy") {
        if (tradingMode === "exactIn") {
          // Use Case 1: Buy Exact In - user inputs AWE amount, get TOKEN
          await buy({
            aweAmount: transactionAmount.toString(),
            poolAddress: poolInfo.address,
          });
        } else {
          // Use Case 2: Buy Exact Out - user inputs TOKEN amount desired, spend AWE
          await buyExactOut({
            tokenAmount: transactionAmount.toString(),
            poolAddress: poolInfo.address,
          });
        }
      } else {
        if (!poolInfo.tokenAddress) {
          toastError({
            title: "Invalid Transaction",
            description: "Token address is not available",
          });
          return;
        }

        if (tradingMode === "exactIn") {
          // Use Case 3: Sell Exact In - user inputs TOKEN amount, get AWE
          await sell({
            tokenAmount: transactionAmount.toString(),
            poolAddress: poolInfo.address,
            tokenAddress: poolInfo.tokenAddress,
          });
        } else {
          // Use Case 4: Sell Exact Out - user inputs AWE amount desired, sell TOKEN
          await sellExactOut({
            aweAmount: transactionAmount.toString(),
            poolAddress: poolInfo.address,
            tokenAddress: poolInfo.tokenAddress,
          });
        }
      }
      onTransaction?.();
    } catch (error) {
      console.error("Transaction failed:", error);
      // Error handling is done by the hook
    }
  }, [
    isConnected,
    handleConnectWallet,
    activeTab,
    tradingMode,
    inputAmount,
    poolInfo,
    buy,
    buyExactOut,
    sell,
    sellExactOut,
    onTransaction,
    toastError,
  ]);

  // Button state
  const getButtonState = useMemo(() => {
    // Check if bonding curve has graduated (reached 100%)
    if (progressPercentage >= 100) {
      return {
        text: "Processing Graduation...",
        disabled: true,
        showIcon: true,
      };
    }

    if (isLoadingContractAmount) {
      return {
        text: "Refreshing price data...",
        disabled: true,
        showIcon: false,
      };
    }

    // Check wallet connection first
    if (!isConnected) {
      return { text: "Connect Wallet", disabled: false, showIcon: false };
    }

    if (isPreparing || isConfirming) {
      const text = "Confirming...";
      return { text, disabled: true, showIcon: false };
    }

    if (isConfirmed) {
      if (!inputAmount || Decimal(inputAmount).lte(0)) {
        return {
          text: activeTab === "buy" ? "Buy" : "Sell",
          disabled: true,
          showIcon: false,
        };
      }
    }

    if (
      !inputAmount ||
      Decimal(inputAmount).isNaN() ||
      Decimal(inputAmount).lte(0)
    ) {
      return {
        text: activeTab === "buy" ? "Buy" : "Sell",
        disabled: true,
        showIcon: false,
      };
    }

    // Check for insufficient balance on sell operations
    if (activeTab === "sell") {
      const currentTokenBalance = Decimal(tokenBalanceFormatted);
      if (currentTokenBalance.isNaN() || currentTokenBalance.lte(0)) {
        return {
          text: "Insufficient balance!",
          disabled: true,
          showIcon: false,
        };
      }

      if (tradingMode === "exactIn") {
        if (currentTokenBalance.lt(inputAmount)) {
          return {
            text: "Insufficient balance!",
            disabled: true,
            showIcon: false,
          };
        }
      } else if (tradingMode === "exactOut") {
        if (
          !rawCalculatedAmount ||
          currentTokenBalance.lt(rawCalculatedAmount)
        ) {
          return {
            text: "Insufficient balance!",
            disabled: true,
            showIcon: false,
          };
        }
      }
    }

    // Check for insufficient AWE balance on buy operations
    if (activeTab === "buy") {
      const currentAweBalance = Decimal(balanceFormatted);
      if (currentAweBalance.isNaN() || currentAweBalance.lte(0)) {
        return {
          text: "Insufficient balance!",
          disabled: true,
          showIcon: false,
        };
      }

      if (tradingMode === "exactIn") {
        if (currentAweBalance.lt(inputAmount)) {
          return {
            text: "Insufficient balance!",
            disabled: true,
            showIcon: false,
          };
        }
      } else if (tradingMode === "exactOut") {
        if (!rawCalculatedAmount || Decimal(rawCalculatedAmount).isNaN()) {
          return {
            text: "Insufficient balance!",
            disabled: true,
            showIcon: false,
          };
        }
        // Check graduation limit for Buy Exact Out
        const calculatedAweAmount = Decimal(rawCalculatedAmount);
        // if (calculatedAweAmount.gt(maxAllowedInput)) {
        //   return {
        //     text: "Exceeds graduation limit!",
        //     disabled: true,
        //     showIcon: false,
        //   };
        // }
        if (calculatedAweAmount.gt(currentAweBalance)) {
          return {
            text: "Insufficient balance!",
            disabled: true,
            showIcon: false,
          };
        }
      }
    }

    return {
      text: activeTab === "buy" ? "Buy" : "Sell",
      disabled: false,
      showIcon: false,
    };
  }, [
    isLoadingContractAmount,
    progressPercentage,
    isConnected,
    isPreparing,
    isConfirming,
    isConfirmed,
    transactionError,
    inputAmount,
    currentStep,
    activeTab,
    tradingMode,
    rawCalculatedAmount,
    tokenBalanceFormatted,
    balanceFormatted,
    maxAllowedInput,
  ]);

  const buttonState = getButtonState;

  return (
    <div
      className="flex flex-col gap-4
      w-full max-w-full xl:w-[445px] mx-auto overflow-hidden"
    >
      {/* Progress Section */}
      <div
        className="flex flex-row justify-stretch items-stretch self-stretch flex-wrap gap-2 p-4"
        style={{
          borderRadius: "10px",
          border: "1px solid rgba(224,224,224,0.2)",
        }}
      >
        <div className="flex flex-col gap-[14px] w-full">
          {/* Progress Header */}
          <div className="flex flex-row justify-between items-center self-stretch w-full">
            <span
              className="text-[#FFFFFF] text-[14px] font-normal leading-[1.714]"
              style={{ fontFamily: "DM Mono" }}
            >
              Bonding Curve Progress
            </span>
            <span
              className="text-[#FFFFFF] text-[16px] font-normal leading-[1.5]"
              style={{ fontFamily: "DM Mono" }}
            >
              {formattedProgressPercentage}%
            </span>
          </div>

          {/* Fundraise Progress Section */}
          <div className="flex flex-col gap-[12.5px] w-full">
            {/* Progress Bar */}
            <ProgressV2
              value={progressPercentage}
              inactiveColor="rgba(224,224,224,0.2)"
              segmentHeight={24}
              segmentWidth={8}
            />
          </div>

          {/* Progress Description */}
          <Text variant="small" className="leading-[1.667] md:w-[412px]">
            Graduate this coin to Aerodrome at{" "}
            {TARGET_GRADUATION_CAP.toLocaleString()} AWE market cap. There is ~
            {""}
            {formattedEffectiveCurrentValue} AWE in the bonding curve.
          </Text>
        </div>
      </div>

      {/* Buy/Sell Section */}
      <div
        className="flex flex-col justify-center items-center self-stretch gap-5 p-5 px-4"
        style={{
          borderRadius: "10px",
          border: "1px solid rgba(224,224,224,0.2)",
        }}
      >
        {/* Buy/Sell Tabs */}
        <div className="flex flex-row justify-stretch items-stretch self-stretch gap-[10px] w-full">
          <div className="flex flex-row justify-stretch items-stretch gap-2 p-0 pb-2 w-full">
            <button
              onClick={() => setActiveTab("buy")}
              className={`text-[18px] font-medium leading-[1.333] text-center w-full cursor-pointer pb-2 ${
                activeTab === "buy" ? "text-[#FFFFFF]" : "text-[#8F9393]"
              }`}
              style={{
                fontFamily: "DM Mono",
                borderBottom:
                  activeTab === "buy"
                    ? "1px solid rgba(224,224,224,0.2)"
                    : "none",
              }}
            >
              Buy
            </button>
            <button
              onClick={() => setActiveTab("sell")}
              className={`text-[18px] font-medium leading-[1.333] cursor-pointer text-center w-full pb-2 ${
                activeTab === "sell" ? "text-[#FFFFFF]" : "text-[#8F9393]"
              }`}
              style={{
                fontFamily: "DM Mono",
                borderBottom:
                  activeTab === "sell"
                    ? "1px solid rgba(224,224,224,0.2)"
                    : "none",
              }}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Forms */}
        <div className="flex flex-col items-center self-stretch gap-1 w-full max-w-full overflow-hidden md:overflow-visible">
          {/* Dynamic Top Section */}
          {tradingMode === "exactIn" ? (
            <TradingInputSection
              label={getTradingInputLabel(
                activeTab,
                tradingMode,
                daoPoolFormData?.symbol || poolInfo?.symbol
              )}
              balance={getTradingInputBalance(
                activeTab,
                tradingMode,
                displayBalance,
                tokenDisplayBalance
              )}
              value={inputAmount ?? ""}
              onChange={handleInputChange}
              placeholder="0"
              tokenImage={getTradingInputTokenImage(
                activeTab,
                tradingMode,
                poolInfo?.tokenImage
              )}
              tokenSymbol={getTradingInputTokenSymbol(
                activeTab,
                tradingMode,
                daoPoolFormData?.symbol || poolInfo?.symbol
              )}
              tokenAlt={getTradingInputTokenAlt(
                activeTab,
                tradingMode,
                daoPoolFormData?.symbol || poolInfo?.symbol
              )}
              showQuickSelection={true}
              quickAmounts={QUICK_AMOUNTS}
              quickPercentages={QUICK_PERCENTAGES}
              onQuickAmount={handleQuickAmount}
              onQuickPercentage={handleQuickPercentage}
              onMaxAmount={handleMaxAmount}
              activeTab={activeTab}
              tradingMode={tradingMode}
              inputRef={inputRef}
            />
          ) : (
            <TradingOutputSection
              onClick={handleModeToggle}
              label={getTradingOutputLabel(
                activeTab,
                tradingMode,
                daoPoolFormData?.symbol || poolInfo?.symbol
              )}
              balance={getTradingOutputBalance(
                activeTab,
                tradingMode,
                displayBalance,
                tokenDisplayBalance
              )}
              value={rawCalculatedAmount}
              tokenImage={getTradingOutputTokenImage(
                activeTab,
                tradingMode,
                poolInfo?.tokenImage
              )}
              tokenSymbol={getTradingOutputTokenSymbol(
                activeTab,
                tradingMode,
                daoPoolFormData?.symbol || poolInfo?.symbol
              )}
              tokenAlt={getTradingOutputTokenAlt(
                activeTab,
                tradingMode,
                daoPoolFormData?.symbol || poolInfo?.symbol
              )}
            />
          )}

          {/* Mode Toggle with Indicator */}
          <div className="flex flex-col items-center gap-1 w-full z-10 -mt-2.5 -mb-2">
            <div
              className={`flex justify-center w-[31px] h-[32px] items-center rounded-lg border border-[#27272B] transition-colors ${
                isToggleDebouncing
                  ? "cursor-not-allowed bg-[#151517] opacity-50"
                  : "cursor-pointer bg-[#151517] hover:bg-[#2d2d2e]"
              }`}
              onClick={handleToggleTab}
            >
              <ArrowSwapSvg width={21} height={20} />
            </div>
          </div>

          {/* Dynamic Bottom Section */}
          {tradingMode === "exactIn" ? (
            <TradingOutputSection
              onClick={handleModeToggle}
              label={getTradingOutputLabel(
                activeTab,
                tradingMode,
                daoPoolFormData?.symbol || poolInfo?.symbol
              )}
              balance={getTradingOutputBalance(
                activeTab,
                tradingMode,
                displayBalance,
                tokenDisplayBalance
              )}
              value={rawCalculatedAmount}
              tokenImage={getTradingOutputTokenImage(
                activeTab,
                tradingMode,
                poolInfo?.tokenImage
              )}
              tokenSymbol={getTradingOutputTokenSymbol(
                activeTab,
                tradingMode,
                daoPoolFormData?.symbol || poolInfo?.symbol
              )}
              tokenAlt={getTradingOutputTokenAlt(
                activeTab,
                tradingMode,
                daoPoolFormData?.symbol || poolInfo?.symbol
              )}
            />
          ) : (
            <TradingInputSection
              label={getTradingInputLabel(
                activeTab,
                tradingMode,
                daoPoolFormData?.symbol || poolInfo?.symbol
              )}
              balance={getTradingInputBalance(
                activeTab,
                tradingMode,
                displayBalance,
                tokenDisplayBalance
              )}
              value={inputAmount ?? ""}
              onChange={handleInputChange}
              placeholder="0"
              tokenImage={getTradingInputTokenImage(
                activeTab,
                tradingMode,
                poolInfo?.tokenImage
              )}
              tokenSymbol={getTradingInputTokenSymbol(
                activeTab,
                tradingMode,
                daoPoolFormData?.symbol || poolInfo?.symbol
              )}
              tokenAlt={getTradingInputTokenAlt(
                activeTab,
                tradingMode,
                daoPoolFormData?.symbol || poolInfo?.symbol
              )}
              showQuickSelection={false}
              quickAmounts={QUICK_AMOUNTS}
              quickPercentages={QUICK_PERCENTAGES}
              onQuickAmount={handleQuickAmount}
              onQuickPercentage={handleQuickPercentage}
              onMaxAmount={handleMaxAmount}
              activeTab={activeTab}
              tradingMode={tradingMode}
              inputRef={inputRef}
            />
          )}
        </div>

        {/* Exchange Info */}
        <div className="flex flex-col gap-2 self-stretch w-full">
          {/* Exchange Ratio */}
          <div className="flex flex-row justify-between items-center self-stretch gap-[30px] w-full">
            <span
              className="text-[#565656] text-[12px] font-normal leading-[1.5]"
              style={{ fontFamily: "DM Mono" }}
            >
              Exchange Ratio
            </span>
            <div className="flex flex-row items-center gap-1">
              {(() => {
                const ratio = getExchangeRatioDisplay();
                return (
                  <div
                    className="text-[#E0E0E0] text-[12px] font-normal leading-[1.5]"
                    style={{ fontFamily: "DM Mono" }}
                  >
                    {ratio.base} ={" "}
                    <SmallNumberDisplay
                      value={ratio.equals}
                      className="text-[#E0E0E0] text-[12px] font-normal leading-[1.5]"
                      smallTextClass="text-[10px] text-[#E0E0E0]"
                      style={{ fontFamily: "DM Mono" }}
                    />{" "}
                    {ratio.quote}
                  </div>
                );
              })()}
              <button
                onClick={handleRatioFlip}
                className="w-4 h-4 p-0.5 text-[#E0E0E0] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                title="Flip exchange ratio"
              >
                <ArrowReloadHorizontalSharp width={12} height={12} />
              </button>
            </div>
          </div>
          {/* Platform Fee */}
          <div className="flex flex-row justify-between items-center self-stretch gap-[30px] w-full">
            <span
              className="text-[#565656] text-[12px] font-normal leading-[1.5]"
              style={{ fontFamily: "DM Mono" }}
            >
              Platform Fee
            </span>
            <div className="flex flex-row items-center gap-1">
              <Text variant="small" className="text-[#E0E0E0] leading-[1.5]">
                {formatFeePercentage()}
              </Text>
            </div>
          </div>
        </div>

        {/* Buy/Sell Button */}
        <div
          className="flex flex-row justify-center items-center self-stretch w-full max-h-[44px]"
          style={{
            borderRadius: "10px",
            backgroundColor: "rgba(55,60,62,0.4)",
          }}
        >
          <Button
            onClick={handleButtonClick}
            disabled={buttonState.disabled}
            className={`w-full bg-transparent cursor-pointer hover:bg-[#464545]
              text-[18px] font-medium border-none h-full max-h-[44px]
              flex items-center justify-center gap-2 ${
                buttonState.disabled
                  ? "opacity-50 cursor-not-allowed text-[#8F9393]"
                  : "text-[#FFFFFF] hover:text-[#d5e6e6]"
              } ${buttonState.showIcon ? "text-[#FFC107]" : ""}`}
            style={{ fontFamily: "DM Mono" }}
          >
            {buttonState.showIcon && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-spin"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="#FFC107"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="28 10"
                />
              </svg>
            )}
            {buttonState.text}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BondingCurveProgressSection;
