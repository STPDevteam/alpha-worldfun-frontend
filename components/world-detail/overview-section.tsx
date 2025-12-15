"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DoubleArrowDownIcon } from "@/components/ui/icons/double-arrow-down-icon";
import { DoubleArrowUpIcon } from "@/components/ui/icons/double-arrow-up-icon";
import TextType from "@/components/ui/TextType";
import BlurText from "@/components/ui/BlurText";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CopyButton } from "@/components/ui/copy-button";
import { XLogo } from "@/components/icons/x-logo";
import { BookIcon } from "@/components/icons/book-icon";
import { DiscordIcon } from "@/components/icons/discord-icon";
import { TelegramIcon } from "@/components/icons/telegram-icon";
import { formatAddress } from "@/libs/utils";
import { Text } from "@/components/ui/text";
import { WebsiteIcon } from "../icons";

interface OverviewCardProps {
  title: string;
  launchDate: string;
  description: string;
  tokenSymbol?: string;
  tokenImage?: string | null;
  address?: string;
  socialLinks?: Array<{
    type: string;
    url: string;
  }>;
  className?: string;
}

const OverviewSection = ({
  title,
  launchDate,
  description,
  tokenSymbol,
  tokenImage,
  address,
  socialLinks = [],
  className = "",
}: OverviewCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const fullContentRef = useRef<HTMLDivElement>(null);
  const prevExpandedRef = useRef<boolean>(false);

  const iconClassName = "text-[#828B8D] w-3.5 h-3.5 sm:w-4 sm:h-4";

  const getSocialIcon = (type: string) => {
    const normalizedType = type.toLowerCase();
    switch (normalizedType) {
      case "twitter":
      case "x":
        return <XLogo className={iconClassName} />;
      case "discord":
        return <DiscordIcon className={iconClassName} />;
      case "telegram":
        return <TelegramIcon className={iconClassName} />;
      // case "github":
      //   return <GithubIcon className={iconClassName} />;
      case "website":
        return <WebsiteIcon className={iconClassName} />;
      case "onchain":
      case "onchain-profile":
        return <BookIcon className={iconClassName} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (descriptionRef.current && fullContentRef.current) {
      // Calculate height for exactly 5 lines: 16px (text-base) * 1.375 (leading) * 5 lines = 110px
      const collapsedHeight = 110;
      const fullHeight = fullContentRef.current.scrollHeight;
      setShowExpandButton(fullHeight > collapsedHeight);
    }
  }, [description]);

  // When the description collapses (user clicks "Show less"), scroll to the top
  useEffect(() => {
    const wasExpanded = prevExpandedRef.current;
    if (wasExpanded && !isExpanded && showExpandButton) {
      // Smooth scroll to top of the section - use window scroll
      if (typeof window !== "undefined" && window.scrollTo) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, showExpandButton]);

  return (
    <motion.div
      className={`max-w-[899px] w-full flex flex-col gap-4 relative not-md:px-3 not-md:m-0 not-md:p-0 ${className}`}
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
        <div className="flex items-start sm:items-center gap-3 sm:gap-5 w-full">
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
            <AvatarImage src={tokenImage || undefined} alt={`${title} token`} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg sm:text-xl">
              {title.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2 min-w-0 flex-1">
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
            {/* Address Badge and Social Links */}
            {(address || socialLinks.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 w-full">
                {/* Address Badge */}
                {address && (
                  <motion.div
                    className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.6,
                      ease: [0.75, 0, 0.25, 1.0],
                    }}
                  >
                    <CopyButton
                      content={address}
                      successMessage="Address copied!"
                      variant="ghost"
                      className="flex items-center gap-2 px-2 sm:px-3 cursor-pointer py-1.5 rounded-lg bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] hover:bg-[rgba(81,81,81,0.3)] hover:scale-105 transition-all duration-200 w-full h-auto flex-row-reverse text-[#646E71]"
                    >
                      <span
                        className="text-[#8F9393] text-xs sm:text-sm leading-[18px] truncate max-w-[120px] sm:max-w-none"
                        style={{ fontFamily: "DM Mono", fontWeight: 400 }}
                      >
                        {formatAddress(address)}
                      </span>
                    </CopyButton>
                  </motion.div>
                )}
                {/* Social Links */}
                {socialLinks.map((link, index) => (
                  <motion.div
                    key={index}
                    className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.8 + index * 0.1,
                      ease: [0.75, 0, 0.25, 1.0],
                    }}
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] hover:bg-[rgba(81,81,81,0.3)] hover:scale-110 hover:rotate-3 transition-all duration-200"
                      aria-label={link.type}
                      title={link.type}
                    >
                      {getSocialIcon(link.type) ?? link.type}
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
        <motion.div
          className="flex items-center justify-center gap-2.5 w-fit"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        >
          <Text
            variant="md"
            weight="light"
            className="text-[#B38045] max-md:text-sm"
          >
            Launch Date: {launchDate}
          </Text>
        </motion.div>
      </motion.div>

      {/* Description */}
      <div className="relative">
        {/* Hidden full content for height measurement */}
        <div
          ref={fullContentRef}
          className="invisible absolute
            whitespace-pre-line text-[14px] lg:text-base font-light leading-[1.375] text-white font-dm-mono 
            text-left"
          aria-hidden="true"
          // ensure the hidden element can expand height based on line breaks
          style={{ whiteSpace: "pre-line" }}
        >
          {description}
        </div>

        {/* Visible description with expand/collapse animation */}
        <motion.div
          className="overflow-hidden"
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "linear" }}
        >
          <motion.p
            ref={descriptionRef}
            className="whitespace-pre-line text-[14px] lg:text-base font-light leading-[1.375] text-white font-dm-mono text-left"
            animate={{
              height: isExpanded ? "auto" : showExpandButton ? "110px" : "auto",
            }}
            transition={{
              stiffness: 300,
              damping: 30,
              duration: 0.6,
              ease: "easeOut",
            }}
            style={{
              overflow: "hidden",
              marginBottom: isExpanded && showExpandButton ? "32px" : "0px",
            }}
          >
            {description}
          </motion.p>
        </motion.div>

        {/* Mobile Overlay Gradient - Only visible on mobile when collapsed */}
        <AnimatePresence>
          {showExpandButton && !isExpanded && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 pointer-events-none md:hidden"
              style={{
                height: "80px",
                background:
                  "linear-gradient(180deg, rgba(13, 13, 14, 0) 0%, #0D0D0E 100%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* Mobile Expand Button - Only visible on mobile when content overflows */}
        <AnimatePresence>
          {showExpandButton && (
            <motion.div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 md:hidden z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-center gap-2 px-4 py-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-expanded={isExpanded}
                aria-label={
                  isExpanded ? "Collapse description" : "Expand description"
                }
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <DoubleArrowUpIcon size={16} className="text-white/80" />
                  ) : (
                    <DoubleArrowDownIcon size={16} className="text-white/80" />
                  )}
                  <BlurText
                    text={isExpanded ? "Show less" : "Show more"}
                    className="text-xs text-white/80 font-dm-mono"
                    animateBy="words"
                    delay={50}
                    stepDuration={0.2}
                  />
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default OverviewSection;
