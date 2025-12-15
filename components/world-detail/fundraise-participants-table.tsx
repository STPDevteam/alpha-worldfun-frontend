"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { CopyButton } from "@/components/ui/copy-button";
import { Skeleton, Text } from "@/components/ui";
import { FundraiseParticipantTableData } from "@/libs/types/world-card";
import { cn } from "@/libs/utils";

interface FundraiseParticipantsTableProps {
  data: FundraiseParticipantTableData;
  className?: string;
  isRefreshing?: boolean;
}

interface FundraiseParticipantsTableSkeletonProps {
  rows?: number;
  className?: string;
  variant?: "desktop" | "mobile";
}

const labelClass =
  "text-[#828B8D] text-sm font-normal transition-colors duration-300 group-hover:text-[#9AA3A5]";
const labelStyle = { fontSize: "14px", lineHeight: "18px" } as const;
const DEFAULT_TABLE_HEIGHT = 500;

const DesktopRowSkeleton = () => (
  <div className="group relative flex flex-row items-center gap-3 md:gap-5 w-full max-w-full px-3 md:px-4 py-3 rounded-xl bg-transparent border border-transparent">
    <div className="flex flex-col gap-1.5 w-full md:w-[328px] min-w-0">
      <span className={labelClass} style={labelStyle}>
        Participant
      </span>
      <div className="flex items-center gap-2 min-w-0">
        <Skeleton className="h-[18px] w-32" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>

    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <span className={labelClass} style={labelStyle}>
        Committed
      </span>
      <Skeleton className="h-[18px] w-24" />
    </div>

    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <span className={labelClass} style={labelStyle}>
        Time
      </span>
      <Skeleton className="h-[18px] w-20" />
    </div>
  </div>
);

const MobileRowSkeleton = () => (
  <div className="flex flex-col gap-3 rounded-2xl border border-[#1F1F22] bg-[#0D1116]/70 px-3 py-3">
    <div className="flex flex-col gap-1.5">
      <span className="text-[#828B8D] text-xs font-medium uppercase tracking-[0.08em]">
        Participant
      </span>
      <div className="flex items-center gap-2">
        <Skeleton className="h-[18px] w-32" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
    <div className="flex flex-col gap-1.5">
      <span className="text-[#828B8D] text-xs font-medium uppercase tracking-[0.08em]">
        Committed
      </span>
      <Skeleton className="h-[18px] w-24" />
    </div>
    <div className="flex flex-col gap-1.5">
      <span className="text-[#828B8D] text-xs font-medium uppercase tracking-[0.08em]">
        Time
      </span>
      <Skeleton className="h-[18px] w-20" />
    </div>
  </div>
);

export const FundraiseParticipantsTableSkeleton = ({
  rows = 3,
  className = "",
  variant = "desktop",
}: FundraiseParticipantsTableSkeletonProps) => {
  const containerClasses = cn(
    variant === "desktop"
      ? "relative border border-[#E0E0E0]/20 rounded-2xl p-6 flex flex-col gap-3 max-w-[899px] w-full overflow-hidden bg-[#07090D]/60 backdrop-blur-sm"
      : "relative border border-[#E0E0E0]/20 rounded-2xl py-4 px-3 w-full max-w-[calc(100%-24px)] mx-auto flex flex-col gap-4 bg-[#07090D]/60 backdrop-blur-sm",
    className
  );

  return (
    <div
      className={containerClasses}
      style={{ fontFamily: "DM Mono", minHeight: `${DEFAULT_TABLE_HEIGHT}px` }}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <React.Fragment
          key={`fundraise-participant-skeleton-${variant}-${index}`}
        >
          {variant === "desktop" ? (
            <DesktopRowSkeleton />
          ) : (
            <MobileRowSkeleton />
          )}
          {index < rows - 1 && variant === "desktop" ? (
            <div
              className="w-full h-0 border-t border-dashed border-[#1F1F22]"
              style={{
                borderStyle: "dashed",
                borderWidth: "1px 0 0 0",
              }}
            />
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
};

const NoParticipantsState: React.FC<{ description: string }> = ({
  description,
}) => (
  <div
    className="flex flex-1 flex-col items-center justify-center gap-1 py-20 px-6 text-center"
    style={{ fontFamily: "DM Mono" }}
  >
    <div className="relative h-[120px] w-[120px]">
      <Image
        src="/assets/images/no-data-chart-image.png"
        alt="No data"
        width={120}
        height={120}
        className="object-contain"
      />
    </div>
    <Text className="text-base font-medium text-white">No Data</Text>
    <Text className="text-sm text-[#5D5D5D]">{description}</Text>
  </div>
);

const FundraiseParticipantsTable: React.FC<FundraiseParticipantsTableProps> = ({
  data,
  className = "",
  isRefreshing = false,
}) => {
  const { participants } = data;
  const shouldReduceMotion = useReducedMotion();
  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const hasPendingParticipants = React.useMemo(
    () => participants.some((participant) => participant.isPending),
    [participants]
  );

  const containerStyle = React.useMemo(
    () =>
      ({
        fontFamily: "DM Mono",
        // height: `${DEFAULT_TABLE_HEIGHT}px`,
        // maxHeight: `${DEFAULT_TABLE_HEIGHT}px`,
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      } as React.CSSProperties),
    []
  );

  const truncateAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSecondsRaw = Math.floor(
      (now.getTime() - timestamp.getTime()) / 1000
    );
    const diffInSeconds = Math.max(diffInSecondsRaw, 0);

    if (diffInSeconds < 60) {
      return diffInSeconds <= 5 ? "Just now" : `${diffInSeconds} secs ago`;
    }
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} mins ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hours ago`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} days ago`;
  };

  const formatAmount = (amount: number) => amount.toLocaleString();

  // Sort participants by timestamp in descending order (most recent first)
  const sortedParticipants = React.useMemo(() => {
    return [...participants].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [participants]);

  const hasParticipants = sortedParticipants.length > 0;
  const showSyncIndicator =
    (isRefreshing || hasPendingParticipants) && hasParticipants;

  return (
    <motion.div
      ref={containerRef}
      role="list"
      className={cn(
        "relative border border-[#E0E0E0]/20 rounded-2xl p-6 flex flex-col gap-3",
        "xl:max-w-[899px] w-full",
        "overflow-y-auto overflow-x-hidden scrollbar-hide bg-[#07090D]/60 backdrop-blur-sm",
        className
      )}
      style={containerStyle}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.55, ease }}
    >
      {/* {showSyncIndicator ? (
        <motion.div
          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-[#9AA3A5]"
          initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.4, ease }}
        >
          <span className="truncate">Syncing fundraise activity</span>
          <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                hasPendingParticipants
                  ? "bg-amber-400 animate-pulse"
                  : "bg-emerald-400 animate-pulse"
              )}
            />
            {hasPendingParticipants ? "Pending" : "Live"}
          </span>
        </motion.div>
      ) : null} */}

      {hasParticipants ? (
        sortedParticipants.map((participant, index) => {
          const isPending = Boolean(participant.isPending);
          const pendingLabel = isPending ? "Awaiting confirmation" : null;

          return (
            <React.Fragment key={participant.id}>
              <motion.div
                data-participant-row
                role="listitem"
                layout
                className={cn(
                  "group relative flex flex-row items-center gap-3 md:gap-5 w-full max-w-full px-3 md:px-4 py-3 rounded-xl border transition-[transform,box-shadow,background-color,border-color] duration-300 ease-out",
                  isPending
                    ? "border-white/12 bg-[#111419]/80 shadow-[0px_16px_40px_rgba(10,16,28,0.45)]"
                    : "border-transparent hover:bg-[#111419] hover:shadow-[0px_12px_32px_rgba(0,0,0,0.25)]"
                )}
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 18, scale: 0.98 }
                }
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { opacity: 1, y: 0, scale: 1 }
                }
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { duration: 0.45, ease, delay: index * 0.05 }
                }
                whileHover={
                  shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }
                }
                whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
              >
                <div className="flex flex-col gap-1.5 w-full md:w-[328px] min-w-0">
                  <span
                    className="text-[#828B8D] text-sm font-normal transition-colors duration-300 group-hover:text-[#9AA3A5]"
                    style={{ fontSize: "14px", lineHeight: "18px" }}
                  >
                    Participant
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-[#E0E0E0] text-sm font-medium truncate transition-colors duration-300 group-hover:text-white"
                      style={{ fontSize: "14px", lineHeight: "18px" }}
                    >
                      {truncateAddress(participant.walletAddress)}
                    </span>
                    <CopyButton
                      content={participant.walletAddress}
                      successMessage="Wallet address copied!"
                      errorMessage="Failed to copy wallet address"
                      className="p-1 h-auto w-auto text-[#8F9393] hover:text-white group-hover:text-white transition-colors duration-300"
                      variant="ghost"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <span
                    className="text-[#828B8D] text-sm font-normal transition-colors duration-300 group-hover:text-[#9AA3A5]"
                    style={{ fontSize: "14px", lineHeight: "18px" }}
                  >
                    Committed
                  </span>
                  <span
                    className="text-[#E0E0E0] text-sm font-medium transition-colors duration-300 group-hover:text-white"
                    style={{ fontSize: "14px", lineHeight: "18px" }}
                  >
                    {formatAmount(participant.amount)} AWE
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <span
                    className="text-[#828B8D] text-sm font-normal transition-colors duration-300 group-hover:text-[#9AA3A5]"
                    style={{ fontSize: "14px", lineHeight: "18px" }}
                  >
                    Time
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-2 text-[#E0E0E0] text-sm font-medium transition-colors duration-300 group-hover:text-white",
                      isPending && "text-white"
                    )}
                    style={{ fontSize: "14px", lineHeight: "18px" }}
                  >
                    {isPending
                      ? "Syncing..."
                      : formatTimeAgo(participant.timestamp)}
                    {isPending ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    ) : null}
                  </span>
                  {pendingLabel ? (
                    <span className="text-[12px] font-normal text-amber-300/90">
                      {pendingLabel}
                    </span>
                  ) : null}
                </div>

                {/* <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <span
                    className="text-[#828B8D] text-sm font-normal transition-colors duration-300 group-hover:text-[#9AA3A5]"
                    style={{ fontSize: "14px", lineHeight: "18px" }}
                  >
                    Max
                  </span>
                  <span
                    className="text-[#E0E0E0] text-sm font-medium transition-colors duration-300 group-hover:text-white"
                    style={{ fontSize: "14px", lineHeight: "18px" }}
                  >
                    {participant.tokenAmount
                      ? `${formatAmount(participant.tokenAmount)} AWE`
                      : "500,000 AWE"}
                  </span>
                </div> */}
              </motion.div>

              {index < sortedParticipants.length - 1 && (
                <motion.div
                  className="w-full h-0 border-t border-dashed border-[#1F1F22]"
                  style={{
                    borderStyle: "dashed",
                    borderWidth: "1px 0 0 0",
                    transformOrigin: "center",
                  }}
                  initial={
                    shouldReduceMotion ? false : { opacity: 0, scaleX: 0.65 }
                  }
                  animate={
                    shouldReduceMotion ? undefined : { opacity: 1, scaleX: 1 }
                  }
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : { duration: 0.35, ease, delay: index * 0.05 + 0.2 }
                  }
                />
              )}
            </React.Fragment>
          );
        })
      ) : (
        <motion.div
          role="presentation"
          className="flex flex-1"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.4, ease }}
        >
          <NoParticipantsState description="Fundraise contributions will appear here once supporters join the campaign." />
        </motion.div>
      )}
    </motion.div>
  );
};

export default FundraiseParticipantsTable;
