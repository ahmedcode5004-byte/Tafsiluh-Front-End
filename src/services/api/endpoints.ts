/** REST contract expected from the backend. Keep paths in one place. */
export const ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    me: "/auth/me",
    logout: "/auth/logout",
  },
  products: {
    list: "/products",
    bySlug: (slug: string) => `/products/${encodeURIComponent(slug)}`,
  },
  orders: {
    list: "/orders",
    create: "/orders",
    byId: (id: string) => `/orders/${id}`,
    status: (id: string) => `/orders/${id}/status`,
  },
  avatar: {
    me: "/users/me/avatar",
  },
  wardrobe: {
    me: "/users/me/wardrobe",
    equip: "/users/me/wardrobe/equip",
  },
  profiles: {
    byUsername: (username: string) => `/profiles/${encodeURIComponent(username)}`,
  },
} as const;
