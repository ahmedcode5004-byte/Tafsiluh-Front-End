/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the future Node.js + MongoDB REST API, e.g. https://api.solstice.store/v1 */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
