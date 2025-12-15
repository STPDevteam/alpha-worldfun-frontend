"use client";

import { Text } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/libs/utils";
import { FormDataType } from "../launch-token/form";
import { Check } from "lucide-react";
import { ROUTES } from "@/libs/constants";
import { useNavigationLoadingStore } from "@/libs/stores";
import Link from "next/link";
import { useWorldCardsActions } from "@/libs/hooks/home/use-world-cards";
interface TokenCreatedSuccessfullyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submitData?: FormDataType;
  worldId?: string;
  onAfterAction?: () => void;
}

export const TokenCreatedSuccessfullyDialog = ({
  isOpen,
  onClose,
  submitData,
  worldId,
  onAfterAction,
}: TokenCreatedSuccessfullyDialogProps) => {
  const title = "Token Created Successfully";
  const { invalidateData } = useWorldCardsActions();
  const startNavigation = useNavigationLoadingStore(
    (state) => state.startNavigation
  );
  const adminPath = worldId ? `${ROUTES.admin}/${worldId}` : ROUTES.home;

  const viewActionConfig = (() => {
    switch (submitData?.type) {
      case "world-idea":
        return { label: "View World", tab: "WORLD IDEA" as const };
      case "world-agent":
        return { label: "View Agent", tab: "WORLD AGENT" as const };
      case "utility-agent":
        return { label: "View Utility Agent", tab: "UTILITY AGENT" as const };
      default:
        return { label: "View Token List" as const };
    }
  })();

  const viewHref =
    "tab" in viewActionConfig && viewActionConfig.tab
      ? `${ROUTES.home}?tab=${encodeURIComponent(viewActionConfig.tab)}`
      : ROUTES.home;

  const handleActionComplete = () => {
    if (onAfterAction) {
      onAfterAction();
    } else {
      onClose();
    }
  };

  const onConfirm = () => {
    startNavigation(adminPath);
    invalidateData(); // Invalidate world cards data before redirecting
    handleActionComplete();
  };

  const handleViewTokenList = () => {
    startNavigation(viewHref);
    invalidateData(); // Invalidate world cards data before redirecting
    handleActionComplete();
  };

  return (
    <Dialog open={isOpen}>
      <DialogOverlay className="bg-black-500 backdrop-blur-sm" />
      <DialogContent
        showCloseButton={false}
        className={cn(
          "bg-[#0D0D0E]",
          "border-2 border-[#1F1F22] rounded-2xl",
          "p-0",
          "shadow-[0px_0px_32px_0px_rgba(11,5,16,0.2)]",
          "w-[calc(100dvw-32px)] md:min-w-[480px] md:w-full",
          "overflow-hidden"
        )}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex flex-col items-center gap-3 p-6 sm:p-6 overflow-hidden">
          <div
            className={cn(
              "flex items-center justify-center",
              "w-28 h-28",
              "rounded-full border border-[#282829]",
              "bg-[#101011]"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center",
                "w-20.5 h-20.5",
                "bg-[#1c1c1f]",
                "rounded-full border border-[#25281B]"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center",
                  "w-13.5 h-13.5",
                  "border-4 border-white rounded-full",
                  "bg-dark-500"
                )}
              >
                <Check className="text-white" strokeWidth={4} size={26} />
              </div>
            </div>
          </div>

          <Text variant="xl" weight="medium" className="text-white text-[20px]">
            {title}
          </Text>
          <Text className="text-grey-200 max-w-[340px] text-center text-[16px]">
            Congrats! Your token has been deployed onchain.
          </Text>

          <div className="flex gap-4 w-full mt-9">
            <Link
              href={viewHref}
              onClick={handleViewTokenList}
              className={cn(
                "flex-1",
                "bg-dark-800",
                "rounded-[10px]",
                "flex items-center justify-center",
                "py-2 px-4"
              )}
            >
              <Text variant="bdo-button" weight="medium" className="text-light">
                {viewActionConfig.label}
              </Text>
            </Link>
            <Link
              href={adminPath}
              onClick={onConfirm}
              className={cn(
                "flex-1",
                "bg-light",
                "rounded-[10px]",
                "flex items-center justify-center",
                "py-2 px-4"
              )}
            >
              <Text
                variant="bdo-button"
                weight="medium"
                className="text-darkest-bg text-center"
              >
                {worldId ? "Go to Admin Page" : "Go to Home"}
              </Text>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
