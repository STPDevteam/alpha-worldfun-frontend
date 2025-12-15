import { cookieStorage, createStorage, http } from "wagmi";
import { base, baseSepolia } from "@reown/appkit/networks";
import type { Chain } from "viem";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { NETWORK } from "@/libs/constants";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_PROJECT_ID is not defined. Please set it in .env"
  );
}

export const networks: [Chain, ...Chain[]] =
  process.env.NEXT_PUBLIC_NETWORK === NETWORK.MAINNET ? [base] : [baseSepolia];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [process.env.NEXT_PUBLIC_NETWORK == NETWORK.TESTNET
      ? baseSepolia.id
      : base.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
});

export const config = wagmiAdapter.wagmiConfig;
