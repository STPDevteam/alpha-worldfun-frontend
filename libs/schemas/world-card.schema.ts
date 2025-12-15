import { z } from "zod";

import {
  TokenType,
  TokenStatus,
  FundraisingType,
} from "@/libs/types/world-card";

export const tokenTypeSchema = z.nativeEnum(TokenType);
export const tokenStatusSchema = z.nativeEnum(TokenStatus);
export const fundraisingTypeSchema = z.nativeEnum(FundraisingType);

// Schema matching backend TokenEntity exactly
export const backendTokenSchema = z.object({
  id: z
    .union([z.string(), z.number(), z.bigint()])
    .transform((val) => String(val)),
  userId: z
    .union([z.string(), z.number(), z.bigint()])
    .transform((val) => String(val)),
  tokenName: z.string().nullable().optional(),
  tokenAddress: z.string().nullable().optional(),
  poolAddress: z.string().nullable().optional(),
  tokenImage: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  tokenSymbol: z.string(),
  description: z.string().nullable().optional(),
  worldXHandler: z.string().nullable().optional(),
  onchainProfileLink: z.string().nullable().optional(),
  tokenType: tokenTypeSchema,
  status: tokenStatusSchema,
  targetFundRaise: z.string().nullable().optional(),
  fundraisingType: fundraisingTypeSchema,
  agentId: z.string().nullable().optional(),
  agentName: z.string().nullable().optional(),
  xUrl: z.string().nullable().optional(),
  telegramUrl: z.string().nullable().optional(),
  discordUrl: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  totalAweRaised: z.string().nullable().optional(),
  graduatedAt: z.coerce.date().nullable().optional(),
  marketCapUsd: z.string().nullable().optional(),
});

// Response schema matching backend SearchTokenResponseDto
export const tokenSearchResponseSchema = z.object({
  tokens: z.array(backendTokenSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

// Query schema for search parameters
export const tokenSearchQuerySchema = z.object({
  status: tokenStatusSchema.optional(),
  tokenType: tokenTypeSchema.optional(),
  search: z.string().optional(),
  tokenAddress: z.string().optional(),
  userId: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(12),
});

// Create token request schema (for token creation)
export const createTokenRequestSchema = z.object({
  // Optional fields that can be set by backend or provided
  userId: z.union([z.string(), z.number(), z.bigint()]).optional(),
  tokenName: z.string().optional(),
  tokenAddress: z.string().optional(),
  poolAddress: z.string().optional(),

  // Required fields matching backend validation exactly
  tokenImage: z.string().url(),
  bannerUrl: z.string().url().nullable(),
  tokenSymbol: z.string().min(1).max(10),
  description: z.string().max(1000),
  tokenType: tokenTypeSchema,
  targetFundRaise: z.string().regex(/^\d+(\.\d{1,2})?$/),
  fundraisingType: fundraisingTypeSchema,

  // Optional fields - matching backend DTO
  worldXHandler: z.string().url().optional(),
  onchainProfileLink: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  agentId: z.string().optional(),
  agentName: z.string().optional(),
  xUrl: z.string().optional(),
  telegramUrl: z.string().optional(),
  discordUrl: z.string().optional(),
  endDate: z.string().datetime().optional(),
});

// Update token request schema (for token updates - all fields optional)
export const updateTokenRequestSchema = createTokenRequestSchema.partial();

// Token entity schema for responses (based on backend TokenEntity structure)
export const tokenEntitySchema = backendTokenSchema.extend({});

export type BackendToken = z.infer<typeof backendTokenSchema>;
export type TokenSearchResponse = z.infer<typeof tokenSearchResponseSchema>;
export type TokenSearchQuery = z.infer<typeof tokenSearchQuerySchema>;
export type CreateTokenRequest = z.infer<typeof createTokenRequestSchema>;
export type UpdateTokenRequest = z.infer<typeof updateTokenRequestSchema>;
export type TokenEntity = z.infer<typeof tokenEntitySchema>;
