import type { ProductColor } from "@/types";

export const TEE_COLORS: ProductColor[] = [
  { name: "Black", hex: "#1B1A19" },
  { name: "White", hex: "#F4F2EC" },
  { name: "Navy", hex: "#1F2A44" },
  { name: "Beige", hex: "#D8C7A8" },
  { name: "Olive", hex: "#5E6B3A" },
  { name: "Burgundy", hex: "#6B1F2A" },
  { name: "Heather", hex: "#A7A7A2" },
  { name: "Sun", hex: "#E7AE47" },
  { name: "Sage", hex: "#A9BFA0" },
  { name: "Sky", hex: "#A9C4DA" },
];

/** Print colours for graphics. */
export const INK_COLORS: ProductColor[] = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#141414" },
  { name: "Sun", hex: "#F2B23A" },
  { name: "Coral", hex: "#E5634D" },
  { name: "Sky", hex: "#6FA8DC" },
  { name: "Leaf", hex: "#5D9B5A" },
  { name: "Blush", hex: "#F2A7B8" },
];

function burst(points: number, outer: number, inner: number) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
}

const circle = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;

function flower() {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 6;
    return circle(+(50 + 24 * Math.cos(a)).toFixed(1), +(50 + 24 * Math.sin(a)).toFixed(1), 18);
  });
  return [...petals, circle(50, 50, 16)].join(" ");
}

export interface DesignShape {
  id: string;
  label: string;
  d: string;
  /** evenodd cuts holes (eyes, mouth); nonzero merges overlapping parts. */
  rule: "evenodd" | "nonzero";
}

export const DESIGN_SHAPES: DesignShape[] = [
  { id: "star", label: "Star", rule: "nonzero", d: "M50 5 L61 38 L96 38 L68 59 L79 93 L50 72 L21 93 L32 59 L4 38 L39 38 Z" },
  { id: "heart", label: "Heart", rule: "nonzero", d: "M50 88 C20 66 5 50 5 32 C5 18 16 8 29 8 C39 8 46 14 50 22 C54 14 61 8 71 8 C84 8 95 18 95 32 C95 50 80 66 50 88 Z" },
  { id: "bolt", label: "Bolt", rule: "nonzero", d: "M58 4 L18 56 L46 56 L38 96 L82 40 L54 40 Z" },
  { id: "sun", label: "Sun", rule: "nonzero", d: burst(12, 47, 34) },
  { id: "moon", label: "Moon", rule: "nonzero", d: "M62 8 A42 42 0 1 0 92 70 A34 34 0 1 1 62 8 Z" },
  { id: "smile", label: "Smile", rule: "evenodd", d: `${circle(50, 50, 44)} ${circle(35, 40, 6)} ${circle(65, 40, 6)} M28 58 Q50 84 72 58 Q50 72 28 58 Z` },
  { id: "mountain", label: "Peaks", rule: "nonzero", d: "M2 86 L36 30 L52 54 L66 36 L98 86 Z" },
  { id: "wave", label: "Wave", rule: "nonzero", d: "M2 50 Q18 30 34 50 T66 50 T98 50 L98 72 Q82 52 66 72 T34 72 T2 72 Z" },
  { id: "flower", label: "Flower", rule: "nonzero", d: flower() },
  { id: "diamond", label: "Diamond", rule: "nonzero", d: "M50 4 L92 50 L50 96 L8 50 Z" },
  { id: "arrow", label: "Arrow", rule: "nonzero", d: "M8 40 L60 40 L60 18 L94 50 L60 82 L60 60 L8 60 Z" },
  { id: "dot", label: "Circle", rule: "nonzero", d: circle(50, 50, 44) },
];

export const SHAPE_BY_ID: Record<string, DesignShape> = Object.fromEntries(DESIGN_SHAPES.map((s) => [s.id, s]));

export const MAX_LAYERS = 8;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
