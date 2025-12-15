import { BaseApiService } from "./base.service";
import {
  WorldCard,
  WorldCardFilters,
  TokenStatus,
  TokenType,
  FundraisingType,
} from "@/libs/types/world-card";
import {
  tokenSearchResponseSchema,
  tokenSearchQuerySchema,
  createTokenRequestSchema,
  updateTokenRequestSchema,
  tokenEntitySchema,
  type BackendToken,
  type TokenSearchResponse,
  type TokenSearchQuery,
  type CreateTokenRequest,
  type UpdateTokenRequest,
  type TokenEntity,
} from "@/libs/schemas/world-card.schema";
import { FormDataType } from "@/components/launch-token/form/form-data-type";
import { Hash } from "viem";
import { useAuthStore } from "@/libs/stores/auth.store";
import { DEFAULT_WORLD_IMAGE_SRC, TARGET_FUNDRAISE } from "@/libs/constants";

// Retry configuration interface
interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitterRange?: number;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxAttempts: 5,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  jitterRange: 0.3,
};

export class WorldCardService extends BaseApiService {
  private static readonly DEFAULT_IMAGE_SRC = DEFAULT_WORLD_IMAGE_SRC;

  // Token creation methods
  private getAuthToken(): string | null {
    return useAuthStore.getState().jwt || null;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private calculateDelay(
    attempt: number,
    config: Required<RetryConfig>
  ): number {
    const baseDelay = Math.min(
      config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
      config.maxDelay
    );

    const jitter = baseDelay * config.jitterRange * (Math.random() * 2 - 1);
    return Math.round(baseDelay + jitter);
  }

  private isRetryableError(error: any): boolean {
    if (!error.statusCode) return true;
    if (error.statusCode >= 500) return true;
    if (error.statusCode === 429) return true;
    if (error.statusCode === 408) return true;
    if (error.statusCode === 409) return false;
    if (error.statusCode >= 400 && error.statusCode < 500) return false;

    return false;
  }

  async createToken(
    data: CreateTokenRequest,
    retryConfig?: Partial<RetryConfig>
  ): Promise<TokenEntity> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error(
        "Authentication required. Please login to create tokens."
      );
    }

    const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    let lastError: any;
    const validatedData = createTokenRequestSchema.parse(data);
    const { userId, ...requestData } = validatedData;

    // Attempt creation with retries
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const response = await this.requestNoToast<any>("/tokens", {
          method: "POST",
          body: JSON.stringify(requestData),
          headers: {
            ...this.getAuthHeaders(),
          },
        });

        // Success! Validate and return response
        return tokenEntitySchema.parse(response);
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          console.error("Error is not retryable, stopping retries");
          throw error;
        }

        // If this was the last attempt, throw enhanced error
        if (attempt === config.maxAttempts) {
          console.error("💀 Max retry attempts reached, failing permanently");
          throw new Error(
            `Failed to save token to backend after ${config.maxAttempts} attempts. ` +
              `Original error: ${lastError.message}`
          );
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(attempt, config);

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Should never reach here, but TypeScript needs this
    throw lastError;
  }

  async updateToken(
    id: string,
    updateData: UpdateTokenRequest,
    retryConfig?: Partial<RetryConfig>
  ): Promise<TokenEntity> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error(
        "Authentication required. Please login to update tokens."
      );
    }

    const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    let lastError: any;
    const validatedData = updateTokenRequestSchema.parse(updateData);

    // Attempt update with retries
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const response = await this.requestNoToast<any>(`/tokens/${id}`, {
          method: "PUT",
          body: JSON.stringify(validatedData),
          headers: {
            ...this.getAuthHeaders(),
          },
        });

        // Success! Validate and return response
        return tokenEntitySchema.parse(response);
      } catch (error: any) {
        lastError = error;
        console.error(`Update attempt ${attempt} failed:`, error.message);

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          console.error("Error is not retryable, stopping retries");
          throw error;
        }

        // If this was the last attempt, throw enhanced error
        if (attempt === config.maxAttempts) {
          throw new Error(
            `Failed to update token in backend after ${config.maxAttempts} attempts. ` +
              `Original error: ${lastError.message}`
          );
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(attempt, config);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  transformToCreateRequest(
    formData: FormDataType,
    tokenAddress: string,
    poolAddress?: string,
    endDate?: Date
  ): CreateTokenRequest {
    const tokenTypeMap: Record<string, TokenType> = {
      "world-idea": TokenType.WORLD_IDEA_TOKEN,
      "world-agent": TokenType.WORLD_AGENT,
      "utility-agent": TokenType.UTILITY_AGENT_TOKEN,
    };

    const fundraisingTypeMap: Record<string, FundraisingType> = {
      "fixed-price": FundraisingType.FIXED_PRICE,
      "bonding-curve": FundraisingType.BONDING_CURVE,
    };

    // Build request object with ONLY backend-supported fields
    const request: CreateTokenRequest = {
      // Required fields
      tokenImage: formData.image.data,
      bannerUrl: formData.bannerUrl ?? null,
      tokenSymbol: formData.symbol.trim().toUpperCase(),
      description: formData.description || "",
      tokenType:
        tokenTypeMap[formData.type || "world-idea"] ||
        TokenType.WORLD_IDEA_TOKEN,
      targetFundRaise: TARGET_FUNDRAISE.toString(),
      fundraisingType:
        fundraisingTypeMap[formData.fundraisingType || "fixed-price"] ||
        FundraisingType.FIXED_PRICE,

      // Optional fields - only include if provided
      ...(tokenAddress && { tokenAddress }),
      ...(poolAddress && { poolAddress }),
      ...(formData.name && { tokenName: formData.name.trim() }),
      ...(formData.worldXHandler &&
        formData.worldXHandler.trim() && {
          worldXHandler: formData.worldXHandler.trim(),
        }),
      ...(formData.onchainProfileLink &&
        formData.onchainProfileLink.trim() && {
          onchainProfileLink: formData.onchainProfileLink.trim(),
        }),
      ...(formData.agentId && { agentId: formData.agentId }),
      ...(formData.agentName && { agentName: formData.agentName }),
      ...(formData.xUrl && { xUrl: formData.xUrl }),
      ...(formData.telegramUrl && { telegramUrl: formData.telegramUrl }),
      ...(formData.discordUrl && { discordUrl: formData.discordUrl }),
      ...(formData.websiteUrl && { websiteUrl: formData.websiteUrl }),
      ...(endDate && { endDate: endDate.toISOString() }),
    };

    return request;
  }

  transformToUpdateRequest(
    formData: Partial<FormDataType>
  ): UpdateTokenRequest {
    const tokenTypeMap: Record<string, TokenType> = {
      "world-idea": TokenType.WORLD_IDEA_TOKEN,
      "world-agent": TokenType.WORLD_AGENT,
      "utility-agent": TokenType.UTILITY_AGENT_TOKEN,
    };

    const fundraisingTypeMap: Record<string, FundraisingType> = {
      "fixed-price": FundraisingType.FIXED_PRICE,
      "bonding-curve": FundraisingType.BONDING_CURVE,
    };

    // Build update request object with ONLY provided fields
    const request: UpdateTokenRequest = {};

    // Only include fields that are provided
    if (formData.image?.data) {
      request.tokenImage = formData.image.data;
    }
    if (formData.bannerUrl !== undefined) {
      request.bannerUrl = formData.bannerUrl ?? null;
    }
    if (formData.symbol) {
      request.tokenSymbol = formData.symbol.trim().toUpperCase();
    }
    if (formData.description !== undefined) {
      request.description = formData.description || "";
    }
    if (formData.type) {
      request.tokenType =
        tokenTypeMap[formData.type] || TokenType.WORLD_IDEA_TOKEN;
    }
    if (formData.fundraisingType) {
      request.fundraisingType =
        fundraisingTypeMap[formData.fundraisingType] ||
        FundraisingType.FIXED_PRICE;
    }
    if (formData.name !== undefined) {
      request.tokenName = formData.name ? formData.name.trim() : undefined;
    }
    if (formData.worldXHandler !== undefined) {
      request.worldXHandler = formData.worldXHandler
        ? formData.worldXHandler.trim()
        : undefined;
    }
    if (formData.onchainProfileLink !== undefined) {
      request.onchainProfileLink = formData.onchainProfileLink
        ? formData.onchainProfileLink.trim()
        : undefined;
    }
    if (formData.agentId !== undefined) {
      request.agentId = formData.agentId;
    }
    if (formData.agentName !== undefined) {
      request.agentName = formData.agentName;
    }
    if (formData.xUrl !== undefined) {
      request.xUrl = formData.xUrl;
    }
    if (formData.telegramUrl !== undefined) {
      request.telegramUrl = formData.telegramUrl;
    }
    if (formData.discordUrl !== undefined) {
      request.discordUrl = formData.discordUrl;
    }
    if (formData.websiteUrl !== undefined) {
      request.websiteUrl = formData.websiteUrl;
    }
    if (formData.endDate !== undefined) {
      request.endDate = formData.endDate
        ? formData.endDate.toISOString()
        : undefined;
    }

    return request;
  }

  async createTokenWithBlockchainConfirmation(
    formData: FormDataType,
    tokenAddress: string,
    poolAddress: string,
    endDate: Date,
    transactionHash: Hash
  ): Promise<TokenEntity> {
    const requestData = this.transformToCreateRequest(
      formData,
      tokenAddress,
      poolAddress,
      endDate
    );

    return this.createToken(requestData, {
      maxAttempts: 5,
      initialDelay: 2000,
      maxDelay: 30000,
    });
  }

  /**
   * Get the appropriate image source with fallback logic
   */
  private getImageSrc(tokenImage: string | null | undefined): string {
    if (typeof tokenImage === "string" && tokenImage.trim().length > 0) {
      return tokenImage;
    }
    return WorldCardService.DEFAULT_IMAGE_SRC;
  }

  /**
   * Get the default image source for fallback scenarios
   */
  static getDefaultImageSrc(): string {
    return WorldCardService.DEFAULT_IMAGE_SRC;
  }

  async searchTokens(filters: WorldCardFilters): Promise<TokenSearchResponse> {
    const backendFilters: Partial<TokenSearchQuery> = {
      status: filters.status,
      tokenType: filters.tokenType,
      search: filters.search,
      tokenAddress: filters.tokenAddress,
      userId: filters.userId,
      page: filters.page || 1,
      limit: filters.limit || 12,
    };

    const validatedQuery = tokenSearchQuerySchema.parse(backendFilters);

    const params = new URLSearchParams();
    Object.entries(validatedQuery).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await this.request<any>(
      `/tokens/search?${params.toString()}`
    );

    return tokenSearchResponseSchema.parse(response);
  }

  /**
   * Get featured tokens - latest 3 graduated, top 3 FIXED_PRICE, top 3 BONDING_CURVE
   */
  async getFeaturedTokens(): Promise<TokenSearchResponse> {
    const response = await this.request<any>("/tokens/featured");
    return tokenSearchResponseSchema.parse(response);
  }

  /**
   * Get world detail by ID
   */
  async getWorldById(id: string): Promise<WorldCard> {
    const response = await this.request<BackendToken>(`/tokens/${id}`);
    return this.transformToWorldCard(response);
  }

  transformToWorldCard(backendToken: BackendToken): WorldCard {
    return {
      // Direct backend properties with proper typing
      id: backendToken.id,
      userId: backendToken.userId,
      tokenName: backendToken.tokenName,
      tokenAddress: backendToken.tokenAddress,
      poolAddress: backendToken.poolAddress,
      tokenImage: backendToken.tokenImage,
      bannerUrl: backendToken.bannerUrl,
      tokenSymbol: backendToken.tokenSymbol,
      description: backendToken.description,
      worldXHandler: backendToken.worldXHandler,
      onchainProfileLink: backendToken.onchainProfileLink,
      tokenType: backendToken.tokenType,
      status: backendToken.status,
      targetFundRaise: backendToken.targetFundRaise,
      fundraisingType: backendToken.fundraisingType,
      agentId: backendToken.agentId,
      agentName: backendToken.agentName,
      xUrl: backendToken.xUrl,
      telegramUrl: backendToken.telegramUrl,
      discordUrl: backendToken.discordUrl,
      websiteUrl: backendToken.websiteUrl,
      endDate: backendToken.endDate,
      createdAt: backendToken.createdAt,
      updatedAt: backendToken.updatedAt,
      totalAweRaised: backendToken.totalAweRaised,
      graduatedAt: backendToken.graduatedAt,

      // Default marketCap as requested
      marketCap: "0.00",
      marketCapUsd: backendToken.marketCapUsd,

      // Computed properties for backward compatibility
      title: backendToken.tokenName || "",
      backgroundImage: this.getImageSrc(backendToken.tokenImage),
      worldContract: backendToken.tokenAddress || "",
      launchTime: backendToken.createdAt,
    };
  }

  transformToWorldCards(backendTokens: BackendToken[]): WorldCard[] {
    return backendTokens.map((token) => this.transformToWorldCard(token));
  }
}

export const worldCardService = new WorldCardService();

// Legacy exports for backward compatibility (from token.service.ts)
export const tokenService = worldCardService;

export const launchFixedPriceToken = async (data: any) => {
  return worldCardService.createToken(data);
};
