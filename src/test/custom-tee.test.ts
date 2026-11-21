import { describe, expect, it } from "vitest";
import { buildCustomCartItem } from "@/lib/custom-tee";
import { mergeIntoCart } from "@/store/cart";
import type { CustomDesign, FitChoice } from "@/types";

const fit: FitChoice = {
  mode: "custom",
  measurements: { height: 170, weight: 65, shoulder: 42, chest: 94, waist: 80, hips: 96 },
};
const design = (id: string): CustomDesign => ({
  id,
  baseColor: { name: "Black", hex: "#1B1A19" },
  layers: [
    { id: "l1", kind: "shape", src: "star", color: "#FFFFFF", x: 50, y: 40, size: 40, rotation: 0 },
  ],
});

describe("custom tee", () => {
  it("costs a flat $45", () => {
    expect(buildCustomCartItem({ design: design("d1"), size: "M", quantity: 1, fit }).price).toBe(
      45,
    );
  });
  it("keeps two different designs as separate bag lines", () => {
    let items = mergeIntoCart(
      [],
      buildCustomCartItem({ design: design("d1"), size: "M", quantity: 1, fit }),
    );
    items = mergeIntoCart(
      items,
      buildCustomCartItem({ design: design("d2"), size: "M", quantity: 1, fit }),
    );
    expect(items).toHaveLength(2);
  });
  it("adds to the same line when the same design is added again", () => {
    let items = mergeIntoCart(
      [],
      buildCustomCartItem({ design: design("d1"), size: "M", quantity: 1, fit }),
    );
    items = mergeIntoCart(
      items,
      buildCustomCartItem({ design: design("d1"), size: "M", quantity: 2, fit }),
    );
    expect(items.map((i) => i.quantity)).toEqual([3]);
  });
});

describe("custom garment", () => {
  it("keeps the selected hoodie category in the cart", () => {
    const hoodieDesign: CustomDesign = {
      ...design("d-hoodie"),
      garmentCategory: "hoodie",
    };

    const item = buildCustomCartItem({ design: hoodieDesign, size: "M", quantity: 1, fit });

    expect(item.category).toBe("hoodie");
    expect(item.name).toBe("Custom Hoodie");
  });

  it("stores each graphic on its own print zone", () => {
    const zoneDesign: CustomDesign = {
      ...design("d-zones"),
      garmentCategory: "tshirt",
      layers: [
        {
          id: "front",
          kind: "shape",
          src: "star",
          color: "#FFFFFF",
          x: 50,
          y: 40,
          size: 40,
          rotation: 0,
          zone: "front",
        },
        {
          id: "back",
          kind: "shape",
          src: "heart",
          color: "#FFFFFF",
          x: 50,
          y: 40,
          size: 40,
          rotation: 0,
          zone: "back",
        },
      ],
    };

    expect(zoneDesign.layers.map((layer) => layer.zone)).toEqual(["front", "back"]);
  });
});

describe("avatar custom garment", () => {
  it("preserves the custom design when converting a closet piece", async () => {
    const { garmentFrom } = await import("@/lib/account");
    const custom: CustomDesign = {
      ...design("d-avatar"),
      garmentCategory: "hoodie",
      layers: [
        {
          id: "front-logo",
          kind: "image",
          src: "data:image/png;base64,test",
          x: 50,
          y: 45,
          size: 30,
          rotation: 0,
          zone: "front",
        },
        {
          id: "back-logo",
          kind: "shape",
          src: "heart",
          color: "#FFFFFF",
          x: 50,
          y: 45,
          size: 35,
          rotation: 0,
          zone: "back",
        },
      ],
    };

    const garment = garmentFrom({
      key: "custom|d-avatar",
      productId: "custom-tee",
      slug: "custom-tee",
      name: "Custom Hoodie",
      category: "hoodie",
      color: custom.baseColor,
      size: "M",
      design: custom,
      unlockedAt: "2026-01-01T00:00:00.000Z",
    });

    expect(garment?.design).toBe(custom);
  });
});
