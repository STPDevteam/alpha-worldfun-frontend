"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/libs/utils/cn";
import TextType from "../ui/TextType";
import { TokenStatus } from "@/libs/types/world-card";

interface StatusBadgeProps {
  status: TokenStatus;
  className?: string;
  completedInfo?: {
    fdv?: string;
    createdOn?: string;
  };
}

const StatusBadge = ({
  status,
  className,
  completedInfo,
}: StatusBadgeProps) => {
  const getStatusConfig = (status: TokenStatus) => {
    switch (status) {
      case TokenStatus.ON_GOING:
        return {
          text: "In Progress",
          dotColor: "#E7AC47",
          bgColor: "rgba(231, 172, 71, 0.4)",
        };
      case TokenStatus.LIVE:
        return {
          text: "Graduated",
          dotColor: "#4ADE80",
          bgColor: "rgba(74, 222, 128, 0.4)",
        };
      case TokenStatus.CANCELLED:
        return {
          text: "Expired",
          dotColor: "#FF453A",
          bgColor: "rgba(255, 69, 58, 0.4)",
        };
      default:
        return {
          text: "UNKNOWN",
          dotColor: "#666",
          bgColor: "rgba(102, 102, 102, 0.4)",
        };
    }
  };

  const config = getStatusConfig(status);

  // Special layout for COMPLETED status based on Figma design
  // if (status === TokenStatus.COMPLETED && completedInfo) {
  //   return (
  //     <div
  //       className={cn(
  //         "flex flex-col sm:flex-row items-center gap-3 sm:gap-5",
  //         className
  //       )}
  //     >
  //       {/* FDV Column */}
  //       <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-3">
  //         <span
  //           className="text-[#828B8D] text-xs sm:text-sm leading-[18px] font-normal text-center"
  //           style={{ fontFamily: "DM Mono" }}
  //         >
  //           FDV
  //         </span>
  //         <span
  //           className="text-[#34C759] text-sm sm:text-base leading-[22px] font-medium text-center"
  //           style={{ fontFamily: "DM Mono" }}
  //         >
  //           {completedInfo.fdv || "$749.37K"}
  //         </span>
  //       </div>

  //       {/* Vertical Line */}
  //       <div className="w-full h-px sm:w-px sm:h-full bg-[#0D0D0E]" />

  //       {/* Created On Column */}
  //       <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-3">
  //         <span
  //           className="text-[#828B8D] text-xs sm:text-sm leading-[18px] font-normal text-center"
  //           style={{ fontFamily: "DM Mono" }}
  //         >
  //           Created On
  //         </span>
  //         <span
  //           className="text-[#34C759] text-sm sm:text-base leading-[22px] font-medium text-center"
  //           style={{ fontFamily: "DM Mono" }}
  //         >
  //           {completedInfo.createdOn || "--"}
  //         </span>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span
        className="text-[#999999] text-xs sm:text-sm leading-[18px]"
        style={{ fontFamily: "DM Mono", fontWeight: 400 }}
      >
        [
      </span>
      <div
        className="flex items-center justify-center gap-2.5 px-[3px] py-[3px] w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[8px]"
        style={{ backgroundColor: config.bgColor }}
      >
        <div
          className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-pulse"
          style={{ backgroundColor: config.dotColor }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: -1 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5, ease: "easeOut" }}
        style={{
          fontFamily: "var(--font-dm-mono), monospace",
          fontSize: "clamp(12px, 2vw, 14px)",
          lineHeight: "18px",
        }}
      >
        <TextType
          text={[config.text]}
          as="span"
          className="text-[#999999] text-xs sm:text-sm leading-[18px] font-dm-mono text-left"
          typingSpeed={30}
          pauseDuration={300}
          showCursor={true}
          cursorCharacter=""
          loop={false}
          startOnVisible={true}
          initialDelay={300}
          textColors={["rgba(153, 153, 153, 1)"]}
          cursorClassName="font-dm-mono text-[#999999]"
        />
      </motion.div>
      <span
        className="text-[#999999] text-xs sm:text-sm leading-[18px]"
        style={{ fontFamily: "DM Mono", fontWeight: 400 }}
      >
        ]
      </span>
    </div>
  );
};

export default StatusBadge;
