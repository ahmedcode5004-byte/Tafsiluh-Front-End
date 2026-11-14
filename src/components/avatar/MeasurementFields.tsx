import type { Measurements } from "@/types";
import { MEASUREMENT_FIELDS } from "@/lib/sizing";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Props {
  value: Measurements;
  onChange: (m: Measurements) => void;
  compact?: boolean;
}

export function MeasurementFields({ value, onChange, compact = false }: Props) {
  const set = (key: keyof Measurements, v: number) => onChange({ ...value, [key]: v });

  return (
    <div className={cn("grid gap-x-6", compact ? "grid-cols-2 gap-y-3 sm:grid-cols-3" : "gap-y-5 sm:grid-cols-2")}>
      {MEASUREMENT_FIELDS.map((f) => (
        <label key={f.key} className="block">
          <span className="flex items-baseline justify-between">
            <span className="text-sm font-semibold">{f.label}</span>
            <span className="flex items-baseline gap-1">
              <input
                type="number"
                inputMode="numeric"
                min={f.min}
                max={f.max}
                value={value[f.key]}
                onChange={(e) => set(f.key, Number(e.target.value))}
                onBlur={(e) => set(f.key, Math.min(f.max, Math.max(f.min, Number(e.target.value) || f.min)))}
                className="w-14 rounded-md bg-transparent text-right font-display text-base font-semibold tabular-nums outline-none focus:bg-secondary"
                aria-label={`${f.label} in ${f.unit}`}
              />
              <span className="text-xs text-muted-foreground">{f.unit}</span>
            </span>
          </span>
          {!compact && (
            <Slider
              className="mt-2.5"
              min={f.min}
              max={f.max}
              step={1}
              value={[value[f.key]]}
              onValueChange={(v) => set(f.key, v[0] ?? value[f.key])}
              aria-label={f.label}
            />
          )}
        </label>
      ))}
    </div>
  );
}
