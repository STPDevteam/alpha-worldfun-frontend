import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useAuthStore } from "../stores";

export const useSignInWallet = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const walletAddress = useAuthStore.getState()?.user?.username;

  useEffect(() => {
    // With AppKit SIWE config, the signing should happen automatically
    // when the wallet connects. We just monitor the state here.
    if (address && walletAddress !== address && isConnected && !isConnecting) {
      // Wallet connected with different address. AppKit SIWE should handle signing automatically.
    }
  }, [address, walletAddress, isConnected, isConnecting]);
};
