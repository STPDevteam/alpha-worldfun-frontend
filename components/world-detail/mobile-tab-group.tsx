"use client";

import React from "react";

interface MobileTabGroupProps {
  className?: string;
  activeTab: "info" | "fundraise";
  onTabChange: (tab: "info" | "fundraise") => void;
}

export const MobileTabGroup: React.FC<MobileTabGroupProps> = ({
  className = "",
  activeTab,
  onTabChange,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const updateHeight = () => {
      const height = containerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty(
        "--mobile-tab-group-height",
        `${height}px`
      );
    };

    updateHeight();

    const target = containerRef.current;

    const observer =
      typeof ResizeObserver !== "undefined" && target
        ? new ResizeObserver(() => updateHeight())
        : null;

    if (observer && target) {
      observer.observe(target);
    } else {
      window.addEventListener("resize", updateHeight);
    }

    return () => {
      if (observer && target) {
        observer.unobserve(target);
        observer.disconnect();
      } else {
        window.removeEventListener("resize", updateHeight);
      }

      document.documentElement.style.removeProperty(
        "--mobile-tab-group-height"
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed bottom-0 left-0 right-0 z-50 xl:hidden ${className}`}
      style={{ fontFamily: "var(--font-bdo-grotesk)" }}
    >
      <div className="flex w-full">
        {/* Info Tab */}
        <button
          onClick={() => onTabChange("info")}
          className={`
            flex-1 h-12 px-2.5 flex items-center justify-center gap-2.5
            transition-all duration-200
            ${
              activeTab === "info"
                ? "bg-[#B38045] text-[#FCFCFC]"
                : "bg-[rgba(56,62,55,1)] text-white"
            }
          `}
          style={{
            fontFamily: "BDOGrotesk, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "1.5714285714285714em",
          }}
        >
          Info
        </button>

        {/* Fundraise Tab */}
        <button
          onClick={() => onTabChange("fundraise")}
          className={`
            flex-1 h-12 px-2.5 flex items-center justify-center gap-2.5
            transition-all duration-200
            ${
              activeTab === "fundraise"
                ? "bg-[#B38045] text-[#FCFCFC]"
                : "bg-[rgba(56,62,55,1)] text-white"
            }
          `}
          style={{
            fontFamily: "BDOGrotesk, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "1.5714285714285714em",
          }}
        >
          Fundraise
        </button>
      </div>
    </div>
  );
};
