export const PLATFORM_FEE_BPS = 50;
export const BASIS_POINTS_DIVISOR = 10000;
export const PLATFORM_FEE_PERCENTAGE = 0.5;

export const calculatePlatformFee = (baseAmount: number): number => {
  if (!baseAmount || baseAmount <= 0) return 0;
  return (baseAmount * PLATFORM_FEE_BPS) / BASIS_POINTS_DIVISOR;
};

export const calculatePlatformFeeBigInt = (baseAmountWei: bigint): bigint => {
  if (baseAmountWei <= BigInt(0)) return BigInt(0);
  return (
    (baseAmountWei * BigInt(PLATFORM_FEE_BPS)) / BigInt(BASIS_POINTS_DIVISOR)
  );
};

export const calculateTotalWithFee = (
  baseAmount: number
): {
  baseAmount: number;
  feeAmount: number;
  totalAmount: number;
} => {
  const feeAmount = calculatePlatformFee(baseAmount);
  const totalAmount = baseAmount + feeAmount;

  return {
    baseAmount,
    feeAmount,
    totalAmount,
  };
};

export const calculateTotalWithFeeBigInt = (
  baseAmountWei: bigint
): {
  baseAmountWei: bigint;
  feeAmountWei: bigint;
  totalAmountWei: bigint;
} => {
  const feeAmountWei = calculatePlatformFeeBigInt(baseAmountWei);
  const totalAmountWei = baseAmountWei + feeAmountWei;

  return {
    baseAmountWei,
    feeAmountWei,
    totalAmountWei,
  };
};

export const formatFeePercentage = (): string => {
  return `${PLATFORM_FEE_PERCENTAGE}%`;
};

export const getFeeCalculationContext = (
  inputAmount: number | undefined,
  calculatedAmount: string | undefined,
  activeTab: "buy" | "sell",
  tradingMode: "exactIn" | "exactOut"
): {
  feeAmount: number;
  feeCurrency: string;
  baseAmount: number;
  totalAmount: number;
  shouldShowFees: boolean;
} => {
  let baseAmount: number = 0;
  let feeCurrency: string = "";

  if (tradingMode === "exactIn") {
    baseAmount = inputAmount || 0;
    feeCurrency = activeTab === "buy" ? "AWE" : "TOKEN";
  } else {
    baseAmount = calculatedAmount ? parseFloat(calculatedAmount) : 0;
    feeCurrency = activeTab === "buy" ? "AWE" : "TOKEN";
  }

  const shouldShowFees = baseAmount > 0;

  if (!shouldShowFees) {
    return {
      feeAmount: 0,
      feeCurrency,
      baseAmount: 0,
      totalAmount: 0,
      shouldShowFees: false,
    };
  }

  const { feeAmount, totalAmount } = calculateTotalWithFee(baseAmount);

  return {
    feeAmount,
    feeCurrency,
    baseAmount,
    totalAmount,
    shouldShowFees,
  };
};

/**
 * Debug utility for fee calculations
 * @param amount Input amount
 * @returns Detailed fee calculation breakdown
 */
export const debugFeeCalculation = (amount: number) => {
  const calculation = calculateTotalWithFee(amount);

  return {
    inputAmount: amount,
    platformFeePercentage: `${PLATFORM_FEE_PERCENTAGE}%`,
    platformFeeBPS: PLATFORM_FEE_BPS,
    feeAmount: calculation.feeAmount,
    totalAmount: calculation.totalAmount,
    feeRatio: calculation.feeAmount / amount,
    calculation: {
      formula: `(${amount} * ${PLATFORM_FEE_BPS}) / ${BASIS_POINTS_DIVISOR}`,
      result: calculation.feeAmount,
    },
  };
};
