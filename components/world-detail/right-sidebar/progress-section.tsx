"use client";

import Image from "next/image";

import { Button, Text } from "../../ui";
import { ProgressV2 } from "../../ui/progress-v2";
import { BaseDecimalInput } from "../../common/base-decimal-input";
import type { ProgressSectionProps } from "./types";
import { useProgressSection } from "./hooks/use-progress-section";
import { useAdaptiveFontSize } from "@/hooks/use-adaptive-font-size";

export const ProgressSection = (props: ProgressSectionProps) => {
  const {
    formattedCurrentValue,
    formattedTargetValue,
    progressLabel,
    progressBarWidth,
    inputValue,
    onInputChange,
    showAmountHint,
    balanceLabel,
    isInputDisabled,
    userContributionLabel,
    formattedEstimatedAllocation,
    buttonState,
    handleContribute,
  } = useProgressSection(props);

  // Adaptive font size for input to prevent overflow
  const { fontSize, inputRef: adaptiveInputRef, containerRef } = useAdaptiveFontSize({
    value: inputValue ?? "",
    baseFontSize: 18,
    minFontSize: 12,
    containerPadding: 80, // Account for AWE icon and text on the right
    placeholder: "Enter amount",
  });

  return (
    <div
      className="flex flex-col justify-center
      w-[calc(100%-1.5rem)] md:w-full xl:w-[445px] h-full
      not-md:mx-3 px-4 py-5
      border border-[rgba(224,224,224,0.2)] rounded-[10px] gap-[30px] overflow-hidden"
    >
      <div className="flex flex-row justify-start items-center gap-2.5">
        <h2
          className="text-[#FFFFFF] text-[18px] font-medium leading-[1.333]"
          style={{ fontFamily: "DM Mono" }}
        >
          Fund This World/Agent
        </h2>
      </div>

      <div className="flex flex-col gap-[12.5px] w-full">
        <div className="flex flex-row justify-between items-center w-full">
          <Text variant="base" className="leading-[20px]">
            {formattedCurrentValue} / {formattedTargetValue} AWE
          </Text>
          <Text variant="base" className="leading-[20px]">
            {progressLabel}
          </Text>
        </div>

        <ProgressV2
          value={progressBarWidth}
          segments={21}
          inactiveColor="rgba(224,224,224,0.2)"
          segmentHeight={16}
          gap={2}
          className="w-full"
        />
      </div>

      <div
        className={`flex flex-col items-center gap-2 w-full p-2 px-4 border rounded-[10px] transition-colors ${
          showAmountHint
            ? "border-[#FF6363] bg-[rgba(255,99,99,0.08)]"
            : "border-[rgba(224,224,224,0.2)]"
        }`}
      >
        <div className="flex flex-row justify-between items-center w-full">
          <span
            className="text-[#FFFFFF] text-[14px] font-medium leading-[2]"
            style={{ fontFamily: "DM Mono" }}
          >
            Commit AWE
          </span>
          <span
            className="text-[14px] font-medium leading-[2]"
            style={{ fontFamily: "DM Mono" }}
          >
            <span className="text-[#777272]">Balance </span>
            <span className="text-[#FFFFFF]">{balanceLabel}</span>
          </span>
        </div>

        <div
          ref={containerRef}
          className="flex flex-row justify-between items-center w-full gap-3"
        >
          <div className="flex-1 min-w-0">
            <BaseDecimalInput
              ref={adaptiveInputRef}
              value={inputValue ?? ""}
              onChange={onInputChange}
              placeholder="Enter amount"
              className="bg-transparent border-none font-medium leading-[1.556] placeholder:text-[#777272] focus:outline-none p-0 h-auto flex-1 text-[#FFFFFF] w-full transition-all duration-150"
              style={{
                fontFamily: "DM Mono",
                fontSize: `${fontSize}px`,
              }}
              maxDecimals={18}
              aria-placeholder="Enter amount"
              disabled={isInputDisabled}
              enableCommaFormatting
              aria-invalid={showAmountHint}
            />
          </div>
          <div className="flex flex-row items-center gap-2 h-6 shrink-0">
            <div className="w-6 h-6 bg-[#293033] rounded-full p-1 flex items-center justify-center shrink-0">
              <Image
                src="/icons/awe-logo.svg"
                alt="AWE"
                width={16}
                height={8}
                className="text-[#E0E0E0]"
              />
            </div>
            <span
              className="text-[#FFFFFF] text-[12px] font-medium leading-[1.167] whitespace-nowrap"
              style={{ fontFamily: "DM Mono" }}
            >
              AWE
            </span>
          </div>
        </div>
        {showAmountHint ? (
          <p
            className="self-start text-[#FF9F9F] text-[12px] font-medium leading-[1.4]"
            style={{ fontFamily: "DM Mono" }}
          >
            Enter an amount to continue.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 w-full">
        <div className="flex flex-row justify-between items-center w-full">
          <span
            className="text-[#FFFFFF] text-[12px] font-normal leading-[2]"
            style={{ fontFamily: "DM Mono" }}
          >
            Your Contribution
          </span>
          <span
            className="text-[#FFFFFF] text-[12px] font-light leading-[2]"
            style={{ fontFamily: "DM Mono" }}
          >
            {userContributionLabel}
          </span>
        </div>

        <div className="flex flex-row justify-between items-center w-full">
          <span
            className="text-[#FFFFFF] text-[12px] font-light leading-[2]"
            style={{ fontFamily: "DM Mono" }}
          >
            Estimated Allocation
          </span>
          <span
            className="text-[#FFFFFF] text-[12px] font-light leading-[2]"
            style={{ fontFamily: "DM Mono" }}
          >
            {formattedEstimatedAllocation} AWE
          </span>
        </div>
      </div>

      <div
        className="flex flex-row justify-center items-center
        w-full h-[44px] rounded-[10px]
        bg-[rgba(55,60,62,0.4)] hover:bg-[rgba(83,87,87,0.4)] cursor-pointer"
      >
        <Button
          onClick={handleContribute}
          disabled={buttonState.disabled}
          className={`w-full bg-transparent cursor-pointer hover:bg-transparent text-[18px] font-medium leading-[1.333] border-none p-2.5 h-[44px] flex items-center justify-center gap-2 ${
            buttonState.disabled
              ? "opacity-50 text-[#8F9393]"
              : "text-[#FFFFFF]"
          } ${buttonState.showIcon ? "text-[#FFC107]" : ""}`}
          style={{ fontFamily: "DM Mono" }}
        >
          {buttonState.showIcon && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="animate-spin"
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="#FFC107"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="28 10"
              />
            </svg>
          )}
          {buttonState.text}
        </Button>
      </div>
    </div>
  );
};
