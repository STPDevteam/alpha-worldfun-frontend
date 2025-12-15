export function timestampToSeconds(timestamp: bigint | number | Date): bigint {
  if (timestamp instanceof Date) {
    return BigInt(Math.floor(timestamp.getTime() / 1000));
  }

  if (typeof timestamp === "number") {
    return BigInt(Math.floor(timestamp / 1000));
  }

  if (timestamp > BigInt(10000000000)) {
    return timestamp / BigInt(1000);
  }

  return timestamp;
}

export function validateAndFormatTimestamp(
  timestamp: bigint | number | Date
): bigint {
  const formattedTimestamp = timestampToSeconds(timestamp);
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  const bufferTime = BigInt(300);

  if (formattedTimestamp <= currentTime + bufferTime) {
    const timestampDate = new Date(
      Number(formattedTimestamp) * 1000
    ).toISOString();
    const currentDate = new Date(Number(currentTime) * 1000).toISOString();
    throw new Error(
      `Timestamp must be in the future. Current: ${currentDate}, Provided: ${timestampDate}`
    );
  }

  return formattedTimestamp;
}

export function formatVestingSchedule(
  schedules: Array<{
    date: bigint | number | Date;
    endDate: bigint | number | Date;
    unlockPercent: bigint | number;
    period: bigint | number;
  }>
): Array<{
  date: bigint;
  endDate: bigint;
  unlockPercent: bigint;
  period: bigint;
}> {
  return schedules.map((schedule, index) => {
    const formattedDate = timestampToSeconds(schedule.date);
    const formattedEndDate = timestampToSeconds(schedule.endDate);

    return {
      date: formattedDate,
      endDate: formattedEndDate,
      unlockPercent: BigInt(schedule.unlockPercent),
      period: BigInt(schedule.period),
    };
  });
}
