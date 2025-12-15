"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigationLoadingStore } from "@/libs/stores";
import { cn } from "@/libs/utils/cn";
import type { WorldCard as WorldCardType } from "@/libs/types/world-card";
import WorldCardImage from "./world-card-image";
import WorldCardStatus from "./world-card-status";
import WorldCardInfo, { WorldCardCategories } from "./world-card-info";

interface WorldCardProps {
  card: WorldCardType;
  className?: string;
  priority?: boolean;
  pageIndex?: number;
}

export default function WorldCard({
  card,
  className,
  priority = false,
  pageIndex = 0,
}: WorldCardProps) {
  const startNavigation = useNavigationLoadingStore((state) => state.startNavigation);
  const handleNavigate = useCallback(() => {
    startNavigation(`/world/${card.id}`);
  }, [card.id, startNavigation]);

  return (
    <Link href={`/world/${card.id}`} onNavigate={handleNavigate}>
      <Card
        className={cn(
          "transition-all duration-300 relative cursor-pointer hover:opacity-90 mx-3 w-[calc(100% - 12px)]",
          className
        )}
        style={{
          border: "1px solid rgba(224, 224, 224, 0.2)",
          background: "#010101",
          borderRadius: "10px",
        }}
      >
        <CardContent className="p-4 flex flex-col gap-6">
          {/* Horizontal layout: Image left, Content right */}
          <div className="flex flex-row gap-4">
            {/* Image Section - 138x138px */}
            <WorldCardImage
              src={card.backgroundImage}
              alt={card.title}
              priority={priority}
              pageIndex={pageIndex}
            />

            {/* Content Section - Dynamic height to fit content */}
            <div className="flex flex-col flex-1 min-w-0 justify-between gap-7">
              {/* Title and Status */}
              <div className="flex flex-col gap-3">
                {/* Title and Status Button */}
                <div className="flex flex-col gap-2">
                  <h3
                    className="text-white font-dm-mono font-normal text-sm leading-[10px] uppercase tracking-[0.08em] text-left line-clamp-1"
                    style={{
                      fontWeight: 400,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {card.title}
                  </h3>
                  <WorldCardStatus status={card.status} />
                </div>

                {/* Date */}
                <span
                  className="text-[#646E71] font-dm-mono font-light text-[8px] leading-[6px] tracking-[0.08em]"
                  style={{
                    fontWeight: 300,
                  }}
                >
                  {card.launchTime
                    ? new Date(card.launchTime).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })
                    : "--"}
                </span>
              </div>
              <WorldCardCategories card={card} />
            </div>
          </div>
          {/* Categories and World Info */}
          <WorldCardInfo card={card} />
        </CardContent>
      </Card>
    </Link>
  );
}

