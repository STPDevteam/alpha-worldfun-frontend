// Project Details Types for API Integration
export interface ProjectDetailsData {
  overview?: {
    title: string;
    content: string;
  };
  introduction?: {
    title: string;
    content: string;
  };
  additionalInfo?: Record<string, string>;
}

// API Response Types
export interface ProjectDetailsApiResponse {
  success: boolean;
  data: ProjectDetailsData;
  message?: string;
}

export interface ProjectDetailsApiError {
  success: false;
  error: string;
  code?: string;
}

// Hook return type
export interface UseProjectDetailsReturn {
  data: ProjectDetailsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Component Props
export interface ProjectDetailsTabProps {
  projectData?: ProjectDetailsData;
  className?: string;
  // API Integration props
  projectId?: string;
  onDataUpdate?: (data: ProjectDetailsData) => void;
  loading?: boolean;
  error?: string | null;
}
