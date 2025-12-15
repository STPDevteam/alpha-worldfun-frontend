import { Text } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/libs/utils";
import { WalletConnectHeader } from "../wallet-connect-button/wallet-connect-header";
import Link from "next/link";
import { ROUTES } from "@/libs/constants";
interface ConnectWalletWarningDialogProps {
  isOpen: boolean;
}

export const ConnectWalletWarningDialog = ({
  isOpen,
}: ConnectWalletWarningDialogProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogOverlay className="bg-black-500 backdrop-blur-sm" />
      <DialogTitle></DialogTitle>
      <DialogContent
        showCloseButton={false}
        title={"You need to connect your wallet to continue"}
        className={cn(
          "bg-[#0D0D0E]",
          "border-2 border-[#1F1F22] rounded-2xl",
          "p-0",
          "shadow-[0px_0px_32px_0px_rgba(11,5,16,0.2)]",
          "w-[343px]",
          "overflow-hidden"
        )}
      >
        <div className="flex flex-col items-center gap-6 p-6 sm:gap-6 sm:p-6 overflow-hidden">
          <Text variant="md" weight="medium" className="text-white">
            Wallet connection is required
          </Text>
          <div className="flex gap-4">
            <Link
              href={ROUTES.home}
              className={cn(
                "px-6 py-2.5",
                "hover:bg-dark-700 bg-[#373C3E]/40",
                "border border-[#656565] rounded-[10px]"
              )}
            >
              <Text variant="reg13" weight="medium" className="text-white uppercase">
                Back
              </Text>
            </Link>
            <WalletConnectHeader />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
