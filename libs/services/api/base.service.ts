import { exceptionManager } from "../exception-manager.service";
import { useAuthStore } from "@/libs/stores/auth.store";
import { jwtDecode } from "jwt-decode";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class RefreshTokenError extends Error {
  constructor(message = "Failed to refresh token", public status = 401) {
    super(message);
    this.name = "RefreshTokenError";
  }
}

let refreshTokenPromise: Promise<string | null> | null = null;

export class BaseApiService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  private async refreshTokenIfNeeded(): Promise<string | null> {
    if (refreshTokenPromise) return refreshTokenPromise;

    refreshTokenPromise = new Promise(async (resolve, reject) => {
      try {
        const refreshToken = useAuthStore.getState().jwtRefresher;

        if (!refreshToken) {
          throw new RefreshTokenError("No refresh token available");
        }

        const response = await fetch(`${this.baseURL}/auth/refreshToken`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        if (!response.ok) {
          throw new RefreshTokenError("Token refresh failed", response.status);
        }

        const data = await response.json();
        const newToken = data.jwt;

        if (newToken) {
          useAuthStore.getState().setToken(newToken);
          resolve(newToken);
        } else {
          throw new RefreshTokenError("No JWT in refresh response");
        }
      } catch (error) {
        useAuthStore.getState().logout();
        reject(error);
      } finally {
        refreshTokenPromise = null;
      }
    });

    return refreshTokenPromise;
  }

  private async getValidToken(): Promise<string | null> {
    let token = useAuthStore.getState().jwt;

    if (!token) return null;

    try {
      const { exp } = jwtDecode(token);
      // Refresh if token expires in less than 2 minutes
      if (exp && exp < Math.floor(Date.now() / 1000 + 120)) {
        token = await this.refreshTokenIfNeeded();
      }
    } catch (error) {
      // If token decode fails, try to refresh
      token = await this.refreshTokenIfNeeded();
    }

    return token;
  }

  protected async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    return this.executeRequest<T>(endpoint, options, true);
  }

  private async executeRequest<T>(
    endpoint: string,
    options?: RequestInit,
    showToast = true,
    isRetry = false
  ): Promise<T> {
    try {
      // Get valid token (refresh if needed)
      const token = await this.getValidToken();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options?.headers as Record<string, string>),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        credentials: "include",
        ...options,
        headers,
      });

      if (!response.ok) {
        // Handle 401 errors with token refresh retry
        if (response.status === 401 && !isRetry) {
          try {
            await this.refreshTokenIfNeeded();
            // Retry the request with new token
            return this.executeRequest<T>(endpoint, options, showToast, true);
          } catch (refreshError) {
            // If refresh fails, logout and throw
            useAuthStore.getState().logout();
            throw new RefreshTokenError();
          }
        }

        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        const error = new ApiError(
          errorData.message || `API Error: ${response.statusText}`,
          response.status,
          errorData
        );

        if (showToast) {
          exceptionManager.handleError(error, { showToast: true });
        }
        throw error;
      }

      return response.json();
    } catch (error) {
      if (
        !(error instanceof ApiError) &&
        !(error instanceof RefreshTokenError)
      ) {
        if (showToast) {
          exceptionManager.handleError(error, { showToast: true });
        }
      }
      throw error;
    }
  }

  protected async requestNoToast<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    return this.executeRequest<T>(endpoint, options, false);
  }
}
