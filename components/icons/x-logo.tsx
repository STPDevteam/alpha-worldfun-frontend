import { SVGProps } from "react";

export const XLogo = ({
  className,
  width = 14,
  height = 14,
  ...props
}: SVGProps<SVGSVGElement>) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M8.226 5.9907L13.0271 0.409912H11.8894L7.7206 5.2557L4.391 0.409912H0.550781L5.5857 7.7376L0.550781 13.5899H1.6885L6.0908 8.4726L9.6071 13.5899H13.4474L8.226 5.9907ZM6.6677 7.8021L6.1575 7.0724L2.0985 1.2664H3.846L7.1217 5.9521L7.6319 6.6817L11.8899 12.7724H10.1424L6.6677 7.8021Z"
      fill="#F5F3FF"
    />
  </svg>
);
