"use client";

import * as React from "react";
import { cn } from "@/libs/utils/cn";
import { CopyIcon } from "@/components/ui/icons/copy-icon";
import { useToastStore } from "@/libs/stores/toast.store";
import { Button, type ButtonProps } from "./button";

export interface CopyButtonProps
  extends Omit<ButtonProps, "children" | "onClick"> {
  content: string;
  successMessage?: string;
  errorMessage?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
  onCopySuccess?: () => void;
  onCopyError?: (error: Error) => void;
}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      content,
      successMessage = "Copied to clipboard",
      errorMessage = "Failed to copy",
      showIcon = true,
      children,
      onCopySuccess,
      onCopyError,
      className,
      disabled,
      variant = "ghost",
      size = "icon",
      ...props
    },
    ref
  ) => {
    const [isCopying, setIsCopying] = React.useState(false);
    const addToast = useToastStore((state) => state.addToast);

    const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();

      if (disabled || isCopying || !content) return;

      setIsCopying(true);

      try {
        await navigator.clipboard.writeText(content);

        addToast({
          type: "success",
          title: successMessage,
          duration: 3000,
        });

        onCopySuccess?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Copy failed");

        addToast({
          type: "error",
          title: errorMessage,
          description: err.message,
          duration: 5000,
        });

        onCopyError?.(err);
      } finally {
        setIsCopying(false);
      }
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "transition-all duration-200",
          isCopying && "opacity-70 cursor-wait",
          className
        )}
        disabled={disabled || isCopying || !content}
        onClick={handleCopy}
        title={`Copy: ${content}`}
        aria-label={`Copy content: ${content}`}
        {...props}
      >
        {showIcon && (
          <CopyIcon
            size={size === "icon" ? 16 : 14}
            className={cn(
              "transition-transform duration-200",
              isCopying && "scale-90"
            )}
          />
        )}
        {children}
      </Button>
    );
  }
);

CopyButton.displayName = "CopyButton";

export { CopyButton };
