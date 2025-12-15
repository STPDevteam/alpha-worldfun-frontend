import Decimal from "decimal.js";
import { useBondingCurvePriceQuery } from "./use-bonding-curve-price";
import { useBondingCurveTokenReserve } from "./use-bonding-curve-token-reserve";
import { useMemo } from "react";

const TARGET_GRADUATION_CAP = "100000";
const TOKEN_FOR_SALE = "79310000000";

export type UseGetContractAmountParams = {
  poolAddress?: string;
  inputAmount?: string;
  maxAweInputAmount: string;
  swapToAwe?: boolean;
  mode?: "exactIn" | "exactOut";
};

export const useGetContractAmount = ({
  poolAddress,
  inputAmount,
  maxAweInputAmount,
  swapToAwe,
  mode,
}: UseGetContractAmountParams) => {
  const {
    data: tokenReserveData,
    refetch: refetchTokenReserve,
    isLoading: isLoadingTokenReserves,
  } = useBondingCurveTokenReserve({ poolAddress: poolAddress });

  const maxPossibleTokenInput = useMemo(() => {
    return tokenReserveData?.tokenReserveFormatted || TOKEN_FOR_SALE;
  }, [tokenReserveData]);

  const {
    data: maxPossibleAweInputData,
    refetch: refetchMaxPossibleAweInput,
    isLoading: isLoadingMaxPossibleAweInput,
  } = useBondingCurvePriceQuery({
    amount: maxPossibleTokenInput,
    mode: "exactOut",
    swapToAwe: false,
    poolAddress: poolAddress,
    enabled: !!poolAddress,
  });

  const {
    data: maxPossibleAweOutputData,
    refetch: refetchMaxPossibleAweOutput,
    isLoading: isLoadingMaxPossibleAweOutput,
  } = useBondingCurvePriceQuery({
    amount: maxPossibleTokenInput,
    mode: "exactIn",
    swapToAwe: true,
    poolAddress: poolAddress,
    enabled: !!poolAddress,
  });

  const maxPossibleAweInput = useMemo(() => {
    return maxPossibleAweInputData?.calculatedAmount || maxAweInputAmount;
  }, [maxPossibleAweInputData, maxAweInputAmount]);

  const maxPossibleAweOutput = useMemo(() => {
    return maxPossibleAweOutputData?.calculatedAmount || "0";
  }, [maxPossibleAweOutputData]);

  const contractAmount = useMemo(() => {
    if (!inputAmount) return undefined;

    switch (true) {
      case !swapToAwe && mode === "exactIn":
        return Decimal.min(inputAmount, maxPossibleAweInput).toString();
      case !swapToAwe && mode === "exactOut":
        return Decimal.min(inputAmount, maxPossibleTokenInput).toString();
      case swapToAwe && mode === "exactIn":
        return Decimal.min(inputAmount, maxPossibleTokenInput).toString();
      case swapToAwe && mode === "exactOut":
        return Decimal.min(inputAmount, maxPossibleAweOutput).toString();
      default:
        return inputAmount;
    }
  }, [
    inputAmount,
    swapToAwe,
    mode,
    maxPossibleAweOutput,
    maxPossibleTokenInput,
    maxPossibleAweInput,
  ]);

  return {
    contractAmount,
    isLoadingContractAmount:
      isLoadingMaxPossibleAweInput ||
      isLoadingMaxPossibleAweOutput ||
      isLoadingTokenReserves,
    refetchTokenReserve,
    refetchMaxPossibleAweOutput,
    refetchMaxPossibleAweInput,
  };
};
