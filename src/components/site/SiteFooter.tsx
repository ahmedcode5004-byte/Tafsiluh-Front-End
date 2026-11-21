import { Link } from "@tanstack/react-router";
import type { ShopSearch } from "@/lib/shop-search";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="container-page grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl font-extrabold">
            تفصيله<span className="text-season">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-ink-muted">
            Tees, hoodies and sweatshirts for every season — sized to your body, saved to your
            closet.
          </p>
        </div>
        <FooterCol
          title="Shop"
          links={[
            { label: "T-Shirts", to: "/shop", search: { category: "tshirt" as const } },
            { label: "Hoodies", to: "/shop", search: { category: "hoodie" as const } },
            { label: "Sweatshirts", to: "/shop", search: { category: "sweatshirt" as const } },
          ]}
        />
        <FooterCol
          title="Seasons"
          links={[
            { label: "Winter", to: "/shop", search: { season: "winter" as const } },
            { label: "Summer", to: "/shop", search: { season: "summer" as const } },
            { label: "Autumn", to: "/shop", search: { season: "autumn" as const } },
          ]}
        />
        <div>
          <p className="eyebrow text-ink-muted">Members</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/design" className="hover:text-season">
                Design your own tee
              </Link>
            </li>
            <li>
              <Link to="/account" className="hover:text-season">
                My account
              </Link>
            </li>
            <li>
              <Link to="/account/avatar" className="hover:text-season">
                Avatar studio
              </Link>
            </li>
            <li>
              <Link to="/account/closet" className="hover:text-season">
                Digital closet
              </Link>
            </li>
            <li>
              <Link
                to="/profile/$username"
                params={{ username: "lina.m" }}
                className="hover:text-season"
              >
                Community closets
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-page flex flex-col justify-between gap-2 border-t border-ink-foreground/10 py-6 text-xs text-ink-muted sm:flex-row">
        <p>© 2026 تفصيله</p>
        <p>Made for every season.</p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; to: "/shop"; search: ShopSearch }>;
}) {
  return (
    <div>
      <p className="eyebrow text-ink-muted">{title}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} search={l.search} className="hover:text-season">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
