export const formatNumber = (n: number) => new Intl.NumberFormat().format(n);

export const formatAddress = (
  address: string,
  startChars: number = 7,
  endChars: number = 5
): string => {
  if (!address || typeof address !== "string") {
    return "";
  }

  if (address.length <= startChars + endChars) {
    return address;
  }

  const start = address.slice(0, startChars);
  const end = address.slice(-endChars);

  return `${start}...${end}`;
};

export const formatAddressParts = (
  address: string,
  startChars: number = 7,
  endChars: number = 5
): { prefix: string; suffix: string; full: string } => {
  if (!address || typeof address !== "string") {
    return { prefix: "", suffix: "", full: "" };
  }

  if (address.length <= startChars + endChars) {
    return { prefix: address, suffix: "", full: address };
  }

  const start = address.slice(0, startChars);
  const end = address.slice(-endChars);

  return {
    prefix: `${start}...`,
    suffix: end,
    full: address,
  };
};

// Balance card value formatting functions for CountUp integration
export interface BalanceDisplayValue {
  numericValue: number;
  prefix: string;
  suffix: string;
  decimals?: number;
}

// Currency formatting: 900000 → { numericValue: 900, prefix: "$", suffix: "K" }
export const formatCurrencyForCountUp = (
  amount: number
): BalanceDisplayValue => {
  if (amount >= 1_000_000) {
    return {
      numericValue: Math.round((amount / 1_000_000) * 10) / 10,
      prefix: "$",
      suffix: "M",
      decimals: 1,
    };
  }
  if (amount >= 1_000) {
    return {
      numericValue: Math.round(amount / 1_000),
      prefix: "$",
      suffix: "K",
      decimals: 0,
    };
  }
  return {
    numericValue: amount,
    prefix: "$",
    suffix: "",
    decimals: 0,
  };
};

export const formatCurrencyFullForCountUp = (
  amount: number
): BalanceDisplayValue => {
  return {
    numericValue: amount,
    prefix: "$",
    suffix: "",
    decimals: 0,
  };
};

// Token amount: 1200000 → { numericValue: 1.2, prefix: "", suffix: "M AWE" }
export const formatTokenAmountForCountUp = (
  amount: number,
  symbol = "AWE"
): BalanceDisplayValue => {
  if (amount >= 1_000_000) {
    return {
      numericValue: Math.round((amount / 1_000_000) * 10) / 10,
      prefix: "",
      suffix: `M ${symbol}`,
      decimals: 1,
    };
  }
  if (amount >= 1_000) {
    return {
      numericValue: Math.round((amount / 1_000) * 10) / 10,
      prefix: "",
      suffix: `K ${symbol}`,
      decimals: 1,
    };
  }
  return {
    numericValue: amount,
    prefix: "",
    suffix: ` ${symbol}`,
    decimals: 0,
  };
};

export const formatTokenAmountFullForCountUp = (
  amount: number,
  symbol = "AWE"
): BalanceDisplayValue => {
  return {
    numericValue: amount,
    prefix: "",
    suffix: ` ${symbol}`,
    decimals: 0,
  };
};

// Percentage: 25 → { numericValue: 25, prefix: "", suffix: "%" }
export const formatPercentageForCountUp = (
  value: number
): BalanceDisplayValue => {
  return {
    numericValue: value,
    prefix: "",
    suffix: "%",
    decimals: 0,
  };
};

// Large numbers: 657250000 → { numericValue: 657.3, prefix: "", suffix: "M" }
export const formatLargeNumberForCountUp = (
  amount: number
): BalanceDisplayValue => {
  if (amount >= 1_000_000_000) {
    return {
      numericValue: Math.round((amount / 1_000_000_000) * 10) / 10,
      prefix: "",
      suffix: "B",
      decimals: 1,
    };
  }
  if (amount >= 1_000_000) {
    return {
      numericValue: Math.round((amount / 1_000_000) * 10) / 10,
      prefix: "",
      suffix: "M",
      decimals: 1,
    };
  }
  if (amount >= 1_000) {
    return {
      numericValue: Math.round((amount / 1_000) * 10) / 10,
      prefix: "",
      suffix: "K",
      decimals: 1,
    };
  }
  return {
    numericValue: amount,
    prefix: "",
    suffix: "",
    decimals: 0,
  };
};

// Time formatting from seconds to display components
export const formatTimeFromSeconds = (
  totalSeconds: number
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} => {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`,
  };
};

// Card format mapping based on card ID
export type CardFormatType =
  | "currency"
  | "percentage"
  | "token"
  | "large_number"
  | "time"
  | "currency_full"
  | "token_full";

export const CARD_FORMAT_CONFIG: Record<
  string,
  { type: CardFormatType; symbol?: string }
> = {
  raised: { type: "token_full", symbol: "AWE" },
  team: { type: "percentage" },
  "launch-mc": { type: "currency_full" },
  "presale-mc": { type: "currency_full" },
  lp: { type: "percentage" },
  "max-buy": { type: "currency_full" },
  "awe-remaining": { type: "token_full", symbol: "AWE" },
  "time-remaining": { type: "time" },
  // Fundraising progress specific formats
  "fundraising-main": { type: "currency" },
  "fundraising-bottom": { type: "currency" },
  "fundraising-percentage": { type: "percentage" },
};

// Small number formatting for UI display with leading zero indicators
export interface SmallNumberUIFormat {
  wholeNumber: string;
  leadingZeros?: number;
  significantDigits: string;
  isSmallNumber: boolean;
  originalValue: string;
}

export const formatSmallNumberWithUI = (
  value: string | number
): SmallNumberUIFormat => {
  // Handle edge cases
  if (!value || value === "0" || value === 0) {
    return {
      wholeNumber: "0",
      significantDigits: "",
      isSmallNumber: false,
      originalValue: "0",
    };
  }

  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  // Handle invalid numbers
  if (isNaN(numericValue)) {
    return {
      wholeNumber: "0",
      significantDigits: "",
      isSmallNumber: false,
      originalValue: "0",
    };
  }

  const absValue = Math.abs(numericValue);
  const isNegative = numericValue < 0;
  const valueStr = absValue.toString();

  // For normal numbers (>= 0.001), use standard formatting
  if (absValue >= 0.001) {
    const formatted = absValue.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });

    return {
      wholeNumber: isNegative ? `-${formatted}` : formatted,
      significantDigits: "",
      isSmallNumber: false,
      originalValue: value.toString(),
    };
  }

  // For very small numbers, extract leading zeros and significant digits
  let leadingZeros = 0;
  let significantPart = "";

  // Handle scientific notation
  if (valueStr.includes('e-')) {
    const [coefficient, exponent] = valueStr.split('e-');
    const exp = parseInt(exponent);
    leadingZeros = exp - 1; // e-7 means 6 leading zeros after decimal

    // Get first few significant digits from coefficient
    const cleanCoeff = coefficient.replace('.', '');
    significantPart = cleanCoeff.substring(0, 3); // Take first 3 significant digits
  } else {
    // Handle decimal format like 0.00000123
    const parts = valueStr.split('.');
    if (parts[1]) {
      const fractionalPart = parts[1];
      // Count leading zeros
      for (let i = 0; i < fractionalPart.length; i++) {
        if (fractionalPart[i] === '0') {
          leadingZeros++;
        } else {
          // Take next 3 significant digits
          significantPart = fractionalPart.substring(i, i + 3);
          break;
        }
      }
    }
  }

  // Remove trailing zeros from significant part
  significantPart = significantPart.replace(/0+$/, '');

  return {
    wholeNumber: isNegative ? "-0.0" : "0.0",
    leadingZeros: leadingZeros,
    significantDigits: significantPart,
    isSmallNumber: true,
    originalValue: value.toString(),
  };
};

// Get display values for CountUp based on card ID and numeric value
export const getBalanceDisplayValue = (
  cardId: string,
  value: number
): BalanceDisplayValue => {
  const config = CARD_FORMAT_CONFIG[cardId];
  if (!config) {
    return {
      numericValue: value,
      prefix: "",
      suffix: "",
      decimals: 0,
    };
  }

  switch (config.type) {
    case "currency":
      return formatCurrencyForCountUp(value);
    case "percentage":
      return formatPercentageForCountUp(value);
    case "token":
      return formatTokenAmountForCountUp(value, config.symbol);
    case "token_full":
      return formatTokenAmountFullForCountUp(value, config.symbol);
    case "large_number":
      return formatLargeNumberForCountUp(value);
    case "currency_full":
      return formatCurrencyFullForCountUp(value);
    case "time":
      const timeData = formatTimeFromSeconds(value);
      return {
        numericValue: timeData.days,
        prefix: "",
        suffix: `d ${timeData.hours}h ${timeData.minutes}m ${timeData.seconds}s`,
        decimals: 0,
      };
    default:
      return {
        numericValue: value,
        prefix: "",
        suffix: "",
        decimals: 0,
      };
  }
};
