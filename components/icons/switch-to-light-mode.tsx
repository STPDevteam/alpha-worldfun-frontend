export const SwitchToLightMode: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className,
  width = 22,
  height = 22,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M11 17.5C14.5899 17.5 17.5 14.5899 17.5 11C17.5 7.41015 14.5899 4.5 11 4.5C7.41015 4.5 4.5 7.41015 4.5 11C4.5 14.5899 7.41015 17.5 11 17.5Z"
        stroke="#F5F3FF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.14 18.14L18.01 18.01M18.01 3.99L18.14 3.86L18.01 3.99ZM3.86 18.14L3.99 18.01L3.86 18.14ZM11 1.08V1V1.08ZM11 21V20.92V21ZM1.08 11H1H1.08ZM21 11H20.92H21ZM3.99 3.99L3.86 3.86L3.99 3.99Z"
        stroke="#F5F3FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
