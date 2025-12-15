import { SVGProps } from "react";

export const ArrowTopRight = ({ className, width = 12, height = 12 }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1.05025 11.3492L10.9497 1.44975M10.9497 1.44975H1.05025M10.9497 1.44975V11.3492"
        stroke="#E0E0E0"
      />
    </svg>
  );
};
