"use client";

import React, { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/libs/configs/query-client";
import { WagmiProvider, cookieToInitialState, type Config } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import {
  config,
  networks,
  projectId,
  wagmiAdapter,
  siweConfig,
} from "@/libs/configs";
import { base, baseSepolia } from "@reown/appkit/networks";
import { NETWORK } from "@/libs/constants";
import { IntlProvider } from "react-intl";

const metadata = {
  name: "World.fun Alpha",
  description: "World.fun Alpha - Explore and create new worlds with blockchain-powered experiences",
  url: typeof window !== "undefined" ? window.location.origin : "https://alpha.world.fun/",
  icons: ["/favicon.ico"],
};

if (!projectId) {
  console.error("AppKit Initialization Error: Project ID is missing.");
} else {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId: projectId!,
    networks: networks,
    defaultNetwork:
      process.env.NEXT_PUBLIC_NETWORK === NETWORK.MAINNET ? base : baseSepolia,
    metadata,
    features: { analytics: false, email: false, socials: false },
    siweConfig: siweConfig,
  });
}

export const ClientProvider = ({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) => {
  const initialState = cookieToInitialState(config as Config, cookies);

  return (
    <IntlProvider locale="en">
      <WagmiProvider config={config as Config} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </IntlProvider>
  );
};
