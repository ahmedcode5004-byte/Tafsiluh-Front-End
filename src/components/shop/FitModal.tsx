import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Ruler, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Category, Measurements, ProductColor, Size } from "@/types";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { clampMeasurements, DEFAULT_MEASUREMENTS, recommendSize, SIZE_ORDER } from "@/lib/sizing";
import { formatPrice } from "@/lib/format";
import { tint } from "@/lib/color";
import { toastSuccess } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/site/Modal";
import { MeasurementFields } from "@/components/avatar/MeasurementFields";
import { GarmentArt } from "./GarmentArt";
import { cn } from "@/lib/utils";

interface Summary {
  productId: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  color: ProductColor;
  graphic?: string | undefined;
  size: Size;
  quantity: number;
}

export function FitModal() {
  const navigate = useNavigate();
  const { fitRequest, closeFit } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const incrementWithFit = useCartStore((s) => s.incrementWithFit);

  const summary: Summary | null = useMemo(() => {
    if (!fitRequest) return null;
    if (fitRequest.kind === "add") {
      const p = fitRequest.product;
      return {
        productId: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        price: p.price,
        color: fitRequest.color,
        graphic: p.graphic,
        size: fitRequest.size,
        quantity: fitRequest.quantity,
      };
    }
    const line = items.find((i) => i.lineId === fitRequest.lineId);
    if (!line) return null;
    return { ...line, quantity: 1 };
  }, [fitRequest, items]);

  const avatar = user?.avatar ?? null;
  const [mode, setMode] = useState<"avatar" | "custom">("avatar");
  const [custom, setCustom] = useState<Measurements>(DEFAULT_MEASUREMENTS);
  const [size, setSize] = useState<Size>("M");
  const [touchedSize, setTouchedSize] = useState(false);

  // Reset per request
  useEffect(() => {
    if (!fitRequest) return;
    setMode(avatar ? "avatar" : "custom");
    setCustom(avatar?.measurements ?? DEFAULT_MEASUREMENTS);
    setTouchedSize(false);
  }, [fitRequest]); // eslint-disable-line react-hooks/exhaustive-deps

  const measurements = mode === "avatar" && avatar ? avatar.measurements : clampMeasurements(custom);
  const recommended = recommendSize(measurements);
  const activeSize = touchedSize ? size : recommended;

  const confirm = () => {
    if (!fitRequest || !summary) return;
    const fit = { mode, measurements };
    if (fitRequest.kind === "add") {
      addItem({
        productId: summary.productId,
        slug: summary.slug,
        name: summary.name,
        category: summary.category,
        price: summary.price,
        color: summary.color,
        size: activeSize,
        quantity: summary.quantity,
        fit,
        ...(summary.graphic ? { graphic: summary.graphic } : {}),
      });
      closeFit();
      if (fitRequest.then === "checkout") {
        void navigate({ to: "/checkout" });
      } else {
        void toastSuccess("Added to your bag", `${summary.quantity} × ${summary.name} · ${summary.color.name} · ${activeSize}`);
      }
    } else {
      incrementWithFit(fitRequest.lineId, fit, activeSize);
      closeFit();
      void toastSuccess("Quantity updated", `+1 ${summary.name} · Size ${activeSize}`);
    }
  };

  const goCreateAvatar = () => {
    closeFit();
    void navigate({ to: "/account/avatar" });
  };

  const isBuyNow = fitRequest?.kind === "add" && fitRequest.then === "checkout";

  return (
    <Modal open={!!fitRequest && !!summary} onClose={closeFit} label="Choose your fit" className="sm:max-w-2xl">
      {summary && (
        <div className="p-6 sm:p-9">
          <div className="flex items-center gap-4 pr-10">
            <div className="size-20 shrink-0 rounded-2xl p-2" style={{ background: tint(summary.color.hex, 26) }}>
              <GarmentArt category={summary.category} color={summary.color.hex} graphic={summary.graphic} />
            </div>
            <div className="min-w-0">
              <p className="eyebrow text-season-deep">Smart sizing</p>
              <h2 className="mt-1 truncate text-2xl font-semibold">{summary.name}</h2>
              <p className="text-sm text-muted-foreground">
                {summary.color.name} · {summary.quantity} × {formatPrice(summary.price)}
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm font-semibold">How should we size {summary.quantity > 1 ? "these" : "this"}?</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <OptionCard
              active={mode === "avatar"}
              disabled={!avatar}
              onClick={() => avatar && setMode("avatar")}
              icon={<UserRound className="size-5" />}
              title="Use my saved avatar"
              body={
                avatar
                  ? `Chest ${avatar.measurements.chest} · Waist ${avatar.measurements.waist} · ${avatar.measurements.height} cm`
                  : "You haven't built an avatar yet."
              }
              extra={
                !avatar && (
                  <span
                    role="link"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      goCreateAvatar();
                    }}
                    className="mt-2 inline-block text-xs font-semibold underline underline-offset-4"
                  >
                    Build my avatar →
                  </span>
                )
              }
            />
            <OptionCard
              active={mode === "custom"}
              onClick={() => setMode("custom")}
              icon={<Ruler className="size-5" />}
              title="Enter custom measurements"
              body="Ordering for someone else, or a different fit this time."
            />
          </div>

          <AnimatePresence initial={false}>
            {mode === "custom" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 rounded-2xl bg-secondary/60 p-5">
                  <MeasurementFields value={custom} onChange={setCustom} compact />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold">Size</p>
              <p className="text-xs text-muted-foreground">
                Recommended: <span className="font-semibold text-foreground">{recommended}</span>
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {SIZE_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setTouchedSize(true);
                  }}
                  data-active={activeSize === s}
                  className="relative min-w-12 rounded-xl border border-foreground/15 px-3 py-2 text-sm font-semibold transition data-[active=true]:border-foreground data-[active=true]:bg-foreground data-[active=true]:text-background"
                >
                  {s}
                  {s === recommended && (
                    <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-season" aria-label="recommended" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="pill-outline" size="lg" onClick={closeFit}>
              Cancel
            </Button>
            <Button variant="pill" size="lg" onClick={confirm}>
              {fitRequest?.kind === "increment"
                ? `Add 1 more · ${activeSize}`
                : isBuyNow
                  ? `Buy now · ${activeSize}`
                  : `Add to bag · ${activeSize}`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function OptionCard({
  active,
  disabled,
  onClick,
  icon,
  title,
  body,
  extra,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
  extra?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-disabled={disabled}
      className={cn(
        "rounded-2xl border p-4 text-left transition",
        active ? "border-foreground bg-foreground text-background" : "border-foreground/15 hover:border-foreground/40",
        disabled && "cursor-not-allowed opacity-70",
      )}
    >
      <span className={cn("grid size-9 place-items-center rounded-full", active ? "bg-season text-ink" : "bg-secondary")}>
        {icon}
      </span>
      <span className="mt-3 block font-semibold">{title}</span>
      <span className={cn("mt-1 block text-xs", active ? "text-background/70" : "text-muted-foreground")}>{body}</span>
      {extra}
    </button>
  );
}

