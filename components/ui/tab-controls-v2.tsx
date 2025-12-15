"use client";

import * as React from "react";
import { cn } from "@/libs/utils/index";
import { Text } from "./text";

interface TabControlsV2Props {
  /**
   * Array of tab options to display
   */
  tabs: string[];
  /**
   * Currently selected tab value
   */
  value: string;
  /**
   * Callback when a tab is selected
   */
  onValueChange: (value: string) => void;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

export function TabControlsV2({
  tabs,
  value,
  onValueChange,
  className,
}: TabControlsV2Props) {
  return (
    <div
      className={cn(
        "flex flex-row items-center",
        "gap-1.5 md:gap-2",
        // Enable horizontal scrolling on mobile without scrollbar
        "overflow-x-auto scrollbar-hide",
        // Prevent scrollbar from appearing
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = value === tab;

        return (
          <button
            key={tab}
            role="tab"
            aria-selected={isActive}
            onClick={() => onValueChange(tab)}
            className={cn(
              "flex flex-row justify-between items-center",
              "px-2.5 py-2.5 md:px-3 md:py-3 xl:px-6 xl:py-4",
              "rounded-md md:rounded-lg",
              "transition-[background-color] duration-300 ease-in-out",
              "relative",
              "gap-2 md:gap-3",
              // Background
              isActive ? "bg-[rgba(16,16,16,0.4)]" : "bg-[rgba(55,60,62,0.4)]",
              // Border gradient - implemented via before pseudo-element
              "before:absolute before:inset-0",
              "before:rounded-md md:before:rounded-lg before:p-[0.5px]",
              "before:-z-10",
              // Additional border for active state - no transition
              isActive &&
                "before:p-[1px] border border-[rgba(255,240,240,0.2)]",
              // Backdrop blur
              "backdrop-blur-[100px]",
              // Hover states
              !isActive && "hover:bg-[rgba(55,60,62,0.5)]",
              isActive && "hover:bg-[rgba(16,16,16,0.5)]",
              "h-8 md:h-9",
              "whitespace-nowrap",
              "cursor-pointer"
            )}
          >
            {/* Text */}
            <Text
              variant="small"
              weight="light"
              className={cn(
                "uppercase text-center",
                "text-[10px] leading-[16px] md:text-xs md:leading-[20px]",
                isActive && "md:text-[13px]",
                "tracking-[0.06em] md:tracking-[0.08em]",
                "transition-all duration-300 ease-in-out",
                "text-[#E0E0E0]"
              )}
            >
              {tab}
            </Text>

            {/* Icon (Plus/Minus) */}
            <div className="relative w-[8px] h-[8px] md:w-[10px] md:h-[10px] flex-shrink-0">
              {/* Minus (horizontal line) - always visible */}
              <div
                className={cn(
                  "absolute top-1/2 left-0 h-[1px] bg-[#E0E0E0]",
                  "w-[8px] md:w-[10px]",
                  "transform -translate-y-1/2",
                  "transition-opacity duration-300 ease-in-out"
                )}
              />
              {/* Plus (vertical line) - only visible when not active */}
              <div
                className={cn(
                  "absolute top-0 left-1/2 w-[1px] bg-[#E0E0E0]",
                  "h-[8px] md:h-[10px]",
                  "transform -translate-x-1/2",
                  "transition-all duration-300 ease-in-out",
                  isActive ? "opacity-0 scale-y-0" : "opacity-100 scale-y-100"
                )}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
