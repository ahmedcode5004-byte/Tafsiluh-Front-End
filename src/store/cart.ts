import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, FitChoice, Size } from "@/types";
import { uid } from "@/lib/format";
import { browserStorage } from "./storage";

export type NewCartItem = Omit<CartItem, "lineId">;

/** Lines merge when product, colour, size, fit (including custom measurements) and design all match. */
export function lineKey(item: Pick<CartItem, "productId" | "color" | "size" | "fit" | "design">) {
  const fit = item.fit.mode === "custom" ? `custom:${JSON.stringify(item.fit.measurements)}` : "avatar";
  // Each custom design is its own line; only the same design merges.
  const design = item.design ? `|design:${item.design.id}` : "";
  return `${item.productId}|${item.color.name}|${item.size}|${fit}${design}`;
}

export function mergeIntoCart(items: CartItem[], incoming: NewCartItem): CartItem[] {
  const key = lineKey(incoming);
  const existing = items.find((i) => lineKey(i) === key);
  if (existing) {
    return items.map((i) => (i === existing ? { ...i, quantity: i.quantity + incoming.quantity } : i));
  }
  return [...items, { ...incoming, lineId: uid("line") }];
}

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity * i.price, 0);

interface CartState {
  items: CartItem[];
  addItem: (item: NewCartItem) => void;
  /** Add one more unit of a line, using the fit chosen in the smart sizing prompt. */
  incrementWithFit: (lineId: string, fit: FitChoice, size: Size) => void;
  decrement: (lineId: string) => void;
  remove: (lineId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: mergeIntoCart(s.items, item) })),
      incrementWithFit: (lineId, fit, size) =>
        set((s) => {
          const line = s.items.find((i) => i.lineId === lineId);
          if (!line) return s;
          const { lineId: _omit, ...rest } = line;
          return { items: mergeIntoCart(s.items, { ...rest, fit, size, quantity: 1 }) };
        }),
      decrement: (lineId) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.lineId === lineId ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        })),
      remove: (lineId) => set((s) => ({ items: s.items.filter((i) => i.lineId !== lineId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "solstice.cart", storage: browserStorage, skipHydration: true },
  ),
);
