import React from "react";
import { formatSmallNumberWithUI } from "@/libs/utils/format";

interface SmallNumberDisplayProps {
  value: string | number | null | undefined;
  className?: string;
  smallTextClass?: string;
  style?: React.CSSProperties;
}

const SmallNumberDisplay: React.FC<SmallNumberDisplayProps> = ({
  value,
  className = "",
  smallTextClass = "text-xs opacity-75",
  style
}) => {
  // Handle empty/null values
  if (!value && value !== 0) {
    return (
      <span className={className} style={style}>
        0
      </span>
    );
  }

  const formatted = formatSmallNumberWithUI(value);

  // For normal numbers, display as usual
  if (!formatted.isSmallNumber) {
    return (
      <span className={className} style={style}>
        {formatted.wholeNumber}
      </span>
    );
  }

  // For small numbers, display with visual leading zero count
  return (
    <span className={className} style={style}>
      {formatted.wholeNumber}
      {formatted.leadingZeros !== undefined && formatted.leadingZeros > 0 && (
        <span className={smallTextClass}>
          {formatted.leadingZeros}
        </span>
      )}
      {formatted.significantDigits}
    </span>
  );
};

export default SmallNumberDisplay;