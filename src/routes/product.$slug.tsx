import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { productQuery } from "@/services/products.service";
import { CATEGORY_LABELS } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { tint } from "@/lib/color";
import { recommendSize } from "@/lib/sizing";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { GarmentArt } from "@/components/shop/GarmentArt";
import { AvatarFigure } from "@/components/avatar/AvatarFigure";
import { DEFAULT_LOOK } from "@/components/avatar/looks";
import { DEFAULT_MEASUREMENTS } from "@/lib/sizing";
import type { Size } from "@/types";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!product) throw notFound();
    return { name: product.name, description: product.description };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — تفصيله` : "Product — تفصيله" },
      { name: "description", content: loaderData?.description ?? "تفصيله product" },
      { property: "og:title", content: loaderData ? `${loaderData.name} — تفصيله` : "Product — تفصيله" },
      { property: "og:description", content: loaderData?.description ?? "تفصيله product" },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-4xl font-semibold">Product not found</h1>
      <Link to="/shop" className="mt-6 inline-block font-semibold underline">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(slug));
  const user = useAuthStore((s) => s.user);
  const requestFit = useUIStore((s) => s.requestFit);
  const [colorIdx, setColorIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [onAvatar, setOnAvatar] = useState(false);
  if (!product) return null;
  const color = product.colors[colorIdx] ?? product.colors[0]!;
  const m = user?.avatar?.measurements ?? DEFAULT_MEASUREMENTS;
  const size: Size = recommendSize(m);

  const request = (then: "stay" | "checkout") =>
    requestFit({ kind: "add", product, color, size, quantity: qty, then });

  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]" style={{ background: tint(color.hex, 24) }}>
        <div className="absolute inset-[10%]">
          {onAvatar ? (
            <AvatarFigure measurements={m} look={user?.avatar?.look ?? DEFAULT_LOOK} garment={{ key: color.name, category: product.category, color, graphic: product.graphic }} />
          ) : (
            <GarmentArt category={product.category} color={color.hex} graphic={product.graphic} />
          )}
        </div>
        <button type="button" onClick={() => setOnAvatar((v) => !v)} className="absolute bottom-5 left-5 rounded-full bg-card px-4 py-2 text-sm font-semibold shadow-soft">
          {onAvatar ? "Show flat-lay" : "Preview on avatar"}
        </button>
      </div>
      <div className="lg:py-6">
        <p className="eyebrow text-season-deep">{CATEGORY_LABELS[product.category]}</p>
        <h1 className="mt-2 text-5xl font-semibold">{product.name}</h1>
        <p className="mt-3 font-display text-2xl">{formatPrice(product.price)}</p>
        <p className="mt-6 text-muted-foreground">{product.description}</p>
        <p className="mt-8 text-sm font-semibold">Colour · {color.name}</p>
        <div className="mt-2 flex gap-2">
          {product.colors.map((c, i) => (
            <button key={c.name} type="button" aria-label={c.name} onClick={() => setColorIdx(i)} data-active={i === colorIdx} className="size-9 rounded-full border border-foreground/15 ring-offset-2 ring-offset-background data-[active=true]:ring-2 data-[active=true]:ring-foreground" style={{ background: c.hex }} />
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Sizes XS–3XL · {user?.avatar ? `Your avatar suggests ${size}` : "Size is chosen in the next step"}</p>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-foreground/15">
            <button type="button" className="px-4 py-3" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
            <span className="w-6 text-center font-semibold">{qty}</span>
            <button type="button" className="px-4 py-3" onClick={() => setQty((q) => q + 1)} aria-label="Increase">+</button>
          </div>
          <Button variant="pill" size="xl" className="flex-1" onClick={() => request("stay")}>Add to bag</Button>
        </div>
        <Button variant="pill-outline" size="xl" className="mt-3 w-full" onClick={() => request("checkout")}>Buy now</Button>
        <ul className="mt-8 grid grid-cols-2 gap-2 text-sm">
          {product.details.map((d) => <li key={d} className="rounded-xl bg-secondary px-3 py-2">{d}</li>)}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">{product.fabric} · {product.weight}</p>
      </div>
    </div>
  );
}
