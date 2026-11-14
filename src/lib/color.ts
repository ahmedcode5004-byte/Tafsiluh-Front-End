/** Relative luminance check for garment hex colours (product data). */
export function isLight(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

export const shade = (hex: string, pct = 78) => `color-mix(in oklab, ${hex} ${pct}%, black)`;
export const tint = (hex: string, pct = 16) => `color-mix(in oklab, ${hex} ${pct}%, var(--card))`;
