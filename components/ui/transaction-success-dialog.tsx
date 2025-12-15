"use client";

import { ReactNode } from "react";
import { SuccessDialog } from "@/components/ui/success-dialog";

interface TransactionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onViewExplorer?: () => void;

  title?: string;

  amount?: string;
  currency?: string;
  worldName?: string;
  allocatedAmount?: string;
  allocatedCurrency?: string;
}

export function TransactionSuccessDialog({
  isOpen,
  onClose,
  onViewExplorer,
  title = "Transaction Successful",
  amount,
  currency,
  worldName,
  allocatedAmount,
  allocatedCurrency,
}: TransactionSuccessDialogProps) {
  const Token = ({ children }: { children: ReactNode }) => (
    <span className="font-messina-sans font-semibold text-base leading-[1.375] text-white">
      {children}
    </span>
  );

  const description = (
    <>
      You&apos;ve committed {amount && <Token>{amount}</Token>}{" "}
      {currency && <Token>{currency}</Token>} to{" "}
      {worldName} world. Please wait until the
      fundraising ends. You will receive the allocated{" "}
      {allocatedAmount && <Token>{allocatedAmount}</Token>}{" "}
      {allocatedCurrency && <Token>{allocatedCurrency}</Token>} or be refunded
      if the fundraising is unsuccessful.
    </>
  );

  return (
    <SuccessDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      allowTextButton="Done"
      anotherTextButton="View on Explorer"
      onViewExplorer={onViewExplorer}
    />
  );
}
