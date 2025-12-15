"use client";

import { motion } from "motion/react";
import TextType from "@/components/ui/TextType";
import { InlineClamp } from "@/components/ui/inline-clamp";

interface OverviewSectionDesktopProps {
  title: string;
  launchDate: string;
  description: string;
  tokenSymbol?: string;
  className?: string;
}

const OverviewSectionDesktop = ({
  title,
  launchDate,
  description,
  tokenSymbol,
  className = "",
}: OverviewSectionDesktopProps) => {
  return (
    <motion.div
      className={`max-w-[899px] w-full flex flex-col gap-4 relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Title + Launch Date Section */}
      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
          className="flex items-baseline gap-2"
        >
          <div
            style={{
              fontFamily: "var(--font-bdo-grotesk), sans-serif",
              fontSize: "24px",
              lineHeight: "1.5",
            }}
          >
            <TextType
              text={[title]}
              as="h2"
              className="text-2xl font-normal leading-[1.5] text-white font-bdo-grotesk text-left"
              typingSpeed={30}
              pauseDuration={500}
              showCursor={true}
              cursorCharacter=""
              loop={false}
              startOnVisible={true}
              initialDelay={300}
              textColors={["rgba(255, 255, 255, 1)"]}
              cursorClassName="font-bdo-grotesk text-white"
            />
          </div>
          {tokenSymbol && (
            <span
              className="font-bdo-grotesk"
              style={{
                fontSize: "18px",
                color: "#8F9393",
                lineHeight: "1.5",
              }}
            >
              #{tokenSymbol}
            </span>
          )}
        </motion.div>
        <motion.div
          className="flex items-center justify-center gap-2.5 w-fit"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        >
          <span className="text-base font-light leading-[1.25] text-[#80C838] font-dm-mono text-left">
            Launch Date: {launchDate}
          </span>
        </motion.div>
      </motion.div>

      {/* Description with InlineClamp */}
      <motion.div
        className="overflow-hidden"
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "linear" }}
      >
        <InlineClamp
          text={description}
          maxLines={10}
          className="whitespace-pre-line text-base font-light leading-[1.375] text-white font-dm-mono text-left"
          showMoreLabel="Show more"
          showLessLabel="Show less"
        />
      </motion.div>
    </motion.div>
  );
};

export default OverviewSectionDesktop;