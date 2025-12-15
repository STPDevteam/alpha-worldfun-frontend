import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type {
  UseInfiniteListOptions,
  UseInfiniteListReturn,
  PaginatedResponse,
} from '@/libs/types/pagination';

export function useInfiniteList<T extends { id: string }>(
  options: UseInfiniteListOptions<T>
): UseInfiniteListReturn<T> {
  const {
    queryKey,
    queryFn,
    pageSize = 12,
    enabled = true,
    filters = {},
    sorting = [],
    staleTime = 300000, // 5 minutes
    gcTime = 600000, // 10 minutes
  } = options;

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: [...queryKey, { filters, sorting, pageSize }],
    queryFn: ({ pageParam }) =>
      queryFn({
        pageParam,
        filters,
        sorting,
      }),
    getNextPageParam: (lastPage: PaginatedResponse<T>) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined;
    },
    initialPageParam: undefined,
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  const flattenedData = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  const totalCount = useMemo(() => {
    return data?.pages[0]?.pagination.total;
  }, [data]);

  const isEmpty = useMemo(() => {
    return !isLoading && flattenedData.length === 0;
  }, [isLoading, flattenedData.length]);

  const refresh = async () => {
    await refetch();
  };

  return {
    data: flattenedData,
    isLoading: isLoading && !isFetchingNextPage,
    isLoadingMore: isFetchingNextPage,
    error: error as Error | null,
    hasNextPage: !!hasNextPage,
    fetchNextPage,
    refresh,
    isEmpty,
    totalCount,
    refetch,
  };
}