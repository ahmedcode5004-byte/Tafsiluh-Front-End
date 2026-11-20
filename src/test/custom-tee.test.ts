import { describe, expect, it } from "vitest";
import { buildCustomCartItem } from "@/lib/custom-tee";
import { mergeIntoCart } from "@/store/cart";
import type { CustomDesign, FitChoice } from "@/types";

const fit: FitChoice = { mode: "custom", measurements: { height: 170, weight: 65, shoulder: 42, chest: 94, waist: 80, hips: 96 } };
const design = (id: string): CustomDesign => ({
  id,
  baseColor: { name: "Black", hex: "#1B1A19" },
  layers: [{ id: "l1", kind: "shape", src: "star", color: "#FFFFFF", x: 50, y: 40, size: 40, rotation: 0 }],
});

describe("custom tee", () => {
  it("costs a flat $45", () => {
    expect(buildCustomCartItem({ design: design("d1"), size: "M", quantity: 1, fit }).price).toBe(45);
  });
  it("keeps two different designs as separate bag lines", () => {
    let items = mergeIntoCart([], buildCustomCartItem({ design: design("d1"), size: "M", quantity: 1, fit }));
    items = mergeIntoCart(items, buildCustomCartItem({ design: design("d2"), size: "M", quantity: 1, fit }));
    expect(items).toHaveLength(2);
  });
  it("adds to the same line when the same design is added again", () => {
    let items = mergeIntoCart([], buildCustomCartItem({ design: design("d1"), size: "M", quantity: 1, fit }));
    items = mergeIntoCart(items, buildCustomCartItem({ design: design("d1"), size: "M", quantity: 2, fit }));
    expect(items.map((i) => i.quantity)).toEqual([3]);
  });
});
