"use client";

import { cn } from "@/libs/utils/cn";
import { useWorldCardsActions } from "@/libs/hooks/home";
import { useWorldCardsFilters } from "@/libs/stores/world-cards-store";
import { TokenStatus } from "@/libs/types/world-card";

type FilterValue = "all" | "just-launched" | "upcoming" | "ended";

interface FilterSectionProps {
  className?: string;
}

export default function FilterSection({ className }: FilterSectionProps) {
  const filters = useWorldCardsFilters();
  const { setFilters } = useWorldCardsActions();

  // Map TokenStatus to FilterValue for UI
  const mapTokenStatusToFilter = (
    status: TokenStatus | undefined
  ): FilterValue => {
    switch (status) {
      case TokenStatus.LIVE:
        return "just-launched";
      case TokenStatus.ON_GOING:
        return "upcoming";
      case TokenStatus.CANCELLED:
        return "ended";
      default:
        return "all";
    }
  };

  // Map UI filter values to TokenStatus enum
  const mapFilterToTokenStatus = (
    filter: FilterValue
  ): TokenStatus | undefined => {
    switch (filter) {
      case "just-launched":
        return TokenStatus.LIVE;
      case "upcoming":
        return TokenStatus.ON_GOING;
      case "ended":
        return TokenStatus.CANCELLED;
      case "all":
      default:
        return undefined;
    }
  };

  const activeFilter = mapTokenStatusToFilter(filters.status);

  const handleFilterChange = (filter: FilterValue) => {
    const tokenStatus = mapFilterToTokenStatus(filter);
    setFilters({ status: tokenStatus });
  };

  const filterOptions = [
    { value: "all" as const, label: "ALL" },
    { value: "just-launched" as const, label: "JUST LAUNCHED" },
    { value: "upcoming" as const, label: "UPCOMING" },
    { value: "ended" as const, label: "ENDED" },
  ];

  return (
    <div className={cn("flex flex-col gap-4 p-3 pb-3 w-full", className)}>
      {/* Filter Options Section */}
      <div className="flex justify-between items-center w-full gap-[11px]">
        <span
          className="text-white font-dm-mono text-[13px] font-light leading-[1.23077em] text-right"
          style={{
            fontWeight: 300,
            letterSpacing: "0.08em",
          }}
        >
          SHOW:
        </span>

        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleFilterChange(option.value)}
            className={cn(
              "font-dm-mono text-[13px] font-light leading-[1.23077em] text-right transition-colors duration-200",
              activeFilter === option.value
                ? "text-white underline"
                : "text-white/20"
            )}
            style={{
              fontWeight: 300,
              letterSpacing: "0.08em",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
