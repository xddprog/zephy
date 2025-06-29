/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BASE_API_URL: string;
    readonly VITE_LIVEKIT_SERVER_URL: string;
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv;
}
  