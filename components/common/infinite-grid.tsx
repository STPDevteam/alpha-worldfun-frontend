"use client";

import React, { ReactNode } from "react";
import { cn } from "@/libs/utils/cn";
import { useInfiniteScroll } from "@/libs/hooks/common";
import { LoadingSpinner } from "./loading-spinner";
import type {
  UseInfiniteListReturn,
  GridConfig,
} from "@/libs/types/pagination";

interface InfiniteGridProps<T extends { id: string }> {
  useDataHook: () => UseInfiniteListReturn<T>;
  renderItem: (item: T, index: number, pageIndex: number) => ReactNode;
  renderSkeleton: (index: number) => ReactNode;
  gridConfig: GridConfig;
  skeletonCount?: number;
  emptyState?: ReactNode;
  errorState?: (error: Error, retry: () => void) => ReactNode;
  className?: string;
  loadingIndicator?: ReactNode;
  pageSize?: number;
}

export function InfiniteGrid<T extends { id: string }>({
  useDataHook,
  renderItem,
  renderSkeleton,
  gridConfig,
  skeletonCount = 6,
  emptyState,
  errorState,
  className,
  loadingIndicator,
  pageSize = 24,
}: InfiniteGridProps<T>) {
  const {
    data,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage,
    fetchNextPage,
    refresh,
    isEmpty,
  } = useDataHook();

  const { ref: loadMoreRef } = useInfiniteScroll(
    hasNextPage && !isLoadingMore,
    fetchNextPage,
    {
      threshold: 0.5,
      rootMargin: "400px",
      enabled: !isLoading && !error,
      debounceMs: 200,
    }
  );

  // Use predefined grid classes to avoid dynamic class generation issues
  const gridClasses = cn(
    "grid",
    gridConfig.gridClasses,
    gridConfig.maxWidth && `max-w-[${gridConfig.maxWidth}]`,
    className
  );

  // Error state
  if (error && !data.length) {
    if (errorState) {
      return (
        <div className="flex items-center justify-center min-h-[70vh]">
          {errorState(error, refresh)}
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error.message}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={gridClasses} style={{ gap: gridConfig.gap }}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div key={`skeleton-${index}`}>{renderSkeleton(index)}</div>
        ))}
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    if (emptyState) {
      return (
        <>{emptyState}</>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-64 w-full">
        <div className="text-center">
          <p className="text-gray-400">No items found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main grid */}
      <div className={gridClasses} style={{ gap: gridConfig.gap }}>
        {data.map((item, index) => {
          const pageIndex = Math.floor(index / pageSize) + 1;
          return (
            <div
              key={item.id}
              className={cn(
                gridConfig.itemMinWidth && `min-w-[${gridConfig.itemMinWidth}]`,
                gridConfig.itemMaxWidth && `max-w-[${gridConfig.itemMaxWidth}]`
              )}
            >
              {renderItem(item, index, pageIndex)}
            </div>
          );
        })}
      </div>

      {/* Loading more indicator */}
      {(hasNextPage || isLoadingMore) && (
        <div ref={loadMoreRef} className="flex justify-center py-8 min-h-[80px]">
          {isLoadingMore &&
            (loadingIndicator || (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="small" />
                <span className="text-gray-400">Loading more...</span>
              </div>
            ))}
          {/* Show placeholder when has more but not loading to ensure trigger element is visible */}
          {hasNextPage && !isLoadingMore && (
            <div className="h-1 w-full opacity-0 pointer-events-none" />
          )}
        </div>
      )}

      {/* Error state for failed pagination */}
      {error && data.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="text-center">
            <p className="text-red-400 mb-2">Failed to load more items</p>
            <button
              onClick={fetchNextPage}
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
