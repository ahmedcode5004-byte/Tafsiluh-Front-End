import type { Measurements, Size } from "@/types";

export const SIZE_ORDER: Size[] = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

/** Upper chest bound (cm, exclusive) for each size; 3XL covers everything above. */
const CHEST_LIMITS: Array<[Size, number]> = [
  ["XS", 86],
  ["S", 94],
  ["M", 102],
  ["L", 110],
  ["XL", 118],
  ["XXL", 126],
];

/**
 * Recommend a garment size from body measurements.
 * Chest drives the size; a waist close to (or above) the chest, or very broad
 * shoulders, bumps one size up for comfort.
 */
export function recommendSize(m: Measurements): Size {
  let index = CHEST_LIMITS.findIndex(([, limit]) => m.chest < limit);
  if (index === -1) index = SIZE_ORDER.length - 1;
  const roomy = m.waist >= m.chest - 4 || m.shoulder >= 52;
  if (roomy) index = Math.min(index + 1, SIZE_ORDER.length - 1);
  return SIZE_ORDER[index] ?? "M";
}

export const DEFAULT_MEASUREMENTS: Measurements = {
  height: 175,
  weight: 70,
  shoulder: 44,
  chest: 96,
  waist: 80,
  hips: 98,
};

export const MEASUREMENT_FIELDS: Array<{
  key: keyof Measurements;
  label: string;
  unit: string;
  min: number;
  max: number;
}> = [
  { key: "height", label: "Height", unit: "cm", min: 140, max: 210 },
  { key: "weight", label: "Weight", unit: "kg", min: 40, max: 150 },
  { key: "shoulder", label: "Shoulder", unit: "cm", min: 32, max: 58 },
  { key: "chest", label: "Chest", unit: "cm", min: 70, max: 140 },
  { key: "waist", label: "Waist", unit: "cm", min: 55, max: 135 },
  { key: "hips", label: "Hips", unit: "cm", min: 75, max: 140 },
];

export function clampMeasurements(m: Measurements): Measurements {
  const out = { ...m };
  for (const f of MEASUREMENT_FIELDS) {
    const v = Number(out[f.key]);
    out[f.key] = Number.isFinite(v) ? Math.min(f.max, Math.max(f.min, v)) : DEFAULT_MEASUREMENTS[f.key];
  }
  return out;
}
