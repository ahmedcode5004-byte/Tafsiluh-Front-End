import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { cartCount, useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { SEASON_LABELS } from "@/data/products";

const NAV = [
  { label: "Shop all", to: "/shop", search: {} },
  { label: "T-Shirts", to: "/shop", search: { category: "tshirt" as const } },
  { label: "Hoodies", to: "/shop", search: { category: "hoodie" as const } },
  { label: "Sweatshirts", to: "/shop", search: { category: "sweatshirt" as const } },
];

export function SiteHeader() {
  const user = useAuthStore((s) => s.user);
  const count = useCartStore((s) => cartCount(s.items));
  const { openAuth, season } = useUIStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled}
      className="sticky top-0 z-40 border-b border-transparent bg-background/70 backdrop-blur-xl transition-colors data-[scrolled=true]:border-border"
    >
      <div className="bg-ink text-ink-foreground">
        <div className="container-page flex h-8 items-center justify-center gap-2 text-[0.7rem] font-semibold tracking-wide">
          <span className="size-1.5 rounded-full bg-season" />
          The {SEASON_LABELS[season]} edit is live · Free shipping over $150
        </div>
      </div>
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="font-display text-xl font-extrabold tracking-tight">
            SOLSTICE<span className="text-season">.</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                search={n.search}
                className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                activeOptions={{ includeSearch: true }}
                activeProps={{ className: "!text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          {user ? (
            <Link
              to="/account"
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-secondary"
            >
              <span className="grid size-7 place-items-center rounded-full bg-season text-xs font-bold text-ink">
                {user.firstName.charAt(0)}
              </span>
              <span className="hidden sm:inline">{user.firstName}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-secondary"
            >
              <UserRound className="size-4" />
              <span className="hidden sm:inline">Sign in</span>
            </button>
          )}
          <Link
            to="/cart"
            className="relative grid size-10 place-items-center rounded-full transition hover:bg-secondary"
            aria-label={`Bag, ${count} items`}
          >
            <ShoppingBag className="size-5" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-foreground px-1 text-[0.65rem] font-bold text-background"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full transition hover:bg-secondary md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
            aria-label="Mobile"
          >
            <div className="container-page flex flex-col py-4">
              {NAV.map((n, i) => (
                <motion.div key={n.label} initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <Link to={n.to} search={n.search} className="block py-3 font-display text-2xl font-semibold">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
              {user && (
                <Link to="/account/closet" className="block py-3 font-display text-2xl font-semibold">
                  My closet
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
