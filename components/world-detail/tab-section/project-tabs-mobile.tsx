"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/libs/utils/cn";
import PanelContainer from "./ui/PanelContainer";
import { buildTabs } from "./tabsConfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Reuse the same types from the main project-tabs component
export interface TeamOverviewContent {
  type: "team-overview";
  data?: unknown;
}

export interface ProjectDetailsContent {
  type: "project-details";
  data?: unknown;
}


export interface VestingScheduleContent {
  type: "vesting-schedule";
  data?: unknown;
}

export type TabContentData =
  | TeamOverviewContent
  | ProjectDetailsContent
  | VestingScheduleContent;

interface ProjectTabsMobileProps {
  className?: string;
  onTabChange?: (tabId: string) => void;
  teamOverviewContent?: React.ReactNode;
  projectDetailsContent?: React.ReactNode;
  vestingScheduleContent?: React.ReactNode;
}

interface TabData {
  id: string;
  label: string;
  content?: React.ReactNode;
}

export function ProjectTabsMobile({
  className,
  onTabChange,
  teamOverviewContent,
  projectDetailsContent,
  vestingScheduleContent,
}: ProjectTabsMobileProps) {
  const [activeTab, setActiveTab] = useState<string>("team-overview");

  const tabs: TabData[] = buildTabs({
    "team-overview": teamOverviewContent,
    "project-details": projectDetailsContent,
    "vesting-schedule": vestingScheduleContent,
  });

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile Tab Picker */}
      <div className="mb-4 flex justify-start">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center justify-between px-6 py-4 rounded-lg border transition-all duration-200",
                "font-mono text-[13px] font-light uppercase tracking-[0.08em] leading-[1.538]",
                "backdrop-blur-[100px]",
                "bg-[rgba(16,16,16,0.4)] border-white/20 text-[#E0E0E0]",
                "hover:border-white/30",
                "h-[52px] min-w-[216px] w-fit"
              )}
              style={{
                padding: "16px 24px"
              }}
            >
              <span>
                {activeTabData?.label}
              </span>
              <ChevronDown className="w-[10px] h-[10px] text-[#E0E0E0]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className={cn(
              "min-w-[216px] backdrop-blur-[100px]",
              "bg-black/40 border-white/20",
              "rounded-lg"
            )}
            align="start"
            sideOffset={4}
          >
            {tabs.map((tab) => (
              <DropdownMenuItem
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "cursor-pointer transition-colors",
                  "font-mono text-[13px] font-light uppercase tracking-[0.08em] leading-[1.538]",
                  "text-[#E0E0E0] hover:bg-white/10",
                  "focus:bg-white/10 focus:text-[#E0E0E0]",
                  activeTab === tab.id && "bg-white/5",
                  "h-[52px] flex items-center"
                )}
                style={{
                  padding: "16px 24px"
                }}
              >
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Tab Content */}
      {activeTabData && (
        <PanelContainer 
          className={cn("mb-6 shadow-lg animate-in slide-in-from-top-1 duration-200")}
        > 
          {activeTabData.content}
        </PanelContainer>
      )}
    </div>
  );
}

export default ProjectTabsMobile;