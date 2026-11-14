import { create } from "zustand";
import type { Product, ProductColor, Season, Size } from "@/types";
import { seasonForMonth } from "@/lib/season";
import { useAuthStore } from "./auth";

export type FitRequest =
  | {
      kind: "add";
      product: Product;
      color: ProductColor;
      size: Size;
      quantity: number;
      then: "stay" | "checkout";
    }
  | { kind: "increment"; lineId: string };

type AuthView = "login" | "signup";

interface UIState {
  hydrated: boolean;
  season: Season;
  setSeason: (season: Season) => void;
  authOpen: boolean;
  authView: AuthView;
  authReason: string | null;
  pendingFit: FitRequest | null;
  fitRequest: FitRequest | null;
  openAuth: (view?: AuthView, reason?: string | null) => void;
  closeAuth: () => void;
  /** Gate every cart action: guests get the auth modal, members get the smart sizing prompt. */
  requestFit: (req: FitRequest) => void;
  resumePending: () => void;
  closeFit: () => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  hydrated: false,
  season: seasonForMonth(new Date().getMonth()),
  setSeason: (season) => set({ season }),
  authOpen: false,
  authView: "login",
  authReason: null,
  pendingFit: null,
  fitRequest: null,
  openAuth: (view = "login", reason = null) => set({ authOpen: true, authView: view, authReason: reason }),
  closeAuth: () => set({ authOpen: false, authReason: null }),
  requestFit: (req) => {
    if (!useAuthStore.getState().user) {
      set({
        pendingFit: req,
        authOpen: true,
        authView: "signup",
        authReason: "Create an account or sign in to add pieces to your bag.",
      });
      return;
    }
    set({ fitRequest: req });
  },
  resumePending: () => {
    const pending = get().pendingFit;
    if (pending) set({ fitRequest: pending, pendingFit: null });
  },
  closeFit: () => set({ fitRequest: null }),
}));
