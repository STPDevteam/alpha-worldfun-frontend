"use client";

import { create } from "zustand";

type NavigationLoadingState = {
  pendingCount: number;
  isNavigating: boolean;
  startNavigation: (targetPath?: string) => void;
  finishNavigation: () => void;
  resetNavigation: () => void;
};

const trimTrailingSlash = (value: string) => {
  if (value.length > 1 && value.endsWith("/")) {
    return value.slice(0, -1);
  }

  return value;
};

const normalizePath = (path: string, base?: string) => {
  if (!path) {
    return "/";
  }

  try {
    const url = base ? new URL(path, base) : new URL(path);
    return `${trimTrailingSlash(url.pathname)}${url.search}` || "/";
  } catch {
    const noHash = path.split("#")[0] ?? path;
    const [pathnameRaw, searchRaw] = noHash.split("?");
    const pathname = trimTrailingSlash(pathnameRaw || "/");
    return searchRaw ? `${pathname}?${searchRaw}` : pathname;
  }
};

export const useNavigationLoadingStore = create<NavigationLoadingState>((set) => ({
  pendingCount: 0,
  isNavigating: false,
  startNavigation: (targetPath) =>
    set((state) => {
      if (targetPath && typeof window !== "undefined") {
        const targetNormalized = normalizePath(targetPath, window.location.origin);
        const currentNormalized = normalizePath(window.location.href);
        if (targetNormalized === currentNormalized) {
          return state;
        }
      }

      return {
        pendingCount: state.pendingCount + 1,
        isNavigating: true,
      };
    }),
  finishNavigation: () =>
    set((state) => {
      if (state.pendingCount <= 1) {
        return {
          pendingCount: 0,
          isNavigating: false,
        };
      }

      return {
        pendingCount: state.pendingCount - 1,
        isNavigating: true,
      };
    }),
  resetNavigation: () => set({ pendingCount: 0, isNavigating: false }),
}));
