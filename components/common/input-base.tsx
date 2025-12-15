import { cn } from "@/libs/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputBaseProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  inputClassName?: string;
  block?: boolean;
  prepend?: React.ReactNode;
  append?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  backgroundColor?: string;
}

const getState = (disabled: boolean, error: boolean) => {
  if (disabled) return "disabled";
  if (error) return "error";
  return "enabled";
};

export const InputBase = forwardRef<HTMLInputElement, InputBaseProps>(
  (
    {
      containerClassName,
      inputClassName,
      block = false,
      disabled = false,
      error = false,
      prepend,
      append,
      backgroundColor = "bg-dark-900",
      ...props
    },
    ref
  ) => {
    return (
      <div
        data-state={getState(disabled, error)}
        className={cn(
          "group",
          block ? "w-full" : "w-fit",
          "px-4 py-3",
          backgroundColor,
          "border-dark-700 border rounded-xl",
          "input-hover:bg-[#19B0AE]",
          "input-active:bg-[#19B0AE]",
          "input-error:bg-[#E73420]",
          "input-disabled:bg-[#869DA3]",
          "flex items-center justify-between",
          containerClassName
        )}
      >
        {prepend}
        <input
          className={cn(
            "m-0",
            "border-none",
            "rounded-none",
            "w-full",
            "h-full",
            "max-h-5",
            "focus:outline-none",
            "bg-transparent",
            "text-light",
            "input-disabled:cursor-not-allowed",
            "input-disabled:text-[#869DA3]",
            "placeholder:text-grey-300",
            "text-sm/4.5",
            inputClassName
          )}
          disabled={disabled}
          onFocus={(e) => {
            // Move cursor to end of content
            const value = e.target.value;
            e.target.setSelectionRange(value.length, value.length);
            if (props.onFocus) {
              props.onFocus(e);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === " " && e.currentTarget.selectionStart === 0) {
              e.preventDefault();
            }
            if (props.onKeyDown) {
              props.onKeyDown(e);
            }
          }}
          autoComplete="off"
          {...props}
          ref={ref}
        />
        {append}
      </div>
    );
  }
);

InputBase.displayName = "InputBase";
