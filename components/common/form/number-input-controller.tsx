import { Text } from "@/components/ui";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { InputBase } from "..";
import { HTMLInputTypeAttribute } from "react";
import { BaseDecimalInput } from "../base-decimal-input";
import { cn } from "@/libs/utils";

interface NumberInputControllerProps<
  TFieldValues extends FieldValues = FieldValues
> {
  placeholder?: string;
  disabled?: boolean;
  prepend?: React.ReactNode;
  append?: React.ReactNode;
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  maxLength?: number;
  inputType?: HTMLInputTypeAttribute;
}
export const NumberInputController = <
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
}: NumberInputControllerProps<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        return (
          <div className="flex flex-col">
            <div className="relative">
              {prepend && (
                <div className="absolute w-7 h-6 flex items-center justify-start left-2.5 top-1/2 -translate-y-1/2 z-10">
                  {prepend}
                </div>
              )}
              <BaseDecimalInput
                className={cn(
                  "w-full",
                  "bg-dark-900",
                  "border-dark-700 border rounded-xl",
                  "px-4 py-3",
                  "text-sm/4.5",
                  "placeholder:text-grey-300",
                  "text-light",
                  "focus:outline-none"
                )}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                value={field.value || ""}
                onChange={(value) => field.onChange(value)}
                maxDecimals={18}
              />
              {append && (
                <div className="absolute w-7 h-6 flex items-center justify-end right-4 bottom-3 z-10">
                  {append}
                </div>
              )}
            </div>
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
