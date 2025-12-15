import { cn } from "@/libs/utils";
import { Button, Text } from "@/components/ui";
import { ArrowLeft } from "../icons/arrow-left";

export const FormLayout = ({
  title,
  children,
  onBack,
  onContinue,
  isDisabledContinue,
  continueText = "Continue",
  className,
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  onContinue: () => void;
  isDisabledContinue?: boolean;
  continueText?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "w-full md:max-w-[589px]",
        "rounded-3xl",
        "p-4 md:p-6",
        "z-10",
        "bg-[#0101014D]",
        "border border-light/15",
        "relative",
        className
      )}
    >
      <div className={cn("py-4.5", "flex items-center justify-between")}>
        {onBack ? (
          <button
            className={cn(
              "cursor-pointer",
              "group",
              "rounded-full",
              "w-9 h-9",
              "pr-4",
              "flex items-center justify-center"
            )}
            onClick={onBack}
          >
            <ArrowLeft className="group-hover:opacity-50" />
          </button>
        ) : (
          <div className="w-6 h-6"></div>
        )}
        <Text variant="xl" weight="medium" className="text-light">
          {title}
        </Text>
        <div className="w-6 h-6"></div>
      </div>
      {children}

      <div className="flex justify-end mt-6">
        <Button
          variant="light"
          onClick={onContinue}
          className="uppercase"
          disabled={isDisabledContinue}
        >
          {continueText}
        </Button>
      </div>
    </div>
  );
};
