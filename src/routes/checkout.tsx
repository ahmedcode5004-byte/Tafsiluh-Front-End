import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { cartSubtotal, useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useOrdersStore } from "@/store/orders";
import { formatPrice, shippingFor } from "@/lib/format";
import { alertSuccess, alertWarning } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequireAuth } from "@/components/site/RequireAuth";
import type { PaymentMethod } from "@/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — تفصيله" },
      { name: "description", content: "Complete your تفصيله order." },
      { property: "og:title", content: "Checkout — تفصيله" },
      { property: "og:description", content: "Complete your تفصيله order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth reason="Sign in to check out.">
      <Checkout />
    </RequireAuth>
  ),
});

function Checkout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user)!;
  const { items, clear } = useCartStore();
  const placeOrder = useOrdersStore((s) => s.placeOrder);
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [busy, setBusy] = useState(false);
  const subtotal = cartSubtotal(items);
  const shippingFee = shippingFor(subtotal);

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-4xl font-semibold">Nothing to check out</h1>
        <Link to="/shop" className="mt-6 inline-block font-semibold underline">Back to shop</Link>
      </div>
    );
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const shipping = {
      fullName: f["fullName"] ?? "", phone: f["phone"] ?? "", address: f["address"] ?? "",
      city: f["city"] ?? "", postalCode: f["postalCode"] ?? "", country: f["country"] ?? "",
    };
    if (Object.values(shipping).some((v) => !v.trim())) {
      void alertWarning("Missing details", "Please fill in every shipping field.");
      return;
    }
    setBusy(true);
    const order = await placeOrder({ userId: user.id, items, subtotal, shippingFee, total: subtotal + shippingFee, shipping, payment });
    clear();
    setBusy(false);
    await alertSuccess("Order confirmed successfully", `Order <b>${order.id}</b> is on its way. Delivered pieces unlock in your closet.`);
    void navigate({ to: "/account" });
  };

  return (
    <form onSubmit={submit} className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <h1 className="text-5xl font-semibold">Checkout</h1>
        <Input name="fullName" placeholder="Full name" defaultValue={`${user.firstName} ${user.lastName}`} />
        <Input name="phone" placeholder="Phone" defaultValue={user.phone} />
        <Input name="address" placeholder="Street address" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input name="city" placeholder="City" />
          <Input name="postalCode" placeholder="Postal code" />
          <Input name="country" placeholder="Country" />
        </div>
        <p className="pt-4 text-sm font-semibold">Payment</p>
        <div className="flex gap-2">
          {(["card", "cod"] as const).map((p) => (
            <button key={p} type="button" onClick={() => setPayment(p)} data-active={payment === p} className="rounded-full border px-4 py-2 text-sm font-semibold data-[active=true]:bg-foreground data-[active=true]:text-background">
              {p === "card" ? "Card" : "Cash on delivery"}
            </button>
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-3xl bg-card p-6 ring-1 ring-border">
        {items.map((i) => (
          <div key={i.lineId} className="flex justify-between py-1 text-sm"><span>{i.quantity} × {i.name} ({i.size})</span><span>{formatPrice(i.price * i.quantity)}</span></div>
        ))}
        <div className="mt-4 flex justify-between border-t pt-4 font-display text-xl font-semibold"><span>Total</span><span>{formatPrice(subtotal + shippingFee)}</span></div>
        <Button variant="pill" size="xl" className="mt-6 w-full" disabled={busy}>{busy ? "Placing order…" : "Place order"}</Button>
      </aside>
    </form>
  );
}
