import { motion } from "framer-motion";
import { useState } from "react";
import type { AvatarLook, Measurements } from "@/types";
import { clampMeasurements, DEFAULT_MEASUREMENTS, recommendSize } from "@/lib/sizing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AvatarFigure, type AvatarGarment } from "./AvatarFigure";
import { DEFAULT_LOOK, HAIR_COLORS, HAIR_STYLES, SKIN_TONES } from "./looks";
import { MeasurementFields } from "./MeasurementFields";

interface Props {
  initialMeasurements?: Measurements | undefined;
  initialLook?: AvatarLook | undefined;
  garment?: AvatarGarment | null;
  saveLabel?: string;
  saving?: boolean;
  onSave: (m: Measurements, look: AvatarLook) => void;
  secondaryAction?: { label: string; onClick: () => void } | undefined;
  layout?: "stacked" | "split";
}

export function AvatarStudio({
  initialMeasurements,
  initialLook,
  garment = null,
  saveLabel = "Save avatar",
  saving = false,
  onSave,
  secondaryAction,
  layout = "split",
}: Props) {
  const [m, setM] = useState<Measurements>(initialMeasurements ?? DEFAULT_MEASUREMENTS);
  const [look, setLook] = useState<AvatarLook>(initialLook ?? DEFAULT_LOOK);
  const safe = clampMeasurements(m);
  const size = recommendSize(safe);

  return (
    <div className={cn("grid gap-8", layout === "split" && "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start")}>
      <div className="relative overflow-hidden rounded-[2rem] bg-stage">
        <div className="absolute left-5 top-5 z-10">
          <p className="eyebrow text-muted-foreground">Live preview</p>
          <motion.p
            key={size}
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-1 font-display text-2xl font-semibold"
          >
            Your size · {size}
          </motion.p>
        </div>
        <div className={cn("mx-auto px-6 pb-4 pt-16", layout === "split" ? "h-[440px] lg:h-[560px]" : "h-[360px]")}>
          <AvatarFigure measurements={safe} look={look} garment={garment} />
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold">Body measurements</h3>
          <p className="mt-1 text-sm text-muted-foreground">Drag or type — your avatar reshapes as you go.</p>
          <div className="mt-5">
            <MeasurementFields value={m} onChange={setM} />
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">Skin tone</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SKIN_TONES.map((c) => (
                <Swatch key={c} color={c} active={look.skin === c} onClick={() => setLook({ ...look, skin: c })} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Hair colour</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {HAIR_COLORS.map((c) => (
                <Swatch key={c} color={c} active={look.hair === c} onClick={() => setLook({ ...look, hair: c })} />
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold">Hairstyle</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {HAIR_STYLES.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setLook({ ...look, hairStyle: h.id })}
                  data-active={look.hairStyle === h.id}
                  className="rounded-full border border-foreground/15 px-4 py-1.5 text-sm font-medium transition data-[active=true]:border-foreground data-[active=true]:bg-foreground data-[active=true]:text-background"
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button variant="pill" size="lg" disabled={saving} onClick={() => onSave(safe, look)}>
            {saving ? "Saving…" : saveLabel}
          </Button>
          {secondaryAction && (
            <Button variant="pill-outline" size="lg" type="button" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Swatch({ color, active, onClick }: { color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Colour ${color}`}
      data-active={active}
      className="size-8 rounded-full border border-foreground/10 ring-offset-2 ring-offset-card transition hover:scale-110 data-[active=true]:ring-2 data-[active=true]:ring-foreground"
      style={{ background: color }}
    />
  );
}
