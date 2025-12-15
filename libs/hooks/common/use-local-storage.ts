import { useEffect, useState } from "react";
export function useLocalStorage<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  });
  useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem(key, JSON.stringify(v));
  }, [key, v]);
  return [v, setV] as const;
}
