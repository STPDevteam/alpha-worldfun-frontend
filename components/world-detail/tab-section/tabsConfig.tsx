"use client";

import React from "react";
import TeamOverviewResponsive from "./team-overview-responsive";
import { ProjectDetailsTab } from "./project-details-tab";
import VestingScheduleTab from "./vesting-schedule-tab";

export type TabDef = {
  id: "team-overview" | "project-details" | "vesting-schedule";
  label: string;
  content: React.ReactNode;
};

export type TabsOverrides = Partial<Record<TabDef["id"], React.ReactNode>>;

export function buildTabs(overrides?: TabsOverrides): TabDef[] {
  return [
    {
      id: "team-overview",
      label: "Team Overview",
      content: overrides?.["team-overview"] ?? <TeamOverviewResponsive />,
    },
    {
      id: "project-details",
      label: "Project Details",
      content: overrides?.["project-details"] ?? <ProjectDetailsTab />,
    },
    {
      id: "vesting-schedule",
      label: "Vesting Schedule",
      content: overrides?.["vesting-schedule"] ?? <VestingScheduleTab />,
    },
  ];
}

export type { TabsOverrides as ProjectTabsOverrides };
