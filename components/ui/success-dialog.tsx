"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SuccessIcon from "@/public/assets/images/success-icon.png";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onViewExplorer?: () => void;
  title?: string;
  allowTextButton?: string;
  anotherTextButton?: string;
  description?: ReactNode;
}

export const SuccessDialog = ({
  isOpen,
  onClose,
  onViewExplorer,
  title = "Transaction Successful",
  allowTextButton = "View on Explorer",
  anotherTextButton = "Done",
  description,
}: SuccessDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black-500 backdrop-blur-sm" />
      <DialogContent className="w-[400px] max-w-[calc(100vw-32px)] bg-[#0D0D0E] border-2 border-[#1F1F22] rounded-2xl sm:rounded-2xl p-0 shadow-[0px_0px_32px_0px_rgba(11,5,16,0.2)] [&>button]:hidden sm:max-w-[400px]">
        <div className="flex flex-col items-center gap-6 p-6 sm:gap-6 sm:p-6">
          {/* Success Icon */}
          <Image
            src={SuccessIcon}
            className="w-28 h-28 sm:w-28 sm:h-28"
            alt="Success Icon"
          />

          {/* Title + Description */}
          <div className="flex flex-col items-center gap-3 w-full px-0 sm:px-3">
            <h2 className="font-messina-sans font-semibold text-xl leading-[1.3] text-white text-center sm:text-xl">
              {title}
            </h2>

            <div className="font-messina-sans font-light text-base leading-[1.375] text-[#828B8D] text-center w-full sm:text-base">
              {description}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:gap-4 sm:justify-center">
            <Button
              variant="outline"
              onClick={onViewExplorer}
              className="w-full sm:flex-1 h-10 bg-[#1F1F22] border-0 text-[#E0E0E0] font-messina-sans font-semibold text-sm leading-[1.286] rounded-[90px] px-5 py-2 hover:bg-[#2A2A2D] transition-colors order-2 sm:order-1"
            >
              {anotherTextButton}
            </Button>

            <Button
              onClick={onClose}
              className="w-full sm:flex-1 h-10 bg-[#0E3263] border-0 text-white font-messina-sans font-semibold text-sm leading-[1.286] rounded-[90px] px-5 py-2 hover:bg-[#1A4A7D] transition-colors order-1 sm:order-2"
            >
              {allowTextButton}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
