import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DesignLayer, ProductColor } from "@/types";
import { TEE_COLORS } from "@/data/designer";
import { uid } from "@/lib/format";
import { browserStorage } from "./storage";

interface DesignState {
  baseColor: ProductColor;
  layers: DesignLayer[];
  setColor: (c: ProductColor) => void;
  addLayer: (layer: Omit<DesignLayer, "id">) => string;
  updateLayer: (id: string, patch: Partial<DesignLayer>) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => string | null;
  /** Move a layer one step towards the front (+1) or back (-1). */
  moveLayer: (id: string, dir: 1 | -1) => void;
  reset: () => void;
}

/** The in-progress design survives page changes (e.g. building an avatar mid-design). */
export const useDesignStore = create<DesignState>()(
  persist(
    (set, get) => ({
      baseColor: TEE_COLORS[0]!,
      layers: [],
      setColor: (baseColor) => set({ baseColor }),
      addLayer: (layer) => {
        const id = uid("layer");
        set((s) => ({ layers: [...s.layers, { ...layer, id }] }));
        return id;
      },
      updateLayer: (id, patch) =>
        set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
      removeLayer: (id) => set((s) => ({ layers: s.layers.filter((l) => l.id !== id) })),
      duplicateLayer: (id) => {
        const src = get().layers.find((l) => l.id === id);
        if (!src) return null;
        const copy = { ...src, id: uid("layer"), x: Math.min(100, src.x + 6), y: Math.min(100, src.y + 6) };
        set((s) => ({ layers: [...s.layers, copy] }));
        return copy.id;
      },
      moveLayer: (id, dir) =>
        set((s) => {
          const i = s.layers.findIndex((l) => l.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= s.layers.length) return s;
          const layers = [...s.layers];
          [layers[i], layers[j]] = [layers[j]!, layers[i]!];
          return { layers };
        }),
      reset: () => set({ baseColor: TEE_COLORS[0]!, layers: [] }),
    }),
    { name: "solstice.design", storage: browserStorage, skipHydration: true },
  ),
);
