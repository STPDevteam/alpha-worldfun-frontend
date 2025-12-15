"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import BreadcrumbSection from "@/components/world-detail/breadcrumb-section";
import ProjectHeader from "@/components/admin/project-header";
import FundraisingProgress from "@/components/admin/fundraising-progress";
import WorldOverview from "@/components/admin/world-overview";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { ROUTES } from "@/libs/constants/routes";
import { TokenStatus, FundraisingType } from "@/libs/types/world-card";
import {
  useWorldById,
  worldDetailQueryKeys,
} from "@/hooks/api/use-world-by-id";
import { useAuth } from "@/libs/hooks/auth";
import { useBondingCurveAweReserve } from "@/libs/hooks/contracts/use-bonding-curve-awe-reserve";
import { useDaoPoolData } from "@/libs/hooks/contracts/use-dao-pool-data";
import { useQueryClient } from "@tanstack/react-query";

interface AdminPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminPage({ params }: AdminPageProps) {
  const [id, setId] = useState<string>("");
  const queryClient = useQueryClient();

  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
    });
  }, [params]);

  // Get current user from React Query auth hook
  const {
    user: currentUser,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  // Use React Query hook to fetch world data
  const { data: worldData, error, isPending: worldLoading } = useWorldById(id);

  // Contract-based data hooks for different fundraising types
  const {
    aweReserveFormatted: contractAweReserve,
    isLoading: isAweReserveLoading,
  } = useBondingCurveAweReserve({
    poolAddress: worldData?.poolAddress || undefined,
    enabled:
      !!worldData?.poolAddress &&
      worldData?.fundraisingType === FundraisingType.BONDING_CURVE,
  });

  const {
    totalAweRaisedFormatted: contractAweRaised,
    //totalAweRefundedFormatted: contractAweRefunded,
    isLoading: isDaoPoolLoading,
  } = useDaoPoolData({
    poolAddress: worldData?.poolAddress || undefined,
    enabled:
      !!worldData?.poolAddress &&
      worldData?.fundraisingType === FundraisingType.FIXED_PRICE,
  });

  const effectiveCurrentValue = useMemo(() => {
    if (!worldData) return 0;
    if (worldData.fundraisingType === FundraisingType.BONDING_CURVE) {
      if (contractAweReserve && !isAweReserveLoading) {
        return typeof contractAweReserve === "string"
          ? parseFloat(contractAweReserve)
          : Number(contractAweReserve);
      }
    }

    if (worldData.fundraisingType === FundraisingType.FIXED_PRICE) {
      if (contractAweRaised && !isDaoPoolLoading) {
        return typeof contractAweRaised === "string"
          ? parseFloat(contractAweRaised)
          : Number(contractAweRaised);
      }
    }

    return 0;
  }, [
    worldData,
    contractAweReserve,
    isAweReserveLoading,
    contractAweRaised,
    isDaoPoolLoading,
  ]);

  const projectData = worldData
    ? {
        ...worldData,
        address: worldData.tokenAddress,
        avatarUrl: worldData.tokenImage,
        socialLinks: [
          // X/Twitter links (xUrl takes priority over worldXHandler)
          ...(worldData.xUrl
            ? [
                {
                  type: "twitter" as const,
                  url: worldData.xUrl,
                },
              ]
            : worldData.worldXHandler
            ? [
                {
                  type: "twitter" as const,
                  url: worldData.worldXHandler.startsWith("http")
                    ? worldData.worldXHandler
                    : `https://x.com/${worldData.worldXHandler.replace(
                        "@",
                        ""
                      )}`,
                },
              ]
            : []),
          // GitHub link
          ...(worldData.githubUrl
            ? [
                {
                  type: "github" as const,
                  url: worldData.githubUrl,
                },
              ]
            : []),
          // Discord link
          ...(worldData.discordUrl
            ? [
                {
                  type: "discord" as const,
                  url: worldData.discordUrl,
                },
              ]
            : []),
          // Telegram link
          ...(worldData.telegramUrl
            ? [
                {
                  type: "telegram" as const,
                  url: worldData.telegramUrl,
                },
              ]
            : []),
          // Onchain profile link (as website)
          ...(worldData.onchainProfileLink
            ? [
                {
                  type: "website" as const,
                  url: worldData.onchainProfileLink,
                },
              ]
            : []),
          // Website link
          ...(worldData.websiteUrl
            ? [
                {
                  type: "website" as const,
                  url: worldData.websiteUrl,
                },
              ]
            : []),
        ],
        currentAmount: effectiveCurrentValue,
        targetAmount: parseInt(worldData.targetFundRaise || "0"),
        currency: worldData.tokenSymbol,
        completedInfo: {
          fdv: worldData.marketCap,
          createdOn: new Date(worldData.createdAt).toLocaleDateString(),
        },
        startDate: worldData.createdAt ? new Date(worldData.createdAt) : null,
        unlockDate: new Date(),
        completedData: {
          marketCap: worldData.marketCap,
          volume24h: "0.00",
          change24h: "0.00",
        },
      }
    : null;

  const breadcrumbItems = [
    { label: "Home", href: ROUTES.home },
    worldData?.id
      ? {
          label: projectData?.title || "Loading...",
          href: `/world/${worldData.id}`,
        }
      : { label: projectData?.title || "Loading..." },
    { label: "Admin" },
  ];

  const shouldShowLoadingState = authLoading || (!worldData && worldLoading);

  if (shouldShowLoadingState) {
    return (
      <div className="min-h-screen bg-[#0D0D0E] flex flex-col items-center justify-start px-4 sm:px-6">
        <div className="w-full max-w-[846px] py-4 sm:py-6 space-y-4 sm:space-y-6">
          <BreadcrumbSection items={breadcrumbItems} />
          <div
            className="bg-[#0D0D0E] border border-[#1F1F22] rounded-2xl p-4 sm:p-6 md:p-8 space-y-5"
            aria-busy="true"
            aria-live="polite"
          >
            <div className="flex flex-col gap-4 animate-pulse">
              <div className="h-6 sm:h-8 bg-[#161618] rounded-lg" />
              <div className="h-24 bg-[#161618] rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-20 bg-[#161618] rounded-xl" />
                <div className="h-20 bg-[#161618] rounded-xl" />
              </div>
            </div>
            <p className="text-sm text-[#8A9499] text-center">
              Verifying your access...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0D0D0E] flex flex-col items-center justify-start">
        <div className="w-full max-w-[846px] py-6 space-y-6">
          <BreadcrumbSection items={breadcrumbItems} />
          <div className="bg-[#0D0D0E] border border-[#1F1F22] rounded-2xl p-4 md:p-6 text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">
              Authentication Required
            </h2>
            <p className="text-[#8A9499]">
              You must be logged in to access the admin panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user owns this world (only after data is loaded)
  if (
    worldData &&
    currentUser &&
    String(worldData.userId) !== String(currentUser.id)
  ) {
    return (
      <div className="min-h-screen bg-[#0D0D0E] flex flex-col items-center justify-start">
        <div className="w-full max-w-[846px] py-6 space-y-6">
          <BreadcrumbSection items={breadcrumbItems} />
          <div className="bg-[#0D0D0E] border border-[#1F1F22] rounded-2xl p-4 md:p-6 text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">
              Access Denied
            </h2>
            <p className="text-[#8A9499] mb-4">
              You don&apos;t have permission to access this world&apos;s admin
              panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0E] flex flex-col items-center justify-start">
        <div className="w-full max-w-[846px] py-6 space-y-6">
          <BreadcrumbSection items={breadcrumbItems} />
          <div className="bg-[#0D0D0E] border border-[#1F1F22] rounded-2xl p-4 md:p-6 text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">
              Failed to load world data
            </h2>
            <p className="text-[#8A9499]">
              {error instanceof Error
                ? error.message
                : "An unknown error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!projectData) {
    return (
      <div className="min-h-screen bg-[#0D0D0E] flex flex-col items-center justify-start">
        <div className="w-full max-w-[846px] py-6 space-y-6">
          <BreadcrumbSection items={breadcrumbItems} />
          <div className="bg-[#0D0D0E] border border-[#1F1F22] rounded-2xl p-4 md:p-6 text-center">
            <h2 className="text-xl font-semibold text-[#8A9499] mb-2">
              World not found
            </h2>
            <p className="text-[#8A9499]">
              The requested world could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0E] flex flex-col items-center justify-start px-4 sm:px-6">
      <div className="w-full max-w-[846px] py-4 sm:py-6 space-y-4 sm:space-y-6">
        <BreadcrumbSection items={breadcrumbItems} />

        <div className="bg-[#0D0D0E] border border-[#1F1F22] rounded-2xl p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5">
          <ProjectHeader
            title={projectData.title}
            address={projectData.address || ""}
            avatarUrl={projectData.avatarUrl || ""}
            status={projectData.status}
            tokenSymbol={worldData?.tokenSymbol}
            socialLinks={projectData.socialLinks}
            completedInfo={projectData.completedInfo}
          />

          <motion.div
            className="w-full h-px text-[#212121] border-dashed border-t-2 overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.8,
              delay: 1.5,
              ease: [0.25, 0.1, 0.25, 1.0],
            }}
            style={{
              transformOrigin: "left center",
              borderColor: "#212121",
            }}
          />

          <WorldOverview
            title={projectData.title}
            description={projectData.description || ""}
            tokenSymbol={worldData?.tokenSymbol}
          />

          {projectData.status !== TokenStatus.CANCELLED && (
            <FundraisingProgress
              currentAmount={projectData.currentAmount}
              targetAmount={projectData.targetAmount}
              status={projectData.status}
              startDate={projectData.startDate || new Date()}
              endDate={worldData?.endDate}
              fundraisingType={worldData?.fundraisingType}
              completedData={projectData.completedData}
            />
          )}
        </div>

        <div className="bg-[#0D0D0E] border border-[#1F1F22] rounded-2xl p-3 sm:p-4 md:p-6">
          <AdminTabs
            fundraisingStatus={projectData.status}
            fundraisedAmount={projectData.currentAmount}
            unlockDate={projectData.unlockDate}
            poolAddress={worldData?.poolAddress || undefined}
            fundraisingType={worldData?.fundraisingType}
            tokenData={worldData}
            onTokenUpdate={(updatedToken) => {
              // Invalidate the world detail query to refetch updated data
              queryClient.invalidateQueries({
                queryKey: worldDetailQueryKeys.byId(id),
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
