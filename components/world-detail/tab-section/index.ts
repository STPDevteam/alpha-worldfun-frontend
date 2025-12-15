export { ProjectTabs, type TabContentData } from './project-tabs';
export type { 
  TeamOverviewContent, 
  ProjectDetailsContent, 
  VestingScheduleContent 
} from './project-tabs';

// Export individual tab components
export { TeamOverviewTab } from './team-overview-tab';
export { ProjectDetailsTab } from './project-details-tab';
export { default as VestingScheduleTab } from './vesting-schedule-tab';
export type { VestingSeriesData, VestingApiData } from './vesting-schedule-tab';

