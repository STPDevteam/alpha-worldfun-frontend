"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LoadingIcon } from "@/components/ui/icons";
import { AnimatedBalanceValue } from "../ui";
import { TokenStatus, FundraisingType } from "@/libs/types/world-card";
import WorldCardCountdown from "../home/world-card-countdown";
import { ProgressV2 } from "../ui/progress-v2";

interface FundraisingProgressProps {
  currentAmount: number;
  targetAmount: number;
  className?: string;
  status?: TokenStatus;
  startDate?: Date;
  endDate?: Date | null;
  fundraisingType?: FundraisingType;
  completedData?: {
    marketCap?: string;
    volume24h?: string;
    change24h?: string;
  };
}

const FundraisingProgress = ({
  currentAmount,
  targetAmount,
  className = "",
  status,
  startDate,
  endDate,
  fundraisingType,
  completedData,
}: FundraisingProgressProps) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [showLoadingIcon, setShowLoadingIcon] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const progressPercentage = Math.min(
    Math.max((currentAmount / targetAmount) * 100, 0),
    100
  );
  const formattedTarget = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(targetAmount);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Animation trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 120);

    const stopLoadingTimer = setTimeout(() => {
      setShowLoadingIcon(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(stopLoadingTimer);
    };
  }, []);

  // Special layout for LIVE status token is graduated based on Figma design
  if (status === TokenStatus.LIVE && completedData) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex flex-col gap-4 md:gap-[18px]">
          {/*
          <div className="flex flex-col sm:flex-row justify-stretch items-stretch gap-3 sm:gap-[18px] w-full">
            <motion.div
              className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: shouldAnimate ? 1 : 0,
                y: shouldAnimate ? 0 : 10,
              }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            >
              <div className="flex flex-col justify-center gap-1.5 p-3 sm:p-[18px] rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
                <div className="flex items-center gap-1">
                  <span
                    className="text-[#656565] text-xs sm:text-sm leading-[18px] font-normal"
                    style={{ fontFamily: "DM Mono" }}
                  >
                    Market Cap
                  </span>
                </div>
                <span
                  className="text-[#E0E0E0] text-sm sm:text-base leading-[22px] font-medium"
                  style={{ fontFamily: "DM Mono" }}
                >
                  {completedData.marketCap || "--"}
                </span>
              </div>
            </motion.div>

            <motion.div
              className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: shouldAnimate ? 1 : 0,
                y: shouldAnimate ? 0 : 10,
              }}
              transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
            >
              <div className="flex flex-col justify-center gap-1.5 p-3 sm:p-[18px] rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
                <div className="flex items-center gap-1">
                  <span
                    className="text-[#656565] text-xs sm:text-sm leading-[18px] font-normal"
                    style={{ fontFamily: "DM Mono" }}
                  >
                    Volume (24h)
                  </span>
                </div>
                <span
                  className="text-[#E0E0E0] text-sm sm:text-base leading-[22px] font-medium"
                  style={{ fontFamily: "DM Mono" }}
                >
                  {completedData.volume24h || "--"}
                </span>
              </div>
            </motion.div>

            <motion.div
              className="relative rounded-lg p-[0.5px] bg-gradient-to-br from-[rgba(255,255,255,0.3)] via-transparent to-[rgba(153,153,153,0.2)] flex-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: shouldAnimate ? 1 : 0,
                y: shouldAnimate ? 0 : 10,
              }}
              transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
            >
              <div className="flex flex-col justify-center gap-1.5 p-3 sm:p-[18px] rounded-[8px] bg-[rgba(81,81,81,0.2)] backdrop-blur-[100px] h-full">
                <div className="flex items-center gap-1">
                  <span
                    className="text-[#656565] text-xs sm:text-sm leading-[18px] font-normal"
                    style={{ fontFamily: "DM Mono" }}
                  >
                    24h Change
                  </span>
                </div>
                <span
                  className="text-[#13BD43] text-sm sm:text-base leading-[22px] font-medium"
                  style={{ fontFamily: "DM Mono" }}
                >
                  {completedData.change24h || "--"}
                </span>
              </div>
            </motion.div>
          </div>  */}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-[#0C0C0C] border border-[#171717] rounded-xl p-3 sm:p-4 md:p-[18px] flex flex-col gap-3 sm:gap-4 md:gap-[18px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#27272B] rounded-[6px] relative">
              <LoadingIcon
                size={16}
                className={`sm:w-[18px] sm:h-[18px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#E0E0E0] ${
                  showLoadingIcon ? "animate-spin" : "animate-none"
                }`}
              />
            </div>
            <h3
              className="text-[#E0E0E0] text-sm sm:text-base leading-[22px] font-medium"
              style={{ fontFamily: "DM Mono" }}
            >
              Funding progress
            </h3>
          </div>

          {status === TokenStatus.ON_GOING &&
            fundraisingType === FundraisingType.FIXED_PRICE &&
            endDate && (
              <motion.div
                className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
                style={{
                  background:
                    "linear-gradient(180deg, #010101 0%, #1F1F22 100%)",
                }}
                initial={{ opacity: 0, x: 10 }}
                animate={{
                  opacity: shouldAnimate ? 1 : 0,
                  x: shouldAnimate ? 0 : 10,
                }}
                transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
              >
                <WorldCardCountdown
                  launchTime={
                    endDate instanceof Date ? endDate : new Date(endDate)
                  }
                />
              </motion.div>
            )}
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-1.5">
              <div className="flex items-end gap-1.5">
                <AnimatedBalanceValue
                  cardId="fundraising-main"
                  value={shouldAnimate ? currentAmount : 0}
                  duration={1.5}
                  delay={0.5}
                  className="text-white text-lg sm:text-xl md:text-2xl leading-[24px] sm:leading-[28px] md:leading-[32px] font-medium"
                  style={{
                    fontFamily: "DM Mono",
                    background:
                      "linear-gradient(to right, rgba(255,255,255,0.8), #ffffff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                  customFormat={{
                    useThousandsSeparator: true,
                    thousandsSeparator: ",",
                    prefix: "",
                    suffix: "",
                    decimals: 2,
                  }}
                />
                <span
                  className="text-white text-xl md:text-2xl leading-[28px] md:leading-[32px] font-medium ml-1"
                  style={{ fontFamily: "DM Mono" }}
                >
                  AWE
                </span>
              </div>
              <div className="flex items-end h-auto sm:h-[27px]">
                <span
                  className="text-[#555555] text-sm md:text-base leading-[18px] md:leading-[20px] font-normal"
                  style={{ fontFamily: "BDO Grotesk" }}
                >
                  / {formattedTarget} AWE
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <motion.div
                className="w-full overflow-hidden"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{
                  opacity: shouldAnimate ? 1 : 0,
                  scaleX: shouldAnimate ? 1 : 0,
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.5,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}
                style={{
                  transformOrigin: "left center",
                }}
              >
                <ProgressV2
                  value={progressPercentage}
                  segments={isMobile ? 30 : 85}
                  activeColor="#B38045"
                  inactiveColor="#27272B"
                  segmentHeight={isMobile ? 20 : 24}
                  gap={isMobile ? 2 : 3}
                />
              </motion.div>

              <div className="flex flex-col gap-1">
                <motion.div
                  className="flex justify-between items-center w-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: shouldAnimate ? 1 : 0,
                    y: shouldAnimate ? 0 : 10,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 2.0,
                    ease: "easeOut",
                  }}
                >
                  <div className="flex items-center gap-1">
                    <AnimatedBalanceValue
                      cardId="fundraising-bottom"
                      value={shouldAnimate ? currentAmount : 0}
                      duration={1.5}
                      delay={0.5}
                      className="text-[#8F9393] text-sm leading-[18px] font-medium"
                      style={{
                        fontFamily: "DM Mono",
                        background:
                          "linear-gradient(to right, rgba(143,147,147,0.6), #8F9393)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                      customFormat={{
                        useThousandsSeparator: true,
                        thousandsSeparator: ",",
                        prefix: "",
                        suffix: "",
                        decimals: 4,
                      }}
                    />
                    <span
                      className="text-[#8F9393] text-sm leading-[18px] font-medium ml-1"
                      style={{ fontFamily: "DM Mono" }}
                    >
                      AWE funded
                    </span>
                  </div>
                  <AnimatedBalanceValue
                    cardId="fundraising-percentage"
                    value={shouldAnimate ? Math.round(progressPercentage) : 0}
                    duration={1.5}
                    delay={0.5}
                    className="text-[#E0E0E0] text-sm leading-[18px] font-medium"
                    style={{
                      fontFamily: "DM Mono",
                      background:
                        "linear-gradient(to right, rgba(224,224,224,0.6), #E0E0E0)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundraisingProgress;
