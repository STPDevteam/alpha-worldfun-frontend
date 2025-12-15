import { useEffect, useState, useCallback } from "react";
import { usePublicClient, useChainId } from "wagmi";
import { parseUnits } from "viem";
import { AWE_BONDING_CURVE_POOL_ABI, SUPPORTED_CHAINS } from "@/libs/constants";
import { useToast } from "@/libs/hooks/common";
import { handleWagmiError } from "@/libs/utils/contract-error-handler";
import { formatSmallNumberWithUI } from "@/libs/utils/format";
import Decimal from "decimal.js";
import { formatUnits } from "ethers";
import { useQuery } from "@tanstack/react-query";

export type TradingMode = "exactIn" | "exactOut";

export interface UseBondingCurvePriceParams {
  amount: string | undefined;
  mode: TradingMode;
  swapToAwe?: boolean;
  poolAddress?: string;
  enabled?: boolean;
}

export interface UseBondingCurvePriceReturn {
  calculatedAmount: string | null;
  calculatedAmountFormatted: string | null;
  isLoading: boolean;
  error: Error | null;
  exchangeRate: string | null;
  exchangeRateValue: number | null;
  refetch: () => void;
  mode: TradingMode;
}

export function useBondingCurvePrice({
  amount,
  mode,
  swapToAwe = false,
  poolAddress,
  enabled = true,
}: UseBondingCurvePriceParams): UseBondingCurvePriceReturn {
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { error: toastError } = useToast();

  const [calculatedAmount, setCalculatedAmount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [exchangeRateValue, setExchangeRateValue] = useState<number | null>(
    null
  );

  const fetchPrice = useCallback(async () => {
    setError(null);
    setCalculatedAmount(null);
    setExchangeRate(null);
    setExchangeRateValue(null);

    if (!enabled || !poolAddress || !publicClient || !amount) {
      return;
    }

    if (!(Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId)) {
      const chainError = new Error("Please switch to a supported network");
      setError(chainError);
      return;
    }

    if (!amount || Decimal(amount).isNaN() || Decimal(amount).lte(0)) {
      return;
    }

    setIsLoading(true);

    try {
      const amountWei = parseUnits(amount, 18);

      let result: bigint;

      if (mode === "exactIn") {
        result = (await publicClient.readContract({
          address: poolAddress as `0x${string}`,
          abi: AWE_BONDING_CURVE_POOL_ABI,
          functionName: "getAmountOut",
          args: [amountWei, swapToAwe],
        })) as bigint;
      } else {
        result = (await publicClient.readContract({
          address: poolAddress as `0x${string}`,
          abi: AWE_BONDING_CURVE_POOL_ABI,
          functionName: "getAmountIn",
          args: [amountWei, swapToAwe],
        })) as bigint;
      }

      const resultFormatted = formatUnits(result, 18);
      setCalculatedAmount(resultFormatted);

      let rate: number;
      let rateText: string;
      let rateValue: number;

      if (mode === "exactIn") {
        rate = Decimal(result).div(amountWei).toNumber();
        if (swapToAwe) {
          rateValue = rate;
          const formattedRate = formatSmallNumberWithUI(rate);
          if (formattedRate.isSmallNumber) {
            rateText = `1 TOKEN = ${formattedRate.wholeNumber}${
              formattedRate.leadingZeros ? formattedRate.leadingZeros : ""
            }${formattedRate.significantDigits} AWE`;
          } else {
            rateText = `1 TOKEN = ${formattedRate.wholeNumber} AWE`;
          }
        } else {
          rateValue = rate;
          const formattedRate = formatSmallNumberWithUI(rate);
          if (formattedRate.isSmallNumber) {
            rateText = `1 AWE = ${formattedRate.wholeNumber}${
              formattedRate.leadingZeros ? formattedRate.leadingZeros : ""
            }${formattedRate.significantDigits} TOKEN`;
          } else {
            rateText = `1 AWE = ${formattedRate.wholeNumber} TOKEN`;
          }
        }
      } else {
        rate = Decimal(result).div(amountWei).toNumber();
        if (swapToAwe) {
          rateValue = 1 / rate;
          const formattedRate = formatSmallNumberWithUI(rateValue);
          if (formattedRate.isSmallNumber) {
            rateText = `1 TOKEN = ${formattedRate.wholeNumber}${
              formattedRate.leadingZeros ? formattedRate.leadingZeros : ""
            }${formattedRate.significantDigits} AWE`;
          } else {
            rateText = `1 TOKEN = ${formattedRate.wholeNumber} AWE`;
          }
        } else {
          rateValue = 1 / rate;
          const formattedRate = formatSmallNumberWithUI(rateValue);
          if (formattedRate.isSmallNumber) {
            rateText = `1 AWE = ${formattedRate.wholeNumber}${
              formattedRate.leadingZeros ? formattedRate.leadingZeros : ""
            }${formattedRate.significantDigits} TOKEN`;
          } else {
            rateText = `1 AWE = ${formattedRate.wholeNumber} TOKEN`;
          }
        }
      }

      setExchangeRate(rateText);
      setExchangeRateValue(rateValue);
    } catch (err) {
      console.error(`Failed to fetch bonding curve price (${mode}):`, err);

      const enhancedError = handleWagmiError(err, "bonding-curve", {
        showToast: false,
      });

      setError(enhancedError);
    } finally {
      setIsLoading(false);
    }
  }, [amount, mode, swapToAwe, poolAddress, publicClient, enabled, chainId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPrice();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchPrice]);

  const calculatedAmountFormatted = calculatedAmount
    ? parseFloat(calculatedAmount).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      })
    : null;

  const refetch = useCallback(() => {
    fetchPrice();
  }, [fetchPrice]);

  return {
    calculatedAmount,
    calculatedAmountFormatted,
    isLoading,
    error,
    exchangeRate,
    exchangeRateValue,
    refetch,
    mode,
  };
}

export function useBondingCurvePriceQuery({
  amount,
  mode,
  swapToAwe = false,
  poolAddress,
  enabled = true,
}: UseBondingCurvePriceParams) {
  const publicClient = usePublicClient();
  const chainId = useChainId();

  return useQuery({
    queryKey: [
      "bonding-curve-price",
      poolAddress,
      amount,
      mode,
      swapToAwe,
      chainId,
    ],
    queryFn: async () => {
      if (!poolAddress || !publicClient || !amount) {
        throw new Error("Missing required parameters");
      }

      if (!(Object.values(SUPPORTED_CHAINS) as number[]).includes(chainId)) {
        throw new Error("Please switch to a supported network");
      }

      if (!amount || Decimal(amount).isNaN() || Decimal(amount).lte(0)) {
        throw new Error("Invalid amount");
      }

      const amountWei = parseUnits(amount, 18);

      let result: bigint;

      if (mode === "exactIn") {
        result = (await publicClient.readContract({
          address: poolAddress as `0x${string}`,
          abi: AWE_BONDING_CURVE_POOL_ABI,
          functionName: "getAmountOut",
          args: [amountWei, swapToAwe],
        })) as bigint;
      } else {
        result = (await publicClient.readContract({
          address: poolAddress as `0x${string}`,
          abi: AWE_BONDING_CURVE_POOL_ABI,
          functionName: "getAmountIn",
          args: [amountWei, swapToAwe],
        })) as bigint;
      }

      return {
        result,
        amountWei,
      };
    },
    select: (data) => {
      const { result, amountWei } = data;

      const resultFormatted = formatUnits(result, 18);

      let rate: number;
      let rateText: string;
      let rateValue: number;

      if (mode === "exactIn") {
        rate = Decimal(result.toString()).div(amountWei.toString()).toNumber();
        if (swapToAwe) {
          rateValue = rate;
          const formattedRate = formatSmallNumberWithUI(rate);
          if (formattedRate.isSmallNumber) {
            rateText = `1 TOKEN = ${formattedRate.wholeNumber}${
              formattedRate.leadingZeros ? formattedRate.leadingZeros : ""
            }${formattedRate.significantDigits} AWE`;
          } else {
            rateText = `1 TOKEN = ${formattedRate.wholeNumber} AWE`;
          }
        } else {
          rateValue = rate;
          const formattedRate = formatSmallNumberWithUI(rate);
          if (formattedRate.isSmallNumber) {
            rateText = `1 AWE = ${formattedRate.wholeNumber}${
              formattedRate.leadingZeros ? formattedRate.leadingZeros : ""
            }${formattedRate.significantDigits} TOKEN`;
          } else {
            rateText = `1 AWE = ${formattedRate.wholeNumber} TOKEN`;
          }
        }
      } else {
        rate = Decimal(result.toString()).div(amountWei.toString()).toNumber();
        if (swapToAwe) {
          rateValue = 1 / rate;
          const formattedRate = formatSmallNumberWithUI(rateValue);
          if (formattedRate.isSmallNumber) {
            rateText = `1 TOKEN = ${formattedRate.wholeNumber}${
              formattedRate.leadingZeros ? formattedRate.leadingZeros : ""
            }${formattedRate.significantDigits} AWE`;
          } else {
            rateText = `1 TOKEN = ${formattedRate.wholeNumber} AWE`;
          }
        } else {
          rateValue = 1 / rate;
          const formattedRate = formatSmallNumberWithUI(rateValue);
          if (formattedRate.isSmallNumber) {
            rateText = `1 AWE = ${formattedRate.wholeNumber}${
              formattedRate.leadingZeros ? formattedRate.leadingZeros : ""
            }${formattedRate.significantDigits} TOKEN`;
          } else {
            rateText = `1 AWE = ${formattedRate.wholeNumber} TOKEN`;
          }
        }
      }

      const calculatedAmountFormatted = parseFloat(
        resultFormatted
      ).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      });

      return {
        calculatedAmount: resultFormatted,
        calculatedAmountFormatted,
        exchangeRate: rateText,
        exchangeRateValue: rateValue,
        mode,
      };
    },
    enabled:
      enabled &&
      !!poolAddress &&
      !!publicClient &&
      !!amount &&
      !Decimal(amount || "0").isNaN() &&
      Decimal(amount || "0").gt(0),
    staleTime: 60000,
  });
}
