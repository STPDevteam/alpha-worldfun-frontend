import { useQuery } from "@tanstack/react-query";
import { authService } from "@/libs/services/api/auth.service";
import { useAuthStore } from "@/libs/stores/auth.store";

export const useAuth = () => {
  const jwt = useAuthStore((state) => state.jwt);

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await authService.getMe();
      return response;
    },
    enabled: !!jwt, // Only run query if JWT exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry authentication errors
      if (error?.statusCode === 401 || error?.statusCode === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    user: query.data,
    isAuthenticated: !!jwt && !!query.data && !query.data.blocked,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
