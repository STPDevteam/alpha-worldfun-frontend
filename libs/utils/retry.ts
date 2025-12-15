export const isNetworkError = (error: unknown): boolean => {
  if (!error) return false;

  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  const networkErrorPatterns = [
    "network",
    "timeout",
    "fetch",
    "connection",
    "econnrefused",
    "enotfound",
    "etimedout",
    "socket",
    "aborted",
    "econnreset",
    "unavailable",
    "rate limit",
    "too many requests",
    "rpc",
    "provider",
    "http",
    "https",
  ];

  return networkErrorPatterns.some((pattern) => errorMessage.includes(pattern));
};

export const BALANCE_QUERY_CONFIG = {
  retry: 5,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
  retryOnMount: true,
  shouldRetry: (failureCount: number, error: unknown) => {
    if (failureCount >= 5) return false;
    return isNetworkError(error);
  },
};
