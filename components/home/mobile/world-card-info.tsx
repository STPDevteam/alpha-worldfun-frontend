"use client";

import React from "react";
import { cn } from "@/libs/utils/cn";
import { formatAddressParts } from "@/libs/utils/format";
import type { WorldCard as WorldCardType } from "@/libs/types/world-card";
import { isEmpty } from "lodash";
import { CopyButton } from "@/components/ui/copy-button";
import { Text } from "@/components/ui/text";

interface WorldCardInfoProps {
  card: WorldCardType;
  className?: string;
}

export function WorldCardCategories({ card }: WorldCardInfoProps) {
  //Todo: Transform categories data for mobile display
  const categories = "Simulation, Tipping, Prediction Market, Game";

  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-white font-dm-mono font-medium text-xs leading-[16px] tracking-[0.01em]"
        style={{
          fontWeight: 500,
        }}
      >
        Type
      </span>
      <span
        className="text-[#646E71] font-dm-mono font-medium text-xs leading-[16px] tracking-[0.01em] line-clamp-2"
        style={{
          fontWeight: 500,
        }}
      >
        {isEmpty(categories) ? "--" : card.tokenType.replaceAll("_", " ")}
      </span>
    </div>
  );
}

export default function WorldCardInfo({ card, className }: WorldCardInfoProps) {
  const displayAddress =
    formatAddressParts(card.worldContract).prefix +
    formatAddressParts(card.worldContract).suffix;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Description */}
      <Text
        preserveWhitespace
        className="text-[#F5F3FF] font-dm-mono font-light text-xs leading-[16px] tracking-[0.01em] line-clamp-3"
        variant="small"
        weight="light"
        style={{
          fontWeight: 300,
        }}
      >
        {isEmpty(card.description) ? "--" : card.description}
      </Text>

      {/* World Address */}
      <div
        className="flex items-center gap-2 px-2 py-2 self-start"
        style={{
          border: "0.5px solid rgba(100, 110, 113, 0.7)",
          borderRadius: "8px",
        }}
      >
        <span
          className="text-[#646E71] font-dm-mono font-light text-xs leading-[16px] tracking-[0.08em]"
          style={{
            fontWeight: 300,
          }}
        >
          <span className="text-white">World</span>{" "}
          {isEmpty(displayAddress) ? "--" : displayAddress}
        </span>
        <CopyButton
          content={card.worldContract}
          successMessage="World address copied!"
          errorMessage="Failed to copy address"
          className="p-1 h-auto w-auto text-[#646E71]"
          variant="ghost"
        />
      </div>
    </div>
  );
}
