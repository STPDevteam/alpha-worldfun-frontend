"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import LoadingSpinner from "./loading-spinner";
import { useNavigationLoadingStore } from "@/libs/stores";

const MIN_VISIBLE_MS = 200;
const STUCK_NAVIGATION_FALLBACK_MS = 10000;

const NavigationLoadingOverlay = () => {
  const pathname = usePathname();
  const isNavigating = useNavigationLoadingStore((state) => state.isNavigating);
  const resetNavigation = useNavigationLoadingStore(
    (state) => state.resetNavigation
  );

  const startTimestampRef = useRef<number | null>(null);
  const previousPathnameRef = useRef(pathname);
  const fallbackTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isNavigating) {
      startTimestampRef.current = performance.now();
      fallbackTimeoutRef.current = window.setTimeout(() => {
        resetNavigation();
      }, STUCK_NAVIGATION_FALLBACK_MS);
    } else {
      startTimestampRef.current = null;
      if (fallbackTimeoutRef.current) {
        window.clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = undefined;
      }
    }

    return () => {
      if (fallbackTimeoutRef.current) {
        window.clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = undefined;
      }
    };
  }, [isNavigating, resetNavigation]);

  useEffect(() => {
    if (!isNavigating) {
      previousPathnameRef.current = pathname;
      return;
    }

    if (previousPathnameRef.current !== pathname) {
      const elapsed = startTimestampRef.current
        ? performance.now() - startTimestampRef.current
        : 0;
      const delay = elapsed >= MIN_VISIBLE_MS ? 0 : MIN_VISIBLE_MS - elapsed;

      const timeout = window.setTimeout(() => {
        resetNavigation();
      }, delay);

      return () => window.clearTimeout(timeout);
    }

    previousPathnameRef.current = pathname;
  }, [pathname, isNavigating, resetNavigation]);

  if (!isNavigating) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center 
      bg-black/40 backdrop-blur-md">
      <LoadingSpinner size="large" fullScreen={false} />
    </div>


  );
};

export default NavigationLoadingOverlay;
