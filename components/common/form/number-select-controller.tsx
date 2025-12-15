import { Button, Text } from "@/components/ui";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { InputBase } from "..";
import { HTMLInputTypeAttribute } from "react";
import { BaseDecimalInput } from "../base-decimal-input";
import { cn } from "@/libs/utils";

interface NumberSelectControllerProps<
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
  options: { value: number; label: string }[];
}
export const NumberSelectController = <
  TFieldValues extends FieldValues = FieldValues
>({
  placeholder,
  disabled,
  prepend,
  append,
  control,
  name,
  maxLength,
  options,
}: NumberSelectControllerProps<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        return (
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row w-full gap-3 md:gap-2.5">
              <div className="relative flex-1">
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
              <div className="flex gap-2.5">
                {options.map((item) => (
                  <Button
                    key={item.value}
                    variant={field.value === item.value.toString() ? "light" : "grey"}
                    className={cn("hover:opacity-80", "flex-1")}
                    onClick={() => field.onChange(item.value.toString())}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
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
