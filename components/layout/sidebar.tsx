"use client";

import { cn } from "@/libs/utils";
import { LINKS } from "@/libs/constants/links";
import { BookIcon, SwitchToLightMode, TosIcon, XLogo } from "../icons";

// TODO: add active state and replace by common button component

const SidebarItem = ({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      className={cn(
        "w-8 h-8",
        "flex items-center justify-center",
        "cursor-pointer",
        "transition-all duration-200 ease-in-out",
        "hover:text-white hover:scale-110",
        "group"
      )}
      onClick={onClick}
    >
      <div className="transition-all duration-200 ease-in-out group-hover:brightness-125 group-hover:drop-shadow-sm">
        {icon}
      </div>
    </button>
  );
};

export const Sidebar = () => {
  const handleBookClick = () => {
    window.open(LINKS.AI_SHARK_TANK_PRIMER, "_blank", "noopener,noreferrer");
  };

  const handleXClick = () => {
    window.open(LINKS.X_TWITTER, "_blank", "noopener,noreferrer");
  };

  const handleTosClick = () => {
    window.open(LINKS.TERMS_OF_SERVICE, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 bottom-0",
        "h-[100dvh]",
        "flex flex-col items-center justify-between",
        "p-5",
        "border-r border-[#43424A]",
        "min-h-[100dvh]"
      )}
    >
      {/* TODO: add switch to light mode */}
      {/* <SidebarItem icon={<SwitchToLightMode />} onClick={() => {}} /> */}
      <div
        className={cn(
          "max-xl:hidden",
          "flex-1",
          "flex flex-col items-center justify-center gap-6"
        )}
      >
        <SidebarItem icon={<BookIcon />} onClick={handleBookClick} />
        <SidebarItem icon={<XLogo />} onClick={handleXClick} />
        <SidebarItem icon={<TosIcon />} onClick={handleTosClick} />
      </div>
    </div>
  );
};
