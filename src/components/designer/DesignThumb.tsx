import type { Category, CustomDesign } from "@/types";
import { GarmentArt } from "@/components/shop/GarmentArt";
import { TeeCanvas } from "./TeeCanvas";

/** Product thumbnail that shows the customer's own design when there is one. */
export function DesignThumb({
  design,
  category,
  color,
  graphic,
}: {
  design?: CustomDesign | undefined;
  category: Category;
  color: string;
  graphic?: string | undefined;
}) {
  if (design) return <TeeCanvas baseColor={design.baseColor.hex} layers={design.layers} />;
  return <GarmentArt category={category} color={color} graphic={graphic} />;
}
