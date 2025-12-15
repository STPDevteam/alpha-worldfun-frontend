"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { CopyButton } from "@/components/ui/copy-button";
import { Text } from "@/components/ui";
import { FundraiseParticipantTableData } from "@/libs/types/world-card";
import { cn } from "@/libs/utils";

interface FundraiseParticipantsTableMobileProps {
  data: FundraiseParticipantTableData;
  className?: string;
  isRefreshing?: boolean;
}

const ACTIVE_RESET_DELAY = 220;
const DEFAULT_TABLE_HEIGHT = 500;

const NoParticipantsState: React.FC<{ description: string }> = ({
  description,
}) => (
  <div
    className="flex flex-1 flex-col items-center justify-center gap-1 py-16 px-6 text-center"
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

const FundraiseParticipantsTableMobile: React.FC<
  FundraiseParticipantsTableMobileProps
> = ({ data, className = "", isRefreshing = false }) => {
  const { participants } = data;

  const [activeParticipantId, setActiveParticipantId] = React.useState<
    string | null
  >(null);
  const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const shouldReduceMotion = useReducedMotion();
  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const labelClass =
    "text-[#828B8D] text-sm font-normal uppercase tracking-[0.08em] whitespace-nowrap";
  const valueTextClass = "text-[#E0E0E0] text-sm font-medium";

  const containerStyle = React.useMemo(
    () =>
      ({
        fontFamily: "DM Mono",
        maxHeight: `${DEFAULT_TABLE_HEIGHT}px`,
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      } as React.CSSProperties),
    []
  );

  const clearPendingReset = React.useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const triggerActiveState = React.useCallback(
    (participantId: string) => {
      clearPendingReset();
      setActiveParticipantId(participantId);

      resetTimerRef.current = setTimeout(() => {
        setActiveParticipantId((current) =>
          current === participantId ? null : current
        );
        resetTimerRef.current = null;
      }, ACTIVE_RESET_DELAY);
    },
    [clearPendingReset]
  );

  const handlePointerDown = React.useCallback(
    (participantId: string) => {
      clearPendingReset();
      setActiveParticipantId(participantId);
    },
    [clearPendingReset]
  );

  const handlePointerLeave = React.useCallback(() => {
    clearPendingReset();
    setActiveParticipantId(null);
  }, [clearPendingReset]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>, participantId: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        triggerActiveState(participantId);
      }
    },
    [triggerActiveState]
  );

  React.useEffect(
    () => () => {
      clearPendingReset();
    },
    [clearPendingReset]
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

  const sortedParticipants = React.useMemo(() => {
    return [...participants].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [participants]);

  const hasParticipants = sortedParticipants.length > 0;
  // const hasPendingParticipants = React.useMemo(
  //   () => sortedParticipants.some((participant) => participant.isPending),
  //   [sortedParticipants]
  // );
  //const showSyncIndicator = (isRefreshing || hasPendingParticipants) && hasParticipants;

  return (
    <motion.div
      className={cn(
        "relative border border-[#E0E0E0]/20 rounded-2xl py-4 px-3",
        "w-full mx-auto flex flex-col gap-4",
        "overflow-y-auto overflow-x-hidden scrollbar-hide bg-[#07090D]/60 backdrop-blur-sm",
        className
      )}
      style={{
        ...containerStyle,
        minHeight: hasParticipants ? undefined : `${DEFAULT_TABLE_HEIGHT}px`,
      }}
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.55, ease }}
    >
      {/* {showSyncIndicator ? (
        <motion.div
          className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[#9AA3A5]"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.4, ease }}
        >
          <span className="truncate normal-case tracking-normal text-xs text-[#E0E0E0]/85">
            Syncing fundraise activity
          </span>
          <span className="flex items-center gap-2 text-white">
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
          const isActive = activeParticipantId === participant.id;
          const isPending = Boolean(participant.isPending);
          const rows = [
            {
              key: "participant",
              label: "Participant",
              value: (
                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                  <span
                    className={cn(
                      valueTextClass,
                      "truncate transition-colors duration-200",
                      (isActive || isPending) && "text-white"
                    )}
                    style={{ fontSize: "14px", lineHeight: "18px" }}
                  >
                    {truncateAddress(participant.walletAddress)}
                  </span>
                  <CopyButton
                    content={participant.walletAddress}
                    successMessage="Wallet address copied!"
                    errorMessage="Failed to copy wallet address"
                    className="p-1 h-auto w-auto text-[#8F9393] active:text-white transition-colors duration-200"
                    variant="ghost"
                    onCopySuccess={() => triggerActiveState(participant.id)}
                  />
                </div>
              ),
            },
            {
              key: "committed",
              label: "Committed",
              value: (
                <span
                  className={cn(
                    valueTextClass,
                    "transition-colors duration-200",
                    (isActive || isPending) && "text-white"
                  )}
                  style={{ fontSize: "14px", lineHeight: "18px" }}
                >
                  {`${formatAmount(participant.amount)} AWE`}
                </span>
              ),
            },
            {
              key: "time",
              label: "Time",
              value: (
                <span
                  className={cn(
                    valueTextClass,
                    "transition-colors duration-200",
                    (isActive || isPending) && "text-white"
                  )}
                  style={{ fontSize: "14px", lineHeight: "18px" }}
                >
                  {isPending
                    ? "Syncing..."
                    : formatTimeAgo(participant.timestamp)}
                  {isPending ? (
                    <span className="ml-2 inline-flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  ) : null}
                </span>
              ),
            },
            // {
            //   key: "max",
            //   label: "Max",
            //   value: (
            //     <span
            //       className={cn(
            //         valueTextClass,
            //         "transition-colors duration-200",
            //         (isActive || isPending) && "text-white"
            //       )}
            //       style={{ fontSize: "14px", lineHeight: "18px" }}
            //     >
            //       {participant.tokenAmount
            //         ? `${formatAmount(participant.tokenAmount)} AWE`
            //         : "500,000 AWE"}
            //     </span>
            //   ),
            // },
          ];

          return (
            <React.Fragment key={participant.id}>
              <motion.div
                role="button"
                tabIndex={0}
                layout
                className="relative w-full cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                initial={
                  shouldReduceMotion
                    ? undefined
                    : { opacity: 0, y: 14, scale: 0.98 }
                }
                whileInView={
                  shouldReduceMotion
                    ? undefined
                    : { opacity: 1, y: 0, scale: 1 }
                }
                viewport={{ once: true, amount: 0.1 }}
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { duration: 0.45, ease, delay: index * 0.05 }
                }
                whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                onClick={() => triggerActiveState(participant.id)}
                onPointerDown={() => handlePointerDown(participant.id)}
                onPointerUp={() => triggerActiveState(participant.id)}
                onPointerLeave={handlePointerLeave}
                onKeyDown={(event) => handleKeyDown(event, participant.id)}
                onBlur={handlePointerLeave}
                aria-pressed={isActive}
                aria-label={`Fundraise participant ${truncateAddress(
                  participant.walletAddress
                )}`}
              >
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-xl border border-white/10 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.12),transparent_55%)]"
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={
                    shouldReduceMotion ? undefined : { duration: 0.35, ease }
                  }
                />
                <div
                  className={cn(
                    "relative z-[1] grid grid-cols-[120px_minmax(0,1fr)] gap-y-3 gap-x-3 px-3 py-3 rounded-xl",
                    "transition-all duration-200 bg-transparent border border-transparent",
                    isActive
                      ? "bg-[#111419] border-white/12 shadow-[0px_12px_32px_rgba(0,0,0,0.25)]"
                      : "active:bg-[#111419]/70 hover:border-white/10",
                    isPending &&
                      "border-white/12 bg-[#111419]/80 shadow-[0px_16px_40px_rgba(10,16,28,0.45)]"
                  )}
                >
                  {rows.map((row) => (
                    <React.Fragment key={row.key}>
                      <span
                        className={cn(
                          labelClass,
                          "transition-colors duration-200",
                          (isActive || isPending) && "text-[#9AA3A5]"
                        )}
                        style={{ fontSize: "12px", lineHeight: "16px" }}
                      >
                        {row.label}
                      </span>
                      <div className="min-w-0 flex items-center">
                        {row.value}
                      </div>
                    </React.Fragment>
                  ))}
                  {isPending ? (
                    <div className="col-span-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-amber-300/90">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
                      Awaiting confirmation
                    </div>
                  ) : null}
                </div>
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
                    shouldReduceMotion
                      ? undefined
                      : { opacity: 0, scaleX: 0.65 }
                  }
                  whileInView={
                    shouldReduceMotion ? undefined : { opacity: 1, scaleX: 1 }
                  }
                  viewport={{ once: true, amount: 0.1 }}
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : { duration: 0.35, ease, delay: index * 0.05 + 0.18 }
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
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.4, ease }}
        >
          <NoParticipantsState description="Participant activity shows up here once the fundraise receives contributions." />
        </motion.div>
      )}
    </motion.div>
  );
};

export default FundraiseParticipantsTableMobile;
