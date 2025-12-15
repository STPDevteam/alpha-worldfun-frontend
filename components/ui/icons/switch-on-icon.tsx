import * as React from "react";
import { cn } from "@/libs/utils/cn";

export interface SwitchOnIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export const SwitchOnIcon = React.forwardRef<SVGSVGElement, SwitchOnIconProps>(
  ({ size = 24, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={typeof size === 'number' ? (size * 16) / 24 : '16'}
        viewBox="0 0 24 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("inline-block", className)}
        {...props}
      >
        <path
          d="M16 0H8C3.589 0 0 3.589 0 8C0 12.411 3.589 16 8 16H16C20.411 16 24 12.411 24 8C24 3.589 20.411 0 16 0ZM16 15H8C4.14 15 1 11.859 1 8C1 4.141 4.14 1 8 1H16C19.86 1 23 4.141 23 8C23 11.859 19.86 15 16 15ZM20 8C20 10.206 18.206 12 16 12C13.794 12 12 10.206 12 8C12 5.794 13.794 4 16 4C18.206 4 20 5.794 20 8Z"
          fill="currentColor"
        />
      </svg>
    );
  }
);

SwitchOnIcon.displayName = "SwitchOnIcon";