import { Text } from "@/components/ui";
import { cn } from "@/libs/utils";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

// Custom scrollbar styles - inject into document head
if (typeof document !== "undefined") {
  const styleId = "custom-scrollbar-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #4B5563;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #6B7280;
      }
    `;
    document.head.appendChild(style);
  }
}

interface TextAreaControllerProps<
  TFieldValues extends FieldValues = FieldValues
> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  placeholder: string;
  prepend?: React.ReactNode;
  append?: React.ReactNode;
  maxLength?: number;
  backgroundColor?: string;
  height?: string;
  enableScrollbarStyling?: boolean;
}

export const TextAreaController = <
  TFieldValues extends FieldValues = FieldValues
>({
  control,
  name,
  placeholder,
  prepend,
  append,
  maxLength = 300,
  backgroundColor = "bg-dark-900",
  height = "h-28",
  enableScrollbarStyling = false,
}: TextAreaControllerProps<TFieldValues>) => {
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

              <textarea
                id={String(field.name)}
                name={field.name}
                placeholder={placeholder}
                className={cn(
                  "w-full",
                  height,
                  "px-4 py-3",
                  "text-light placeholder:text-brGrey-1",
                  backgroundColor,
                  "focus-visible:outline-none",
                  "border-dark-700 border rounded-xl",
                  "text-sm/4.5",
                  "resize-none",
                  prepend && "pl-11",
                  append && "pr-11",
                  enableScrollbarStyling && "custom-scrollbar"
                )}
                style={
                  enableScrollbarStyling
                    ? {
                        scrollbarWidth: "thin",
                        scrollbarColor: "#4B5563 transparent",
                      }
                    : undefined
                }
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (maxLength && value.length > maxLength) {
                    return;
                  }
                  field.onChange(value);
                }}
                onFocus={(e) => {
                  // Move cursor to end of content
                  const value = e.target.value;
                  e.target.setSelectionRange(value.length, value.length);
                }}
                onBlur={field.onBlur}
                ref={field.ref}
                maxLength={maxLength}
                aria-invalid={!!error}
                aria-describedby={
                  error ? `${String(field.name)}-error` : undefined
                }
                onKeyDown={(e) => {
                  if (
                    (e.key === " " || e.key === "Enter") &&
                    e.currentTarget.selectionStart === 0
                  ) {
                    e.preventDefault();
                  }
                }}
              />

              {append && (
                <div className="absolute w-7 h-6 flex items-center justify-end right-4 bottom-3 z-10">
                  {append}
                </div>
              )}
            </div>
            {error && (
              <Text id={`${String(field.name)}-error`} className="text-orange">
                {error.message as string}
              </Text>
            )}
          </div>
        );
      }}
    />
  );
};
