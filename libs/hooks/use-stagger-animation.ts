"use client";

import { useRef, useCallback, useState, useEffect } from "react";

interface StaggerConfig {
  delayPerItem: number; // Delay between each item in seconds
  maxDelay: number; // Maximum delay to prevent excessive wait times
  resetOnNewPage: boolean; // Whether to reset stagger count for new pages
}

const DEFAULT_CONFIG: StaggerConfig = {
  delayPerItem: 0.05, // Reduced to 50ms for smoother scroll
  maxDelay: 0.3, // Reduced max delay to 300ms
  resetOnNewPage: true,
};

export function useStaggerAnimation(config: Partial<StaggerConfig> = {}) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const indexCounterRef = useRef(0);
  const currentPageRef = useRef(0);

  const getStaggerDelay = useCallback(
    (index: number, pageIndex: number = 0): number => {
      // Reset counter when moving to a new page
      if (fullConfig.resetOnNewPage && pageIndex !== currentPageRef.current) {
        indexCounterRef.current = 0;
        currentPageRef.current = pageIndex;
      }

      // Calculate delay based on position within the page
      const positionInPage = fullConfig.resetOnNewPage
        ? index
        : indexCounterRef.current;
      const delay = positionInPage * fullConfig.delayPerItem;

      // Increment counter for next item
      indexCounterRef.current++;

      // Enforce maximum delay to prevent excessive wait times
      return Math.min(delay, fullConfig.maxDelay);
    },
    [fullConfig]
  );

  const resetStagger = useCallback(() => {
    indexCounterRef.current = 0;
    currentPageRef.current = 0;
  }, []);

  return {
    getStaggerDelay,
    resetStagger,
  };
}

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

// Utility hook for performance-conscious animation settings
export function useAnimationSettings() {
  const prefersReducedMotion = useReducedMotion();

  // Performance-optimized settings for mobile
  const animationSettings = {
    // Disable animations if user prefers reduced motion
    enabled: !prefersReducedMotion,

    // Use hardware acceleration hints
    willChange: "opacity, transform",

    // Optimized viewport settings for mobile
    viewport: {
      once: true, // Only animate once
      margin: "-10% 0px", // Start animation when 10% visible
      amount: 0.1, // Minimum visibility threshold
    },

    // Performance hints for the browser
    style: {
      backfaceVisibility: "hidden" as const,
      perspective: 1000,
    },
  };

  return animationSettings;
}
