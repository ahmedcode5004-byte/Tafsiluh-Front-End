import type { Order, OrderStatus } from "@/types";
import { api } from "./api/client";
import { USE_MOCKS } from "./api/config";
import { ENDPOINTS } from "./api/endpoints";
import { wait } from "./mock/storage";

export type CreateOrderPayload = Omit<Order, "id" | "status" | "createdAt" | "deliveredAt">;

export const ordersService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    if (!USE_MOCKS) return api.post<Order>(ENDPOINTS.orders.create, payload);
    await wait(600);
    return {
      ...payload,
      id: `SOL-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "placed",
      createdAt: new Date().toISOString(),
      deliveredAt: null,
    };
  },
  async updateStatus(order: Order, status: OrderStatus): Promise<Order> {
    if (!USE_MOCKS) return api.patch<Order>(ENDPOINTS.orders.status(order.id), { status });
    await wait(200);
    return { ...order, status, deliveredAt: status === "delivered" ? new Date().toISOString() : order.deliveredAt };
  },
};
