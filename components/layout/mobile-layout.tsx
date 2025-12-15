"use client";

import { ROUTES } from "@/libs/constants/routes";
import { LINKS } from "@/libs/constants/links";
import { cn } from "@/libs/utils";
import { useNavigationLoadingStore } from "@/libs/stores";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookIcon,
  SwitchToLightMode,
  ToggleSideBarIcon,
  TosIcon,
  XLogo,
} from "../icons";
import { Text } from "@/components/ui";
import { WalletConnectHeader } from "../wallet-connect-button/wallet-connect-header";

const SidebarButton = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) => {
  return (
    <button
      type="button"
      className={cn(
        "bg-[#292929] hover:opacity-60 hover:scale-105 active:scale-95",
        "rounded-full",
        "w-9 h-9",
        "flex items-center justify-center",
        "transition-all duration-200 ease-out"
      )}
      onClick={onClick}
    >
      <ToggleSideBarIcon className={className} />
    </button>
  );
};

const RouteItem = ({
  text,
  onClick,
  isActive,
  index,
}: {
  text: string;
  onClick: () => void;
  isActive: boolean;
  index: number;
}) => {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-start",
        "hover:bg-dark-700 hover:scale-[1.02]",
        "p-2",
        "w-full",
        "transition-all duration-200 ease-out",
        "animate-in slide-in-from-left fade-in",
        "rounded-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      )}
      style={{
        animationDelay: `${150 + index * 100}ms`,
        animationDuration: "400ms",
        animationFillMode: "both",
      }}
      onClick={onClick}
      role="link"
      aria-current={isActive ? "page" : undefined}
      data-active={isActive ? "true" : undefined}
    >
      <Text
        variant="reg13"
        weight="light"
        className={cn(
          "text-light uppercase transition-colors duration-200",
          isActive
            ? "text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.45)] font-semibold"
            : "opacity-70"
        )}
      >
        {text}
      </Text>
    </button>
  );
};

const SidebarMobile = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return <SidebarButton onClick={toggleSidebar} className="rotate-45" />;
};

interface SidebarMobileSheetProps {
  requestClose: () => void;
  open: boolean;
}

const SidebarMobileSheet = ({
  requestClose,
  open,
}: SidebarMobileSheetProps) => {
  const rawPathname = usePathname();
  const activePathname = rawPathname ?? ROUTES.home;
  const isHome = activePathname === ROUTES.home;
  const isHowItWorks = activePathname === ROUTES.howItWorks;
  const isLaunchToken = activePathname === ROUTES.launchToken;
  const router = useRouter();
  const startNavigation = useNavigationLoadingStore(
    (state) => state.startNavigation
  );
  const firstFocusableRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        requestClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose]);
  const handleRouteClick = (route: string) => {
    startNavigation(route);
    router.push(route);
    requestClose();
  };

  return (
    <>
      {/* Backdrop overlay with fade transition */}
      <div
        className={cn(
          "fixed inset-0 z-80 bg-black/60 backdrop-blur-sm",
          "transition-opacity duration-500 ease-out",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={requestClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 z-90 w-[240px] flex flex-col shadow-2xl",
          "bg-dark-900",
          "transition-transform duration-500 ease-out will-change-transform",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div
          className={cn(
            "flex items-center gap-4 m-3",
            open
              ? "opacity-100 translate-y-0 transition-all duration-500 delay-150"
              : "opacity-0 -translate-y-2"
          )}
        >
          <SidebarButton onClick={requestClose} />
          <Image
            src="/assets/images/world-fun-logo.png"
            alt="Logo"
            width={120}
            height={18}
            className="w-[120px] h-[18px]"
          />
        </div>
        <div
          className={cn(
            "flex flex-col gap-4",
            "bg-[#373C3E]/40",
            "px-6 py-4",
            "mt-10 mb-[100px]",
            "rounded-lg",
            "mx-3",
            open
              ? "opacity-100 translate-y-0 transition-all duration-500 delay-200"
              : "opacity-0 translate-y-4"
          )}
        >
          {/* <RouteItem
            text="Discover worlds"
            onClick={() => handleRouteClick(ROUTES.home)}
            isActive={isHome}
            index={0}
            // @ts-expect-error - Legacy component prop type mismatch - pass ref to first item for initial focus
            ref={firstFocusableRef}
          /> */}
          <RouteItem
            text="How It works"
            onClick={() => handleRouteClick(ROUTES.howItWorks)}
            isActive={isHowItWorks}
            index={1}
          />
          <RouteItem
            text="Launch World/Agent"
            onClick={() => handleRouteClick(ROUTES.launchToken)}
            isActive={isLaunchToken}
            index={2}
          />
        </div>
        <div
          className={cn(
            "flex items-center justify-center gap-12",
            "px-3 py-4",
            "border-t border-[#43424A]",
            "mx-3",
            open
              ? "opacity-100 translate-y-0 transition-all duration-500 delay-300"
              : "opacity-0 translate-y-4"
          )}
        >
          {/* TODO: add switch to light mode */}
          {/* <button
            className={cn(
              "w-10 h-10",
              "hover:bg-dark-800",
              "flex items-center justify-center",
              "pointer-cusor"
            )}
          >
            <SwitchToLightMode />
          </button> */}
          <Link
            href={LINKS.AI_SHARK_TANK_PRIMER}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "w-10 h-10",
              "hover:bg-dark-800 hover:scale-110 active:scale-95",
              "flex items-center justify-center",
              "transition-all duration-200 ease-out",
              "rounded-lg"
            )}
          >
            <BookIcon width={24} height={24} />
          </Link>
          <Link
            href={LINKS.X_TWITTER}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "w-10 h-10",
              "hover:bg-dark-800 hover:scale-110 active:scale-95",
              "flex items-center justify-center",
              "transition-all duration-200 ease-out",
              "rounded-lg"
            )}
          >
            <XLogo width={24} height={24} />
          </Link>
          <Link
            href={LINKS.TERMS_OF_SERVICE}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "w-10 h-10",
              "hover:bg-dark-800 hover:scale-110 active:scale-95",
              "flex items-center justify-center",
              "transition-all duration-200 ease-out",
              "rounded-lg"
            )}
          >
            <TosIcon width={24} height={24} />
          </Link>
        </div>
      </div>
    </>
  );
};

export const MobileLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarMounted, setIsSidebarMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => {
    if (!isSidebarMounted) setIsSidebarMounted(true);
    requestAnimationFrame(() => setIsSidebarOpen(true));
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setIsSidebarMounted(false);
  };

  const toggleSidebar = () => {
    if (isSidebarOpen) closeSidebar();
    else openSidebar();
  };

  // Scroll lock when sidebar mounted
  useEffect(() => {
    if (isSidebarMounted) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isSidebarMounted]);

  // Cleanup no longer needed (removed timeout logic)

  return (
    <div className="relative">
      {isSidebarMounted && (
        <SidebarMobileSheet open={isSidebarOpen} requestClose={closeSidebar} />
      )}
      <div
        className={cn(
          "flex flex-col",
          "transition-all duration-500 ease-out",
          isSidebarOpen && "blur-sm scale-[0.98] opacity-90"
        )}
        onClick={() => isSidebarOpen && closeSidebar()}
      >
        <div className="flex justify-between p-3 sticky top-0 z-50 bg-[#0D0D0E]">
          <div className="flex items-center gap-4">
            <SidebarMobile toggleSidebar={toggleSidebar} />
            <Link href={ROUTES.home}>
              <Image
                src="/assets/images/world-fun-logo.png"
                alt="Logo"
                width={120}
                height={18}
              />
            </Link>
          </div>
          <WalletConnectHeader />
        </div>
        <div className={cn("flex flex-col justify-center")}>{children}</div>
      </div>
    </div>
  );
};
