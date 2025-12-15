import { BaseApiService } from "./base.service";

export interface AuthMeResponse {
  id: number;
  role: string;
  name: string;
  blocked: boolean;
  confirmed: boolean;
  username: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  jwtValidFrom: string;
  password: string;
  confirmationHash: string;
  lastLoginAt: string;
  verifyCode: string;
  verifyCodeCount: number;
  verifyCreatedAt: string;
}

export class AuthService extends BaseApiService {
  async getMe(): Promise<AuthMeResponse> {
    // JWT is now automatically added by BaseApiService
    return this.request<AuthMeResponse>("/auth/me");
  }
}

export const authService = new AuthService();
