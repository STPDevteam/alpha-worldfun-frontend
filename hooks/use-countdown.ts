"use client";

import { useState, useEffect } from "react";

interface UseCountdownProps {
  /**
   * Target end date/time for the countdown
   */
  endDate: Date | string | null | undefined;
  /**
   * Update interval in milliseconds (default: 1000ms = 1 second)
   */
  interval?: number;
}

interface CountdownResult {
  /**
   * Formatted countdown string (e.g., "02d 13h 45m 23s")
   */
  formattedTime: string;
  /**
   * Individual time units
   */
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /**
   * Whether the countdown has ended
   */
  isEnded: boolean;
}

/**
 * Custom hook for creating a live countdown timer
 * @param endDate - The target end date/time
 * @param interval - Update interval in milliseconds (default: 1000)
 * @returns Countdown information with formatted string and individual units
 */
export function useCountdown({
  endDate,
  interval = 1000,
}: UseCountdownProps): CountdownResult {
  const calculateCountdown = (): CountdownResult => {
    if (!endDate) {
      return {
        formattedTime: "00d 00h 00m 00s",
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isEnded: true,
      };
    }

    const now = new Date();
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      return {
        formattedTime: "00d 00h 00m 00s",
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isEnded: true,
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const formattedTime = `${String(days).padStart(2, "0")}d ${String(
      hours
    ).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(
      seconds
    ).padStart(2, "0")}s`;

    return {
      formattedTime,
      days,
      hours,
      minutes,
      seconds,
      isEnded: false,
    };
  };

  const [countdown, setCountdown] = useState<CountdownResult>(
    calculateCountdown
  );

  useEffect(() => {
    // Update immediately on mount
    setCountdown(calculateCountdown());

    // Set up interval for updates
    const timer = setInterval(() => {
      setCountdown(calculateCountdown());
    }, interval);

    // Cleanup interval on unmount
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate, interval]);

  return countdown;
}
