/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SAVE_THE_DATE_MODE?: string;
  readonly VITE_WEDDING_TRACK?: 'shehnai' | 'sitar' | string;
  readonly VITE_MUSIC_AUTOPLAY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
