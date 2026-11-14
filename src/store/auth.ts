import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AvatarProfile, User } from "@/types";
import { authService, type RegisterPayload } from "@/services/auth.service";
import { avatarService } from "@/services/avatar.service";
import { configureApiClient } from "@/services/api/client";
import { browserStorage } from "./storage";

interface AuthState {
  user: User | null;
  token: string | null;
  register: (payload: RegisterPayload) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  saveAvatar: (avatar: Omit<AvatarProfile, "updatedAt">) => Promise<void>;
  equip: (key: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      register: async (payload) => {
        const { user, token } = await authService.register(payload);
        set({ user, token });
        return user;
      },
      login: async (email, password) => {
        const { user, token } = await authService.login(email, password);
        set({ user, token });
        return user;
      },
      logout: () => {
        void authService.logout();
        set({ user: null, token: null });
      },
      saveAvatar: async (input) => {
        const current = get().user;
        if (!current) return;
        const avatar = await avatarService.save({ ...input, updatedAt: new Date().toISOString() });
        const user = { ...current, avatar };
        set({ user });
        await authService.saveUser(user);
      },
      equip: (key) => {
        const current = get().user;
        if (!current) return;
        const user = { ...current, equippedKey: key };
        set({ user });
        void authService.saveUser(user);
      },
    }),
    { name: "solstice.session", storage: browserStorage, skipHydration: true },
  ),
);

configureApiClient({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => useAuthStore.setState({ user: null, token: null }),
});
