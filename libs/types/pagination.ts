export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    cursor?: string;
    nextCursor?: string;
    hasMore: boolean;
    total?: number;
    page?: number;
    limit: number;
  };
}

export interface SortConfig<T = any> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

export interface InfiniteQueryParams {
  pageParam?: string | number;
  filters?: Record<string, any>;
  sorting?: SortConfig[];
}

export type InfiniteQueryFunction<T> = (
  params: InfiniteQueryParams
) => Promise<PaginatedResponse<T>>;

export interface UseInfiniteListOptions<T> {
  queryKey: string[];
  queryFn: InfiniteQueryFunction<T>;
  pageSize?: number;
  enabled?: boolean;
  filters?: Record<string, any>;
  sorting?: SortConfig<T>[];
  staleTime?: number;
  gcTime?: number;
}

export interface UseInfiniteListReturn<T> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refresh: () => void;
  isEmpty: boolean;
  totalCount?: number;
  refetch: () => void;
}

export interface GridConfig {
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap: string;
  maxWidth?: string;
  itemMinWidth?: string;
  itemMaxWidth?: string;
  gridClasses: string;
}

// Predefined grid classes to avoid dynamic class generation issues with Tailwind
export const GRID_CLASS_MAP = {
  '1-1-2': 'grid-cols-1 md:grid-cols-1 lg:grid-cols-2',
  '2-3-4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  '1-1-1': 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
  '1-2-3-4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
} as const;

export const GRID_CONFIGS = {
  WORLD_CARDS: {
    columns: { mobile: 1, tablet: 2, desktop: 4 },
    gap: '1rem',
    maxWidth: '1325px',
    itemMaxWidth: '320px',
    gridClasses: GRID_CLASS_MAP['1-2-3-4']
  },
  USER_CARDS: {
    columns: { mobile: 2, tablet: 3, desktop: 4 },
    gap: '1rem',
    maxWidth: '1200px',
    gridClasses: GRID_CLASS_MAP['2-3-4']
  },
  TABLE_ROWS: {
    columns: { mobile: 1, tablet: 1, desktop: 1 },
    gap: '0',
    maxWidth: '100%',
    gridClasses: GRID_CLASS_MAP['1-1-1']
  }
} as const;