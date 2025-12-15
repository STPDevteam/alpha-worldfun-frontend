export const toNumberOrNull = (
  value: number | string | null | undefined
): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const formatTokenAmount = (value: number | null): string => {
  if (value === null) {
    return "--";
  }

  try {
    return value.toLocaleString();
  } catch {
    return "--";
  }
};

export const clampPercentage = (value: number | null): number | null => {
  if (value === null) {
    return null;
  }

  return Math.min(Math.max(value, 0), 100);
};
