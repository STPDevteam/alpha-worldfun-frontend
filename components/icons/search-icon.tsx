import { SVGProps } from "react";

export const SearchIcon = ({
  className,
  width = 16,
  height = 15,
  ...props
}: SVGProps<SVGSVGElement>) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 16 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M12.3335 11.8333L14.6668 14.1666M14.0002 7.16658C14.0002 3.66878 11.1646 0.833252 7.66683 0.833252C4.16903 0.833252 1.3335 3.66878 1.3335 7.16658C1.3335 10.6644 4.16903 13.4999 7.66683 13.4999C11.1646 13.4999 14.0002 10.6644 14.0002 7.16658Z"
      stroke="#828B8D"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
