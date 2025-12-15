import { z } from "zod";

// Ethereum address validation
const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

// Numeric string validation (for BigInt values from subgraph)
const numericStringSchema = z.string().regex(/^\d+$/, "Invalid numeric string");

// Timestamp validation (Unix timestamp as string)
const timestampSchema = z.string().regex(/^\d+$/, "Invalid timestamp");

// Transaction hash validation
const txHashSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash");

// Base pagination schema
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNextPage: z.boolean(),
      hasPreviousPage: z.boolean(),
    }),
  });

// Core entity schemas
export const subgraphTokenSchema = z.object({
  address: ethereumAddressSchema,
  totalVolume: numericStringSchema,
  totalVolumeUSD: numericStringSchema,
  lpAddress: ethereumAddressSchema.optional(),
  nftId: numericStringSchema.optional(),
  mintToDao: numericStringSchema.optional(),
});

export const subgraphDaoContributorSchema = z.object({
  id: z.string().optional(),
  dao: ethereumAddressSchema.optional(),
  contributor: ethereumAddressSchema.optional(),
  totalAweContributed: numericStringSchema,
  lastContribution: numericStringSchema,
  lastContributedAt: timestampSchema,
  totalTokenClaimed: numericStringSchema,
  lastTokenClaimed: numericStringSchema.optional().nullable(),
  lastTokenClaimedAt: timestampSchema.optional().nullable(),
  totalRefunded: numericStringSchema,
  netContribution: numericStringSchema,
  contributionCount: numericStringSchema,
  refundCount: numericStringSchema,
  totalBought: numericStringSchema,
  totalSold: numericStringSchema,
  buyCount: numericStringSchema,
  sellCount: numericStringSchema,
  firstContributionAt: timestampSchema,
  lastActivityAt: timestampSchema,
});

const subgraphDaoTokenFieldSchema = z
  .union([subgraphTokenSchema, ethereumAddressSchema])
  .nullable();

export const subgraphDaoSchema = z.object({
  id: z.string(),
  address: ethereumAddressSchema,
  daoManager: ethereumAddressSchema,
  supply: numericStringSchema,
  totalSale: numericStringSchema,
  fundraisingGoal: numericStringSchema,
  endTime: timestampSchema,
  isGoalReached: z.boolean(),
  createdAt: timestampSchema.optional(),
  totalAweRaised: numericStringSchema,
  totalContributors: numericStringSchema,
  totalTokenClaimed: numericStringSchema,
  totalTokenClaimers: numericStringSchema,
  totalContributions: numericStringSchema,
  totalRefunds: numericStringSchema,
  totalRefundedAmount: numericStringSchema,
  lpAddress: ethereumAddressSchema.optional(),
  nftId: numericStringSchema.optional().nullable(),
  mintToDao: numericStringSchema.optional().nullable(),
  token: subgraphDaoTokenFieldSchema.optional(),
  contributors: z.array(subgraphDaoContributorSchema),
});

export const subgraphContributionHistorySchema = z.object({
  id: z.string(),
  contributorAddress: ethereumAddressSchema,
  transactionHash: txHashSchema,
  blockNumber: numericStringSchema,
  timestamp: timestampSchema,
  amount: numericStringSchema,
  contributionType: z.enum([
    "CONTRIBUTION",
    "REFUND",
    "BONDING_CURVE_BUY",
    "BONDING_CURVE_SELL",
    "DAO_CLAIMED",
  ]),
  totalContributionsAtTime: numericStringSchema,
  totalAweRaisedAtTime: numericStringSchema,
  contributorTotalAtTime: numericStringSchema,
});

export const subgraphBondingCurveTraderSchema = z.object({
  id: z.string(),
  bondingCurve: z.string().min(1).optional(),
  trader: ethereumAddressSchema,
  totalBought: numericStringSchema,
  totalSold: numericStringSchema,
  totalBuyVolume: numericStringSchema,
  totalSellVolume: numericStringSchema,
  buyCount: numericStringSchema,
  sellCount: numericStringSchema,
  firstTradeAt: timestampSchema,
  lastTradeAt: timestampSchema,
});

export const subgraphBondingCurveSchema = z.object({
  id: z.string(),
  pool: ethereumAddressSchema,
  token: ethereumAddressSchema,
  lpAddress: z.union([ethereumAddressSchema, z.literal("")]).optional(),
  totalBuys: numericStringSchema,
  totalSells: numericStringSchema,
  totalBuyVolume: numericStringSchema,
  totalSellVolume: numericStringSchema,
  totalTokensTraded: numericStringSchema,
  totalVolume: numericStringSchema,
  isActive: z.boolean(),
  createdAt: timestampSchema,
  graduatedAt: z.union([timestampSchema, z.literal("")]).optional(),
  traders: z.array(subgraphBondingCurveTraderSchema).optional(),
});

export const subgraphBondingCurveBuySchema = z.object({
  id: z.string(),
  bondingCurve: z.string().min(1).optional(),
  trader: ethereumAddressSchema,
  buyer: ethereumAddressSchema,
  aweAmount: numericStringSchema,
  tokenAmount: numericStringSchema,
  blockNumber: numericStringSchema,
  blockTimestamp: timestampSchema,
  transactionHash: txHashSchema,
});

export const subgraphBondingCurveSellSchema = z.object({
  id: z.string(),
  bondingCurve: z.string().min(1).optional(),
  trader: ethereumAddressSchema,
  seller: ethereumAddressSchema,
  tokenAmount: numericStringSchema,
  aweAmount: numericStringSchema,
  blockNumber: numericStringSchema,
  blockTimestamp: timestampSchema,
  transactionHash: txHashSchema,
});

// Query filter schemas
export const contributionHistoryFiltersSchema = z.object({
  daoAddress: ethereumAddressSchema.optional(),
  contributorAddress: ethereumAddressSchema.optional(),
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(10).optional(),
});

export const bondingCurveFiltersSchema = z.object({
  tokenAddress: ethereumAddressSchema.optional(),
  traderAddress: ethereumAddressSchema.optional(),
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(10).optional(),
});

export const bondingCurveTradesFiltersSchema = z.object({
  bondingCurveAddress: ethereumAddressSchema.optional(),
  traderAddress: ethereumAddressSchema.optional(),
  tradeType: z.enum(["BUY", "SELL"]).default("BUY").optional(),
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(10).optional(),
});

export const bondingCurveHistoryFiltersSchema = z.object({
  bondingCurveAddress: ethereumAddressSchema.optional(),
  traderAddress: ethereumAddressSchema.optional(),
  tradeType: z.enum(["ALL", "BUY", "SELL"]).default("ALL").optional(),
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(10).optional(),
});

// Response schemas
export const daoResponseSchema = subgraphDaoSchema;

export const contributionHistoryResponseSchema = paginatedResponseSchema(
  subgraphContributionHistorySchema
);

export const bondingCurveResponseSchema = paginatedResponseSchema(
  subgraphBondingCurveSchema
);

export const bondingCurveByPoolResponseSchema = subgraphBondingCurveSchema;

export const bondingCurveTradesResponseSchema = paginatedResponseSchema(
  z.union([subgraphBondingCurveBuySchema, subgraphBondingCurveSellSchema])
);

export const bondingCurveHistoryResponseSchema = paginatedResponseSchema(
  z.union([subgraphBondingCurveBuySchema, subgraphBondingCurveSellSchema])
);

// Export types for use in components
export type SubgraphTokenData = z.infer<typeof subgraphTokenSchema>;
export type SubgraphDaoData = z.infer<typeof subgraphDaoSchema>;
export type SubgraphContributionHistoryData = z.infer<
  typeof subgraphContributionHistorySchema
>;
export type SubgraphBondingCurveData = z.infer<
  typeof subgraphBondingCurveSchema
>;
export type SubgraphBondingCurveBuyData = z.infer<
  typeof subgraphBondingCurveBuySchema
>;
export type SubgraphBondingCurveSellData = z.infer<
  typeof subgraphBondingCurveSellSchema
>;

export type ContributionHistoryFiltersData = z.infer<
  typeof contributionHistoryFiltersSchema
>;
export type BondingCurveFiltersData = z.infer<typeof bondingCurveFiltersSchema>;
export type BondingCurveTradesFiltersData = z.infer<
  typeof bondingCurveTradesFiltersSchema
>;
export type BondingCurveHistoryFiltersData = z.infer<
  typeof bondingCurveHistoryFiltersSchema
>;
