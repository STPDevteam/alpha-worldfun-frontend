import {
  type SIWESession,
  type SIWEVerifyMessageArgs,
  type SIWECreateMessageArgs,
  createSIWEConfig,
  formatMessage,
} from "@reown/appkit-siwe";
import { useAuthStore } from "../stores/auth.store";
import { getAddress } from "ethers";
import { base, baseSepolia } from "viem/chains";
import { NETWORK } from "@/libs/constants";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ACTIVE_CHAIN_ID =
  process.env.NEXT_PUBLIC_NETWORK === NETWORK.MAINNET
    ? base.id
    : baseSepolia.id;

async function getSession() {
  return {
    address: useAuthStore.getState().user?.username,
    chainId: ACTIVE_CHAIN_ID,
  } as SIWESession;
}

const verifyMessage = async ({ message, signature }: SIWEVerifyMessageArgs) => {
  try {
    const response = await fetch(BASE_URL + "/auth/siwe/verify", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: JSON.stringify({ message, signature }),
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    useAuthStore.getState().login({
      token: result.jwt,
      tokenRefersher: result.jwtRefresh,
      user: result.user,
      profile: result.profile,
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: window.location.host,
    uri: window.location.origin,
    chains: [ACTIVE_CHAIN_ID],
    statement: "Please sign with your account",
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) => {
    let ethereumAddress = address;

    if (address && address.startsWith("did:pkh:eip155:")) {
      const parts = address.split(":");
      const rawAddress = parts[parts.length - 1];

      const checksummedAddress = getAddress(rawAddress);

      const didParts = parts.slice(0, -1);
      ethereumAddress = [...didParts, checksummedAddress].join(":");
    }

    return formatMessage(args, ethereumAddress);
  },

  getNonce: async () => {
    const res = await fetch(BASE_URL + "/auth/siwe/nonce", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const nonce = await res.text();
    if (!nonce) {
      throw new Error("Failed to get nonce!");
    }
    return nonce;
  },
  getSession,
  verifyMessage,
  signOut: async () => {
    try {
      // Call backend logout endpoint to destroy session
      await fetch(BASE_URL + "/auth/siwe/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear frontend auth state
    useAuthStore.getState().logout();
    return true;
  },
});
