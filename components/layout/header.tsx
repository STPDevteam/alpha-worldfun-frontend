"use client";

import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Text } from "@/components/ui";
import { ROUTES } from "@/libs/constants/routes";
import { useNavigationLoadingStore } from "@/libs/stores";
import { cn } from "@/libs/utils";
import { WalletConnectHeader } from "../wallet-connect-button/wallet-connect-header";
import { LINKS } from "@/libs/constants";
import WorldFunLogo from "@/public/assets/images/world-fun-logo.svg";

export const Header = () => {
  const pathname = usePathname();
  const isHowItWorks = pathname === ROUTES.howItWorks;
  const isLaunchToken = pathname === ROUTES.launchToken;

  const startNavigation = useNavigationLoadingStore(
    (state) => state.startNavigation
  );
  const createNavigateHandler = useCallback(
    (target: string) => () => startNavigation(target),
    [startNavigation]
  );

  return (
    <div
      className={cn(
        "flex justify-between items-center",
        "px-4 md:px-8 lg:px-15 py-4",
        "sticky top-0 z-50 bg-[#080808]",
        "gap-4"
      )}
    >
      <Link href={ROUTES.home} onNavigate={createNavigateHandler(ROUTES.home)}>
        <Image
          src={WorldFunLogo}
          alt="Logo"
          width={180}
          height={27}
          priority
          quality={100}
          className="w-[120px] h-[18px] lg:w-[180px] lg:h-[27px] object-contain"
        />
      </Link>
      <div className="flex items-center gap-4 md:gap-6 lg:gap-12.5 lg:w-min-[666px]">
        {/* <Link href={LINKS.DISCOVER_WORLDS} target="_blank" rel="noopener noreferrer">
          <Text
            variant="reg13"
            className={cn(
              "text-grey-200 hover:text-light font-light uppercase",
            )}
          >
            Discover new worlds
          </Text>
        </Link> */}
        <Link
          href={ROUTES.howItWorks}
          onNavigate={createNavigateHandler(ROUTES.howItWorks)}
        >
          <Text
            variant="reg13"
            className={cn(
              "text-grey-200 hover:text-light font-medium uppercase",
              isHowItWorks && "underline"
            )}
          >
            How It works
          </Text>
        </Link>
        <Link
          href={ROUTES.launchToken}
          onNavigate={createNavigateHandler(ROUTES.launchToken)}
        >
          <Text
            variant="reg13"
            className={cn(
              "text-grey-200 hover:text-light font-medium uppercase",
              isLaunchToken && "underline"
            )}
          >
            Launch world/agent
          </Text>
        </Link>
        <div className="justify-end">
          <WalletConnectHeader />
        </div>
      </div>
    </div>
  );
};
