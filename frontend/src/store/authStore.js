import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMe, login as loginApi, logout as logoutApi } from "../api/auth";
import { tokenStorage } from "../api/client";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      status: "idle",

      async init() {
        if (get().status === "authenticated") return;
        set({ status: "loading" });
        try {
          const { data } = await getMe();
          set({ user: data, role: data.role, status: "authenticated" });
        } catch {
          tokenStorage.clear();
          set({ user: null, role: null, status: "unauthenticated" });
        }
      },

      async login({ email, password, role }) {
        const { data } = await loginApi({ email, password, role });
        // Save the tokens so the request interceptor can attach them
        // manually — this is the piece that makes login survive on
        // mobile browsers that block the cross-site auth cookie.
        tokenStorage.set(data.accessToken, data.refreshToken);
        set({ user: data.user, role, status: "authenticated" });
        return data.user;
      },

      async logout() {
        try {
          await logoutApi();
        } finally {
          tokenStorage.clear();
          set({ user: null, role: null, status: "unauthenticated" });
        }
      },

      updateUser(patch) {
        set((state) => ({ user: { ...state.user, ...patch } }));
      },

      forceLogout() {
        tokenStorage.clear();
        set({ user: null, role: null, status: "unauthenticated" });
      },
    }),
    {
      name: "pulseaid-auth",
      partialize: (state) => ({ user: state.user, role: state.role }),
    }
  )
);

window.addEventListener("auth:expired", () => {
  useAuthStore.getState().forceLogout();
});