import type { Season } from "@/types";

/** Northern-hemisphere season for a month; spring folds into autumn's palette. */
export function seasonForMonth(month: number): Season {
  if (month === 11 || month <= 1) return "winter";
  if (month >= 5 && month <= 7) return "summer";
  return "autumn";
}
