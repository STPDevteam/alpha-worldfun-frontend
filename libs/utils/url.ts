export const ensureHttpsProtocol = (
  url?: string | null
): string | undefined => {
  if (!url) {
    return undefined;
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
};
