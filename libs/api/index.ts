import { useAuthStore } from "@/libs/stores/auth.store";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const authApi = axios.create({
  baseURL: API_URL,
});

// Axios-based token refresh for backward compatibility
let axiosRefreshPromise: Promise<string | null> | null = null;

const axiosRefreshToken = async (): Promise<string | null> => {
  if (axiosRefreshPromise) return axiosRefreshPromise;

  axiosRefreshPromise = new Promise(async (resolve, reject) => {
    try {
      const refreshToken = useAuthStore.getState().jwtRefresher;

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await api.get<{ jwt: string }>("/auth/refreshToken", {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      const newToken = response.data.jwt;

      if (newToken) {
        useAuthStore.getState().setToken(newToken);
        resolve(newToken);
      } else {
        throw new Error("No JWT in refresh response");
      }
    } catch (error) {
      useAuthStore.getState().logout();
      reject(error);
    } finally {
      axiosRefreshPromise = null;
    }
  });

  return axiosRefreshPromise;
};

authApi.interceptors.request.use(async (config) => {
  let token = useAuthStore.getState().jwt;

  if (token) {
    try {
      const { exp } = jwtDecode(token);
      // Refresh if token expires in less than 2 minutes
      if (exp && exp < Math.floor(Date.now() / 1000 + 120)) {
        token = await axiosRefreshToken();
      }
    } catch (error) {
      // If token decode fails, try to refresh
      try {
        token = await axiosRefreshToken();
      } catch (refreshError) {
        useAuthStore.getState().logout();
        throw refreshError;
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry on 401 if not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await axiosRefreshToken();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return authApi(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export { api, authApi };
