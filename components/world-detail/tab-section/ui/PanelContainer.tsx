"use client";

import React from "react";
import DecorativeBars from "./DecorativeBars";
import { cn } from "@/libs/utils/cn";

type PanelContainerProps = {
  children: React.ReactNode;
  className?: string;
  withBars?: boolean;
  padding?: string; // tailwind classes for padding override
};

export function PanelContainer({
  children,
  className,
  withBars = false,
  padding = "p-6",
}: PanelContainerProps) {
  return (
    <div className={cn("relative rounded-lg border border-gray-200/20 bg-[#10101066]", padding, className)}>
      {withBars && <DecorativeBars />}
      {children}
    </div>
  );
}

export default PanelContainer;
