import * as React from "react";
import { cn } from "@/libs/utils/cn";

export interface LoadingIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export const LoadingIcon = React.forwardRef<SVGSVGElement, LoadingIconProps>(
  ({ size = 18, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 17 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("inline-block animate-spin", className)}
        {...props}
      >
        <path
          d="M13.245 14.8256C11.9233 15.8186 10.2804 16.407 8.5 16.407C4.1331 16.407 0.593023 12.8669 0.593023 8.5C0.593023 4.1331 4.1331 0.593023 8.5 0.593023C12.8669 0.593023 16.407 4.1331 16.407 8.5C16.407 9.18265 16.3205 9.84509 16.1578 10.477C15.9813 11.1625 15.2324 11.481 14.5646 11.246C13.9968 11.0461 13.7361 10.3975 13.8783 9.8126C13.9806 9.39183 14.0349 8.95225 14.0349 8.5C14.0349 5.44317 11.5568 2.96512 8.5 2.96512C5.44317 2.96512 2.96512 5.44317 2.96512 8.5C2.96512 11.5568 5.44317 14.0349 8.5 14.0349C9.54346 14.0349 10.5195 13.7461 11.3525 13.2442"
          stroke="currentColor"
          strokeWidth="1.125"
          strokeLinecap="round"
        />
      </svg>
    );
  }
);

LoadingIcon.displayName = "LoadingIcon";