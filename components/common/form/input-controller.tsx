import { Text } from "@/components/ui";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { InputBase } from "..";
import { HTMLInputTypeAttribute } from "react";

interface InputControllerProps<TFieldValues extends FieldValues = FieldValues> {
  placeholder?: string;
  disabled?: boolean;
  prepend?: React.ReactNode;
  append?: React.ReactNode;
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  maxLength?: number;
  inputType?: HTMLInputTypeAttribute;
  backgroundColor?: string;
  removeWhitespace?: boolean;
  allowOnlyAlphanumeric?: boolean;
  forceUppercase?: boolean;
}

// Control characters to filter out (C0, C1, and zero-width characters)
const CONTROL_CHARS = new Set([
  0x00a0, // Non-breaking space
  0x200b,
  0x200c,
  0x200d,
  0x200e,
  0x200f, // Zero-width chars
  0x202a,
  0x202b,
  0x202c,
  0x202d,
  0x202e, // Directional formatting
  0x2060, // Word joiner
  0xfeff, // Zero-width no-break space
]);

const isControlCharacter = (code: number): boolean => {
  return (
    code <= 0x1f || // C0 controls
    (code >= 0x7f && code <= 0x9f) || // C1 controls
    CONTROL_CHARS.has(code)
  );
};

const isCombiningDiacritic = (code: number): boolean => {
  return code >= 0x0300 && code <= 0x036f;
};

const convertVietnameseDToAscii = (char: string): string => {
  if (char === "\u0111") return "d"; // d (Vietnamese)
  if (char === "\u0110") return "D"; // D (Vietnamese)
  return char;
};

const isAllowedAsciiChar = (char: string, code: number): boolean => {
  const isDigit = code >= 0x30 && code <= 0x39;
  const isUpperAlpha = code >= 0x41 && code <= 0x5a;
  const isLowerAlpha = code >= 0x61 && code <= 0x7a;
  const isSpecialChar = char === "." || char === "_" || char === "-";

  return isDigit || isUpperAlpha || isLowerAlpha || isSpecialChar;
};

const removeControlCharacters = (text: string): string => {
  let result = "";
  for (const char of text) {
    if (!isControlCharacter(char.charCodeAt(0))) {
      result += char;
    }
  }
  return result;
};

const convertToAscii = (text: string): string => {
  let result = "";
  const decomposed = text.normalize("NFD");

  for (const char of decomposed) {
    const code = char.charCodeAt(0);

    // Skip combining diacritical marks
    if (isCombiningDiacritic(code)) {
      continue;
    }

    // Handle Vietnamese d/D
    const converted = convertVietnameseDToAscii(char);
    if (converted !== char) {
      result += converted;
      continue;
    }

    // Only keep allowed ASCII characters
    if (isAllowedAsciiChar(char, code)) {
      result += char;
    }
  }

  return result;
};

const sanitizeToAscii = (value: string): string => {
  if (!value) {
    return "";
  }

  // Step 1: Normalize to NFKC (compatibility composition)
  const normalized = value.normalize("NFKC");

  // Step 2: Remove control characters
  const withoutControl = removeControlCharacters(normalized);

  // Step 3: Convert to ASCII-only characters
  return convertToAscii(withoutControl);
};
export const InputController = <
  TFieldValues extends FieldValues = FieldValues
>({
  placeholder,
  disabled,
  prepend,
  append,
  control,
  name,
  maxLength,
  inputType = "text",
  backgroundColor,
  removeWhitespace,
  allowOnlyAlphanumeric,
  forceUppercase,
}: InputControllerProps<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        return (
          <div className="flex flex-col">
            <InputBase
              block={true}
              type={inputType}
              placeholder={placeholder}
              disabled={disabled}
              prepend={prepend}
              append={append}
              maxLength={maxLength}
              error={!!error}
              backgroundColor={backgroundColor}
              {...field}
              value={field.value || ""}
              onChange={(e) => {
                let value = e.target.value;

                // Handle number input type
                if (inputType === "number") {
                  if (value === "") {
                    field.onChange(undefined);
                    return;
                  }

                  const isValidNumberFormat = /^[0-9]*\.?[0-9]*$/.test(value);

                  if (isValidNumberFormat) {
                    const numValue = Number(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                      field.onChange(numValue);
                    } else if (
                      value.endsWith(".") &&
                      !isNaN(Number(value.slice(0, -1)))
                    ) {
                      return;
                    }
                  }
                  return;
                }

                // Remove whitespace if enabled
                if (removeWhitespace) {
                  value = value.replace(/\s/g, "");
                }

                // Normalize IME output to ASCII-only token characters
                if (allowOnlyAlphanumeric) {
                  value = sanitizeToAscii(value);
                  value = value.replace(/[^a-zA-Z0-9._-]/g, "");
                }

                // Force uppercase if enabled
                if (forceUppercase) {
                  value = value.toUpperCase();
                }

                // Enforce maxLength
                if (maxLength && value.length > maxLength) {
                  return;
                }

                field.onChange(value);
              }}
            />
            {error && (
              <Text className="text-orange mt-1">
                {error.message as string}
              </Text>
            )}
          </div>
        );
      }}
    />
  );
};
