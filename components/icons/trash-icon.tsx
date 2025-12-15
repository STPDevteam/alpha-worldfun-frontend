import { cn } from "@/libs/utils";
import { SVGProps } from "react";

export const TrashIcon = ({
  className,
  width = 19,
  height = 21,
  ...props
}: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 19 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("hover:cursor-pointer hover:opacity-80", className)}
      {...props}
    >
      <path
        d="M1.49988 5.5H17.4999M7.49988 9.5V15.5M11.4999 9.5V15.5M2.49988 5.5L3.49988 17.5C3.49988 18.0304 3.71059 18.5391 4.08566 18.9142C4.46074 19.2893 4.96944 19.5 5.49988 19.5H13.4999C14.0303 19.5 14.539 19.2893 14.9141 18.9142C15.2892 18.5391 15.4999 18.0304 15.4999 17.5L16.4999 5.5M6.49988 5.5V2.5C6.49988 2.23478 6.60523 1.98043 6.79277 1.79289C6.98031 1.60536 7.23466 1.5 7.49988 1.5H11.4999C11.7651 1.5 12.0194 1.60536 12.207 1.79289C12.3945 1.98043 12.4999 2.23478 12.4999 2.5V5.5"
        stroke="#E23238"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
