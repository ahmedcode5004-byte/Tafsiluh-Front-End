import type { CustomDesign, FitChoice, Size } from "@/types";
import type { NewCartItem } from "@/store/cart";

export const CUSTOM_TEE = {
  productId: "custom-tee",
  slug: "custom-tee",
  name: "Custom Tee",
  /** Flat price per custom tee, whatever is printed on it. */
  price: 45,
} as const;

export const customTeePrice = (_design: CustomDesign) => CUSTOM_TEE.price;

export function buildCustomCartItem(input: {
  design: CustomDesign;
  size: Size;
  quantity: number;
  fit: FitChoice;
}): NewCartItem {
  return {
    productId: CUSTOM_TEE.productId,
    slug: CUSTOM_TEE.slug,
    name: CUSTOM_TEE.name,
    category: "tshirt",
    price: customTeePrice(input.design),
    color: input.design.baseColor,
    size: input.size,
    quantity: input.quantity,
    fit: input.fit,
    design: input.design,
  };
}
