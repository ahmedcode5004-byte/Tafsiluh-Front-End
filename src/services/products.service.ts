import { queryOptions } from "@tanstack/react-query";
import { PRODUCTS } from "@/data/products";
import type { Product } from "@/types";
import { api } from "./api/client";
import { USE_MOCKS } from "./api/config";
import { ENDPOINTS } from "./api/endpoints";

export const productsService = {
  async list(): Promise<Product[]> {
    if (USE_MOCKS) return PRODUCTS;
    return api.get<Product[]>(ENDPOINTS.products.list);
  },

  async getBySlug(slug: string): Promise<Product | null> {
    if (USE_MOCKS) return PRODUCTS.find((p) => p.slug === slug) ?? null;
    return api.get<Product>(ENDPOINTS.products.bySlug(slug));
  },
};

export const productsQuery = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: () => productsService.list(),
    staleTime: 60_000,
  });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["products", slug],
    queryFn: () => productsService.getBySlug(slug),
    staleTime: 60_000,
  });
