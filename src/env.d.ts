/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly STRIPE_SECRET_KEY: string;
  readonly PRICE_ID_MOJO_SUAVE: string;
  readonly PRICE_ID_MOJO_PICANTE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
