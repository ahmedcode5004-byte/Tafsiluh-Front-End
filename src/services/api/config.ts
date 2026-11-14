/**
 * API configuration. Set VITE_API_BASE_URL (see .env.example) to point the
 * storefront at the Node.js + MongoDB backend. When it is empty every service
 * falls back to the in-browser mock implementation.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
export const USE_MOCKS = API_BASE_URL.length === 0;
