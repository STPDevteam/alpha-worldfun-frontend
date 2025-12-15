"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/libs/utils/cn";

interface WorldCardCountdownProps {
  launchTime: Date;
  className?: string;
}

interface TimeUnit {
  value: number;
  label: string;
}

interface CountdownTimeBlockProps {
  timeUnit: TimeUnit;
  className?: string;
}

function CountdownTimeBlock({ timeUnit, className }: CountdownTimeBlockProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center gap-1 sm:gap-2 px-1 sm:px-1.5 py-0 rounded-[4px]",
        className
      )}
      style={{
        background: "#010101",
      }}
    >
      <span
        className="text-xs sm:text-base font-messina-sans font-normal leading-[18px] sm:leading-[22px] text-center"
        style={{
          fontWeight: 350,
          background:
            "linear-gradient(90deg, rgba(147, 197, 253, 1) 0%, rgba(191, 219, 254, 1) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {timeUnit.value}
        {timeUnit.label}
      </span>
    </div>
  );
}

function calculateTimeRemaining(launchTime: Date): TimeUnit[] {
  const now = new Date();
  const timeDiff = launchTime.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return [
      { value: 0, label: "days" },
      { value: 0, label: "hrs" },
      { value: 0, label: "mins" },
      { value: 0, label: "secs" },
    ];
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return [
    { value: days, label: "days" },
    { value: hours, label: "hrs" },
    { value: minutes, label: "mins" },
    { value: seconds, label: "secs" },
  ];
}

export default function WorldCardCountdown({
  launchTime,
  className,
}: WorldCardCountdownProps) {
  const [timeUnits, setTimeUnits] = useState<TimeUnit[]>(() =>
    calculateTimeRemaining(launchTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUnits(calculateTimeRemaining(launchTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [launchTime]);

  return (
    <div className={cn("flex flex-col sm:flex-row gap-1 sm:gap-2 items-center min-w-0", className)}>
      <span
        className="text-xs sm:text-sm text-white font-office-times-round font-normal leading-[20px] sm:leading-[24px] flex-shrink-0"
        style={{
          fontWeight: 400,
        }}
      >
        End in
      </span>
      <div className="flex flex-row gap-0.5 sm:gap-1 items-center">
        {timeUnits.map((unit, index) => (
          <CountdownTimeBlock key={`${unit.label}-${index}`} timeUnit={unit} />
        ))}
      </div>
    </div>
  );
}
