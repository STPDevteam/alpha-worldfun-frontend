export type TimeFilter = "1D" | "7D" | "1M" | "1Y" | "Max";

type TokenPriceDataPoint = [string, number];

export const formatDate = (d: Date | string) => new Date(d).toLocaleString();

export const getDateNDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const filterDataByTimeRange = <T extends [string, any]>(
  data: T[],
  filter: TimeFilter
): T[] => {
  if (filter === "Max" || !data.length) return data;

  const daysMap: Record<Exclude<TimeFilter, "Max">, number> = {
    "1D": 1,
    "7D": 7,
    "1M": 30,
    "1Y": 365,
  };

  // Sort data by date to ensure proper ordering
  const sortedData = [...data].sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Get the latest date in the dataset instead of current date
  const latestDate = new Date(sortedData[sortedData.length - 1][0]);

  // Calculate cutoff date relative to the latest date in the dataset
  const cutoffDate = new Date(latestDate);
  cutoffDate.setDate(cutoffDate.getDate() - daysMap[filter]);

  return sortedData.filter(([dateStr]) => {
    const itemDate = new Date(dateStr);
    return itemDate >= cutoffDate;
  });
};

/**
 * Deduplicates chart data by date, preserving the latest value for each unique date.
 * This prevents duplicate xAxis labels in ECharts when multiple data points exist for the same date.
 * 
 * @param data Array of [date, value] tuples
 * @param strategy Aggregation strategy for duplicate values
 * @returns Deduplicated array with unique dates
 */
export const deduplicateChartData = <T extends [string, number]>(
  data: T[],
  strategy: 'latest' | 'earliest' | 'average' | 'sum' | 'max' | 'min' = 'latest'
): T[] => {
  if (!data.length) return data;

  // Group data points by date
  const groupedByDate = new Map<string, number[]>();
  const originalOrder = new Map<string, number>(); // Track first occurrence order

  data.forEach(([date, value], index) => {
    if (!groupedByDate.has(date)) {
      groupedByDate.set(date, []);
      originalOrder.set(date, index);
    }
    groupedByDate.get(date)!.push(value);
  });

  // Apply aggregation strategy and maintain original order
  const result: T[] = [];
  
  // Sort by original order to maintain chronological sequence
  const sortedDates = Array.from(groupedByDate.keys()).sort(
    (a, b) => originalOrder.get(a)! - originalOrder.get(b)!
  );

  sortedDates.forEach(date => {
    const values = groupedByDate.get(date)!;
    let aggregatedValue: number;

    switch (strategy) {
      case 'earliest':
        aggregatedValue = values[0];
        break;
      case 'latest':
        aggregatedValue = values[values.length - 1];
        break;
      case 'average':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
        break;
      case 'sum':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0);
        break;
      case 'max':
        aggregatedValue = Math.max(...values);
        break;
      case 'min':
        aggregatedValue = Math.min(...values);
        break;
      default:
        aggregatedValue = values[values.length - 1]; // Default to latest
    }

    result.push([date, aggregatedValue] as T);
  });

  return result;
};

export const formatAxisLabel = (value: string, filter: TimeFilter): string => {
  const date = new Date(value);

  switch (filter) {
    case "1D":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "7D":
    case "1M":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "1Y":
    case "Max":
      return date.toLocaleDateString("en-US", {
        year: "2-digit",
        month: "short",
      });
    default:
      return value;
  }
};

export const formatTimeAxisLabel = (timestamp: number, filter: TimeFilter): string => {
  const date = new Date(timestamp);

  switch (filter) {
    case "1D":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "7D":
    case "1M":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "1Y":
    case "Max":
      return date.toLocaleDateString("en-US", {
        year: "2-digit",
        month: "short",
      });
    default:
      return date.toLocaleDateString("en-US");
  }
};

export const filterDataByTimeRangeTimestamp = <T extends [number, any]>(
  data: T[],
  filter: TimeFilter
): T[] => {
  if (filter === "Max" || !data.length) return data;

  const daysMap: Record<Exclude<TimeFilter, "Max">, number> = {
    "1D": 1,
    "7D": 7,
    "1M": 30,
    "1Y": 365,
  };

  // Sort data by timestamp to ensure proper ordering
  const sortedData = [...data].sort(([a], [b]) => a - b);

  // Get the latest timestamp in the dataset
  const latestTimestamp = sortedData[sortedData.length - 1][0];
  
  // Calculate cutoff timestamp relative to the latest timestamp in the dataset
  const cutoffTimestamp = latestTimestamp - (daysMap[filter] * 24 * 60 * 60 * 1000);

  return sortedData.filter(([timestamp]) => timestamp >= cutoffTimestamp);
};

export const transformToTimeData = (data: [string, number][]): [number, number][] => {
  return data.map(([dateStr, value]) => [new Date(dateStr).getTime(), value]);
};
