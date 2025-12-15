import { useEffect, useRef, useState, RefObject } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
  debounceMs?: number;
}

interface UseInfiniteScrollReturn {
  ref: RefObject<HTMLDivElement | null>;
  isIntersecting: boolean;
}

export function useInfiniteScroll(
  hasNextPage: boolean,
  fetchNextPage: () => void,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    threshold = 0.1,
    rootMargin = "100px",
    enabled = true,
    debounceMs = 100,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting && hasNextPage) {
          // Debounce the fetchNextPage call to prevent rapid requests
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            fetchNextPage();
          }, debounceMs);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hasNextPage, fetchNextPage, enabled, threshold, rootMargin, debounceMs]);

  return {
    ref,
    isIntersecting,
  };
}
