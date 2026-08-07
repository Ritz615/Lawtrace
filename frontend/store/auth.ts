"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthState } from "@/types";

interface AuthStore extends AuthState {
  login: (user: User, access_token: string, refresh_token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      isAuthenticated: false,

      login: (user, access_token, refresh_token) =>
        set({ user, access_token, refresh_token, isAuthenticated: true }),

      logout: () => {
        set({ user: null, access_token: null, refresh_token: null, isAuthenticated: false });
        window.location.href = "/auth/login";
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "lexai-auth",
      partialize: (state) => ({
        user: state.user,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
