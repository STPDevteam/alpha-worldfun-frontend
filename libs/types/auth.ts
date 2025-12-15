export interface UserEntity {
  id: string;
  name: string;
  jwtValidFrom: Date;
  blocked: boolean;
  username: string;
  provider: "USERNAME" | "LOCAL" | "google" | "apple" | "facebook" | "SIWE";
  profileId?: string;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  walletAddress?: string;
}

export interface ProfileEntity {
  id?: number;
  name?: string;
  walletAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
  dob?: string | null;
  avatar?: string | null;
}

export type Session = { user?: UserEntity };
