"use client";

import { Button, Text } from "../ui";
import Image from "next/image";
import { useMemo, useCallback, useEffect, useRef } from "react";
import {
  useDaoPoolRefund,
  useDaoPoolClaim,
  useDaoPoolContributions,
  type UseDaoPoolDataReturn,
} from "@/libs/hooks/contracts";
import { useAccount } from "wagmi";
import { useWalletConnectButton } from "@/libs/hooks/wallet/use-wallet-connect-button";
import aweTokenIcon from "@/public/icons/awe-token.png";
import { EnterWorldSection } from "./right-sidebar";

interface RightSidebarRefundClaimProps {
  poolAddress?: string;
  daoPoolData?: UseDaoPoolDataReturn;
  tokenImage?: string;
  tokenSymbol?: string;
  onRefundComplete?: () => void;
  onClaimComplete?: () => void;
  bannerUrl?: string;
}

const formatTokenAmount = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "0";
  }

  try {
    return value.toLocaleString();
  } catch {
    return "0";
  }
};

export default function RightSidebarRefundClaim({
  poolAddress,
  daoPoolData,
  tokenImage,
  tokenSymbol,
  onRefundComplete,
  onClaimComplete,
  bannerUrl,
}: RightSidebarRefundClaimProps) {
  const { address, isConnected } = useAccount();
  const { handleConnectWallet } = useWalletConnectButton();

  // Get user's contribution data
  const {
    aweAmountFormatted: userContribution,
    refunded: userRefunded,
    claimedTokenAmount,
    isLoading: isLoadingContributions,
  } = useDaoPoolContributions({
    poolAddress: poolAddress,
    userAddress: address,
    enabled: !!poolAddress && !!address,
  });

  // Check if user has claimed (claimedTokenAmount > 0)
  const userClaimed = claimedTokenAmount && claimedTokenAmount > 0;

  // Get refund hook
  const {
    refund,
    status: refundStatus,
    reset: resetRefund,
    isGraduated: refundIsGraduated,
  } = useDaoPoolRefund(poolAddress);

  // Get claim hook
  const {
    claim,
    status: claimStatus,
    reset: resetClaim,
    isGraduated: claimIsGraduated,
  } = useDaoPoolClaim(poolAddress);

  // Use isGraduated from either hook (they should be the same)
  const isGraduated = daoPoolData?.isGraduated || claimIsGraduated;

  const userContributionAmount = useMemo(() => {
    if (!userContribution) return 0;
    return Number(userContribution) || 0;
  }, [userContribution]);

  // Track if we've already called the completion callbacks to avoid duplicates
  const claimCompletedRef = useRef(false);
  const refundCompletedRef = useRef(false);
  useEffect(() => {
    if (claimStatus === "success" && !claimCompletedRef.current) {
      claimCompletedRef.current = true;
      onClaimComplete?.();
    }
  }, [claimStatus, onClaimComplete]);

  useEffect(() => {
    if (refundStatus === "success" && !refundCompletedRef.current) {
      refundCompletedRef.current = true;
      onRefundComplete?.();
    }
  }, [refundStatus, onRefundComplete]);

  // Determine operation mode based on graduation status
  const operationMode = isGraduated ? "claim" : "refund";

  // State flags for refund mode
  const isRefunding =
    refundStatus === "pending" || refundStatus === "preparing";
  const hasRefunded = userRefunded || refundStatus === "success";
  const canRefund =
    isConnected && userContributionAmount > 0 && !hasRefunded && !isRefunding;

  // State flags for claim mode
  const isClaiming = claimStatus === "pending" || claimStatus === "preparing";
  const hasClaimed = userClaimed || claimStatus === "success";
  const canClaim =
    isConnected && userContributionAmount > 0 && !hasClaimed && !isClaiming;

  // Combined state flags
  const hasNoContribution =
    userContributionAmount === 0 && !hasRefunded && !hasClaimed;
  const isProcessing = isRefunding || isClaiming;
  const hasCompleted = operationMode === "refund" ? hasRefunded : hasClaimed;
  const canProcess = operationMode === "refund" ? canRefund : canClaim;

  const displayAmount = useMemo(() => {
    if (hasCompleted) {
      return 0;
    }
    if (operationMode === "claim") {
      const conversionRate = 793100;
      return userContributionAmount * conversionRate;
    }
    return userContributionAmount;
  }, [hasCompleted, operationMode, userContributionAmount]);

  // Button click handling - either connect wallet, refund, or claim
  const handleButtonClick = useCallback(async () => {
    if (!isConnected) {
      await handleConnectWallet();
      return;
    }

    if (!poolAddress) {
      console.error("Pool address is not available");
      return;
    }

    if (!canProcess) {
      return;
    }

    try {
      if (operationMode === "refund") {
        await refund();
      } else {
        await claim();
      }
    } catch (error) {
      console.error(`${operationMode} failed:`, error);
    }
  }, [
    isConnected,
    handleConnectWallet,
    poolAddress,
    canProcess,
    operationMode,
    refund,
    claim,
    onRefundComplete,
    onClaimComplete,
  ]);

  // Determine button state and styling
  const getButtonState = () => {
    if (!isConnected) {
      return {
        text: "Connect Wallet",
        disabled: false,
        bgColor: "bg-[rgba(55,60,62,0.4)]",
        hoverBgColor: "hover:bg-[rgba(83,87,87,0.4)]",
      };
    }

    if (hasNoContribution) {
      return {
        text: isGraduated ? "No Tokens to Claim" : "ENDED",
        disabled: true,
        bgColor: "bg-[rgba(55,60,62,0.4)]",
        hoverBgColor: "",
      };
    }

    if (hasCompleted) {
      return {
        text:
          operationMode === "refund" ? "Refund Completed!" : "Claim Completed!",
        disabled: true,
        bgColor: "bg-[rgba(55,60,62,0.4)]",
        hoverBgColor: "",
      };
    }

    if (isProcessing) {
      return {
        text: operationMode === "refund" ? "Refunding..." : "Claiming...",
        disabled: true,
        bgColor: "bg-[rgba(55,60,62,0.4)]",
        hoverBgColor: "",
      };
    }

    return {
      text: operationMode === "refund" ? "Refund" : "Claim Tokens",
      disabled: false,
      bgColor: "bg-[rgba(55,60,62,0.4)]",
      hoverBgColor: "hover:bg-[rgba(83,87,87,0.4)]",
    };
  };

  const buttonState = getButtonState();

  // Determine display title and description
  const displayTitle = isGraduated ? "Claim Your Tokens" : "Refund Commitment";
  const displayDescription = isGraduated
    ? "Token has graduated! Claim your tokens now."
    : "Refund All Amount";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Enter World Section */}
      <EnterWorldSection bannerUrl={bannerUrl} className="hidden xl:block" />

      {/* Refund/Claim Section */}
      <div
        className="flex flex-col items-center gap-[18px] self-stretch
        rounded-2xl border border-[#1F1F22] bg-[#0C0C0C]
        p-[18px]"
      >
        {/* Title */}
        <div className="flex flex-col justify-center gap-[76px]">
          <p className="font-dm-mono text-lg font-medium leading-[1.222] text-[#E0E0E0]">
            {displayTitle}
          </p>
        </div>

        {/* Your Total Committed - only show in claim mode */}
        {operationMode === "claim" && (
          <div className="flex items-center justify-between gap-1.5 self-stretch">
            <Text
              variant="reg13"
              weight="regular"
              className="text-[#828B8D] text-[15px] md:text-base"
            >
              Your Total Committed
            </Text>
            <Text
              variant="reg13"
              weight="medium"
              className="text-[#E0E0E0] text-[15px] md:text-base"
            >
              {isLoadingContributions
                ? "--"
                : formatTokenAmount(userContributionAmount)}{" "}
              AWE
            </Text>
          </div>
        )}

        {/* AWE Amount Card */}
        <div className="flex flex-col items-center gap-3.5 self-stretch">
          <div
            className={`flex flex-col gap-4 self-stretch rounded-xl border ${"border-[#1D1D1D] bg-[#151515]"} p-[18px]`}
          >
            {/* Title */}
            <div className="flex gap-4">
              <p className="font-dm-mono text-sm font-normal leading-[1.286] text-[#8F9393]">
                {displayDescription}
              </p>
            </div>

            {/* Value + Symbol */}
            <div className="flex items-center justify-between gap-[39px] self-stretch rounded-lg">
              <p className="font-dm-mono text-2xl font-medium leading-[1.333] text-[#E0E0E0]">
                {hasCompleted ? "0" : formatTokenAmount(displayAmount)}
              </p>

              {/* Symbol with Logo */}
              <div className="flex items-center gap-[7px]">
                {operationMode === "claim" ? (
                  <>
                    {tokenImage && (
                      <Image
                        src={tokenImage}
                        alt={tokenSymbol || "Token"}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <p className="font-dm-mono text-sm font-normal leading-[1.286] text-[#E0E0E0]">
                      {tokenSymbol}
                    </p>
                  </>
                ) : (
                  <>
                    {/* AWE Token Logo */}
                    <Image
                      src={aweTokenIcon}
                      alt="AWE Token"
                      width={40}
                      height={16}
                      className="object-contain"
                    />
                    <p className="font-dm-mono text-sm font-normal leading-[1.286] text-[#E0E0E0]">
                      AWE
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div
          className={`flex flex-row justify-center items-center w-full h-[44px] rounded-[10px] ${
            buttonState.bgColor
          } ${buttonState.hoverBgColor} ${
            buttonState.disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <Button
            onClick={handleButtonClick}
            disabled={buttonState.disabled}
            className="w-full bg-transparent cursor-pointer hover:bg-transparent text-[#FFFFFF] disabled:text-[#8F9393] text-[18px] font-medium leading-[1.333] border-none p-2.5 h-[44px] disabled:cursor-not-allowed disabled:opacity-100"
          >
            {buttonState.text}
          </Button>
        </div>
      </div>
    </div>
  );
}
