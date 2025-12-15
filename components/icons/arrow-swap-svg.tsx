import React from "react";

interface ArrowSwapSvgProps {
  width?: number;
  height?: number;
  className?: string;
}

const ArrowSwapSvg: React.FC<ArrowSwapSvgProps> = ({
  width = 21,
  height = 20,
  className
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8.10076 17.0832L3.91748 12.9082"
        stroke="white"
        strokeWidth="1.1149"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.10059 2.91699V17.0836"
        stroke="white"
        strokeWidth="1.1149"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.084 2.91699L17.2673 7.09197"
        stroke="white"
        strokeWidth="1.1149"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.084 17.0836V2.91699"
        stroke="white"
        strokeWidth="1.1149"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowSwapSvg;