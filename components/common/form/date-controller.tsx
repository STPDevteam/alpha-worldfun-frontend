import {
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@/components/ui";
import { cn } from "@/libs/utils";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface DateControllerProps<TFieldValues extends FieldValues = FieldValues> {
  placeholder?: string;
  disabled?: boolean;
  prepend?: React.ReactNode;
  append?: React.ReactNode;
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  disablePastDates?: boolean;
}
export const DateController = <TFieldValues extends FieldValues = FieldValues>({
  placeholder,
  append,
  control,
  name,
  disablePastDates = false,
}: DateControllerProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        return (
          <div className="flex flex-col">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "px-4 py-3",
                    "flex justify-between",
                    "border border-dark-700 rounded-xl",
                    "bg-dark-900",
                    append && "w-48"
                  )}
                >
                  <Text className="text-light">
                    {field.value
                      ? field.value.toLocaleDateString()
                      : <span className="text-grey-300">{placeholder}</span>}
                  </Text>
                </button>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={4}
                className="w-auto overflow-hidden p-0"
                align="start"
                side="bottom"
              >
                <Calendar
                  mode="single"
                  selected={field.value}
                  captionLayout="dropdown"
                  disabled={disablePastDates ? (date) => date < new Date(new Date().setHours(0, 0, 0, 0)) : undefined}
                  onSelect={(date) => {
                    field.onChange(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
            {error && <Text className="text-orange mt-1">{error.message as string}</Text>}
          </div>
        );
      }}
    />
  );
};
