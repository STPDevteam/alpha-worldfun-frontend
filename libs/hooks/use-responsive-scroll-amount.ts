import { useState, useEffect } from "react";

/**
 * Custom hook to calculate responsive scroll amount based on breakpoint
 *
 * Returns:
 * - 301px for mobile (< 768px): 285px card + 16px gap
 * - 321px for desktop (≥ 768px): 305px card + 16px gap
 */
export function useResponsiveScrollAmount() {
  const [scrollAmount, setScrollAmount] = useState(301); // Mobile default

  useEffect(() => {
    const updateScrollAmount = () => {
      // md breakpoint: 768px
      const isMobile = window.innerWidth < 768;
      setScrollAmount(isMobile ? 301 : 321);
    };

    // Set initial value
    updateScrollAmount();

    // Update on window resize
    window.addEventListener("resize", updateScrollAmount);
    return () => window.removeEventListener("resize", updateScrollAmount);
  }, []);

  return scrollAmount;
}
