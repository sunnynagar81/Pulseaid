import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMe, login as loginApi, logout as logoutApi } from "../api/auth";

/**
 * The JWT itself lives only in an httpOnly cookie — JS can never read it,
 * by design (protects against XSS token theft). What we persist here is
 * just the non-sensitive user profile, purely so a page refresh doesn't
 * flash an empty/logged-out UI for a moment before init() confirms the
 * session. init() always re-validates against the server regardless.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null, // "donor" | "hospital"
      status: "idle", // "idle" | "loading" | "authenticated" | "unauthenticated"

      async init() {
        if (get().status === "authenticated") return; // already confirmed this session
        set({ status: "loading" });
        try {
          const { data } = await getMe();
          set({ user: data, role: data.role, status: "authenticated" });
        } catch {
          set({ user: null, role: null, status: "unauthenticated" });
        }
      },

      async login({ email, password, role }) {
        const { data } = await loginApi({ email, password, role });
        set({ user: data.user, role, status: "authenticated" });
        return data.user;
      },

      async logout() {
        try {
          await logoutApi();
        } finally {
          set({ user: null, role: null, status: "unauthenticated" });
        }
      },

            updateUser(patch) {
        set((state) => ({ user: { ...state.user, ...patch } }));
      },

      forceLogout() {
        set({ user: null, role: null, status: "unauthenticated" });
      },

      // Called by the auth:expired event from api/client.js when a
      // refresh-token attempt fails — the session is truly over.
      forceLogout() {
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