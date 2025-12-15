"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui";
import { useNavigationLoadingStore } from "@/libs/stores";
import { cn } from "@/libs/utils/cn";
import { formatAddressParts } from "@/libs/utils/format";
import type { WorldCard as WorldCardType } from "@/libs/types/world-card";
import { TokenStatus } from "@/libs/types/world-card";
import { CopyButton } from "@/components/ui/copy-button";
import { isEmpty } from "lodash";
import { WorldCardService } from "@/libs/services/api/world-card.service";

interface WorldCardProps {
  card: WorldCardType;
  className?: string;
  priority?: boolean;
  pageIndex?: number;
}

function getStatusBadgeConfig(status: WorldCardType["status"]) {
  const statusConfig = {
    [TokenStatus.LIVE]: {
      label: "Just Launched",
      bgColor: "rgba(128, 200, 56, 0.2)",
      textColor: "#80C838",
    },
    [TokenStatus.ON_GOING]: {
      label: "Upcoming",
      bgColor: "rgba(255, 165, 0, 0.2)",
      textColor: "#FFA500",
    },
    [TokenStatus.COMPLETED]: {
      label: "Completed",
      bgColor: "rgba(128, 128, 128, 0.2)",
      textColor: "#808080",
    },
    [TokenStatus.CANCELLED]: {
      label: "Cancelled",
      bgColor: "rgba(255, 69, 58, 0.2)",
      textColor: "#FF453A",
    },
  } as const;

  return statusConfig[status] || statusConfig[TokenStatus.LIVE];
}

function WorldCard({ card, className, priority = false }: WorldCardProps) {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "01/07/2026";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const statusCfg = getStatusBadgeConfig(card.status);
  const addr = formatAddressParts(card.worldContract);
  const displayAddress = `${addr.prefix}${addr.suffix}`;
  const startNavigation = useNavigationLoadingStore((state) => state.startNavigation);
  const handleNavigate = useCallback(() => {
    startNavigation(`/world/${card.id}`);
  }, [card.id, startNavigation]);

  // Image handling: service already provides proper fallback, but we need state for error handling
  const [imgSrc, setImgSrc] = useState<string>(card.backgroundImage);

  useEffect(() => {
    setImgSrc(card.backgroundImage);
  }, [card.backgroundImage]);

  return (
    <Link href={`/world/${card.id}`} onNavigate={handleNavigate}>
      <Card
        className={cn(
          "w-full max-w-[1316px] transition-all duration-300 relative",
          "cursor-pointer hover:opacity-90",
          "border-t-[0.5px] border-t-[#646E71]",
          className
        )}
      >
        <CardContent className="p-0 relative">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-stretch gap-6 lg:gap-12 xl:gap-[127px] 
            p-4 lg:pt-6 lg:pb-8 lg:px-0">
            {/* Left: title, status, date, countdown (optional) */}
            <div className="flex flex-col w-full lg:w-auto lg:max-w-[290px] lg:flex-shrink-0 gap-2">
              <div className="flex flex-row items-start gap-4 justify-start flex-wrap md:flex-nowrap">
                <h3
                  className="text-white font-dm-mono uppercase text-left line-clamp-2 min-w-0 flex-shrink-0 xl:max-w-[130px]"
                  style={{
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "1.25em",
                    letterSpacing: "0.08em",
                  }}
                >
                  {card.title}
                </h3>

                <div
                  className="flex items-center rounded-[32px] w-fit flex-shrink-0"
                  style={{
                    background: statusCfg.bgColor,
                    backdropFilter: "blur(32.8px)",
                    padding: "8px 12px",
                  }}
                >
                  <span
                    className="font-dm-mono text-center whitespace-nowrap"
                    style={{
                      fontSize: "12px",
                      fontWeight: 300,
                      lineHeight: "1.3333em",
                      letterSpacing: "0.08em",
                      color: statusCfg.textColor,
                    }}
                  >
                    {statusCfg.label}
                  </span>
                </div>
              </div>

              <div
                className="text-[#646E71] font-dm-mono text-left"
                style={{
                  fontSize: "12px",
                  fontWeight: 300,
                  lineHeight: "1.3333em",
                  letterSpacing: "0.08em",
                }}
              >
                {formatDate(card.launchTime)}
              </div>

              {/* No countdown in current Figma spec */}
            </div>

            {/* Middle: (row) left content 390 + right categories */}
            <div className="flex flex-col lg:flex-row w-full 
              lg:flex-1 lg:w-auto lg:min-w-0 lg:max-w-[645px]
              gap-8 lg:gap-10">
              <div className="flex flex-col w-auto xl:w-full lg:max-w-[390px] gap-4">
                <Text
                  preserveWhitespace
                  className="text-[#F5F3FF] font-dm-mono text-left
                    overflow-hidden line-clamp-6"
                  style={{
                    fontSize: "14px",
                    fontWeight: 300,
                    lineHeight: "1.1428571428571428em",
                    letterSpacing: "0.01em",
                  }}
                >
                  {card.description}
                </Text>

                <div
                  className="flex items-center w-full max-w-[240px] gap-2 px-2 py-2 self-start"
                  style={{
                    border: "0.5px solid rgba(100, 110, 113, 0.7)",
                    borderRadius: "8px",
                  }}
                >
                  <span
                    className="text-[#646E71] flex-1 min-w-0 whitespace-nowrap truncate font-dm-mono font-light text-[14px] leading-[16px]"
                    style={{ fontWeight: 300 }}
                  >
                    <span className="text-white">World</span>{" "}
                    {isEmpty(displayAddress) ? "--" : displayAddress}
                  </span>
                  <CopyButton
                    content={card.worldContract}
                    successMessage="World address copied!"
                    errorMessage="Failed to copy address"
                    className="p-1 h-auto w-auto text-[#646E71] hover:text-white"
                    variant="ghost"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <span
                  className="text-white font-dm-mono text-left"
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    lineHeight: "1.1428571428571428em",
                    letterSpacing: "0.01em",
                  }}
                >
                  Type
                </span>
                <span
                  className="font-dm-mono text-left text-[#646E71]"
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    lineHeight: "1.1428571428571428em",
                    letterSpacing: "0.01em",
                  }}
                >
                  {card.tokenType ? card.tokenType.replaceAll("_", " ") : "--"}
                </span>
              </div>
            </div>

            {/* Right: image */}
            <div
              className="relative overflow-hidden rounded-lg w-[138px] h-[138px] flex-shrink-0 mx-auto lg:mx-0"
            >
              <Image
                src={imgSrc}
                alt={card.title}
                width={138}
                height={138}
                priority={priority}
                className="rounded-lg"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                onError={() => {
                  const defaultSrc = WorldCardService.getDefaultImageSrc();
                  if (imgSrc !== defaultSrc) {
                    setImgSrc(defaultSrc);
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default React.memo(WorldCard);

