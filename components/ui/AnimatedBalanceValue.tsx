"use client";

import CountUp from "./CountUp";
import { getBalanceDisplayValue } from "@/libs/utils/format";
import { useEffect, useMemo, useRef } from "react";

interface AnimatedBalanceValueProps {
  cardId: string;
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  onStart?: () => void;
  onEnd?: () => void;
  // Custom formatting options
  customFormat?: {
    useThousandsSeparator?: boolean;
    thousandsSeparator?: string;
    prefix?: string;
    suffix?: string;
    decimals?: number;
  };
}

type TimeParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const getTimeParts = (totalSeconds: number): TimeParts => {
  const safeTotal = Math.max(0, Math.floor(totalSeconds));

  const days = Math.floor(safeTotal / 86_400);
  const hours = Math.floor((safeTotal % 86_400) / 3_600);
  const minutes = Math.floor((safeTotal % 3_600) / 60);
  const seconds = Math.floor(safeTotal % 60);

  return { days, hours, minutes, seconds };
};

const resolveDirection = (from: number, to: number) =>
  from > to ? "down" : "up";

export const AnimatedBalanceValue = ({
  cardId,
  value,
  duration = 2,
  delay = 0,
  className = "",
  style = {},
  onStart,
  onEnd,
  customFormat,
}: AnimatedBalanceValueProps) => {
  const isTimeCard = cardId === "time-remaining";
  const previousTimePartsRef = useRef<TimeParts | null>(null);
  const hasAnimatedTimeRef = useRef(false);
  const lastCardIdRef = useRef(cardId);

  if (lastCardIdRef.current !== cardId) {
    lastCardIdRef.current = cardId;
    hasAnimatedTimeRef.current = false;
    previousTimePartsRef.current = null;
  }

  const shouldAnimateTime = isTimeCard && !hasAnimatedTimeRef.current;

  const displayValue = useMemo(() => {
    if (customFormat) {
      // Use custom formatting instead of card-based formatting
      return {
        numericValue: value,
        prefix: customFormat.prefix || "",
        suffix: customFormat.suffix || "",
        decimals: customFormat.decimals || 0,
      };
    }
    return getBalanceDisplayValue(cardId, value);
  }, [cardId, value, customFormat]);

  const timeParts = useMemo(() => {
    if (!isTimeCard) {
      return null;
    }
    return getTimeParts(value);
  }, [isTimeCard, value]);

  useEffect(() => {
    if (!isTimeCard || timeParts === null) {
      previousTimePartsRef.current = null;
      return;
    }

    previousTimePartsRef.current = timeParts;
  }, [isTimeCard, timeParts]);

  useEffect(() => {
    if (!isTimeCard || !shouldAnimateTime || timeParts === null) {
      return;
    }

    hasAnimatedTimeRef.current = true;
  }, [isTimeCard, shouldAnimateTime, timeParts]);

  // Special handling for time values - need multiple CountUp components
  if (isTimeCard && timeParts) {
    if (!shouldAnimateTime) {
      return (
        <span className={className} style={style}>
          {timeParts.days}d {timeParts.hours}h {timeParts.minutes}m{" "}
          {timeParts.seconds}s
        </span>
      );
    }

    const previousTimeParts = previousTimePartsRef.current ?? timeParts;

    return (
      <span className={className} style={style}>
        <CountUp
          to={timeParts.days}
          from={previousTimeParts.days}
          direction={resolveDirection(previousTimeParts.days, timeParts.days)}
          duration={duration}
          delay={delay}
          onStart={onStart}
        />
        d{" "}
        <CountUp
          to={timeParts.hours}
          from={previousTimeParts.hours}
          direction={resolveDirection(previousTimeParts.hours, timeParts.hours)}
          duration={duration}
          delay={delay + 0.1}
        />
        h{" "}
        <CountUp
          to={timeParts.minutes}
          from={previousTimeParts.minutes}
          direction={resolveDirection(
            previousTimeParts.minutes,
            timeParts.minutes
          )}
          duration={duration}
          delay={delay + 0.2}
        />
        m{" "}
        <CountUp
          to={timeParts.seconds}
          from={previousTimeParts.seconds}
          direction={resolveDirection(
            previousTimeParts.seconds,
            timeParts.seconds
          )}
          duration={duration}
          delay={delay + 0.3}
          onEnd={onEnd}
        />
        s
      </span>
    );
  }

  // Standard single CountUp component
  return (
    <span className={className} style={style}>
      {displayValue.prefix}
      <CountUp
        to={displayValue.numericValue}
        duration={duration}
        delay={delay}
        onStart={onStart}
        onEnd={onEnd}
        separator={
          customFormat?.useThousandsSeparator !== false
            ? customFormat?.thousandsSeparator ?? ","
            : ""
        }
        decimals={displayValue.decimals}
      />
      {displayValue.suffix}
    </span>
  );
};

export default AnimatedBalanceValue;
