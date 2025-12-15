import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { useToast } from "@/libs/hooks/common";
import {
  useDaoPoolContributions,
  useDaoPoolData,
  useDaoPoolRefund,
  usePoolContribute,
  type UseDaoPoolDataReturn,
} from "@/libs/hooks/contracts";
import { contributionHistoryQueryKeys } from "@/libs/hooks/subgraph";
import { daoQueryKeys } from "@/libs/hooks/subgraph/use-dao-data";
import { bondingCurveQueryKeys } from "@/libs/hooks/subgraph/use-bonding-curve-data";
import { useAweTokenBalance } from "@/libs/hooks/wallet";
import { useWalletConnectButton } from "@/libs/hooks/wallet/use-wallet-connect-button";
import { FundraisingType, TokenStatus } from "@/libs/types";

import type { ProgressSectionProps } from "../types";
import { clampPercentage, formatTokenAmount, toNumberOrNull } from "../utils";

interface ButtonState {
  text: string;
  disabled: boolean;
  showIcon: boolean;
}

export interface ProgressSectionViewModel {
  formattedCurrentValue: string;
  formattedTargetValue: string;
  progressLabel: string;
  progressBarWidth: number;
  displayProgressPercentage: number | null;
  inputValue: string | undefined;
  onInputChange: (value: string | undefined) => void;
  showAmountHint: boolean;
  balanceLabel: string;
  isInputDisabled: boolean;
  userContributionLabel: string;
  formattedEstimatedAllocation: string;
  buttonState: ButtonState;
  handleContribute: () => Promise<void> | void;
}

type FallbackDaoPoolData = UseDaoPoolDataReturn | undefined;

export const useProgressSection = (
  props: ProgressSectionProps
): ProgressSectionViewModel => {
  const {
    currentValue,
    targetValue,
    progressPercentage,
    commitValue,
    balance: propBalance,
    estimatedAllocation,
    poolInfo,
    onContribute,
    daoPoolData,
    status,
    onContributionComplete,
    optimisticRaisedAmount = 0,
    raisedOverride = null,
    worldStatus = null,
  } = props;

  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();
  const { handleConnectWallet } = useWalletConnectButton();
  const { error: toastError } = useToast();

  const {
    balance,
    balanceFormatted,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    refetch: refetchBalance,
  } = useAweTokenBalance();

  const {
    contribute,
    isPreparing,
    isConfirming,
    isConfirmed,
    currentStep,
    hash,
  } = usePoolContribute(poolInfo?.address);

  const daoPoolAddress =
    poolInfo?.type === FundraisingType.FIXED_PRICE ? poolInfo?.address : undefined;

  const { aweAmountFormatted: userContribution, refunded: userRefunded } =
    useDaoPoolContributions({
      poolAddress: daoPoolAddress,
      userAddress: address,
      enabled: !!daoPoolAddress && !!address,
    });

  const {
    refundAsync,
    isRefunding,
    isConfirming: isRefundConfirming,
    isConfirmed: isRefundConfirmed,
  } = useDaoPoolRefund(daoPoolAddress);

  const shouldFetchDaoPoolData = !daoPoolData && !!daoPoolAddress;

  const fallbackDaoPoolData: FallbackDaoPoolData = useDaoPoolData({
    poolAddress: daoPoolAddress,
    enabled: shouldFetchDaoPoolData,
  });

  const effectiveDaoPoolData = daoPoolData ?? fallbackDaoPoolData;
  const totalAweRaisedBigint = effectiveDaoPoolData?.totalAweRaised;
  const remainingAweForRaisingBigint =
    effectiveDaoPoolData?.remainingAweForRaising;
  const hasDaoRaisedValue = typeof totalAweRaisedBigint === "bigint";
  const hasDaoRemainingValue = typeof remainingAweForRaisingBigint === "bigint";
  const totalAweRaisedFormatted = hasDaoRaisedValue
    ? effectiveDaoPoolData?.totalAweRaisedFormatted
    : undefined;
  const remainingAweForRaisingFormatted = hasDaoRemainingValue
    ? effectiveDaoPoolData?.remainingAweForRaisingFormatted
    : undefined;
  const refetchDaoPoolData = effectiveDaoPoolData?.refetch;

  const isRefunded =
    effectiveDaoPoolData?.totalAweRefunded !== undefined &&
    effectiveDaoPoolData?.totalAweRefunded > BigInt(0);

  const optimisticDelta = useMemo(() => {
    if (typeof optimisticRaisedAmount !== "number") {
      return 0;
    }

    return Number.isFinite(optimisticRaisedAmount)
      ? Math.max(optimisticRaisedAmount, 0)
      : 0;
  }, [optimisticRaisedAmount]);

  const triggerContributionRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: contributionHistoryQueryKeys.all,
    });

    const poolAddressToInvalidate = poolInfo?.address;
    const poolType = poolInfo?.type;

    if (poolAddressToInvalidate) {
      if (poolType === FundraisingType.FIXED_PRICE) {
        queryClient.invalidateQueries({
          queryKey: daoQueryKeys.byAddress(poolAddressToInvalidate),
        });

        if (address) {
          queryClient.invalidateQueries({
            queryKey: [
              "readContract",
              {
                address: poolAddressToInvalidate,
                functionName: "contributions",
                args: [address],
              },
            ],
          });
        }
      }

      if (poolType === FundraisingType.BONDING_CURVE) {
        queryClient.invalidateQueries({
          queryKey: bondingCurveQueryKeys.byPool(poolAddressToInvalidate),
        });
      }
    }

    refetchDaoPoolData?.();
  }, [
    poolInfo?.address,
    poolInfo?.type,
    queryClient,
    refetchDaoPoolData,
    address,
  ]);

  const lastContributionAmountRef = useRef<number | null>(null);
  const lastContributionTimestampRef = useRef<Date | null>(null);
  const lastHandledContributionRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  const baseRaisedValue = useMemo(() => {
    if (typeof raisedOverride === "number" && Number.isFinite(raisedOverride)) {
      return raisedOverride;
    }

    if (hasDaoRaisedValue) {
      return toNumberOrNull(totalAweRaisedFormatted);
    }

    return toNumberOrNull(currentValue);
  }, [
    raisedOverride,
    hasDaoRaisedValue,
    totalAweRaisedFormatted,
    currentValue,
  ]);

  const baseTargetValue = useMemo(
    () => toNumberOrNull(targetValue),
    [targetValue]
  );

  const baseProgressPercentage = useMemo(() => {
    const providedProgress = toNumberOrNull(progressPercentage);
    if (providedProgress !== null) {
      return clampPercentage(providedProgress);
    }

    if (
      baseRaisedValue !== null &&
      baseTargetValue !== null &&
      baseTargetValue > 0
    ) {
      const computed = (baseRaisedValue / baseTargetValue) * 100;
      return clampPercentage(computed);
    }

    return null;
  }, [progressPercentage, baseRaisedValue, baseTargetValue]);

  const displayCurrentValue = useMemo(() => {
    if (baseRaisedValue !== null) {
      return baseRaisedValue + optimisticDelta;
    }

    return optimisticDelta > 0 ? optimisticDelta : null;
  }, [baseRaisedValue, optimisticDelta]);

  const displayProgressPercentage = useMemo(() => {
    if (
      baseTargetValue !== null &&
      baseTargetValue > 0 &&
      displayCurrentValue !== null
    ) {
      const computed = (displayCurrentValue / baseTargetValue) * 100;
      return clampPercentage(computed);
    }

    return baseProgressPercentage;
  }, [baseTargetValue, displayCurrentValue, baseProgressPercentage]);

  const formattedCurrentValue = formatTokenAmount(displayCurrentValue);
  const formattedTargetValue = formatTokenAmount(baseTargetValue);
  const flooredProgressPercentage =
    displayProgressPercentage !== null
      ? Math.floor(displayProgressPercentage * 100) / 100
      : null;
  const formattedProgressPercentage =
    flooredProgressPercentage !== null
      ? flooredProgressPercentage.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      : "--";
  const progressLabel =
    formattedProgressPercentage === "--"
      ? "--"
      : `${formattedProgressPercentage}%`;
  const progressBarWidth = displayProgressPercentage ?? 0;

  const remainingAllocationValueBase = useMemo(() => {
    const fromHook = hasDaoRemainingValue
      ? toNumberOrNull(remainingAweForRaisingFormatted)
      : null;
    const fallbackAllocation = toNumberOrNull(estimatedAllocation);
    return fromHook ?? fallbackAllocation;
  }, [
    hasDaoRemainingValue,
    remainingAweForRaisingFormatted,
    estimatedAllocation,
  ]);

  const computedRemainingFromTarget = useMemo(() => {
    if (
      baseTargetValue !== null &&
      baseTargetValue > 0 &&
      displayCurrentValue !== null
    ) {
      const remaining = baseTargetValue - displayCurrentValue;
      return remaining > 0 ? remaining : 0;
    }

    return null;
  }, [baseTargetValue, displayCurrentValue]);

  const remainingAllocationValue = useMemo(() => {
    if (computedRemainingFromTarget !== null) {
      return computedRemainingFromTarget;
    }

    if (remainingAllocationValueBase === null) {
      return null;
    }

    const adjusted = remainingAllocationValueBase - optimisticDelta;
    return adjusted > 0 ? adjusted : 0;
  }, [
    computedRemainingFromTarget,
    remainingAllocationValueBase,
    optimisticDelta,
  ]);

  const formattedEstimatedAllocation = (() => {
    if (remainingAllocationValue !== null) {
      return remainingAllocationValue.toLocaleString();
    }

    if (typeof estimatedAllocation === "string" && estimatedAllocation.trim()) {
      return estimatedAllocation;
    }

    return "--";
  })();

  const initialCommitValue = useMemo(() => {
    if (
      typeof commitValue === "string" &&
      commitValue.trim().length > 0 &&
      !Number.isNaN(Number(commitValue))
    ) {
      return commitValue;
    }

    return undefined;
  }, [commitValue]);

  const [inputValue, setInputValue] = useState<string | undefined>(initialCommitValue);
  const [hasAttemptedCommit, setHasAttemptedCommit] = useState(false);

  useEffect(() => {
    setInputValue(initialCommitValue);
  }, [initialCommitValue]);

  const isAmountMissing =
    inputValue === undefined ||
    inputValue === null ||
    inputValue === "" ||
    Number.isNaN(Number(inputValue)) ||
    Number(inputValue) <= 0;

  useEffect(() => {
    if (!isAmountMissing && hasAttemptedCommit) {
      setHasAttemptedCommit(false);
    }
  }, [isAmountMissing, hasAttemptedCommit]);

  const showAmountHint =
    isConnected &&
    !isPreparing &&
    !isConfirming &&
    isAmountMissing &&
    hasAttemptedCommit;

  const balanceLabel = isBalanceLoading
    ? "Loading..."
    : isBalanceError || !balanceFormatted
    ? propBalance ?? "--"
    : Number(balanceFormatted).toLocaleString();

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current !== null) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isConfirmed) {
      return;
    }

    const committedAmount = lastContributionAmountRef.current;
    const committedTimestamp =
      lastContributionTimestampRef.current ?? new Date();
    const txHash = hash ?? undefined;
    const handledKey =
      txHash ??
      `${poolInfo?.address ?? "pool"}-${committedTimestamp.getTime()}`;

    const alreadyHandled = lastHandledContributionRef.current === handledKey;

    if (!alreadyHandled) {
      lastHandledContributionRef.current = handledKey;

      if (
        onContributionComplete &&
        typeof committedAmount === "number" &&
        !Number.isNaN(committedAmount) &&
        committedAmount > 0
      ) {
        onContributionComplete({
          amount: committedAmount,
          walletAddress: address ?? undefined,
          txHash,
          poolAddress: poolInfo?.address,
          timestamp: committedTimestamp,
        });
      }
    }

    setInputValue(undefined);
    setHasAttemptedCommit(false);
    refetchBalance();

    lastContributionAmountRef.current = null;
    lastContributionTimestampRef.current = null;

    triggerContributionRefresh();

    if (pollIntervalRef.current !== null) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, [
    address,
    hash,
    isConfirmed,
    onContributionComplete,
    poolInfo?.address,
    refetchBalance,
    triggerContributionRefresh,
  ]);

  useEffect(() => {
    if (!isRefundConfirmed) {
      return;
    }

    const poolAddress = poolInfo?.address;

    setInputValue("0");
    setHasAttemptedCommit(false);

    refetchBalance();

    queryClient.invalidateQueries({
      queryKey: contributionHistoryQueryKeys.all,
    });

    if (poolAddress) {
      queryClient.invalidateQueries({
        queryKey: daoQueryKeys.byAddress(poolAddress),
      });
    }

    const timer = setTimeout(() => {
      refetchDaoPoolData?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    isRefundConfirmed,
    refetchDaoPoolData,
    refetchBalance,
    queryClient,
    poolInfo?.address,
  ]);

  const handleContribute = useCallback(async () => {
    if (status === TokenStatus.CANCELLED) {
      const hasRaisedFunds =
        totalAweRaisedBigint && totalAweRaisedBigint > BigInt(0);
      const notYetRefunded =
        effectiveDaoPoolData?.totalAweRefunded === undefined ||
        effectiveDaoPoolData?.totalAweRefunded === BigInt(0);

      if (hasRaisedFunds && notYetRefunded) {
        if (!isConnected) {
          await handleConnectWallet();
          return;
        }

        try {
          await refundAsync();
        } catch (error) {
          console.error("Refund failed:", error);
        }
      }
      return;
    }

    if (!isConnected) {
      await handleConnectWallet();
      return;
    }

    if (!poolInfo) {
      console.warn("No pool information provided for contribution");
      onContribute?.();
      return;
    }

    if (isAmountMissing) {
      setHasAttemptedCommit(true);
      console.warn("Invalid contribution amount");
      return;
    }

    if (balanceFormatted && inputValue) {
      const userBalanceNumber = Number(balanceFormatted);
      const inputValueNumber = Number(inputValue);
      if (userBalanceNumber < inputValueNumber) {
        toastError({
          title: "Insufficient Balance",
          description: `You have ${userBalanceNumber.toFixed(
            2
          )} AWE but need ${inputValueNumber.toFixed(2)} AWE`,
        });
        return;
      }
    }

    lastContributionAmountRef.current = inputValue ? Number(inputValue) : null;
    lastContributionTimestampRef.current = new Date();
    lastHandledContributionRef.current = null;

    try {
      const numericAmount = inputValue && inputValue !== "" ? Number(inputValue) : 0;
      contribute({
        poolInfo,
        amount: numericAmount,
        userBalance: balance,
      });
    } catch (error) {
      console.error("Contribution failed:", error);
    }
  }, [
    status,
    totalAweRaisedBigint,
    effectiveDaoPoolData?.totalAweRefunded,
    isConnected,
    handleConnectWallet,
    refundAsync,
    poolInfo,
    onContribute,
    isAmountMissing,
    balanceFormatted,
    toastError,
    inputValue,
    contribute,
    balance,
  ]);

  const getButtonState = useCallback((): ButtonState => {
    if (status === TokenStatus.CANCELLED) {
      const hasRaisedFunds =
        totalAweRaisedBigint && totalAweRaisedBigint > BigInt(0);
      const notYetRefunded =
        effectiveDaoPoolData?.totalAweRefunded === undefined ||
        effectiveDaoPoolData?.totalAweRefunded === BigInt(0);

      if (hasRaisedFunds && notYetRefunded) {
        if (!isConnected) {
          return { text: "Connect Wallet", disabled: false, showIcon: false };
        }

        if (isRefunding || isRefundConfirming) {
          return { text: "REFUNDING...", disabled: true, showIcon: false };
        }

        return { text: "REFUND", disabled: false, showIcon: false };
      }

      if (isRefunded) {
        return { text: "REFUNDED", disabled: true, showIcon: false };
      }

      return { text: "CANCELLED", disabled: true, showIcon: false };
    }

    if (
      displayProgressPercentage !== null &&
      displayProgressPercentage >= 100 &&
      worldStatus === TokenStatus.ON_GOING
    ) {
      return {
        text: "Processing Graduation...",
        disabled: true,
        showIcon: true,
      };
    }

    if (
      displayProgressPercentage !== null &&
      displayProgressPercentage >= 100
    ) {
      return { text: "Fundraise Completed!", disabled: true, showIcon: false };
    }

    if (!isConnected) {
      return { text: "Connect Wallet", disabled: false, showIcon: false };
    }

    if (isPreparing || isConfirming) {
      const text = currentStep || "Confirming...";
      return { text, disabled: true, showIcon: false };
    }

    if (!poolInfo) {
      return { text: "Contribute", disabled: false, showIcon: false };
    }

    // Disable button when amount is missing or equals 0
    if (!inputValue || inputValue === "" || inputValue === "0") {
      return { text: "Contribute", disabled: true, showIcon: false };
    }

    if (inputValue && Number(inputValue) > 0) {
      if (!balanceFormatted) {
        return {
          text: "Insufficient balance!",
          disabled: true,
          showIcon: false,
        };
      }

      const currentAweBalance = Number(balanceFormatted);
      const inputValueNumber = Number(inputValue);
      if (!Number.isNaN(currentAweBalance) && inputValueNumber > currentAweBalance) {
        return {
          text: "Insufficient balance!",
          disabled: true,
          showIcon: false,
        };
      }
    }

    return { text: "Contribute", disabled: false, showIcon: false };
  }, [
    status,
    totalAweRaisedBigint,
    effectiveDaoPoolData?.totalAweRefunded,
    isConnected,
    isRefunding,
    isRefundConfirming,
    isRefunded,
    displayProgressPercentage,
    worldStatus,
    isPreparing,
    isConfirming,
    currentStep,
    poolInfo,
    inputValue,
    balanceFormatted,
  ]);

  const buttonState = getButtonState();

  const userContributionLabel = useMemo(() => {
    if (userRefunded || isRefunded) {
      return "0 AWE";
    }

    if (userContribution && Number(userContribution) > 0) {
      return `${Number(userContribution).toLocaleString()} AWE`;
    }

    return "0 AWE";
  }, [userContribution, userRefunded, isRefunded]);

  const isInputDisabled =
    displayProgressPercentage !== null && displayProgressPercentage >= 100;

  return {
    formattedCurrentValue,
    formattedTargetValue,
    progressLabel,
    progressBarWidth,
    displayProgressPercentage,
    inputValue,
    onInputChange: setInputValue,
    showAmountHint,
    balanceLabel,
    isInputDisabled,
    userContributionLabel,
    formattedEstimatedAllocation,
    buttonState,
    handleContribute,
  };
};
