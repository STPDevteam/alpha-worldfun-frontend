import { useEffect, useState } from "react";
export function useDebounce<T>(value: T, delayMs = 300) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setD(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return d;
}
