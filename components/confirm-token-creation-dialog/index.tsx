"use client";

import { Button, Text } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, ensureHttpsProtocol } from "@/libs/utils";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FormDataType } from "../launch-token/form";
import { useLaunchToken } from "@/libs/hooks/launch-token/use-launch-token";
import { TokenCreatedSuccessfullyDialog } from "../token-created-successfully-dialog";
import { LINKS } from "@/libs/constants/links";
import { DEFAULT_WORLD_IMAGE_SRC } from "@/libs/constants";
import { useImageFallback } from "@/libs/hooks";
interface ConfirmTokenCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submitData: FormDataType;
}

export const ConfirmTokenCreationDialog = ({
  isOpen,
  onClose,
  submitData,
}: ConfirmTokenCreationDialogProps) => {
  const title = "Confirm Token Creation";
  const [agreeChecked, setAgreeChecked] = useState(false);
  const launchTokenHook = useLaunchToken();
  const [isSuccess, setIsSuccess] = useState<boolean | undefined>(undefined);
  const [worldId, setWorldId] = useState<string | undefined>(undefined);
  const {
    imageSrc: tokenPreviewSrc,
    handleError: handleTokenPreviewError,
    isFallback: isTokenPreviewFallback,
  } = useImageFallback(
    submitData.image.data,
    DEFAULT_WORLD_IMAGE_SRC,
    "token image preview"
  );

  const onConfirm = async () => {
    try {
      const sanitizedSubmitData = {
        ...submitData,
        websiteUrl: ensureHttpsProtocol(submitData.websiteUrl),
      };
      const result = await launchTokenHook.mutateAsync(sanitizedSubmitData);
      setIsSuccess(result.success);
      // Extract worldId from the backend response
      if (result.success && result.backendData?.id) {
        setWorldId(result.backendData.id.toString());
      }
      onClose();
    } catch (error) {
      console.error("Token creation failed:", error);
      setIsSuccess(false);
      onClose();
    }
  };

  const closeSuccessDialog = () => {
    setIsSuccess(undefined);
    setWorldId(undefined);
  };

  const closeAllDialogs = () => {
    closeSuccessDialog();
    onClose();
  };

  // Get current status information
  const { status, hash } = launchTokenHook;

  // Determine if we're in a processing state
  const isProcessing =
    status !== "idle" &&
    status !== "error" &&
    status !== "success" &&
    status !== "cancelled";

  // Get status message based on current state
  // const getStatusMessage = () => {
  //   switch (status) {
  //     case "preparing":
  //       return "Preparing transaction...";
  //     case "pending":
  //       return "Transaction pending on blockchain...";
  //     case "success":
  //       return "Transaction confirmed!";
  //     case "cancelled":
  //       return "Transaction was cancelled";
  //     case "error":
  //       return "Transaction failed";
  //     default:
  //       return "";
  //   }
  // };

  const getButtonLoadingText = () => {
    switch (status) {
      case "preparing":
        return "Preparing...";
      case "pending":
        return "Confirming...";
      default:
        return "Processing...";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={isProcessing ? undefined : onClose}>
        <DialogOverlay className="bg-black-500 backdrop-blur-sm" />
        <DialogContent
          showCloseButton={false}
          className={cn(
            "bg-[#0D0D0E]",
            "border-2 border-[#1F1F22] rounded-2xl sm:rounded-2xl",
            "p-0",
            "shadow-[0px_0px_32px_0px_rgba(11,5,16,0.2)]",
            "w-[calc(100dvw-32px)] md:min-w-[480px] md:w-full",
            "overflow-hidden"
          )}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div className="flex flex-col items-center gap-6 p-6 sm:gap-6 sm:p-6 overflow-hidden">
            <Text variant="xl" weight="medium" className="text-white">
              {title}
            </Text>
            <Text>
              {submitData.fundraisingType === "bonding-curve"
                ? "You're about to create a bonding curve token. Once deployed, this action cannot be undone."
                : "You're about to launch your token. Once deployed, this action cannot be undone."}
            </Text>
            <div
              className={cn(
                "flex gap-4",
                "border rounded-lg border-dark-600",
                "p-4",
                "w-full"
              )}
            >
              <div className="flex-shrink-0 w-20 h-20 relative">
                <Image
                  src={tokenPreviewSrc}
                  alt={submitData.name}
                  fill
                  className="object-cover rounded-lg"
                  onError={handleTokenPreviewError}
                  unoptimized={isTokenPreviewFallback}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <Text variant="md" weight="medium" className="text-light">
                    {submitData.name}
                  </Text>
                  <Text className="text-grey-300">#{submitData.symbol}</Text>
                </div>
                <Text preserveWhitespace className="text-grey-300 line-clamp-3">
                  {submitData.description}
                </Text>
              </div>
            </div>
            <div className="flex gap-2.5 w-full">
              {!agreeChecked ? (
                <button
                  className={cn(
                    "w-4.5 h-4.5",
                    "border border-light rounded-sm"
                  )}
                  onClick={() => setAgreeChecked(!agreeChecked)}
                />
              ) : (
                <button
                  className={cn(
                    "w-4.5 h-4.5",
                    "rounded-sm",
                    "flex items-center justify-center",
                    "bg-light"
                  )}
                  onClick={() => setAgreeChecked(!agreeChecked)}
                >
                  <Check className="text-darkest-bg" />
                </button>
              )}
              <Text className="text-light">
                I agree with the{" "}
                <Link
                  href={LINKS.TERMS_OF_SERVICE}
                  className="text-light underline"
                  target="_blank"
                >
                  Terms of Service
                </Link>
              </Text>
            </div>

            <div className="flex gap-4 w-full">
              <Button
                variant="grey"
                onClick={() => {
                  onClose();
                }}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="light"
                onClick={onConfirm}
                className="flex-1"
                disabled={!agreeChecked || isProcessing}
              >
                {isProcessing ? getButtonLoadingText() : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <TokenCreatedSuccessfullyDialog
        isOpen={isSuccess === true}
        onClose={closeSuccessDialog}
        onAfterAction={closeAllDialogs}
        submitData={submitData}
        worldId={worldId}
      />
    </>
  );
};
