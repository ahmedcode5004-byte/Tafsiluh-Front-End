import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ClosetItem, Order, OrderStatus } from "@/types";
import { ordersService, type CreateOrderPayload } from "@/services/orders.service";
import { browserStorage } from "./storage";

export const STATUS_FLOW: OrderStatus[] = ["placed", "shipped", "out_for_delivery", "delivered"];
export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Order placed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

export const closetKey = (productId: string, colorName: string) => `${productId}|${colorName}`;

/** Items unlock in the digital closet only once their order is delivered. */
export function closetFromOrders(orders: Order[]): ClosetItem[] {
  const map = new Map<string, ClosetItem>();
  for (const order of orders) {
    if (order.status !== "delivered") continue;
    for (const item of order.items) {
      const key = item.design ? `custom|${item.design.id}` : closetKey(item.productId, item.color.name);
      if (map.has(key)) continue;
      const entry: ClosetItem = {
        key,
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        category: item.category,
        color: item.color,
        size: item.size,
        unlockedAt: order.deliveredAt ?? order.createdAt,
      };
      if (item.graphic) entry.graphic = item.graphic;
      if (item.design) entry.design = item.design;
      map.set(key, entry);
    }
  }
  return [...map.values()];
}

interface OrdersState {
  orders: Order[];
  placeOrder: (payload: CreateOrderPayload) => Promise<Order>;
  advance: (orderId: string) => Promise<Order | null>;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      placeOrder: async (payload) => {
        const order = await ordersService.create(payload);
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },
      advance: async (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return null;
        const next = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
        if (!next) return order;
        const updated = await ordersService.updateStatus(order, next);
        set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? updated : o)) }));
        return updated;
      },
    }),
    { name: "solstice.orders", storage: browserStorage, skipHydration: true },
  ),
);
