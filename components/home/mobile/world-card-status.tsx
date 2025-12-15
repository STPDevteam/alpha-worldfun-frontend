"use client";

import React from "react";
import { cn } from "@/libs/utils/cn";
import type { WorldCard as WorldCardType } from "@/libs/types/world-card";
import { TokenStatus } from "@/libs/types/world-card";

interface WorldCardStatusProps {
  status: WorldCardType["status"];
  className?: string;
}

export default function WorldCardStatus({
  status,
  className,
}: WorldCardStatusProps) {
  const statusConfig = {
    [TokenStatus.LIVE]: {
      label: "Just Launched",
      backgroundColor: "rgba(128, 200, 56, 0.2)",
      textColor: "#80C838",
    },
    [TokenStatus.ON_GOING]: {
      label: "Upcoming",
      backgroundColor: "rgba(255, 165, 0, 0.2)",
      textColor: "#FFA500",
    },
    [TokenStatus.COMPLETED]: {
      label: "Completed",
      backgroundColor: "rgba(128, 128, 128, 0.2)",
      textColor: "#808080",
    },
    [TokenStatus.CANCELLED]: {
      label: "Completed",
      backgroundColor: "rgba(128, 128, 128, 0.2)",
      textColor: "#808080",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center px-2 py-1.5 self-start",
        className
      )}
      style={{
        backgroundColor: config.backgroundColor,
        borderRadius: "32px",
        backdropFilter: "blur(32.8px)",
      }}
    >
      <span
        className="font-dm-mono font-light text-[8px] tracking-[0.08em] text-right leading-1.5"
        style={{
          fontWeight: 300,
          color: config.textColor,
        }}
      >
        {config.label}
      </span>
    </div>
  );
}
