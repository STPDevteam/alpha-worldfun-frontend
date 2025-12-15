import { Input } from "@/components/ui";
import { cn } from "@/libs/utils";
import React, {
  ChangeEvent,
  forwardRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { FieldValues, UseControllerReturn } from "react-hook-form";
import { formatUnits, parseUnits } from "viem";

interface BaseDecimalInputProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Input>,
    "onChange" | "value" | "type" | "inputMode" | "step"
  > {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  onChangeBigInt?: (value: bigint | undefined) => void;
  maxDecimals?: number;
  field?: UseControllerReturn<FieldValues, string>;
  enableCommaFormatting?: boolean;
}

/**
 * Validates if a string is a valid decimal number format
 */
const isValidDecimalString = (value: string): boolean => {
  // Allow empty string
  if (value === "") return true;

  // Allow single decimal point
  if (value === ".") return true;

  // Allow digits with optional single decimal point
  const validDecimalFormat = /^(\d+\.?\d*|\.\d*|0\.)$/;
  return validDecimalFormat.test(value);
};

/**
 * Clamps decimal part to max decimal places
 */
const clampDecimalPart = (decimalPart: string, maxDecimals: number): string => {
  if (maxDecimals === undefined || Number.isNaN(maxDecimals)) {
    return decimalPart;
  }

  const safeMaxDecimals = Math.max(Math.floor(maxDecimals), 0);
  if (safeMaxDecimals === 0) {
    return "";
  }

  if (decimalPart.length <= safeMaxDecimals) {
    return decimalPart;
  }

  return decimalPart.slice(0, safeMaxDecimals);
};

/**
 * Strips leading zeros from integer part while preserving "0" for zero values
 */
const stripLeadingZeros = (value: string): string => {
  if (value.length === 0) return "0";
  const trimmed = value.replace(/^0+(?=\d)/, "");
  return trimmed.length === 0 ? "0" : trimmed;
};

/**
 * Normalizes a string value to valid decimal format
 * Preserves full precision - no rounding or parseFloat
 */
const normalizeDecimalString = (
  rawValue: string | undefined,
  maxDecimals: number
): string => {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return "";
  }

  let normalized = String(rawValue).trim();
  if (normalized.length === 0) return "";

  // Remove any commas from formatting
  normalized = normalized.replace(/,/g, "");

  // Handle sign (we don't allow negative for blockchain amounts)
  if (normalized.startsWith("-") || normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }

  // Single decimal point becomes "0."
  if (normalized === ".") {
    return "0.";
  }

  // Handle decimal splitting
  if (!normalized.includes(".")) {
    return stripLeadingZeros(normalized);
  }

  const [rawIntegerPart, rawDecimalPart = ""] = normalized.split(".");
  const integerPart = stripLeadingZeros(rawIntegerPart);
  const decimalPart = clampDecimalPart(rawDecimalPart, maxDecimals);

  if (decimalPart.length === 0) {
    return integerPart;
  }

  const composedInteger = integerPart === "" ? "0" : integerPart;
  return `${composedInteger}.${decimalPart}`;
};

/**
 * Formats a decimal string with comma thousands separators
 */
const formatWithCommas = (
  numStr: string,
  enableCommaFormatting: boolean
): string => {
  if (!enableCommaFormatting || !numStr) return numStr;

  const parts = numStr.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimalPart !== undefined
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
};

/**
 * Removes comma separators from string
 */
const removeCommas = (str: string): string => {
  return str.replace(/,/g, "");
};

const calculateCursorPosition = (
  oldValue: string,
  newValue: string,
  oldCursorPos: number
): number => {
  if (oldCursorPos >= oldValue.length) {
    return newValue.length;
  }

  let charCount = 0;
  for (let i = 0; i < oldCursorPos && i < oldValue.length; i++) {
    if (oldValue[i] !== ",") {
      charCount++;
    }
  }

  let count = 0;
  for (let i = 0; i < newValue.length; i++) {
    if (newValue[i] !== ",") {
      count++;
    }
    if (count === charCount) {
      return i + 1;
    }
  }

  // Fallback to end of string
  return newValue.length;
};

const stringToBigInt = (
  value: string | undefined,
  decimals: number
): bigint | undefined => {
  if (!value || value === "" || value === ".") {
    return undefined;
  }

  try {
    // Ensure the value is a valid decimal string
    const cleanValue = removeCommas(value);

    // Handle trailing decimal point
    const normalizedValue = cleanValue.endsWith(".")
      ? cleanValue.slice(0, -1)
      : cleanValue;

    if (normalizedValue === "" || normalizedValue === "0") {
      return BigInt(0);
    }

    return parseUnits(normalizedValue, decimals);
  } catch (error) {
    console.error("Error converting string to BigInt:", error);
    return undefined;
  }
};

export const BaseDecimalInput = forwardRef<
  HTMLInputElement,
  BaseDecimalInputProps
>(
  (
    {
      value,
      onChange,
      onChangeBigInt,
      maxDecimals = 18,
      className,
      onKeyDown,
      field,
      enableCommaFormatting = false,
      ...rest
    },
    ref
  ) => {
    // External value from props or field
    const externalValue = field?.field?.value ?? value;
    const normalizedExternalValue = normalizeDecimalString(
      externalValue,
      maxDecimals
    );
    const formattedExternalValue = formatWithCommas(
      normalizedExternalValue,
      enableCommaFormatting
    );

    // Track user input separately while typing
    const [userInput, setUserInput] = useState<string | null>(null);
    const [isUserTyping, setIsUserTyping] = useState(false);

    // Track cursor position for comma formatting
    const cursorPositionRef = useRef<number | null>(null);
    const inputElementRef = useRef<HTMLInputElement | null>(null);

    // Use a key to force re-render when external value changes from something to empty
    const [componentKey, setComponentKey] = useState(0);
    const prevExternalValueRef = useRef<string | undefined>(externalValue);

    // Detect external value reset and trigger re-render
    useEffect(() => {
      const prevValue = prevExternalValueRef.current;
      const isNowEmpty = !externalValue || externalValue === "";
      const hadValueBefore = prevValue !== undefined && prevValue !== "";

      // When reset is detected, increment key to force re-render
      if (hadValueBefore && isNowEmpty && !isUserTyping) {
        setComponentKey((prev) => prev + 1);
        setUserInput(null);
      }

      prevExternalValueRef.current = externalValue;
    }, [externalValue, isUserTyping]);

    // Derive display value from user input or external value
    const displayValue = useMemo(() => {
      // Show user input while typing
      if (isUserTyping && userInput !== null) {
        return userInput;
      }
      // Otherwise show formatted external value
      return formattedExternalValue;
    }, [isUserTyping, userInput, formattedExternalValue]);

    // Restore cursor position after formatting
    useEffect(() => {
      if (
        inputElementRef.current &&
        cursorPositionRef.current !== null &&
        isUserTyping
      ) {
        const input = inputElementRef.current;
        const cursorPos = cursorPositionRef.current;

        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          try {
            input.setSelectionRange(cursorPos, cursorPos);
          } catch (e) {
            // Silently fail if setSelectionRange is not supported
          }
        });

        cursorPositionRef.current = null;
      }
    }, [displayValue, isUserTyping]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const currentCursorPos = e.target.selectionStart ?? inputValue.length;
      setIsUserTyping(true);

      // Process input based on formatting mode
      let processedValue = inputValue;

      if (enableCommaFormatting) {
        // Remove commas for processing, but preserve decimal points
        processedValue = removeCommas(inputValue);
      } else {
        // Replace comma with decimal for European input style
        if (processedValue.includes(",") && !processedValue.includes(".")) {
          processedValue = processedValue.replace(",", ".");
        }
      }

      // Handle empty input
      if (processedValue === "") {
        setUserInput("");
        onChange(undefined);
        if (onChangeBigInt) {
          onChangeBigInt(undefined);
        }
        if (field?.field?.onChange && field.field.onChange !== onChange) {
          field.field.onChange(undefined);
        }
        return;
      }

      // Validate decimal format
      if (!isValidDecimalString(processedValue)) {
        return;
      }

      // Prevent multiple decimal points
      const decimalCount = (processedValue.match(/\./g) || []).length;
      if (decimalCount > 1) {
        return;
      }

      // Check decimal places
      const parts = processedValue.split(".");
      if (parts[1] && parts[1].length > maxDecimals) {
        return;
      }

      let finalValue = processedValue;

      // Convert standalone decimal to 0.
      if (finalValue === ".") {
        finalValue = "0.";
      }

      // Remove leading zeros (except for 0. cases)
      if (
        finalValue.length > 1 &&
        finalValue.startsWith("0") &&
        !finalValue.startsWith("0.")
      ) {
        finalValue = finalValue.substring(1);
      }

      // Check if user is typing trailing zeros or decimal point
      const hasTrailingZeros =
        finalValue.includes(".") && finalValue.match(/\.(\d*0+)$/);
      const endsWithDecimal = finalValue.endsWith(".");

      // Apply comma formatting but preserve trailing zeros and decimals
      let formattedDisplayValue;
      if (endsWithDecimal || hasTrailingZeros) {
        // Preserve exact user input for trailing zeros and decimal points
        if (enableCommaFormatting) {
          const parts = finalValue.split(".");
          const formattedInteger = parts[0].replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ","
          );
          formattedDisplayValue =
            parts[1] !== undefined
              ? `${formattedInteger}.${parts[1]}`
              : `${formattedInteger}.`;
        } else {
          formattedDisplayValue = finalValue;
        }
      } else {
        formattedDisplayValue = formatWithCommas(
          finalValue,
          enableCommaFormatting
        );
      }

      // Update user input display
      setUserInput(formattedDisplayValue);

      // Calculate and store new cursor position if comma formatting is enabled
      if (enableCommaFormatting) {
        const oldDisplayValue = displayValue || "";
        const newCursorPos = calculateCursorPosition(
          oldDisplayValue,
          formattedDisplayValue,
          currentCursorPos
        );
        cursorPositionRef.current = newCursorPos;
      }

      // Determine the string value to emit
      const stringValue =
        finalValue === "" || finalValue === "." || finalValue === "0."
          ? undefined
          : finalValue;

      // Call onChange with string value
      onChange(stringValue);

      // Call onChangeBigInt with BigInt value if provided
      if (onChangeBigInt) {
        const bigIntValue = stringToBigInt(stringValue, maxDecimals);
        onChangeBigInt(bigIntValue);
      }

      // Also update react-hook-form field if provided
      if (field?.field?.onChange && field.field.onChange !== onChange) {
        field.field.onChange(stringValue);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsUserTyping(false);
      const cleanedValue = removeCommas(displayValue);

      // Clean up and finalize the value on blur
      if (cleanedValue) {
        let finalStringValue: string | undefined;

        if (cleanedValue === "." || cleanedValue === "0.") {
          finalStringValue = "0";
        } else if (cleanedValue.endsWith(".")) {
          // Remove trailing decimal
          finalStringValue = cleanedValue.slice(0, -1);
        } else {
          finalStringValue = cleanedValue;
        }

        if (finalStringValue) {
          onChange(finalStringValue);

          // Update BigInt value
          if (onChangeBigInt) {
            const bigIntValue = stringToBigInt(finalStringValue, maxDecimals);
            onChangeBigInt(bigIntValue);
          }

          if (field?.field?.onChange && field.field.onChange !== onChange) {
            field.field.onChange(finalStringValue);
          }
        } else {
          // Only set to undefined if truly empty/invalid
          onChange(undefined);
          if (onChangeBigInt) {
            onChangeBigInt(undefined);
          }
          if (field?.field?.onChange && field.field.onChange !== onChange) {
            field.field.onChange(undefined);
          }
        }
      }

      if (field?.field?.onBlur) {
        field.field.onBlur();
      }

      if (rest.onBlur && rest.onBlur !== field?.field?.onBlur) {
        rest.onBlur(e);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsUserTyping(true);
      setUserInput(displayValue || "");

      if (rest.onFocus) {
        rest.onFocus(e);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Block scientific notation and negative/positive signs
      if (["e", "E", "+", "-"].includes(e.key)) {
        e.preventDefault();
      }
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    const combinedRef = (instance: HTMLInputElement | null) => {
      // Store in our internal ref for cursor position management
      inputElementRef.current = instance;

      // Forward to external refs
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref) {
        ref.current = instance;
      }
      if (field?.field?.ref) {
        field.field.ref(instance);
      }
    };

    return (
      <Input
        key={componentKey}
        ref={combinedRef}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        name={field?.field?.name}
        disabled={rest.disabled}
        type="text"
        inputMode="decimal"
        className={cn(
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          className
        )}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        {...rest}
      />
    );
  }
);

BaseDecimalInput.displayName = "BaseDecimalInput";

export const bigIntToString = (
  value: bigint,
  decimals: number = 18
): string => {
  return formatUnits(value, decimals);
};

export const stringToBigIntUtil = (
  value: string,
  decimals: number = 18
): bigint => {
  return parseUnits(value, decimals);
};
