/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CAMERA_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
