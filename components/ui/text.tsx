import { cn } from "@/libs/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const textVariants = cva("text-white", {
  variants: {
    variant: {
      small: "text-xs/4.5 !font-dm-mono",
      base: "text-sm/4.5 !font-dm-mono",
      md: "text-base/5.5 !font-dm-mono",
      lg: "text-[18px]/5.5 !font-dm-mono",
      xl: "text-2xl/8 !font-dm-mono max-md:text-[18px]/5.5",
      xxl: "text-[28px]/9 !font-dm-mono",
      reg13: "text-[13px]/5 !font-dm-mono",
      "bdo-base": "text-sm/4.5 !font-bdo-grotesk",
      "bdo-md": "text-base/5 !font-bdo-grotesk",
      "bdo-xxl": "text-[32px]/9 !font-bdo-grotesk",
      "bdo-button": "text-base/5.5 !font-bdo-grotesk",
    },
    weight: {
      regular: "font-normal",
      semi: "font-semibold", //TODO: remove it after migration
      demibold: "font-semibold",
      medium: "font-medium",
      light: "font-light",
    },
  },
  defaultVariants: {
    variant: "base",
    weight: "regular",
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  /** When true, apply CSS to preserve newlines/whitespace (e.g. content from textarea) */
  preserveWhitespace?: boolean;
}

function Text({ className, variant, weight, preserveWhitespace, ...props }: TextProps) {
  return (
    <p
      className={cn(
        textVariants({ variant, weight }),
        preserveWhitespace && "whitespace-pre-wrap",
        className
      )}
      {...props}
    />
  );
}

export { Text, textVariants };
