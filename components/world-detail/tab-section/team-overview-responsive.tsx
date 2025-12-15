"use client";

import React, { useState, useEffect } from "react";
import { TeamOverviewTab } from "./team-overview-tab";
import { TeamOverviewTabMobile } from "./team-overview-tab-mobile";

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

interface TeamOverviewResponsiveProps {
  teamMembers?: TeamMember[];
  className?: string;
}

export const TeamOverviewResponsive: React.FC<TeamOverviewResponsiveProps> = ({
  teamMembers,
  className,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint for very small screens
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile ? (
    <TeamOverviewTabMobile teamMembers={teamMembers} className={className} />
  ) : (
    <TeamOverviewTab teamMembers={teamMembers} className={className} />
  );
};

export default TeamOverviewResponsive;