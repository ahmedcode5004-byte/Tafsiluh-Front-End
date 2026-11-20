import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { RequireAuth } from "@/components/site/RequireAuth";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account — تفصيله" },
      { name: "description", content: "Your orders, avatar and digital closet at تفصيله." },
      { property: "og:title", content: "My account — تفصيله" },
      { property: "og:description", content: "Your orders, avatar and digital closet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth reason="Sign in to see your account, avatar and closet.">
      <AccountLayout />
    </RequireAuth>
  ),
});

const tab =
  "rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground";

function AccountLayout() {
  const user = useAuthStore((s) => s.user)!;
  const logout = useAuthStore((s) => s.logout);
  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-season-deep">@{user.username}</p>
          <h1 className="mt-2 text-5xl font-semibold">Hi, {user.firstName}</h1>
        </div>
        <button type="button" onClick={logout} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-destructive">
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
      <nav className="mt-8 flex flex-wrap gap-2 border-b border-border pb-4">
        <Link to="/account" activeOptions={{ exact: true }} className={tab} activeProps={{ className: "!bg-foreground !text-background" }}>Orders</Link>
        <Link to="/account/avatar" className={tab} activeProps={{ className: "!bg-foreground !text-background" }}>Avatar studio</Link>
        <Link to="/account/closet" className={tab} activeProps={{ className: "!bg-foreground !text-background" }}>Digital closet</Link>
        <Link to="/profile/$username" params={{ username: user.username }} className={tab}>Public profile</Link>
      </nav>
      <div className="mt-10">
        <Outlet />
      </div>
    </div>
  );
}
