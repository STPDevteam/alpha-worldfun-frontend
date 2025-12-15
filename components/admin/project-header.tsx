"use client";
import React from "react";
import { CopyButton } from "@/components/ui/copy-button";
import StatusBadge from "./status-badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "motion/react";
import TextType from "../ui/TextType";
import { TokenStatus } from "@/libs/types/world-card";
import { XLogo } from "@/components/icons/x-logo";
import { BookIcon } from "@/components/icons/book-icon";
import { DiscordIcon } from "@/components/icons/discord-icon";
import { TelegramIcon } from "@/components/icons/telegram-icon";
import { WebsiteIcon } from "@/components/icons/website-icon";
import { formatAddress } from "@/libs/utils";
interface ProjectHeaderProps {
  title: string;
  address: string;
  avatarUrl?: string;
  status: TokenStatus;
  tokenSymbol?: string;
  socialLinks?: Array<{
    type: string;
    url: string | React.ComponentType<{ className?: string }>;
  }>;
  className?: string;
  completedInfo?: {
    fdv?: string;
    createdOn?: string;
  };
}
const ProjectHeader = ({
  title,
  address,
  avatarUrl,
  status,
  tokenSymbol,
  socialLinks = [],
  className = "",
  completedInfo,
}: ProjectHeaderProps) => {
  const iconClassName = "text-[#828B8D] w-3.5 h-3.5 sm:w-4 sm:h-4";

  // Helper function to ensure URL has proper protocol
  const ensureHttps = (url: string): string => {
    if (!url) return "";
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

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
      case "website":
        return <WebsiteIcon className={iconClassName} />;
      case "onchain":
      case "onchain-profile":
        return <BookIcon className={iconClassName} />;
      default:
        return null;
    }
  };
  return (
    <div className={`flex flex-col gap-4 w-full ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between w-full">
        <div className="flex items-start sm:items-center gap-3 sm:gap-5 w-full">
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
            <AvatarImage src={avatarUrl} alt={`${title} avatar`} />
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
                  fontSize: "clamp(20px, 5vw, 32px)",
                  lineHeight: "clamp(28px, 5.5vw, 45px)",
                }}
              >
                <TextType
                  text={[title]}
                  as="h1"
                  className="text-[#E0E0E0] font-semibold font-bdo-grotesk text-left break-words"
                  style={{
                    fontSize: "clamp(20px, 5vw, 32px)",
                    lineHeight: "clamp(28px, 5.5vw, 45px)",
                  }}
                  typingSpeed={30}
                  pauseDuration={100}
                  showCursor={true}
                  cursorCharacter=""
                  loop={false}
                  startOnVisible={true}
                  initialDelay={100}
                  textColors={["rgba(224, 224, 224, 1)"]}
                  cursorClassName="font-bdo-grotesk text-[#E0E0E0]"
                />
              </div>
              {tokenSymbol && (
                <span
                  className="font-bdo-grotesk"
                  style={{
                    fontSize: "18px",
                    color: "#8F9393",
                    lineHeight: "clamp(28px, 5.5vw, 45px)",
                  }}
                >
                  #{tokenSymbol}
                </span>
              )}
            </motion.div>
            <div className="flex flex-wrap items-center gap-2 w-full">
              {/* Address Badge */}
              <motion.div
                className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.6,
                  ease: [0.75, 0, 0.25, 1.0], // fast to slow
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
              {/* On-Chain Badge */}
              {/* <motion.div
                className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.8,
                  ease: [0.75, 0, 0.25, 1.0], // fast to slow
                }}
              >
                <div className="flex items-center px-2 sm:px-3 py-1.5 rounded-lg bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px]">
                  <span
                    className="text-[#8F9393] text-xs sm:text-sm leading-[18px]"
                    style={{ fontFamily: "DM Mono", fontWeight: 400 }}
                  >
                    On-Chain
                  </span>
                </div>
              </motion.div> */}
              {/* Social Links */}
              {socialLinks.map((link, index) => {
                const isReactComponent = typeof link.url !== "string";
                const IconComponent = isReactComponent
                  ? (link.url as React.ComponentType<{ className?: string }>)
                  : null;
                const safeUrl = !isReactComponent
                  ? ensureHttps(link.url as string)
                  : "";
                return (
                  <motion.div
                    key={index}
                    className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 1.0 + index * 0.1, // staggered delay for each social link
                      ease: [0.75, 0, 0.25, 1.0], // fast to slow
                    }}
                  >
                    {isReactComponent && IconComponent ? (
                      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] hover:bg-[rgba(81,81,81,0.3)] hover:scale-110 hover:rotate-3 transition-all duration-200">
                        <IconComponent className={iconClassName} />
                      </div>
                    ) : (
                      <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] hover:bg-[rgba(81,81,81,0.3)] hover:scale-110 hover:rotate-3 transition-all duration-200"
                        aria-label={link.type}
                        title={link.type}
                      >
                        {getSocialIcon(link.type) ?? link.type}
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
          className="flex-shrink-0 w-full sm:w-auto"
        >
          <StatusBadge status={status} completedInfo={completedInfo} />
        </motion.div>
      </div>
    </div>
  );
};
export default ProjectHeader;
