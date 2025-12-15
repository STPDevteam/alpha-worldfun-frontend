"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Text,
} from "@/components/ui";
import { cn, truncateAddress } from "@/libs/utils";
import { useWalletConnectButton } from "@/libs/hooks/wallet/use-wallet-connect-button";

export const WalletConnectHeader = () => {
  const { isLoading, handleConnectWallet, handleDisconnectWallet, address } =
    useWalletConnectButton();

  return (
    <>
      {!address ? (
        <button
          onClick={handleConnectWallet}
          disabled={isLoading}
          className={cn(
            "px-6 py-2.5",
            "hover:bg-dark-700 bg-[#373C3E]/40",
            "border border-[#656565] rounded-[10px]"
          )}
        >
          <Text variant="reg13" className="text-light uppercase tracking-[1.04px]">
            {isLoading ? "Connecting..." : "Connect"}
          </Text>
        </button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "px-6 py-2.5",
                "hover:bg-dark-700 bg-[#373C3E]/40",
                "border border-[#656565] rounded-[10px]",
                "focus:outline-none focus:ring-0 focus:ring-offset-0",
                "focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
            >
              <Text>{truncateAddress(address, 6, 4)}</Text>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-dark-900 border border-dark-700"
          >
            <DropdownMenuItem onClick={handleDisconnectWallet}>
              <Text>Disconnect</Text>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};
