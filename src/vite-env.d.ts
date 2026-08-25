/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SAVE_THE_DATE_MODE?: string;
  readonly VITE_SHOW_PILLARS_OF_LOVE?: string;
  readonly VITE_SHOW_VISUAL_MEMORIES?: string;
  readonly VITE_SHOW_PHOTO_DRIVE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
