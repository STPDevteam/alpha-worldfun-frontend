import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000,
      gcTime: 600000,
      retry: (failureCount, error: any) => {
        // Don't retry on certain error types
        if (error?.statusCode === 401 || error?.statusCode === 403 || error?.statusCode === 404) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: { 
      retry: 1,
    },
  },
});
