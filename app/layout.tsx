import type { Metadata } from "next";
import "./globals.css";

import { Header, MobileLayout, Sidebar } from "@/components/layout";
import { ToastProvider, ChainSwitchProvider } from "@/components/providers";
import { ClientProvider } from "@/libs/providers";
import NavigationLoadingOverlay from "@/components/common/navigation-loading-overlay";
import { cn } from "@/libs/utils";
import { headers } from "next/headers";

export const metadata: Metadata = {
  metadataBase: new URL("https://alpha.world.fun"), // TODO: Update with actual domain
  title: "World.fun Alpha ",
  description:
    "Explore and create new worlds with blockchain-powered experiences",
  keywords: [
    "AWE",
    "World.fun Alpha ",
    "blockchain",
    "web3",
    "worlds",
    "NFT",
    "cryptocurrency",
    "decentralized",
    "virtual worlds",
    "token creation",
  ],
  authors: [{ name: "World.fun Alpha Team" }],
  creator: "World.fun Alpha",
  publisher: "World.fun Alpha",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    title: "World.fun Alpha",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://alpha.world.fun", // TODO: Update with actual domain
    siteName: "World.fun Alpha",
    title: "World.fun Alpha",
    description:
      "Discover, create, and explore blockchain-powered virtual worlds. Launch tokens, build communities, and shape the future of decentralized experiences.",
    images: [
      {
        url: "https://alpha.world.fun/images/social-thumbnail.png", // TODO: Add social thumbnail image
        width: 1200,
        height: 630,
        alt: "World.fun Alpha - Blockchain Virtual Worlds Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "World.fun Alpha",
    description:
      "Discover, create, and explore blockchain-powered virtual worlds. Launch tokens, build communities, and shape the future of decentralized experiences.",
    creator: "@alpha.world.fun", // TODO: Update with actual Twitter handle
    site: "@alpha world.fun",
    images: [
      {
        url: "https://alpha.world.fun/images/social-thumbnail.png", // TODO: Add social thumbnail image
        alt: "World.fun Alpha - Blockchain Virtual Worlds Platform",
      },
    ],
  },
  alternates: {
    canonical: "https://alpha.world.fun", // TODO: Update with actual domain
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");

  return (
    <html lang="en">
      <body className={cn("antialiased !font-dm-mono")}>
        <style>
          @import
          url(&apos;https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Manrope:wght@200;300;400;500;600;700;800&display=swap&apos;);
        </style>
        <ClientProvider cookies={cookies}>
          <ChainSwitchProvider>
            <ToastProvider>
              <NavigationLoadingOverlay />
              <div
                className={cn(
                  "flex justify-between min-h-full",
                  "bg-linear-to-b from-[#0a0a0a] to-[#111112]",
                  "max-xl:hidden"
                )}
              >
                <Sidebar />
                <div className="flex flex-col flex-1 min-w-0 ml-[73px]">
                  <Header />
                  <div className="flex-1">{children}</div>
                </div>
              </div>
              <div className="xl:hidden bg-linear-to-b from-[#0a0a0a] to-[#111112] min-h-full">
                <MobileLayout>{children}</MobileLayout>
              </div>
            </ToastProvider>
          </ChainSwitchProvider>
        </ClientProvider>
      </body>
    </html>
  );
}