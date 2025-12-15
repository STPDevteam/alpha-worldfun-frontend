import * as React from "react";
import { cn } from "@/libs/utils/cn";

export interface ArrowRightIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export const ArrowRightIcon = React.forwardRef<SVGSVGElement, ArrowRightIconProps>(
  ({ size = 24, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={typeof size === 'number' ? (size * 11) / 12 : '11'}
        height={size}
        viewBox="0 0 11 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("inline-block", className)}
        {...props}
      >
        <path
          d="M2.38419e-07 6H10M10 6L5 1M10 6L5 11"
          stroke="currentColor"
        />
      </svg>
    );
  }
);

ArrowRightIcon.displayName = "ArrowRightIcon";