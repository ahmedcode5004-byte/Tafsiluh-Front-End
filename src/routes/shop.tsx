import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productsQuery } from "@/services/products.service";
import { parseShopSearch, type ShopSearch } from "@/lib/shop-search";
import { CATEGORY_LABELS, SEASON_LABELS } from "@/data/products";
import { SIZE_ORDER } from "@/lib/sizing";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Category, Season } from "@/types";

export const Route = createFileRoute("/shop")({
  validateSearch: (raw: Record<string, unknown>): ShopSearch => parseShopSearch(raw),
  head: () => ({
    meta: [
      { title: "Shop all — تفصيله" },
      { name: "description", content: "Browse tees, hoodies and sweatshirts by season and size, XS–3XL." },
      { property: "og:title", content: "Shop all — تفصيله" },
      { property: "og:description", content: "Seasonal tees, hoodies and sweatshirts in every size." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
  component: ShopPage,
});

const chip =
  "rounded-full border border-foreground/15 px-4 py-1.5 text-sm font-semibold transition data-[active=true]:border-foreground data-[active=true]:bg-foreground data-[active=true]:text-background";

function ShopPage() {
  const { data } = useSuspenseQuery(productsQuery());
  const search = Route.useSearch();
  let list = data.filter(
    (p) =>
      (!search.category || p.category === search.category) &&
      (!search.season || p.seasons.includes(search.season)) &&
      (!search.size || p.sizes.includes(search.size)),
  );
  if (search.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (search.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);

  const title = search.category ? CATEGORY_LABELS[search.category] : "Shop all";
  const cats = Object.keys(CATEGORY_LABELS) as Category[];
  const seasons = Object.keys(SEASON_LABELS) as Season[];

  return (
    <div className="container-page py-12">
      <p className="eyebrow text-season-deep">{search.season ? `${SEASON_LABELS[search.season]} edit` : "Collection"}</p>
      <h1 className="mt-2 text-5xl font-semibold md:text-6xl">{title}</h1>

      <div className="mt-8 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Link to="/shop" search={(s: ShopSearch) => { const { category: _c, ...rest } = s; return rest; }} className={chip} data-active={!search.category}>All</Link>
          {cats.map((c) => (
            <Link key={c} to="/shop" search={(s: ShopSearch) => ({ ...s, category: c })} className={chip} data-active={search.category === c}>
              {CATEGORY_LABELS[c]}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/shop" search={(s: ShopSearch) => { const { season: _s, ...rest } = s; return rest; }} className={chip} data-active={!search.season}>All seasons</Link>
          {seasons.map((s) => (
            <Link key={s} to="/shop" search={(cur: ShopSearch) => ({ ...cur, season: s })} className={chip} data-active={search.season === s}>
              {SEASON_LABELS[s]}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZE_ORDER.map((sz) => (
            <Link key={sz} to="/shop" search={(cur: ShopSearch) => (cur.size === sz ? (({ size: _x, ...r }) => r)(cur) : { ...cur, size: sz })} className={chip} data-active={search.size === sz}>
              {sz}
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">{list.length} pieces</p>
      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        {list.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}
