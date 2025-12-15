import { SVGProps } from "react";

export const ArrowLeft = ({
  className,
  width = 24,
  height = 25,
}: SVGProps<SVGSVGElement>) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#clip0_270_7038)">
      <path
        d="M9.69997 18.8C10.09 18.41 10.09 17.78 9.69997 17.39L5.82997 13.5H21C21.55 13.5 22 13.05 22 12.5C22 11.95 21.55 11.5 21 11.5H5.82997L9.70997 7.61998C10.1 7.22998 10.1 6.59998 9.70997 6.20998C9.31997 5.81998 8.68997 5.81998 8.29997 6.20998L2.69997 11.8C2.30997 12.19 2.30997 12.82 2.69997 13.21L8.28997 18.8C8.67997 19.18 9.31997 19.18 9.69997 18.8Z"
        fill="#828B8D"
      />
    </g>
    <defs>
      <clipPath id="clip0_270_7038">
        <rect
          width="24"
          height="24"
          fill="white"
          transform="translate(0 0.5)"
        />
      </clipPath>
    </defs>
  </svg>
);
