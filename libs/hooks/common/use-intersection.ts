import { useEffect, useRef, useState } from "react";
export function useIntersection<T extends HTMLElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T | null>(null);
  const [isIntersecting, set] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => set(e.isIntersecting),
      options
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [options]);
  return { ref, isIntersecting } as const;
}
