"use client";

import { XLogo } from "@/components/icons/x-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useScrollOverflowMask } from "@/libs/hooks/common/use-scroll-overflow-mask";
import { motion, useScroll } from "motion/react";
import React, { useRef } from "react";

interface TeamMember {
  id: string;
  username: string;
  role: string;
  avatar?: string;
  description: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

interface TeamOverviewTabMobileProps {
  teamMembers?: TeamMember[];
  className?: string;
}

export const TeamOverviewTabMobile: React.FC<TeamOverviewTabMobileProps> = ({
  teamMembers,
  className,
}) => {
  const scrollRef = useRef(null);
  const { scrollXProgress } = useScroll({ container: scrollRef });
  const maskImage = useScrollOverflowMask(scrollXProgress);
  // Default team members data
  const defaultTeamMembers: TeamMember[] = [
    {
      id: "1",
      username: "@Sukibestdog",
      role: "Creator",
      avatar: "https://avatar.iran.liara.run/public",
      description: "Mini about the creator...Lorem Ipsum lorem Ipsum",
      socialLinks: {
        twitter: "https://twitter.com/sukibestdog",
      },
    },
    {
      id: "2",
      username: "@Mikabestcat",
      role: "Creator",
      avatar: "https://avatar.iran.liara.run/public",
      description: "Mini about the creator...Lorem Ipsum lorem Ipsum",
      socialLinks: {
        twitter: "https://twitter.com/mikabestcat",
      },
    },
    {
      id: "3",
      username: "@TeamMember",
      role: "Role",
      avatar: "https://avatar.iran.liara.run/public",
      description: "Additional team member slot for future expansion...",
    },
    {
      id: "4",
      username: "@xxx",
      role: "Role",
      avatar: "https://avatar.iran.liara.run/public",
      description: "Additional team member slot for future expansion...",
    },
  ];

  const displayTeamMembers = teamMembers || defaultTeamMembers;

  return (
    <motion.div
      className={`space-y-2 ${className || ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Title Section */}
      <motion.div
        className="flex items-center justify-start px-3 py-2 pb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1, ease: "easeOut" }}
      >
        <h3 className="text-[26px] font-mono text-[#E0E0E0] font-normal leading-[1.23] tracking-[-0.02em]">
          Our Team
        </h3>
      </motion.div>

      {/* Horizontal Scrolling Container */}
      <motion.div
        ref={scrollRef}
        className="overflow-x-auto px-3"
        style={{
          maskImage,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.2 }}
      >
        <div className="flex gap-2 pb-4">
          {displayTeamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              className="flex-shrink-0 w-[249px] border border-[rgba(224,224,224,0.2)] rounded-lg p-3 pb-6 space-y-4 bg-[rgba(16,16,16,0.4)] backdrop-blur-[100px]"
              initial={{
                opacity: 0,
                y: 50,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.4,
                delay: 0.3 + index * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94], // fast -> slow easing
              }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.15 },
              }}
            >
              {/* Member Info Section */}
              <motion.div
                className="w-[134px] space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: 0.4 + index * 0.08,
                  ease: "easeOut",
                }}
              >
                {/* Avatar */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.2,
                    delay: 0.45 + index * 0.08,
                    ease: "easeOut",
                  }}
                >
                  <Avatar className="w-[68px] h-[68px] rounded-full">
                    <AvatarImage src={member.avatar} alt={member.username} />
                    <AvatarFallback className="bg-gray-600 text-white">
                      {member.username.charAt(1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                {/* Username and Role */}
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: 0.5 + index * 0.08,
                    ease: "easeOut",
                  }}
                >
                  <div className="text-[18px] font-mono font-medium text-white leading-[1.22] text-center">
                    {member.username}
                  </div>
                  <div className="text-[14px] font-mono text-white leading-[1.57]">
                    {member.role}
                  </div>
                </motion.div>

                {/* Twitter Link */}
                {member.socialLinks?.twitter && (
                  <motion.div
                    className="inline-flex items-center gap-2 border-[0.5px] border-[rgba(224,224,224,0.2)] rounded-lg px-2 py-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.15,
                      delay: 0.55 + index * 0.08,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.15 },
                    }}
                  >
                    <XLogo className="w-4 h-4 text-[rgba(255,255,255,0.4)]" />
                    <span className="text-[14px] font-mono text-[rgba(255,255,255,0.4)] leading-[1.57]">
                      Twitter
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* Description */}
              <motion.div
                className="text-[14px] font-mono text-[rgba(255,255,255,0.2)] leading-[1.14]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: 0.6 + index * 0.08,
                  ease: "easeOut",
                }}
              >
                {member.description}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TeamOverviewTabMobile;
