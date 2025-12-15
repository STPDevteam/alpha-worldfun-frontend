"use client";

import { XLogo } from "@/components/icons";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { motion } from "motion/react";
import React from "react";

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

interface TeamOverviewTabProps {
  teamMembers?: TeamMember[];
  className?: string;
}

export const TeamOverviewTab: React.FC<TeamOverviewTabProps> = ({
  teamMembers,
  className,
}) => {
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
      className={`space-y-6 ${className || ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div
        className="flex items-center justify-start p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1, ease: "easeOut" }}
      >
        <h3 className="text-2xl font-mono text-white font-normal">Our Team</h3>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.2 }}
      >
        {displayTeamMembers.map((member, index) => {
          return (
            <motion.div
              key={member.id}
              className="border border-gray-200/20 rounded-lg p-3 space-y-4 lg:min-h-[270px]"
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
              <motion.div
                className="gap-2 flex flex-col items-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: 0.4 + index * 0.08,
                  ease: "easeOut",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.2,
                    delay: 0.45 + index * 0.08,
                    ease: "easeOut",
                  }}
                >
                  <Avatar className="w-17 h-17 items-start">
                    <AvatarImage
                      src={member.avatar}
                      alt={member.username}
                      className="w-17 h-17"
                    />
                  </Avatar>
                </motion.div>
                <motion.div
                  className="text-start justify-start"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: 0.5 + index * 0.08,
                    ease: "easeOut",
                  }}
                >
                  <div className="text-lg font-mono font-medium text-white">
                    {member.username}
                  </div>
                  <div className="text-sm font-mono text-white">
                    {member.role}
                  </div>
                </motion.div>

                {member.socialLinks?.twitter && (
                  <motion.div
                    className="h-10 w-fit flex items-center gap-2 border-[0.5px] border-gray-200/20 rounded-lg px-2"
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
                    <XLogo className="w-4 h-4 text-white/40" />
                    <span className="text-sm font-mono text-white/40">
                      Twitter
                    </span>
                  </motion.div>
                )}
              </motion.div>
              <motion.div
                className="text-sm font-mono text-white/20 text-left"
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
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default TeamOverviewTab;
