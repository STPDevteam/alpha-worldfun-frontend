"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TokenStatus, FundraisingType } from "@/libs/types/world-card";
import {
  useAdminClaims,
  useCreatorClaimUnlockTime,
  type PoolType,
} from "@/libs/hooks/contracts";
import { Text } from "@/components/ui/text";

interface CreatorRewardProps {
  fundraisingStatus: TokenStatus;
  fundraisedAmount?: number;
  creatorPercentage?: number;
  unlockDate?: Date;
  poolAddress?: string;
  fundraisingType?: FundraisingType;
  className?: string;
}

export const CreatorReward = ({
  fundraisingStatus,
  fundraisedAmount = 400000,
  creatorPercentage = 2,
  unlockDate,
  poolAddress,
  fundraisingType,
  className = "",
}: CreatorRewardProps) => {
  // Currency is always AWE token for creator rewards
  const currency = "AWE";
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Determine pool type from fundraising type
  const poolType: PoolType =
    fundraisingType === FundraisingType.BONDING_CURVE
      ? "BONDING_CURVE"
      : "DAO_POOL";

  // Use admin claims hook to get creator claimed status and claim function
  const { creatorClaimed, claimCreatorReward, isClaimingReward, isConfirming } =
    useAdminClaims({
      poolAddress,
      poolType,
      enabled: !!poolAddress && fundraisingStatus === TokenStatus.LIVE,
    });

  // Use unlock time hook to get the actual unlock date from contracts
  const {
    unlockDate: contractUnlockDate,
    isUnlocked: contractIsUnlocked,
    isLoading: isLoadingUnlockTime,
  } = useCreatorClaimUnlockTime({
    poolAddress,
    poolType: fundraisingType,
    enabled: !!poolAddress && fundraisingStatus === TokenStatus.LIVE,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 120);

    return () => clearTimeout(timer);
  }, []);

  const creatorAmount = Math.floor(
    fundraisedAmount * (creatorPercentage / 100)
  );

  // Use contract unlock date if available, otherwise fallback to prop
  const displayUnlockDate = contractUnlockDate || unlockDate;
  const isUnlocked = contractIsUnlocked;

  // Handle claim action
  const handleClaim = async () => {
    try {
      await claimCreatorReward();
    } catch (error) {
      console.error("Failed to claim creator reward:", error);
    }
  };

  // Determine button state
  const isClaimButtonDisabled =
    !isUnlocked || isClaimingReward || isConfirming || creatorClaimed === true;
  const claimButtonText =
    isClaimingReward || isConfirming ? "CLAIMING..." : "CLAIM";

  // State 1: Fundraising in progress
  if (fundraisingStatus === TokenStatus.ON_GOING) {
    return (
      <div className={`w-full ${className}`}>
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: shouldAnimate ? 1 : 0,
            y: shouldAnimate ? 0 : 10,
          }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <Text
            variant="base"
            weight="regular"
            className="text-[#828B8D] leading-[18px]"
          >
            Please wait until the funding is successfully completed. Creator
            rewards will be distributed 1 month after the fundraising success
          </Text>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-2 items-stretch">
          {/* Creator Percentage Card */}
          <motion.div
            className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: shouldAnimate ? 1 : 0,
              y: shouldAnimate ? 0 : 10,
            }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <div className="flex flex-col justify-center gap-2 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
              <Text
                variant="base"
                weight="regular"
                className="text-[#828B8D] leading-[18px]"
              >
                Creator Percentage
              </Text>
              <Text
                variant="md"
                weight="medium"
                className="text-[#E0E0E0] leading-[22px]"
              >
                {creatorPercentage}%
              </Text>
            </div>
          </motion.div>

          {/* Creator Amount Card */}
          <motion.div
            className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: shouldAnimate ? 1 : 0,
              y: shouldAnimate ? 0 : 10,
            }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          >
            <div className="flex flex-col justify-center items-start sm:items-center gap-2 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
              <Text
                variant="base"
                weight="regular"
                className="text-[#828B8D] leading-[18px] text-start sm:text-center"
              >
                Creator Amount
              </Text>
              <Text
                variant="md"
                weight="medium"
                className="text-[#E0E0E0] leading-[22px] text-start sm:text-center"
              >
                --
              </Text>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // State 2: Fundraising complete but creator has NOT claimed yet (waiting period or not unlocked)
  if (fundraisingStatus === TokenStatus.LIVE && creatorClaimed === false) {
    // If unlocked, show claim button
    if (isUnlocked) {
      return (
        <div className={`w-full ${className}`}>
          <div className="flex flex-col lg:flex-row gap-2 items-stretch">
            {/* Fundraised Card */}
            <motion.div
              className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1 lg:max-w-[200px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: shouldAnimate ? 1 : 0,
                y: shouldAnimate ? 0 : 10,
              }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              <div className="flex flex-col justify-center gap-2 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
                <Text
                  variant="base"
                  weight="regular"
                  className="text-[#828B8D] leading-[18px]"
                >
                  Fundraised
                </Text>
                <Text
                  variant="md"
                  weight="medium"
                  className="text-[#E0E0E0] leading-[22px] break-words"
                >
                  {fundraisedAmount.toLocaleString()} {currency}
                </Text>
              </div>
            </motion.div>

            {/* Creator Percentage Card */}
            <motion.div
              className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1 lg:max-w-[200px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: shouldAnimate ? 1 : 0,
                y: shouldAnimate ? 0 : 10,
              }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            >
              <div className="flex flex-col justify-center gap-2 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
                <Text
                  variant="base"
                  weight="regular"
                  className="text-[#828B8D] leading-[18px]"
                >
                  Creator Percentage
                </Text>
                <Text
                  variant="md"
                  weight="medium"
                  className="text-[#E0E0E0] leading-[22px]"
                >
                  {creatorPercentage}%
                </Text>
              </div>
            </motion.div>

            {/* Creator Amount + Claim Button Card */}
            <motion.div
              className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-[2]"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: shouldAnimate ? 1 : 0,
                y: shouldAnimate ? 0 : 10,
              }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
                <div className="flex flex-col justify-center gap-2 w-full sm:w-auto">
                  <Text
                    variant="base"
                    weight="regular"
                    className="text-[#828B8D] leading-[18px]"
                  >
                    Creator Amount
                  </Text>
                  <Text
                    variant="md"
                    weight="medium"
                    className="text-[#E0E0E0] leading-[22px] break-words"
                  >
                    {creatorAmount.toLocaleString()} {currency}
                  </Text>
                </div>

                <button
                  onClick={handleClaim}
                  disabled={isClaimButtonDisabled}
                  className={`flex items-center justify-center gap-1.5 px-[18px] py-2 border rounded-[10px] transition-all whitespace-nowrap ${
                    isClaimButtonDisabled
                      ? "bg-[#656565] border-[#828B8D] cursor-not-allowed opacity-60"
                      : "bg-[#E0E0E0] border-[#E0E0E0] cursor-pointer hover:bg-[#FFFFFF] hover:border-[#FFFFFF]"
                  }`}
                >
                  <Text
                    variant="small"
                    weight="light"
                    className={`leading-[20px] uppercase tracking-[0.08em] text-center ${
                      isClaimButtonDisabled
                        ? "text-[#E0E0E0]"
                        : "text-[#000000]"
                    }`}
                    style={{ fontWeight: 300 }}
                  >
                    {claimButtonText}
                  </Text>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      );
    }

    // Not yet unlocked - show unlock date
    return (
      <div className={`w-full ${className}`}>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch">
          {/* Fundraised Card */}
          <motion.div
            className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: shouldAnimate ? 1 : 0,
              y: shouldAnimate ? 0 : 10,
            }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <div className="flex flex-col justify-start gap-2 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
              <Text
                variant="base"
                weight="regular"
                className="text-[#828B8D] leading-[18px] text-start"
              >
                Fundraised
              </Text>
              <Text
                variant="md"
                weight="medium"
                className="text-[#E0E0E0] leading-[22px] text-start"
              >
                {fundraisedAmount.toLocaleString()} {currency}
              </Text>
            </div>
          </motion.div>

          {/* Creator Percentage Card */}
          <motion.div
            className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: shouldAnimate ? 1 : 0,
              y: shouldAnimate ? 0 : 10,
            }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <div className="flex flex-col justify-start gap-2 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
              <Text
                variant="base"
                weight="regular"
                className="text-[#828B8D] leading-[18px] text-start"
              >
                Creator Percentage
              </Text>
              <Text
                variant="md"
                weight="medium"
                className="text-[#E0E0E0] leading-[22px] text-start"
              >
                {creatorPercentage}%
              </Text>
            </div>
          </motion.div>

          {/* Creator Amount Card */}
          <motion.div
            className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: shouldAnimate ? 1 : 0,
              y: shouldAnimate ? 0 : 10,
            }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          >
            <div className="flex flex-col justify-start items-start gap-2 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
              <Text
                variant="base"
                weight="regular"
                className="text-[#828B8D] leading-[18px] text-start"
              >
                Creator Amount
              </Text>
              <Text
                variant="md"
                weight="medium"
                className="text-[#E0E0E0] leading-[22px] text-start"
              >
                {creatorAmount.toLocaleString()} {currency}
              </Text>
            </div>
          </motion.div>

          {/* Unlock Date Card */}
          <motion.div
            className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: shouldAnimate ? 1 : 0,
              y: shouldAnimate ? 0 : 10,
            }}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
          >
            <div className="flex flex-col justify-center items-center gap-2 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
              <Text
                variant="base"
                weight="regular"
                className="text-[#828B8D] leading-[18px] text-center"
              >
                Unlock date
              </Text>
              <Text
                variant="md"
                weight="medium"
                className="text-[#E0E0E0] leading-[22px] text-center"
              >
                {isLoadingUnlockTime
                  ? "Loading..."
                  : displayUnlockDate?.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }) || "--"}
              </Text>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // State 3: Fundraising complete and unlocked - can claim reward (if not already claimed)
  // State 4: Already claimed - show claimed status
  if (fundraisingStatus === TokenStatus.LIVE && creatorClaimed === true) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex flex-col lg:flex-row gap-2 items-stretch">
          {/* Fundraised Card */}
          <motion.div
            className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1 lg:max-w-[200px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: shouldAnimate ? 1 : 0,
              y: shouldAnimate ? 0 : 10,
            }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <div className="flex flex-col justify-center gap-2 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
              <Text
                variant="base"
                weight="regular"
                className="text-[#828B8D] leading-[18px]"
              >
                Fundraised
              </Text>
              <Text
                variant="md"
                weight="medium"
                className="text-[#E0E0E0] leading-[22px] break-words"
              >
                {fundraisedAmount.toLocaleString()} {currency}
              </Text>
            </div>
          </motion.div>

          {/* Creator Percentage Card */}
          <motion.div
            className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1 lg:max-w-[200px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: shouldAnimate ? 1 : 0,
              y: shouldAnimate ? 0 : 10,
            }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <div className="flex flex-col justify-center gap-2 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
              <Text
                variant="base"
                weight="regular"
                className="text-[#828B8D] leading-[18px]"
              >
                Creator Percentage
              </Text>
              <Text
                variant="md"
                weight="medium"
                className="text-[#E0E0E0] leading-[22px]"
              >
                {creatorPercentage}%
              </Text>
            </div>
          </motion.div>

          {/* Creator Amount + Claim Button Card */}
          <motion.div
            className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-[2]"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: shouldAnimate ? 1 : 0,
              y: shouldAnimate ? 0 : 10,
            }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
              <div className="flex flex-col justify-center gap-2 w-full sm:w-auto">
                <Text
                  variant="base"
                  weight="regular"
                  className="text-[#828B8D] leading-[18px]"
                >
                  Creator Amount
                </Text>
                <Text
                  variant="md"
                  weight="medium"
                  className="text-[#E0E0E0] leading-[22px] break-words"
                >
                  {creatorAmount.toLocaleString()} {currency}
                </Text>
              </div>

              <button
                className="flex items-center justify-center gap-1.5 px-[18px] py-2 bg-[#656565] border border-[#828B8D] rounded-[10px] cursor-not-allowed opacity-60 whitespace-nowrap"
                disabled
              >
                <Text
                  variant="small"
                  weight="light"
                  className="text-[#E0E0E0] leading-[20px] uppercase tracking-[0.08em] text-center"
                  style={{ fontWeight: 300 }}
                >
                  CLAIMED
                </Text>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // State 3: Fundraising complete and unlocked - can claim reward
  return (
    <div className={`w-full ${className}`}>
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: shouldAnimate ? 1 : 0,
          y: shouldAnimate ? 0 : 10,
        }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <Text
          variant="base"
          weight="regular"
          className="text-[#828B8D] leading-[18px]"
        >
          Please wait until the fundraising is successfully completed. Creator
          rewards will be distributed one month after the fundraising success
        </Text>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch">
        {/* Creator Percentage Card */}
        <motion.div
          className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: shouldAnimate ? 1 : 0,
            y: shouldAnimate ? 0 : 10,
          }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          <div className="flex flex-col justify-center gap-2 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
            <Text
              variant="base"
              weight="regular"
              className="text-[#828B8D] leading-[18px]"
            >
              Creator Percentage
            </Text>
            <Text
              variant="md"
              weight="medium"
              className="text-[#E0E0E0] leading-[22px]"
            >
              {creatorPercentage}%
            </Text>
          </div>
        </motion.div>

        {/* Creator Amount Card */}
        <motion.div
          className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: shouldAnimate ? 1 : 0,
            y: shouldAnimate ? 0 : 10,
          }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          <div className="flex flex-col justify-start items-start gap-2 p-4 rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
            <Text
              variant="base"
              weight="regular"
              className="text-[#828B8D] leading-[18px] text-start"
            >
              Creator Amount
            </Text>
            <Text
              variant="md"
              weight="medium"
              className="text-[#E0E0E0] leading-[22px] text-start"
            >
              --
            </Text>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
