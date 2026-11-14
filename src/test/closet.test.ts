import { describe, expect, it } from "vitest";
import { closetFromOrders } from "@/store/orders";
import type { CartItem, Order, OrderStatus } from "@/types";

const item: CartItem = {
  lineId: "l1", productId: "p1", slug: "p1", name: "Tee", category: "tshirt", price: 30,
  color: { name: "Sun", hex: "#fff" }, size: "M", quantity: 1,
  fit: { mode: "custom", measurements: { height: 170, weight: 65, shoulder: 42, chest: 94, waist: 80, hips: 96 } },
};
const order = (status: OrderStatus): Order => ({
  id: status, userId: "u", items: [item], subtotal: 30, shippingFee: 8, total: 38, status,
  shipping: { fullName: "a", phone: "1", address: "a", city: "c", postalCode: "1", country: "EG" },
  payment: "card", createdAt: "2026-01-01T00:00:00.000Z", deliveredAt: null,
});

describe("digital closet", () => {
  it("keeps pieces locked until the order is delivered", () => {
    expect(closetFromOrders([order("placed"), order("shipped"), order("out_for_delivery")])).toHaveLength(0);
  });
  it("unlocks pieces once the order is delivered", () => {
    expect(closetFromOrders([order("delivered")]).map((c) => c.productId)).toEqual(["p1"]);
  });
});
