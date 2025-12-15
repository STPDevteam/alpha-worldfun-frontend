import * as React from "react";
import { cn } from "@/libs/utils/cn";

export interface ArrowUpRightSharpIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export const ArrowUpRightSharpIcon = React.forwardRef<SVGSVGElement, ArrowUpRightSharpIconProps>(
  ({ size = 18, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("inline-block", className)}
        {...props}
      >
        <path
          d="M12.75 5.25L4.5 13.5"
          stroke="currentColor"
          strokeWidth="1.125"
          strokeLinecap="round"
        />
        <path
          d="M8.25 4.5H12.75C13.1036 4.5 13.2803 4.5 13.3902 4.60983C13.5 4.71967 13.5 4.89645 13.5 5.25V9.75"
          stroke="currentColor"
          strokeWidth="1.125"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
);

ArrowUpRightSharpIcon.displayName = "ArrowUpRightSharpIcon";