import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Product } from "@/types";
import { CATEGORY_LABELS } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { tint } from "@/lib/color";
import { GarmentArt } from "./GarmentArt";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [colorIdx, setColorIdx] = useState(0);
  const color = product.colors[colorIdx] ?? product.colors[0]!;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-3xl transition-colors duration-500"
          style={{ background: tint(color.hex, 22) }}
        >
          {product.badge && (
            <span className="eyebrow absolute left-4 top-4 z-10 rounded-full bg-card/85 px-3 py-1.5 text-[0.6rem] text-foreground backdrop-blur">
              {product.badge}
            </span>
          )}
          <motion.div
            className="absolute inset-[12%]"
            whileHover={{ scale: 1.06, rotate: -2 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            <GarmentArt category={product.category} color={color.hex} graphic={product.graphic} />
          </motion.div>
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-muted-foreground">{CATEGORY_LABELS[product.category]}</p>
          <Link to="/product/$slug" params={{ slug: product.slug }}>
            <h3 className="mt-1 truncate text-lg font-semibold leading-tight">{product.name}</h3>
          </Link>
        </div>
        <p className="font-display text-lg font-semibold">{formatPrice(product.price)}</p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {product.colors.map((c, i) => (
          <button
            key={c.name}
            type="button"
            aria-label={c.name}
            onClick={() => setColorIdx(i)}
            className="size-5 rounded-full border border-foreground/15 ring-offset-2 ring-offset-background transition data-[active=true]:ring-2 data-[active=true]:ring-foreground"
            data-active={i === colorIdx}
            style={{ background: c.hex }}
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">XS–3XL</span>
      </div>
    </motion.article>
  );
}
