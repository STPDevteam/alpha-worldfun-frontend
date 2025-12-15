"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/libs/utils/cn";
import ProjectTabsMobile from "./project-tabs-mobile";
import { useIsMobile } from "./hooks/useIsMobile";
import PanelContainer from "./ui/PanelContainer";
import { buildTabs, type ProjectTabsOverrides } from "./tabsConfig";

// Tab content interfaces for type safety
export interface TeamOverviewContent {
  type: "team-overview";
  data?: Record<string, unknown>; // Flexible for future development
}

export interface ProjectDetailsContent {
  type: "project-details";
  data?: Record<string, unknown>;
}


export interface VestingScheduleContent {
  type: "vesting-schedule";
  data?: Record<string, unknown>;
}

export type TabContentData =
  | TeamOverviewContent
  | ProjectDetailsContent
  | VestingScheduleContent;

interface ProjectTabsProps {
  className?: string;
  onTabChange?: (tabId: string, isOpen: boolean) => void;
  teamOverviewContent?: React.ReactNode;
  projectDetailsContent?: React.ReactNode;
  vestingScheduleContent?: React.ReactNode;
  forceMobile?: boolean;
}

interface TabData {
  id: string;
  label: string;
  content?: React.ReactNode;
}

export function ProjectTabs({
  className,
  onTabChange,
  teamOverviewContent,
  projectDetailsContent,
  vestingScheduleContent,
  forceMobile = false,
}: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("team-overview"); // Only one active tab at a time
  const isMobile = useIsMobile(768);
  const overrides: ProjectTabsOverrides = {
    "team-overview": teamOverviewContent,
    "project-details": projectDetailsContent,
    "vesting-schedule": vestingScheduleContent,
  };
  const tabs: TabData[] = buildTabs(overrides);

  const toggleTab = (tabId: string) => {
    const isCurrentlyActive = activeTab === tabId;

    if (isCurrentlyActive) {
      // If clicking on the active tab, close it
      setActiveTab("");
      onTabChange?.(tabId, false);
    } else {
      // If clicking on a different tab, make it active (closes any other open tab)
      setActiveTab(tabId);
      onTabChange?.(tabId, true);
    }
  };

  // Handle mobile tab change (convert from single tab to open/close format)
  const handleMobileTabChange = (tabId: string) => {
    onTabChange?.(tabId, true);
  };

  // Render mobile version on small screens
  if (isMobile || forceMobile) {
    return (
      <ProjectTabsMobile
        className={className}
        onTabChange={handleMobileTabChange}
        teamOverviewContent={overrides["team-overview"]}
        projectDetailsContent={overrides["project-details"]}
        vestingScheduleContent={overrides["vesting-schedule"]}
      />
    );
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto h-auto", className)}>
      {/* Tab Headers */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => {
          const isOpen = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => toggleTab(tab.id)}
              className={cn(
                "flex items-center justify-between px-6 py-4 rounded-lg hover:border-white/10 border transition-all duration-200",
                "font-mono text-sm font-light uppercase tracking-wider",
                "backdrop-blur-[100px]",
                isOpen && ["bg-[#10101066] border-white/20"],
                !isOpen && ["bg-[#373C3E66] border-white/30 text-gray-200"],
                "min-w-[200px] lg:min-w-[215px]"
              )}
            >
              <span className="text-center flex-1">{tab.label}</span>
              <div className="ml-4 w-2.5 h-2.5 flex items-center justify-center">
                {isOpen ? (
                  <Minus className="w-2.5 h-2.5 text-gray-200" />
                ) : (
                  <Plus className="w-2.5 h-2.5 text-gray-200" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-2">
        {tabs.map((tab) => {
          const isOpen = activeTab === tab.id;

          if (!isOpen) return null;

          return (
            <PanelContainer
              key={`${tab.id}-content`}
              className={cn(
                "shadow-lg animate-in slide-in-from-top-1 duration-200"
              )}
            >
              {tab.content}
            </PanelContainer>
          );
        })}
      </div>
    </div>
  );
}

export default ProjectTabs;
