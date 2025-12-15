import { useAuthStore } from "@/libs/stores";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useAppKit, useDisconnect } from "@reown/appkit/react";
import { useSignInWallet } from "@/libs/hooks/use-sign-in-wallet";

export const useWalletConnectButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  useSignInWallet();

  async function handleConnectWallet() {
    if (!isConnected) {
      setIsLoading(true);
      try {
        open();
      } catch (error) {
        console.error("Failed to open wallet connection:", error);
      }
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

  return {
    isLoading,
    handleConnectWallet,
    handleDisconnectWallet,
    address,
  };
};
