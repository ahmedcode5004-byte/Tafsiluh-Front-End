import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  ImagePlus,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import type { Category, FitMode, Measurements, PrintZone, Size } from "@/types";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useDesignStore } from "@/store/design";
import { useUIStore } from "@/store/ui";
import {
  DESIGN_SHAPES,
  INK_COLORS,
  MAX_LAYERS,
  MAX_UPLOAD_BYTES,
  TEE_COLORS,
} from "@/data/designer";
import { buildCustomCartItem, CUSTOM_TEE } from "@/lib/custom-tee";
import { loadImageForPrint } from "@/lib/image";
import { clampMeasurements, DEFAULT_MEASUREMENTS, recommendSize, SIZE_ORDER } from "@/lib/sizing";
import { formatPrice, uid } from "@/lib/format";
import { alertWarning, confirmAction, confirmDanger } from "@/lib/alerts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MeasurementFields } from "@/components/avatar/MeasurementFields";
import { TeeCanvas } from "@/components/designer/TeeCanvas";

export const Route = createFileRoute("/design")({
  head: () => ({
    meta: [
      { title: "Design your own tee — تفصيله" },
      {
        name: "description",
        content:
          "Pick a colour, add graphics or your own photo, and get a custom T-shirt sized to your body.",
      },
      { property: "og:title", content: "Design your own tee — تفصيله" },
      {
        property: "og:description",
        content: "Build a one-of-a-kind T-shirt with your own graphics and fit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DesignPage,
});

const swatch =
  "size-9 rounded-full border border-foreground/15 ring-offset-2 ring-offset-background transition hover:scale-110 data-[active=true]:ring-2 data-[active=true]:ring-foreground";

function DesignPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const openAuth = useUIStore((s) => s.openAuth);
  const addItem = useCartStore((s) => s.addItem);
  const {
    baseColor,
    garmentCategory,
    layers,
    setColor,
    setCategory,
    addLayer,
    updateLayer,
    removeLayer,
    duplicateLayer,
    moveLayer,
    reset,
  } = useDesignStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ink, setInk] = useState(INK_COLORS[0]!.hex);
  const [mode, setMode] = useState<FitMode | null>(null);
  const [custom, setCustom] = useState<Measurements>(DEFAULT_MEASUREMENTS);
  const [sizeOverride, setSizeOverride] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [activeZone, setActiveZone] = useState<PrintZone>("front");

  // On phones the controls sit below the tee; bring it back into view after adding art.
  const showPreview = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const avatar = user?.avatar ?? null;
  const fitMode: FitMode =
    (mode ?? (avatar ? "avatar" : "custom")) === "avatar" && avatar ? "avatar" : "custom";
  const measurements =
    fitMode === "avatar" && avatar ? avatar.measurements : clampMeasurements(custom);
  const recommended = recommendSize(measurements);
  const size = sizeOverride ?? recommended;
  const selected =
    layers.find((l) => l.id === selectedId && (l.zone ?? "front") === activeZone) ?? null;
  const full = layers.length >= MAX_LAYERS;

  const warnFull = () =>
    void alertWarning(
      "That's a lot of art",
      `A tee can hold up to ${MAX_LAYERS} graphics. Remove one to add another.`,
    );

  const addShape = (shapeId: string) => {
    if (full) return warnFull();
    setSelectedId(
      addLayer({
        kind: "shape",
        src: shapeId,
        color: ink,
        x: 50,
        y: 40,
        size: 40,
        rotation: 0,
        zone: activeZone,
      }),
    );
    showPreview();
  };

  const pickInk = (hex: string) => {
    setInk(hex);
    if (selected?.kind === "shape") updateLayer(selected.id, { color: hex });
  };

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      void alertWarning("That isn't an image", "Upload a PNG, JPG, WEBP or similar picture.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      void alertWarning("Image too large", "Pick an image under 10 MB.");
      return;
    }
    if (full) return warnFull();
    setUploading(true);
    try {
      const src = await loadImageForPrint(file);
      setSelectedId(
        addLayer({ kind: "image", src, x: 50, y: 42, size: 70, rotation: 0, zone: activeZone }),
      );
      showPreview();
    } catch {
      void alertWarning("We couldn't read that image", "Try a different file or take a new photo.");
    } finally {
      setUploading(false);
    }
  };

  const chooseAvatar = async () => {
    if (!user) {
      if (
        await confirmAction(
          "Sign in to use your avatar",
          "Your saved measurements live in your account. Your design stays right here.",
          "Sign in",
        )
      ) {
        openAuth("login", "Sign in to size your custom tee with your avatar.");
      }
      return;
    }
    if (!avatar) {
      if (
        await confirmAction(
          "No avatar yet",
          "Build your avatar once and every order fits. Your design is saved while you're away.",
          "Build my avatar",
        )
      ) {
        void navigate({ to: "/account/avatar" });
      }
      return;
    }
    setMode("avatar");
    setSizeOverride(null);
  };

  const clearDesign = async () => {
    if (layers.length === 0) return;
    if (
      await confirmDanger(
        "Start over?",
        "All graphics and images will be removed from this tee.",
        "Clear design",
      )
    ) {
      reset();
      setSelectedId(null);
    }
  };

  const addToBag = async () => {
    if (!user) {
      if (
        await confirmAction(
          "Sign in to add your design",
          "Create an account or sign in — your design stays right here.",
          "Continue",
        )
      ) {
        openAuth("signup", "Create an account or sign in to add your custom tee to your bag.");
      }
      return;
    }
    if (layers.length === 0) {
      void alertWarning(
        "Your tee is still blank",
        "Add a graphic or upload an image before adding it to your bag.",
      );
      return;
    }
    addItem(
      buildCustomCartItem({
        design: { id: uid("design"), baseColor, garmentCategory, layers },
        size,
        quantity: qty,
        fit: { mode: fitMode, measurements },
      }),
    );
    const goToBag = await confirmAction(
      "Custom design added to your bag",
      `${qty} × ${CUSTOM_TEE.name} · ${baseColor.name} · Size ${size}`,
      "View bag",
      "Keep designing",
      "success",
    );
    if (goToBag) void navigate({ to: "/cart" });
  };

  return (
    <div className="container-page py-12">
      <p className="eyebrow text-season-deep">Design studio</p>
      <h1 className="mt-2 text-5xl font-semibold md:text-6xl">Design your own garment</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Pick a colour, drop on graphics or your own photo, then drag and resize until it feels
        right.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        {/* Canvas */}
        <div ref={previewRef} className="scroll-mt-28 lg:sticky lg:top-28">
          <div className="relative overflow-hidden rounded-[2rem] bg-stage p-6 sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-muted-foreground">Live preview</p>
                <p className="mt-1 font-display text-2xl font-semibold">
                  {baseColor.name} · {formatPrice(CUSTOM_TEE.price)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void clearDesign()}
                disabled={layers.length === 0}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-card hover:text-foreground disabled:opacity-40"
              >
                <RotateCcw className="size-3.5" /> Start over
              </button>
            </div>

            <div
              className="mt-5 grid grid-cols-3 gap-3"
              role="radiogroup"
              aria-label="Garment type"
            >
              {(
                [
                  ["tshirt", "T-shirt"],
                  ["sweatshirt", "Sweatshirt"],
                  ["hoodie", "Hoodie"],
                ] as [Category, string][]
              ).map(([category, label]) => (
                <button
                  key={category}
                  type="button"
                  role="radio"
                  aria-checked={garmentCategory === category}
                  onClick={() => {
                    setCategory(category);
                    if (activeZone.includes("sleeve") && category === "tshirt")
                      setActiveZone("front");
                  }}
                  className="rounded-2xl border px-3 py-2.5 text-sm font-semibold transition data-[active=true]:border-foreground data-[active=true]:bg-foreground data-[active=true]:text-background"
                  data-active={garmentCategory === category}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-[72px_minmax(160px,1fr)_72px] items-center gap-2 sm:grid-cols-[112px_minmax(260px,1fr)_112px] sm:gap-3">
              {(
                [
                  ["left-sleeve", "Left sleeve"],
                  ["right-sleeve", "Right sleeve"],
                ] as [PrintZone, string][]
              ).map(([zone, label], index) => (
                <div
                  key={zone}
                  role="button"
                  tabIndex={garmentCategory === "tshirt" ? -1 : 0}
                  aria-pressed={activeZone === zone}
                  aria-disabled={garmentCategory === "tshirt"}
                  onClick={() => {
                    if (garmentCategory !== "tshirt") setActiveZone(zone);
                  }}
                  onKeyDown={(event) => {
                    if (
                      garmentCategory !== "tshirt" &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      setActiveZone(zone);
                    }
                  }}
                  className={cn(
                    "rounded-[1.5rem] border border-border bg-card p-2.5 text-center transition hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                    index === 0 ? "col-start-1 row-start-1" : "col-start-3 row-start-1",
                    activeZone === zone && "ring-2 ring-foreground",
                    garmentCategory === "tshirt" && "pointer-events-none opacity-35",
                  )}
                >
                  <TeeCanvas
                    baseColor={baseColor.hex}
                    category={garmentCategory}
                    zone={zone}
                    layers={layers}
                    editable={activeZone === zone && garmentCategory !== "tshirt"}
                    selectedId={activeZone === zone ? selectedId : null}
                    onSelect={setSelectedId}
                    onChange={updateLayer}
                    className="mx-auto aspect-100/150 w-full max-w-32"
                  />
                  <span className="mt-2 block text-xs font-semibold">{label}</span>
                </div>
              ))}

              <div className="col-start-2 row-start-1 grid gap-4">
                {(["front", "back"] as PrintZone[]).map((zone) => (
                  <div
                    key={zone}
                    role="button"
                    tabIndex={0}
                    aria-pressed={activeZone === zone}
                    onClick={() => setActiveZone(zone)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveZone(zone);
                      }
                    }}
                    className={cn(
                      "rounded-[1.75rem] border border-border bg-card p-3 text-center transition hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                      activeZone === zone && "ring-2 ring-foreground",
                    )}
                  >
                    <TeeCanvas
                      baseColor={baseColor.hex}
                      category={garmentCategory}
                      zone={zone}
                      layers={layers}
                      editable={activeZone === zone}
                      selectedId={activeZone === zone ? selectedId : null}
                      onSelect={setSelectedId}
                      onChange={updateLayer}
                      className="mx-auto w-full max-w-85"
                    />
                    <span className="mt-2 block text-sm font-semibold">
                      {zone === "front" ? "Front view" : "Back view"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-muted-foreground">
              {layers.length === 0
                ? "Add a graphic or upload an image to start."
                : "Drag to move · pull the corner dot to resize · tap outside to deselect"}
            </p>
          </div>

          <AnimatePresence>
            {selected && (
              <motion.div
                key="controls"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 rounded-3xl bg-card p-5 ring-1 ring-border"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    {selected.kind === "image" ? "Your image" : "Graphic"}
                  </p>
                  <div className="flex gap-1">
                    <IconBtn label="Bring forward" onClick={() => moveLayer(selected.id, 1)}>
                      <ArrowUp className="size-4" />
                    </IconBtn>
                    <IconBtn label="Send back" onClick={() => moveLayer(selected.id, -1)}>
                      <ArrowDown className="size-4" />
                    </IconBtn>
                    <IconBtn
                      label="Duplicate"
                      onClick={() =>
                        full ? warnFull() : setSelectedId(duplicateLayer(selected.id))
                      }
                    >
                      <Copy className="size-4" />
                    </IconBtn>
                    <IconBtn
                      label="Delete"
                      danger
                      onClick={() => {
                        removeLayer(selected.id);
                        setSelectedId(null);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </IconBtn>
                  </div>
                </div>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="flex justify-between text-xs font-semibold">
                      <span>Size</span>
                      <span className="text-muted-foreground">{selected.size}%</span>
                    </span>
                    <Slider
                      className="mt-2.5"
                      min={8}
                      max={100}
                      step={1}
                      value={[selected.size]}
                      onValueChange={(v) =>
                        updateLayer(selected.id, { size: v[0] ?? selected.size })
                      }
                      aria-label="Graphic size"
                    />
                  </label>
                  <label className="block">
                    <span className="flex justify-between text-xs font-semibold">
                      <span>Rotation</span>
                      <span className="text-muted-foreground">{selected.rotation}°</span>
                    </span>
                    <Slider
                      className="mt-2.5"
                      min={-180}
                      max={180}
                      step={1}
                      value={[selected.rotation]}
                      onValueChange={(v) =>
                        updateLayer(selected.id, { rotation: v[0] ?? selected.rotation })
                      }
                      aria-label="Graphic rotation"
                    />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="space-y-10">
          <Step n={1} title="Tee colour">
            <div className="flex flex-wrap gap-2.5">
              {TEE_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => setColor(c)}
                  data-active={baseColor.name === c.name}
                  className={swatch}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </Step>

          <Step
            n={2}
            title="Graphics"
            hint="Tap a shape to add it. Pick a print colour first, or recolour a selected shape."
          >
            <div className="flex flex-wrap gap-2">
              {INK_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  aria-label={`Print colour ${c.name}`}
                  title={c.name}
                  onClick={() => pickInk(c.hex)}
                  data-active={ink === c.hex}
                  className={cn(swatch, "size-7")}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {DESIGN_SHAPES.map((s) => (
                <motion.button
                  key={s.id}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => addShape(s.id)}
                  aria-label={`Add ${s.label}`}
                  title={s.label}
                  className="grid aspect-square place-items-center rounded-2xl bg-card p-3 ring-1 ring-border transition hover:ring-foreground/40"
                >
                  <svg viewBox="0 0 100 100" className="size-full text-foreground" aria-hidden>
                    <path d={s.d} fillRule={s.rule} fill="currentColor" />
                  </svg>
                </motion.button>
              ))}
            </div>
          </Step>

          <Step
            n={3}
            title="Your own image"
            hint="Upload from your phone or computer — photos, logos, drawings."
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onUpload(e)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-foreground/20 px-6 py-8 text-sm font-semibold transition hover:border-foreground/50 hover:bg-card disabled:opacity-60"
            >
              <ImagePlus className="size-5" />
              {uploading ? "Preparing your image…" : "Upload an image"}
            </button>
          </Step>

          <Step n={4} title="Fit & size">
            <div className="grid gap-3 sm:grid-cols-2">
              <FitOption
                active={fitMode === "avatar"}
                onClick={() => void chooseAvatar()}
                icon={<UserRound className="size-5" />}
                title="Use saved avatar measurements"
                body={
                  avatar
                    ? `Chest ${avatar.measurements.chest} · Waist ${avatar.measurements.waist} · ${avatar.measurements.height} cm`
                    : user
                      ? "You haven't built an avatar yet."
                      : "Sign in to use your saved avatar."
                }
              />
              <FitOption
                active={fitMode === "custom"}
                onClick={() => {
                  setMode("custom");
                  setSizeOverride(null);
                }}
                icon={<Ruler className="size-5" />}
                title="Enter new custom measurements"
                body="Just for this design — for someone else or a different fit."
              />
            </div>
            <AnimatePresence initial={false}>
              {fitMode === "custom" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-2xl bg-secondary/60 p-5">
                    <MeasurementFields
                      value={custom}
                      onChange={(m) => {
                        setCustom(m);
                        setSizeOverride(null);
                      }}
                      compact
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 flex items-baseline justify-between">
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
                  onClick={() => setSizeOverride(s)}
                  data-active={size === s}
                  className="relative min-w-12 rounded-xl border border-foreground/15 px-3 py-2 text-sm font-semibold transition data-[active=true]:border-foreground data-[active=true]:bg-foreground data-[active=true]:text-background"
                >
                  {s}
                  {s === recommended && (
                    <span
                      className="absolute -right-1 -top-1 size-2.5 rounded-full bg-season"
                      aria-label="recommended"
                    />
                  )}
                </button>
              ))}
            </div>
          </Step>

          <div className="rounded-3xl bg-card p-5 ring-1 ring-border">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center rounded-full border border-foreground/15">
                <button
                  type="button"
                  className="grid size-11 place-items-center"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-6 text-center font-semibold tabular-nums">{qty}</span>
                <button
                  type="button"
                  className="grid size-11 place-items-center"
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <p className="font-display text-2xl font-semibold">
                {formatPrice(CUSTOM_TEE.price * qty)}
              </p>
            </div>
            <Button
              variant="pill"
              size="xl"
              className="mt-4 w-full"
              onClick={() => void addToBag()}
            >
              Add Custom Design to Cart · {size}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <span className="grid size-7 place-items-center rounded-full bg-foreground text-xs font-bold text-background">
          {n}
        </span>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {hint && <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function IconBtn({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "grid size-9 place-items-center rounded-full transition hover:bg-secondary",
        danger && "hover:text-destructive",
      )}
    >
      {children}
    </button>
  );
}

function FitOption({
  active,
  onClick,
  icon,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-2xl border p-4 text-left transition",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/15 hover:border-foreground/40",
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-full",
          active ? "bg-season text-ink" : "bg-secondary",
        )}
      >
        {icon}
      </span>
      <p className="mt-3 font-semibold">{title}</p>
      <p className={cn("mt-1 text-xs", active ? "text-background/70" : "text-muted-foreground")}>
        {body}
      </p>
    </button>
  );
}
