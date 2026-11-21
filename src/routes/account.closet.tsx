import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { closetFromOrders, useOrdersStore } from "@/store/orders";
import { garmentFrom } from "@/lib/account";
import { tint } from "@/lib/color";
import { formatDate } from "@/lib/format";
import { DEFAULT_MEASUREMENTS } from "@/lib/sizing";
import { Button } from "@/components/ui/button";
import { AvatarFigure } from "@/components/avatar/AvatarFigure";
import { DEFAULT_LOOK } from "@/components/avatar/looks";
import { DesignThumb } from "@/components/designer/DesignThumb";

export const Route = createFileRoute("/account/closet")({
  component: ClosetPage,
});

function ClosetPage() {
  const user = useAuthStore((s) => s.user)!;
  const equip = useAuthStore((s) => s.equip);
  const orders = useOrdersStore((s) => s.orders);
  const closet = closetFromOrders(orders.filter((o) => o.userId === user.id));
  const worn = closet.find((c) => c.key === user.equippedKey) ?? null;
  const [garmentView, setGarmentView] = useState<"front" | "back" | "left-sleeve" | "right-sleeve">(
    "front",
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <div className="h-fit rounded-[2rem] bg-stage p-6 lg:sticky lg:top-24">
        <p className="eyebrow text-muted-foreground">Wearing</p>
        <p className="mt-1 font-display text-xl font-semibold">
          {worn ? `${worn.name} · ${worn.color.name}` : "Nothing yet"}
        </p>
        <div className="mx-auto h-105">
          <AvatarFigure
            measurements={user.avatar?.measurements ?? DEFAULT_MEASUREMENTS}
            look={user.avatar?.look ?? DEFAULT_LOOK}
            garment={garmentFrom(worn)}
            garmentView={garmentView}
          />
        </div>
        {worn?.design && (
          <div
            className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-card p-1.5 ring-1 ring-border sm:grid-cols-4"
            aria-label="Garment view"
          >
            {(
              [
                ["front", "Front"],
                ["back", "Back"],
                ["left-sleeve", "Left sleeve"],
                ["right-sleeve", "Right sleeve"],
              ] as const
            )
              .filter(
                ([view]) =>
                  (view !== "left-sleeve" && view !== "right-sleeve") ||
                  worn?.category !== "tshirt",
              )
              .map(([view, label]) => (
                <button
                  key={view}
                  type="button"
                  aria-pressed={garmentView === view}
                  onClick={() => setGarmentView(view)}
                  className="rounded-xl px-3 py-2 text-xs font-semibold transition data-[active=true]:bg-foreground data-[active=true]:text-background"
                  data-active={garmentView === view}
                >
                  {label}
                </button>
              ))}
          </div>
        )}
      </div>

      {closet.length === 0 ? (
        <div className="grid place-items-center rounded-3xl bg-card p-10 text-center ring-1 ring-border">
          <div>
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary">
              <Lock className="size-5" />
            </span>
            <h2 className="mt-5 text-3xl font-semibold">Your closet is locked</h2>
            <p className="mt-2 text-muted-foreground">
              Pieces unlock here once their order is delivered.
            </p>
            <Button asChild variant="pill" size="lg" className="mt-6">
              <Link to="/account">Track my orders</Link>
            </Button>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-5 xl:grid-cols-3">
          {closet.map((c) => {
            const on = c.key === user.equippedKey;
            return (
              <li key={c.key} className="rounded-3xl bg-card p-4 ring-1 ring-border">
                <div
                  className="aspect-square rounded-2xl p-4"
                  style={{ background: tint(c.color.hex, 24) }}
                >
                  <DesignThumb
                    design={c.design}
                    category={c.category}
                    color={c.color.hex}
                    graphic={c.graphic}
                  />
                </div>
                {c.design && (
                  <span className="mt-3 inline-flex rounded-full bg-season px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink">
                    Custom design
                  </span>
                )}
                <p className="mt-3 font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.color.name} · {c.size} · unlocked {formatDate(c.unlockedAt)}
                </p>
                <Button
                  variant={on ? "pill" : "pill-outline"}
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => equip(on ? null : c.key)}
                >
                  {on ? "Wearing — take off" : "Wear on avatar"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
