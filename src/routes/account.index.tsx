import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { STATUS_FLOW, STATUS_LABEL, useOrdersStore } from "@/store/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { toastSuccess } from "@/lib/alerts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account/")({
  component: OrdersPage,
});

function OrdersPage() {
  const user = useAuthStore((s) => s.user)!;
  const allOrders = useOrdersStore((s) => s.orders);
  const advance = useOrdersStore((s) => s.advance);
  const orders = allOrders.filter((o) => o.userId === user.id);

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl bg-card p-10 text-center ring-1 ring-border">
        <h2 className="text-3xl font-semibold">No orders yet</h2>
        <p className="mt-2 text-muted-foreground">Delivered pieces unlock in your digital closet.</p>
        <Button asChild variant="pill" size="lg" className="mt-6"><Link to="/shop">Start shopping</Link></Button>
      </div>
    );
  }

  const onAdvance = async (id: string) => {
    const updated = await advance(id);
    if (updated?.status === "delivered") void toastSuccess("Delivered!", "New pieces unlocked in your closet.");
  };

  return (
    <ul className="space-y-5">
      {orders.map((o) => {
        const step = STATUS_FLOW.indexOf(o.status);
        return (
          <li key={o.id} className="rounded-3xl bg-card p-6 ring-1 ring-border">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-xl font-semibold">{o.id}</p>
              <p className="text-sm text-muted-foreground">{formatDate(o.createdAt)} · {formatPrice(o.total)}</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {o.items.map((i) => `${i.quantity} × ${i.name} (${i.size})`).join(", ")}
            </p>
            <ol className="mt-6 grid grid-cols-4 gap-2">
              {STATUS_FLOW.map((s, idx) => (
                <li key={s} className="text-center">
                  <span data-done={idx <= step} className="mx-auto grid size-8 place-items-center rounded-full bg-secondary text-muted-foreground data-[done=true]:bg-foreground data-[done=true]:text-background">
                    {idx <= step ? <Check className="size-4" /> : idx + 1}
                  </span>
                  <span className="mt-2 block text-xs font-semibold">{STATUS_LABEL[s]}</span>
                </li>
              ))}
            </ol>
            {o.status !== "delivered" && (
              <div className="mt-6 flex justify-end">
                <Button variant="pill-outline" size="sm" onClick={() => void onAdvance(o.id)}>
                  Simulate next step
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
