import type { AvatarLook, HairStyle } from "@/types";

/** Avatar customisation palettes (user-chosen data, not theme colours). */
export const SKIN_TONES = ["#F4D2B5", "#E8B996", "#C98E64", "#A86B45", "#7A4A2C", "#4E2E1C"];
export const HAIR_COLORS = ["#1A1411", "#3B2418", "#6B3B22", "#B07A45", "#D9B98A", "#8C8C8C"];
export const HAIR_STYLES: Array<{ id: HairStyle; label: string }> = [
  { id: "short", label: "Short" },
  { id: "buzz", label: "Buzz" },
  { id: "curly", label: "Curly" },
  { id: "long", label: "Long" },
  { id: "bun", label: "Bun" },
];

export const DEFAULT_LOOK: AvatarLook = { skin: "#E8B996", hair: "#3B2418", hairStyle: "short" };
