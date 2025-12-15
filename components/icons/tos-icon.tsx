import { SVGProps } from "react";

export const TosIcon = ({
  className,
  width = 16,
  height = 18,
  ...props
}: SVGProps<SVGSVGElement>) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 16 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M13.5998 8.2V7.4C13.5998 4.38301 13.5998 2.87452 12.6625 1.93726C11.7253 1 10.2168 1 7.1998 1C4.18282 1 2.67432 1 1.73706 1.93726C0.799805 2.87452 0.799805 4.38301 0.799805 7.4V10.6C0.799805 13.617 0.799805 15.1255 1.73706 16.0627C2.67432 17 4.18282 17 7.1998 17"
      stroke="#F5F3FF"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.1998 16.9996L13.8284 15.6282M14.2855 13.3425C14.2855 14.8573 13.0575 16.0853 11.5427 16.0853C10.0278 16.0853 8.7998 14.8573 8.7998 13.3425C8.7998 11.8276 10.0278 10.5996 11.5427 10.5996C13.0575 10.5996 14.2855 11.8276 14.2855 13.3425Z"
      stroke="#F5F3FF"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      d="M4 5H10.4M4 8.2H7.2"
      stroke="#F5F3FF"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);