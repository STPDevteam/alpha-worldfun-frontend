import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface UseAdaptiveFontSizeOptions {
  value: string;
  baseFontSize?: number; // Base font size in pixels
  minFontSize?: number; // Minimum font size in pixels
  containerPadding?: number; // Padding to account for
  placeholder?: string; // Placeholder text for measuring
}

/**
 * Hook to dynamically adjust font size based on input content length
 * to prevent overflow and maintain readability.
 *
 * IMPORTANT: This hook measures the ACTUAL rendered content from the input element,
 * not just the raw value. This ensures comma-formatted numbers are measured correctly.
 */
export const useAdaptiveFontSize = ({
  value,
  baseFontSize = 18,
  minFontSize = 12,
  containerPadding = 0,
  placeholder = "",
}: UseAdaptiveFontSizeOptions) => {
  const [fontSize, setFontSize] = useState(baseFontSize);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Use useLayoutEffect to measure synchronously before paint
  useLayoutEffect(() => {
    if (!inputRef.current || !containerRef.current) {
      setFontSize(baseFontSize);
      return;
    }

    const inputElement = inputRef.current;
    const containerElement = containerRef.current;

    // Get the actual displayed value (with commas if formatted)
    const displayedValue = inputElement.value || placeholder;

    if (!displayedValue) {
      setFontSize(baseFontSize);
      return;
    }

    // Get container width
    const containerWidth =
      containerElement.getBoundingClientRect().width - containerPadding;

    // Create temporary span to measure text
    const measureSpan = document.createElement("span");
    measureSpan.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: nowrap;
      font-family: "DM Mono";
      font-weight: 500;
      font-size: ${baseFontSize}px;
    `;
    measureSpan.textContent = displayedValue;
    document.body.appendChild(measureSpan);

    // Measure text width at base font size
    const textWidth = measureSpan.getBoundingClientRect().width;
    document.body.removeChild(measureSpan);

    // Calculate if we need to scale down
    if (textWidth > containerWidth && containerWidth > 0) {
      // Calculate scale factor with some margin for safety
      const scaleFactor = (containerWidth * 0.95) / textWidth;
      const newFontSize = Math.max(
        minFontSize,
        Math.floor(baseFontSize * scaleFactor)
      );
      setFontSize(newFontSize);
    } else {
      setFontSize(baseFontSize);
    }
  }, [value, baseFontSize, minFontSize, containerPadding, placeholder]);

  return {
    fontSize,
    inputRef,
    containerRef,
  };
};
