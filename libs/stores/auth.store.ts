import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { UserEntity, ProfileEntity } from "@/libs/types/auth";

interface AuthState {
  jwt?: string | null;
  jwtRefresher?: string | null;
  isAuthenticated: boolean;
  user?: UserEntity | null;
  profile?: ProfileEntity | null;
}

type LoginParams = {
  token: string;
  tokenRefersher: string;
  user: UserEntity;
  profile?: ProfileEntity;
};

interface AuthActions {
  login: (params: LoginParams) => void;
  logout: () => void;
  setToken: (token: string) => void;
  setProfile: (profile: Partial<ProfileEntity>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      jwt: null,
      isAuthenticated: false,
      user: null,
      profile: null,

      login: ({ token, tokenRefersher, user, profile }) => {
        set({
          jwt: token,
          jwtRefresher: tokenRefersher,
          isAuthenticated: true,
          user,
          profile,
        });
      },

      logout: () => {
        set({
          jwt: null,
          isAuthenticated: false,
          user: null,
          profile: null,
        });
      },

      setToken: (token: string) => {
        set({ jwt: token, isAuthenticated: true });
      },

      setProfile: (profile) => {
        set({
          profile: { ...get().profile, ...profile },
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        jwt: state.jwt,
        jwtRefresher: state.jwtRefresher,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);
