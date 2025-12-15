"use client";

import * as React from "react";
import { cn } from "@/libs/utils/index";

interface ProgressV2Props {
  /**
   * The current value of the progress (0-100)
   */
  value?: number;
  /**
   * Total number of segments to display
   * @default 21
   */
  segments?: number;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Color for active (filled) segments
   * @default "#D6914D"
   */
  activeColor?: string;
  /**
   * Color for inactive (unfilled) segments
   * @default "#373C3E"
   */
  inactiveColor?: string;
  /**
   * Width of each segment in pixels
   * @default 8
   */
  segmentWidth?: number;
  /**
   * Height of each segment in pixels
   * @default 24
   */
  segmentHeight?: number;
  /**
   * Gap between segments in pixels
   * @default 2
   */
  gap?: number;
}

/**
 * ProgressV2 - A segmented progress bar component
 *
 * Displays progress as a series of vertical rectangular segments.
 * Matches the Figma design spec with customizable appearance.
 *
 * @example
 * ```tsx
 * <ProgressV2 value={38} />
 * <ProgressV2 value={75} segments={20} activeColor="#00FF00" />
 * ```
 */
export function ProgressV2({
  value = 0,
  segments = 21,
  className,
  activeColor = "#D6914D",
  inactiveColor = "#343535",
  segmentWidth = 8,
  segmentHeight = 24,
  gap = 2,
}: ProgressV2Props) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);

  // Calculate number of active segments based on percentage
  const activeSegments = Math.round((clampedValue / 100) * segments);

  const previousValueRef = React.useRef(clampedValue);
  const isIncreasing = clampedValue >= previousValueRef.current;
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    previousValueRef.current = clampedValue;
  }, [clampedValue]);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate array of segment states
  const segmentStates = React.useMemo(
    () =>
      Array.from({ length: segments }, (_, index) => index < activeSegments),
    [segments, activeSegments]
  );

  return (
    <div
      className={cn("flex items-center self-stretch w-full", className)}
      style={{ gap: `${gap}px` }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${clampedValue}%`}
    >
      {segmentStates.map((isActive, index) => (
        <div
          key={index}
          className="relative flex-1 overflow-hidden rounded-[2px]"
          style={{
            height: `${segmentHeight}px`,
            flexBasis: `${segmentWidth}px`,
            flexShrink: 1,
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: inactiveColor }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: activeColor,
              transformOrigin: "left",
              transform: isActive && isMounted ? "scaleX(1)" : "scaleX(0)",
              opacity: isActive && isMounted ? 1 : 0,
              transition:
                "transform 0.5s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.45s ease",
              transitionDelay: `${(isIncreasing ? index : segments - index - 1) * 35}ms`,
              willChange: "transform",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Export a variant with preset styles for common use cases
export const ProgressV2Variants = {
  /**
   * Default style matching Figma design
   */
  default: {
    activeColor: "#D6914D",
    inactiveColor: "#343535",
    segments: 21,
  },
  /**
   * Small variant for compact spaces
   */
  small: {
    activeColor: "#D6914D",
    inactiveColor: "#343535",
    segments: 15,
    segmentWidth: 6,
    segmentHeight: 16,
    gap: 1.5,
  },
  /**
   * Large variant for emphasis
   */
  large: {
    activeColor: "#D6914D",
    inactiveColor: "#343535",
    segments: 30,
    segmentWidth: 10,
    segmentHeight: 32,
    gap: 3,
  },
} as const;
