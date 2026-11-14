import type { Category, Season, Size } from "@/types";

export type ShopSort = "featured" | "price-asc" | "price-desc";

export interface ShopSearch {
  category?: Category;
  season?: Season;
  size?: Size;
  sort?: ShopSort;
}

const CATEGORIES: Category[] = ["tshirt", "hoodie", "sweatshirt"];
const SEASONS: Season[] = ["winter", "summer", "autumn"];
const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const SORTS: ShopSort[] = ["featured", "price-asc", "price-desc"];

const pick = <T extends string>(list: T[], v: unknown): T | undefined =>
  typeof v === "string" && (list as string[]).includes(v) ? (v as T) : undefined;

export function parseShopSearch(raw: Record<string, unknown>): ShopSearch {
  const out: ShopSearch = {};
  const category = pick(CATEGORIES, raw["category"]);
  const season = pick(SEASONS, raw["season"]);
  const size = pick(SIZES, raw["size"]);
  const sort = pick(SORTS, raw["sort"]);
  if (category) out.category = category;
  if (season) out.season = season;
  if (size) out.size = size;
  if (sort) out.sort = sort;
  return out;
}
