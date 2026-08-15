/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SAVE_THE_DATE_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
