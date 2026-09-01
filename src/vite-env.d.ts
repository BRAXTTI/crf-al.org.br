/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do site WordPress (base da REST API e de mídia/uploads). */
  readonly VITE_WP_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
