import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Ruler, Shirt, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { Category, Season } from "@/types";
import { productsQuery } from "@/services/products.service";
import { profilesService } from "@/services/profiles.service";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { CATEGORY_LABELS, SEASON_LABELS } from "@/data/products";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { GarmentArt } from "@/components/shop/GarmentArt";
import { AvatarFigure, type AvatarGarment } from "@/components/avatar/AvatarFigure";
import { DEFAULT_LOOK } from "@/components/avatar/looks";
import { DEFAULT_MEASUREMENTS } from "@/lib/sizing";
import heroWinter from "@/assets/hero-winter.jpg";
import heroSummer from "@/assets/hero-summer.jpg";
import heroAutumn from "@/assets/hero-autumn.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOLSTICE — Tees, hoodies & sweatshirts for every season" },
      {
        name: "description",
        content: "Shop winter, summer and autumn edits of tees, hoodies and sweatshirts in XS–3XL, sized to your own avatar.",
      },
      { property: "og:title", content: "SOLSTICE — Tees, hoodies & sweatshirts for every season" },
      {
        property: "og:description",
        content: "Seasonal essentials in every size, fitted to your avatar and saved to your digital closet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
  component: HomePage,
});

const HEROES: Record<Season, { image: string; title: string; line: string }> = {
  winter: { image: heroWinter, title: "Built for the cold.", line: "Brushed fleece hoodies and heavy crews in snow, glacier and midnight." },
  summer: { image: heroSummer, title: "Made for the sun.", line: "Boxy heavyweight tees and breezy terry in bone, sand and sea glass." },
  autumn: { image: heroAutumn, title: "Dressed in ember.", line: "Rust, moss and cocoa — layering pieces for the turning season." },
};
const SEASONS: Season[] = ["winter", "summer", "autumn"];

function HomePage() {
  const { data: products } = useSuspenseQuery(productsQuery());
  const season = useUIStore((s) => s.season);
  const seasonal = products.filter((p) => p.seasons.includes(season)).slice(0, 4);

  return (
    <>
      <Hero />
      <QuickFilters />

      <section className="container-page mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-season-deep">The {SEASON_LABELS[season]} edit</p>
            <h2 className="mt-2 text-4xl font-semibold md:text-5xl">In season now</h2>
          </div>
          <Link to="/shop" search={{ season }} className="group flex items-center gap-2 text-sm font-semibold">
            View all {SEASON_LABELS[season].toLowerCase()}
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={season}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4"
          >
            {seasonal.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      <AvatarFeature />
      <Community />
    </>
  );
}

function Hero() {
  const { season, setSeason } = useUIStore();
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => {
      const cur = useUIStore.getState().season;
      setSeason(SEASONS[(SEASONS.indexOf(cur) + 1) % SEASONS.length]!);
    }, 6500);
    return () => clearInterval(t);
  }, [auto, setSeason]);

  const hero = HEROES[season];

  return (
    <section className="container-page pt-4">
      <div className="relative h-[78vh] min-h-[560px] overflow-hidden rounded-[2rem] bg-ink text-ink-foreground md:rounded-[2.5rem]">
        <AnimatePresence initial={false}>
          <motion.img
            key={season}
            src={hero.image}
            alt={`${SEASON_LABELS[season]} collection campaign`}
            width={1600}
            height={1008}
            className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent md:hidden" />

        <div className="relative flex h-full flex-col justify-between p-6 md:p-12">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Season">
            {SEASONS.map((s) => (
              <button
                key={s}
                role="tab"
                aria-selected={season === s}
                onClick={() => {
                  setAuto(false);
                  setSeason(s);
                }}
                className="relative rounded-full px-4 py-2 text-sm font-semibold text-ink-foreground/80 transition hover:text-ink-foreground"
              >
                {season === s && (
                  <motion.span
                    layoutId="season-pill"
                    className="absolute inset-0 rounded-full bg-ink-foreground/15 ring-1 ring-ink-foreground/30 backdrop-blur"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{SEASON_LABELS[s]}</span>
              </button>
            ))}
          </div>

          <div className="max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={season}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="eyebrow text-season">{SEASON_LABELS[season]} 2026</p>
                <h1 className="mt-3 text-5xl font-semibold leading-[0.95] md:text-7xl lg:text-8xl">{hero.title}</h1>
                <p className="mt-5 max-w-md text-base text-ink-foreground/80 md:text-lg">{hero.line}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="season" size="xl">
                <Link to="/shop" search={{ season }}>
                  Shop the {SEASON_LABELS[season]} edit <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="on-ink-outline" size="xl">
                <Link to="/account/avatar">Build your avatar</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const QUICK: Array<{ category: Category; color: string; blurb: string }> = [
  { category: "tshirt", color: "#E7AE47", blurb: "From 34" },
  { category: "hoodie", color: "#B9CADA", blurb: "From 78" },
  { category: "sweatshirt", color: "#A4502C", blurb: "From 68" },
];

function QuickFilters() {
  return (
    <section className="container-page mt-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK.map((q, i) => (
          <motion.div
            key={q.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to="/shop"
              search={{ category: q.category }}
              className="group flex h-full items-center justify-between gap-4 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-border transition hover:-translate-y-1 hover:shadow-lift"
            >
              <div>
                <p className="font-display text-2xl font-semibold">{CATEGORY_LABELS[q.category]}</p>
                <p className="mt-1 text-sm text-muted-foreground">${q.blurb} · XS–3XL</p>
              </div>
              <div className="size-20 shrink-0 transition duration-500 group-hover:rotate-[-6deg] group-hover:scale-110">
                <GarmentArt category={q.category} color={q.color} />
              </div>
            </Link>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/shop"
            className="group flex h-full flex-col justify-between gap-4 rounded-3xl bg-ink p-5 text-ink-foreground transition hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl font-semibold">All sizes</p>
              <ArrowUpRight className="size-5 transition group-hover:rotate-45" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((s) => (
                <span key={s} className="rounded-full border border-ink-foreground/25 px-2.5 py-1 text-xs font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

const SHOWCASE: AvatarGarment[] = [
  { key: "a", category: "hoodie", color: { name: "Glacier", hex: "#B9CADA" } },
  { key: "b", category: "tshirt", color: { name: "Sun", hex: "#E7AE47" }, graphic: "SOLSTICE" },
  { key: "c", category: "sweatshirt", color: { name: "Rust", hex: "#A4502C" } },
];
const SHOWCASE_BODIES = [
  DEFAULT_MEASUREMENTS,
  { height: 162, weight: 58, shoulder: 39, chest: 86, waist: 68, hips: 96 },
  { height: 188, weight: 95, shoulder: 50, chest: 112, waist: 96, hips: 106 },
];

function AvatarFeature() {
  const [i, setI] = useState(0);
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SHOWCASE.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="container-page mt-28">
      <div className="grid overflow-hidden rounded-[2.5rem] bg-ink-gradient text-ink-foreground lg:grid-cols-2">
        <div className="flex flex-col justify-center p-8 md:p-14">
          <p className="eyebrow text-season">Avatar fit engine</p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">Your body. Your avatar. Your size.</h2>
          <p className="mt-5 max-w-md text-ink-muted">
            Enter six measurements once. Your avatar morphs to match, recommends a size for every piece, and wears what you
            buy.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Ruler, t: "Measure", d: "Height, weight, shoulder, chest, waist, hips." },
              { icon: Sparkles, t: "Morph", d: "Watch your avatar reshape in real time." },
              { icon: Shirt, t: "Wear", d: "Delivered pieces unlock in your closet." },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="rounded-2xl bg-ink-foreground/5 p-4 ring-1 ring-ink-foreground/10">
                <Icon className="size-5 text-season" />
                <p className="mt-3 font-semibold">{t}</p>
                <p className="mt-1 text-xs text-ink-muted">{d}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button asChild variant="on-ink" size="xl">
              <Link to="/account/avatar">{user?.avatar ? "Open avatar studio" : "Create my avatar"}</Link>
            </Button>
          </div>
        </div>
        <div className="relative min-h-[460px] bg-ink-foreground/5">
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-season/25 to-transparent" />
          <div className="relative mx-auto h-[520px] max-w-sm py-8">
            <AvatarFigure measurements={SHOWCASE_BODIES[i]!} look={DEFAULT_LOOK} garment={SHOWCASE[i]!} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Community() {
  const profiles = profilesService.listFeatured();
  return (
    <section className="container-page mt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-season-deep">Social wardrobe</p>
          <h2 className="mt-2 text-4xl font-semibold md:text-5xl">Peek inside other closets</h2>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          Every delivered piece unlocks on its owner's avatar. Visit a profile to see how it's worn.
        </p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {profiles.map((p, idx) => {
          const worn = p.closet.find((c) => c.key === p.equippedKey) ?? null;
          return (
            <motion.div
              key={p.username}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.6 }}
            >
              <Link
                to="/profile/$username"
                params={{ username: p.username }}
                className="group flex items-center gap-4 rounded-3xl bg-card p-5 ring-1 ring-border transition hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="h-36 w-24 shrink-0 rounded-2xl bg-stage">
                  <AvatarFigure
                    measurements={p.avatar.measurements}
                    look={p.avatar.look}
                    garment={worn ? { key: worn.key, category: worn.category, color: worn.color, graphic: worn.graphic } : null}
                    idle={false}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-xl font-semibold">{p.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{p.username}</p>
                  <p className="mt-3 text-xs font-semibold">
                    {p.closet.length} pieces unlocked <ArrowRight className="inline size-3 transition group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
