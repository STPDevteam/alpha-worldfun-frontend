"use client";

import { cn } from "@/libs/utils/cn";
import { useWorldCardsActions } from "@/libs/hooks/home";
import { useWorldCardsFilters } from "@/libs/stores/world-cards-store";
import { TokenStatus } from "@/libs/types/world-card";

type TabValue = "all" | "upcoming" | "live" | "ended";

interface TabControlsProps {
  defaultTab?: TabValue;
  onTabChange?: (tab: TabValue) => void;
  className?: string;
}

export default function TabControls({
  defaultTab = "all",
  onTabChange,
  className,
}: TabControlsProps) {
  // Use store state instead of local state to prevent conflicts
  const filters = useWorldCardsFilters();
  const { setFilters } = useWorldCardsActions();

  // Map TokenStatus back to TabValue for UI
  const mapTokenStatusToTab = (status: TokenStatus | undefined): TabValue => {
    switch (status) {
      case TokenStatus.LIVE:
        return "live";
      case TokenStatus.ON_GOING:
        return "upcoming";
      case TokenStatus.CANCELLED:
        return "ended";
      default:
        return "all";
    }
  };

  // Get current values from store, fallback to defaults
  const activeTab = mapTokenStatusToTab(filters.status) || defaultTab;

  // Map UI tab values to TokenStatus enum
  const mapTabToTokenStatus = (tab: TabValue): TokenStatus | undefined => {
    switch (tab) {
      case "live":
        return TokenStatus.LIVE;
      case "upcoming":
        return TokenStatus.ON_GOING;
      case "ended":
        // For "ended" tab, we'll need to handle multiple statuses in the store/hook
        return TokenStatus.CANCELLED;
      case "all":
      default:
        return undefined; // No status filter
    }
  };

  const handleTabChange = (tab: TabValue) => {
    onTabChange?.(tab);
    // Update the Zustand store with new filters
    const tokenStatus = mapTabToTokenStatus(tab);
    setFilters({ status: tokenStatus });
  };

  const tabs = [
    { value: "all" as const, label: "ALL" },
    { value: "live" as const, label: "JUST LAUNCHED" },
    { value: "upcoming" as const, label: "UPCOMING" },
    { value: "ended" as const, label: "ENDED" },
  ];

  const tabTypography = {
    fontFamily: "DM Mono, monospace",
    fontWeight: 300,
    fontSize: "14px",
    lineHeight: "1.14em",
    letterSpacing: "8%",
  } as const;

  return (
    <div
      className={cn(
        "w-full max-w-[1320px] flex flex-row items-center justify-end py-4 mx-auto",
        className
      )}
    >
      {/* Filter Section */}
      <div className="flex items-center gap-[11px]">
        <span
          className="text-sm font-light uppercase tracking-[0.08em] text-white/80"
          style={tabTypography}
        >
          SHOW:
        </span>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTabChange(tab.value)}
            aria-pressed={activeTab === tab.value}
            className={cn(
              "relative px-1.5 py-1 text-sm font-light tracking-[0.08em] uppercase transition-all duration-300 ease-out",
              "bg-transparent border-none text-right text-white/40 hover:text-white/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
              activeTab === tab.value && "text-white"
            )}
            style={tabTypography}
          >
            {tab.label}
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute left-0 right-0 -bottom-1 h-[3px] origin-center scale-x-0 rounded-full bg-white/60",
                "transition-transform duration-300 ease-out",
                activeTab === tab.value && "scale-x-100 bg-white"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
