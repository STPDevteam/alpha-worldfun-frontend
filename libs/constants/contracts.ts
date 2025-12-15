import { base, baseSepolia } from "viem/chains";
import {
  AweFactoryABI,
  AweBondingCurvePoolABI,
  AweDaoPoolABI,
  TOKEN,
  EventEmitter,
} from "../abi";

const getAweTokenAddress = (chainId: number): string => {
  const envToken = process.env.NEXT_PUBLIC_AWE_TOKEN;

  if (envToken) {
    return envToken;
  }

  return chainId === base.id
    ? "0x1b4617734c43f6159f3a70b7e06d883647512778" // Base mainnet
    : "0x23cfd3288ab3ab20ff0dd2d111e030e0d467a147"; // Base Sepolia testnet
};

// Contract addresses
export const CONTRACT_ADDRESSES = {
  [base.id]: {
    FACTORY: "0x29913970D376cEbbE9Fb9333c22270A4b6d42813",
    AWE_TOKEN: getAweTokenAddress(base.id),
  },
  [baseSepolia.id]: {
    FACTORY: "0x2f35B54C2A91564E0F9fD53C785A759a317B8f58",
    AWE_TOKEN: getAweTokenAddress(baseSepolia.id),
  },
} as const;

// ABI Constants
export const FACTORY_ABI = AweFactoryABI.abi;
export const AWE_FACTORY_ABI = AweFactoryABI.abi;
export const AWE_BONDING_CURVE_POOL_ABI = AweBondingCurvePoolABI.abi;
export const AWE_DAO_POOL_ABI = AweDaoPoolABI.abi;
export const TOKEN_ABI = TOKEN.abi;
export const EVENT_EMITTER_ABI = EventEmitter.abi;

// Chain configuration
export const SUPPORTED_CHAINS = {
  BASE: base.id,
  BASE_SEPOLIA: baseSepolia.id,
} as const;

export const TARGET_FUNDRAISE = 100000;
