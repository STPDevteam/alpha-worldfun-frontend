"use client";

import React from "react";
import { motion } from "motion/react";
import { InlineClamp } from "../ui/inline-clamp";

interface WorldOverviewProps {
  title?: string;
  description: string;
  tokenSymbol?: string;
  className?: string;
}

const WorldOverview = ({
  title = "World Overview",
  description,
  tokenSymbol,
  className = "",
}: WorldOverviewProps) => {
  // InlineClamp handles truncation and show-more/show-less behavior,
  // so no local state is required here.

  return (
    <motion.div
      className={`flex flex-col gap-3 w-full ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 2.3,
        ease: "easeOut",
      }}
    >
      <motion.div
        className="flex items-baseline gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.4,
          delay: 2.5,
          ease: "easeOut",
        }}
      >
        <h3
          className="text-[#E0E0E0] text-base sm:text-lg leading-[22px] font-medium"
          style={{ fontFamily: "DM Mono" }}
        >
          {title}
        </h3>
        {tokenSymbol && (
          <span
            className="font-dm-mono"
            style={{
              fontSize: "14px",
              color: "#8F9393",
              lineHeight: "22px",
            }}
          >
            #{tokenSymbol}
          </span>
        )}
      </motion.div>

      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: 2.7,
          ease: "easeOut",
        }}
      >
        <InlineClamp
          text={description}
          maxLines={5}
          className="text-[#8F9393] text-xs sm:text-sm leading-[16px] sm:leading-[18px] font-normal"
        />
      </motion.div>
    </motion.div>
  );
};

export default WorldOverview;
