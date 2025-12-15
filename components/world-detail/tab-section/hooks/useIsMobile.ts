"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe mobile breakpoint hook
 * - Defaults to md (768px) unless overridden
 */
export function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Guard for SSR
    if (typeof window === "undefined") return;

    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const onChange = () => setIsMobile(mq.matches);

    onChange();
    if ("addEventListener" in mq) {
      mq.addEventListener("change", onChange);
    } else if ("addListener" in mq) {
      (mq as unknown as { addListener: (cb: (e: MediaQueryListEvent) => void) => void }).addListener(onChange);
    }

    return () => {
      if ("removeEventListener" in mq) {
        mq.removeEventListener("change", onChange);
      } else if ("removeListener" in mq) {
        (mq as unknown as { removeListener: (cb: (e: MediaQueryListEvent) => void) => void }).removeListener(onChange);
      }
    };
  }, [breakpointPx]);

  return isMobile;
}

export default useIsMobile;
