"use client";

import React, { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/libs/utils/cn";
import { UpdateTokenInfoForm } from "./forms/update-token-info-form";
import { FeeClaimAreaForm } from "./forms/fee-claim-area-form";
import { CreatorReward } from "./creator-reward";
import {
  TokenStatus,
  WorldCard,
  FundraisingType,
} from "@/libs/types/world-card";
import { TokenEntity } from "@/libs/schemas/world-card.schema";
import {
  useAdminClaims,
  type PoolType,
} from "@/libs/hooks/contracts/use-admin-claims";

interface AdminTabsProps {
  className?: string;
  fundraisingStatus?: TokenStatus;
  fundraisedAmount?: number;
  unlockDate?: Date;
  poolAddress?: string;
  fundraisingType?: FundraisingType;
  tokenData?: WorldCard;
  onTokenUpdate?: (updatedToken: TokenEntity) => void;
}

// Claim Button Component
const ClaimButton: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}> = ({ onClick, disabled, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "px-3 sm:px-5 py-2 rounded-[10px]",
        "bg-[#E0E0E0] text-[#010101]",
        "text-sm sm:text-base font-light",
        "hover:bg-[#E0E0E0]/90 transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "h-8 sm:h-10 min-w-[100px] sm:min-w-[120px] flex items-center justify-center gap-2 cursor-pointer"
      )}
      style={{ fontFamily: "DM Mono" }}
    >
      {loading ? (
        <>
          <div className="w-3 h-3 sm:w-4 sm:h-4 border-1 border-white border-t-transparent rounded-[10px] animate-spin" />
          <span className="hidden sm:inline">Claiming...</span>
          <span className="sm:hidden">...</span>
        </>
      ) : (
        <>
          <span className="sm:inline">CLAIM FEE</span>
        </>
      )}
    </button>
  );
};

export const AdminTabs = ({
  className,
  fundraisingStatus = TokenStatus.LIVE,
  fundraisedAmount = 400000,
  unlockDate,
  poolAddress,
  fundraisingType,
  tokenData,
  onTokenUpdate,
}: AdminTabsProps) => {
  // Determine pool type for claim hook
  const poolType: PoolType =
    fundraisingType === FundraisingType.FIXED_PRICE
      ? "DAO_POOL"
      : "BONDING_CURVE";

  // Use the admin claims hook
  const { claimDexFees, isClaimingFees, isConfirming } = useAdminClaims({
    poolAddress,
    poolType,
    enabled: !!poolAddress,
  });

  // Determine if we should show data based on token status
  const hasData = useMemo(() => {
    return fundraisingStatus === TokenStatus.LIVE;
  }, [fundraisingStatus]);

  // Mock statistics - replace with real data
  const unclaimedAmount = hasData ? 56.27 : 0;

  // Handle claim fees
  const handleClaimFees = async () => {
    try {
      await claimDexFees();
    } catch (error) {
      console.error("Failed to claim DEX fees:", error);
    }
  };

  // Determine loading state
  const isLoading = isClaimingFees || isConfirming;

  return (
    <div className={cn("w-full", className)}>
      <Tabs defaultValue="update-token-info" className="w-full">
        {/* Custom Tab List */}
        <TabsList
          className="w-full h-auto flex justify-between items-center overflow-x-auto
          bg-transparent p-0 border-b border-[#212121]
          gap-3 scrollbar-hide"
        >
          <div className="flex gap-4 sm:gap-7 min-w-max">
            <TabsTrigger
              value="update-token-info"
              className={cn(
                "relative h-auto bg-transparent p-0 pb-3 whitespace-nowrap",
                "text-sm sm:text-base font-medium text-[#656565]",
                "data-[state=active]:text-[#E0E0E0]",
                "hover:text-[#E0E0E0] transition-colors",
                "border-none shadow-none",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
                "after:bg-transparent data-[state=active]:after:bg-[#E0E0E0]",
                "focus-visible:outline-none focus-visible:ring-0"
              )}
              style={{ fontFamily: "DM Mono" }}
            >
              Update Token Info
            </TabsTrigger>

            <TabsTrigger
              value="creator-reward"
              className={cn(
                "relative h-auto bg-transparent p-0 pb-3 whitespace-nowrap",
                "text-sm sm:text-base font-medium text-[#656565]",
                "data-[state=active]:text-[#E0E0E0]",
                "hover:text-[#E0E0E0] transition-colors",
                "border-none shadow-none",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
                "after:bg-transparent data-[state=active]:after:bg-[#E0E0E0]",
                "focus-visible:outline-none focus-visible:ring-0"
              )}
              style={{ fontFamily: "DM Mono" }}
            >
              Creator Reward
            </TabsTrigger>
          </div>

          {/* Claim Button on Right Side - Only show when claimable */}
          {unclaimedAmount > 0 && (
            <div className="w-full sm:w-auto flex justify-center items-center sm:justify-end pb-3">
              <ClaimButton
                onClick={handleClaimFees}
                disabled={false}
                loading={isLoading}
              />
            </div>
          )}
        </TabsList>

        {/* Tab Contents */}
        <div className="mt-4 sm:mt-6">
          <TabsContent value="update-token-info" className="mt-0">
            {tokenData ? (
              <UpdateTokenInfoForm
                tokenData={tokenData}
                onSuccess={onTokenUpdate}
                onError={(error) => console.error("Token update error:", error)}
              />
            ) : (
              <div className="text-center text-[#656565] p-8">
                Loading token data...
              </div>
            )}
          </TabsContent>

          <TabsContent value="fee-claim-area" className="mt-0">
            <FeeClaimAreaForm
              tokenStatus={fundraisingStatus}
              poolAddress={poolAddress}
              poolType={
                fundraisingType === FundraisingType.FIXED_PRICE
                  ? "DAO_POOL"
                  : "BONDING_CURVE"
              }
            />
          </TabsContent>

          <TabsContent value="creator-reward" className="mt-0 overflow-x-hidden">
            <CreatorReward
              fundraisingStatus={fundraisingStatus}
              fundraisedAmount={fundraisedAmount}
              unlockDate={unlockDate}
              poolAddress={poolAddress}
              fundraisingType={fundraisingType}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
