import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cartSubtotal, useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { formatPrice, shippingFor } from "@/lib/format";
import { tint } from "@/lib/color";
import { confirmDanger, toastSuccess } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { DesignThumb } from "@/components/designer/DesignThumb";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your bag — تفصيله" },
      { name: "description", content: "Review the pieces in your bag and their fit." },
      { property: "og:title", content: "Your bag — تفصيله" },
      { property: "og:description", content: "Review the pieces in your bag." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, decrement, remove } = useCartStore();
  const requestFit = useUIStore((s) => s.requestFit);
  const subtotal = cartSubtotal(items);
  const shipping = shippingFor(subtotal);

  const removeLine = async (lineId: string, name: string) => {
    if (await confirmDanger("Remove this item?", `${name} will be removed from your bag.`)) {
      remove(lineId);
      void toastSuccess("Item deleted");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-5xl font-semibold">Your bag is empty</h1>
        <Button asChild variant="pill" size="xl" className="mt-8"><Link to="/shop">Start shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="text-5xl font-semibold">Your bag</h1>
        <ul className="mt-8 divide-y divide-border">
          {items.map((i) => (
            <li key={i.lineId} className="flex gap-4 py-5">
              <div className="size-24 shrink-0 rounded-2xl p-2" style={{ background: tint(i.color.hex, 24) }}>
                <DesignThumb design={i.design} category={i.category} color={i.color.hex} graphic={i.graphic} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{i.name}</p>
                <p className="text-sm text-muted-foreground">{i.design ? "Your design · " : ""}{i.color.name} · Size {i.size} · {i.fit.mode === "avatar" ? "Avatar fit" : "Custom fit"}</p>
                <div className="mt-3 flex items-center gap-3">
                  <button type="button" aria-label="Decrease" className="grid size-8 place-items-center rounded-full border" onClick={() => (i.quantity === 1 ? void removeLine(i.lineId, i.name) : decrement(i.lineId))}><Minus className="size-3" /></button>
                  <span className="w-5 text-center font-semibold">{i.quantity}</span>
                  <button type="button" aria-label="Increase" className="grid size-8 place-items-center rounded-full border" onClick={() => requestFit({ kind: "increment", lineId: i.lineId })}><Plus className="size-3" /></button>
                  <button type="button" aria-label="Remove" className="ml-auto text-muted-foreground hover:text-destructive" onClick={() => void removeLine(i.lineId, i.name)}><Trash2 className="size-4" /></button>
                </div>
              </div>
              <p className="font-display font-semibold">{formatPrice(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
      </div>
      <aside className="h-fit rounded-3xl bg-card p-6 ring-1 ring-border">
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        <div className="mt-2 flex justify-between text-sm"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
        <div className="mt-4 flex justify-between border-t pt-4 font-display text-xl font-semibold"><span>Total</span><span>{formatPrice(subtotal + shipping)}</span></div>
        <Button asChild variant="pill" size="xl" className="mt-6 w-full"><Link to="/checkout">Checkout</Link></Button>
      </aside>
    </div>
  );
}
