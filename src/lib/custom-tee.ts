import type { CustomDesign, FitChoice, Size } from "@/types";
import type { NewCartItem } from "@/store/cart";

export const CUSTOM_TEE = {
  productId: "custom-tee",
  slug: "custom-tee",
  name: "Custom Garment",
  /** Flat price per custom garment, whatever is printed on it. */
  price: 45,
} as const;

export const customTeePrice = (_design: CustomDesign) => CUSTOM_TEE.price;

export function buildCustomCartItem(input: {
  design: CustomDesign;
  size: Size;
  quantity: number;
  fit: FitChoice;
}): NewCartItem {
  const category = input.design.garmentCategory ?? "tshirt";
  const names = {
    tshirt: "Custom T-Shirt",
    hoodie: "Custom Hoodie",
    sweatshirt: "Custom Sweatshirt",
  };

  return {
    productId: CUSTOM_TEE.productId,
    slug: CUSTOM_TEE.slug,
    name: names[category],
    category,
    price: customTeePrice(input.design),
    color: input.design.baseColor,
    size: input.size,
    quantity: input.quantity,
    fit: input.fit,
    design: input.design,
  };
}
