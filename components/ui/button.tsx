import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/libs/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer hover:cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-transparent text-primary-foreground hover:bg-transparent",
        primary:
          "bg-[#0E3263] text-light hover:bg-[#0E3263]/90 rounded-[16px] px-[14px] py-[8px] gap-[8px]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        grey: "bg-[#373C3E66] text-light hover:bg-[#373C3E66]/90 rounded-[10px] px-6 py-2.5 gap-[8px]", //TODO: change to primary/secondary
        light: "bg-light text-dark-900 hover:bg-light/90 rounded-[10px] px-6 py-2.5 gap-[8px]", //TODO: change to primary/secondary
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  background?: string;
  radius?: string;
  textColor?: string;
  hoverEffect?: string;
  customStyle?: React.CSSProperties;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      background,
      radius,
      textColor,
      hoverEffect,
      customStyle,
      style,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const dynamicStyles: React.CSSProperties = {
      ...customStyle,
      ...style,
      ...(background && { backgroundColor: background }),
      ...(radius && { borderRadius: radius }),
      ...(textColor && { color: textColor }),
    };

    const dynamicClasses = cn(
      buttonVariants({ variant, size }),
      hoverEffect && `hover:${hoverEffect}`,
      className
    );

    return (
      <Comp
        className={dynamicClasses}
        style={dynamicStyles}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
