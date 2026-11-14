import { motion } from "framer-motion";
import type { Category } from "@/types";
import { isLight, shade } from "@/lib/color";
import { cn } from "@/lib/utils";

interface Props {
  category: Category;
  color: string;
  graphic?: string | undefined;
  className?: string;
}

const SHAPES: Record<Category, string> = {
  tshirt:
    "M72 34 Q100 50 128 34 L170 54 L156 92 L138 84 L139 196 Q100 202 61 196 L62 84 L44 92 L30 54 Z",
  sweatshirt:
    "M72 34 Q100 48 128 34 L164 46 Q176 92 186 160 L164 166 L141 90 L141 186 Q100 192 59 186 L59 90 L36 166 L14 160 Q24 92 36 46 Z",
  hoodie:
    "M70 36 Q100 54 130 36 L166 48 Q178 94 188 164 L166 170 L143 92 L143 192 Q100 198 57 192 L57 92 L34 170 L12 164 Q22 94 34 48 Z",
};

/** Flat-lay product illustration, coloured from product data. */
export function GarmentArt({ category, color, graphic, className }: Props) {
  const dark = shade(color, 80);
  const ink = isLight(color) ? "var(--ink)" : "var(--ink-foreground)";
  return (
    <motion.svg
      viewBox="0 0 200 220"
      className={cn("h-full w-full drop-shadow-[0_18px_22px_rgba(0,0,0,0.12)]", className)}
      aria-hidden
      key={color + category}
      initial={{ opacity: 0.4, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {category === "hoodie" && (
        <path d="M68 38 Q66 6 100 4 Q134 6 132 38 Q118 30 100 52 Q82 30 68 38 Z" style={{ fill: dark }} />
      )}
      <path d={SHAPES[category]} style={{ fill: color }} />
      {/* neck */}
      {category === "hoodie" ? (
        <>
          <path d="M70 37 Q100 64 130 37" fill="none" style={{ stroke: dark }} strokeWidth={6} />
          <path d="M94 52 L92 84 M106 52 L108 88" style={{ stroke: dark }} strokeWidth={2.4} strokeLinecap="round" />
          <path d="M70 192 L78 140 L122 140 L130 192" fill="none" style={{ stroke: dark }} strokeWidth={2.2} />
        </>
      ) : (
        <path d="M72 35 Q100 54 128 35" fill="none" style={{ stroke: dark }} strokeWidth={5} />
      )}
      {category !== "tshirt" && (
        <>
          <path d={category === "hoodie" ? "M57 182 L143 182 L143 192 Q100 198 57 192 Z" : "M59 176 L141 176 L141 186 Q100 192 59 186 Z"} style={{ fill: dark }} />
          <path d={category === "hoodie" ? "M12 164 L34 170 L37 158 L15 152 Z" : "M14 160 L36 166 L39 154 L17 148 Z"} style={{ fill: dark }} />
          <path d={category === "hoodie" ? "M188 164 L166 170 L163 158 L185 152 Z" : "M186 160 L164 166 L161 154 L183 148 Z"} style={{ fill: dark }} />
        </>
      )}
      {category === "sweatshirt" && <path d="M95 46 L100 56 L105 46" fill="none" style={{ stroke: dark }} strokeWidth={2.4} />}
      {category === "tshirt" && (
        <>
          <path d="M44 92 L48 82 M156 92 L152 82" style={{ stroke: dark }} strokeWidth={2} opacity={0.6} />
        </>
      )}
      {graphic && (
        <text
          x={100}
          y={category === "hoodie" ? 118 : 102}
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontWeight={800}
          fontSize={Math.min(22, 120 / Math.max(4, graphic.length * 0.62))}
          letterSpacing="0.05em"
          fill={ink}
        >
          {graphic}
        </text>
      )}
    </motion.svg>
  );
}
