import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useOrdersStore } from "@/store/orders";
import { useUIStore } from "@/store/ui";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AuthModal } from "@/components/site/AuthModal";
import { FitModal } from "@/components/shop/FitModal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow text-season-deep">Lost in the wardrobe</p>
        <h1 className="mt-3 text-7xl font-bold text-foreground">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to the shop
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SOLSTICE — Seasonal tees, hoodies & sweatshirts" },
      {
        name: "description",
        content: "Seasonal tees, hoodies and sweatshirts in XS–3XL, sized to your own avatar.",
      },
      { name: "author", content: "Solstice Supply Co." },
      { property: "og:title", content: "SOLSTICE — Seasonal tees, hoodies & sweatshirts" },
      { property: "og:description", content: "Seasonal tees, hoodies and sweatshirts sized to your own avatar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const season = useUIStore((s) => s.season);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const firstRender = useRef(true);

  useEffect(() => {
    firstRender.current = false;
    // Stores skip hydration so SSR and the first client render match; restore them now.
    void Promise.all([
      useAuthStore.persist.rehydrate(),
      useCartStore.persist.rehydrate(),
      useOrdersStore.persist.rehydrate(),
    ]).then(() => useUIStore.setState({ hydrated: true }));
  }, []);

  useEffect(() => {
    // SweetAlert popups render outside the app wrapper, so mirror the season on <html>.
    document.documentElement.dataset["season"] = season;
  }, [season]);

  return (
    <QueryClientProvider client={queryClient}>
      <div data-season={season} className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader />
        <motion.main
          key={pathname}
          className="flex-1"
          initial={firstRender.current ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Required: nested routes render here. */}
          <Outlet />
        </motion.main>
        <SiteFooter />
        <AuthModal />
        <FitModal />
      </div>
    </QueryClientProvider>
  );
}
