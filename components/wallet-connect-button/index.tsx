"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Text,
} from "@/components/ui";
import { useAuthStore } from "@/libs/stores";
import { cn, truncateAddress } from "@/libs/utils";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useAppKit, useDisconnect } from "@reown/appkit/react";
import { useSignInWallet } from "@/libs/hooks/use-sign-in-wallet";

export const WalletConnectButton = ({ className }: { className?: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  useSignInWallet();

  async function handleConnectWallet() {
    if (!isConnected) {
      setIsLoading(true);
      open();
    }
    setIsLoading(false);
  }

  const handleDisconnectWallet = async () => {
    setIsLoading(true);
    try {
      disconnect();
      useAuthStore.getState().logout();
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  return (
    <>
      {!address ? (
        <Button
          variant="grey"
          onClick={handleConnectWallet}
          disabled={isLoading}
          className={className}
        >
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "border border-dark-900 rounded-lg",
                "hover:bg-dark-700",
                "focus:outline-none focus:ring-0 focus:ring-offset-0",
                "focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
            >
              <Text>{truncateAddress(address, 6, 4)}</Text>
            </Button>
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
