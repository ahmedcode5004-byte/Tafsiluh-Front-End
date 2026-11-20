import { motion, useDragControls, useMotionValue } from "framer-motion";
import { useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import type { DesignLayer } from "@/types";
import { SHAPE_BY_ID } from "@/data/designer";
import { GarmentArt } from "@/components/shop/GarmentArt";
import { cn } from "@/lib/utils";

/** Printable chest area, as % of the tee illustration box. */
const PRINT_AREA = { left: 33, top: 29, width: 34, height: 50 };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

interface Props {
  baseColor: string;
  layers: DesignLayer[];
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onChange?: (id: string, patch: Partial<DesignLayer>) => void;
  className?: string;
}

export function TeeCanvas({ baseColor, layers, editable = false, selectedId = null, onSelect, onChange, className }: Props) {
  const areaRef = useRef<HTMLDivElement>(null);
  const deselect = (e: ReactPointerEvent) => {
    if (editable && e.target === e.currentTarget) onSelect?.(null);
  };

  return (
    <div className={cn("relative aspect-[200/220] w-full select-none", className)} onPointerDown={deselect}>
      <GarmentArt category="tshirt" color={baseColor} className="pointer-events-none absolute inset-0" />
      <div
        ref={areaRef}
        onPointerDown={deselect}
        className={cn("absolute", editable && "rounded-md outline-dashed outline-1 outline-foreground/25")}
        style={{
          left: `${PRINT_AREA.left}%`,
          top: `${PRINT_AREA.top}%`,
          width: `${PRINT_AREA.width}%`,
          height: `${PRINT_AREA.height}%`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {layers.map((l) => (
            <LayerView
              key={l.id}
              layer={l}
              editable={editable}
              selected={editable && l.id === selectedId}
              areaRef={areaRef}
              onSelect={onSelect}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LayerView({
  layer,
  editable,
  selected,
  areaRef,
  onSelect,
  onChange,
}: {
  layer: DesignLayer;
  editable: boolean;
  selected: boolean;
  areaRef: RefObject<HTMLDivElement | null>;
  onSelect?: ((id: string | null) => void) | undefined;
  onChange?: ((id: string, patch: Partial<DesignLayer>) => void) | undefined;
}) {
  const controls = useDragControls();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // The drag offset is folded into x/y on drop; clear it once the new position renders.
  useLayoutEffect(() => {
    mx.set(0);
    my.set(0);
  }, [layer.x, layer.y, mx, my]);

  const startResize = (e: ReactPointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const area = areaRef.current?.getBoundingClientRect();
    if (!area) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const start = layer.size;
    const move = (ev: PointerEvent) => {
      const d = (ev.clientX - startX + (ev.clientY - startY)) / 2;
      onChange?.(layer.id, { size: Math.round(clamp(start + ((d * 2) / area.width) * 100, 8, 100)) });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      className="absolute"
      style={{ left: `${layer.x}%`, top: `${layer.y}%`, width: `${layer.size}%`, transform: "translate(-50%, -50%)" }}
    >
      <motion.div
        drag={editable}
        dragListener={false}
        dragControls={controls}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={areaRef}
        style={{ x: mx, y: my, rotate: layer.rotation }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileDrag={{ scale: 1.04 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        onPointerDown={
          editable
            ? (e) => {
                onSelect?.(layer.id);
                controls.start(e);
              }
            : undefined
        }
        onDragEnd={() => {
          const a = areaRef.current?.getBoundingClientRect();
          if (!a) return;
          onChange?.(layer.id, {
            x: +clamp(layer.x + (mx.get() / a.width) * 100, 0, 100).toFixed(1),
            y: +clamp(layer.y + (my.get() / a.height) * 100, 0, 100).toFixed(1),
          });
        }}
        className={cn(
          "relative",
          editable && "pointer-events-auto cursor-grab touch-none active:cursor-grabbing",
          selected && "rounded-sm outline outline-2 -outline-offset-2 outline-season",
        )}
      >
        <LayerArt layer={layer} />
        {selected && (
          <button
            type="button"
            aria-label="Resize graphic"
            onPointerDown={startResize}
            className="absolute bottom-0 right-0 size-4 cursor-nwse-resize touch-none rounded-full border-2 border-background bg-foreground"
          />
        )}
      </motion.div>
    </div>
  );
}

export function LayerArt({ layer }: { layer: DesignLayer }) {
  if (layer.kind === "image") {
    return <img src={layer.src} alt="" draggable={false} className="pointer-events-none block h-auto w-full" />;
  }
  const shape = SHAPE_BY_ID[layer.src];
  if (!shape) return null;
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none block h-auto w-full" aria-hidden>
      <path d={shape.d} fillRule={shape.rule} style={{ fill: layer.color }} />
    </svg>
  );
}
