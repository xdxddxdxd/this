/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SENTRY_DSN?: string;
  /** Yalnızca geliştirme fallback'i; üretimde anahtar ai-proxy edge function'ında tutulur. */
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GROQ_API_KEY?: string;
  readonly VITE_OPENROUTER_API_KEY?: string;
  readonly VITE_CEREBRAS_API_KEY?: string;
  readonly VITE_CEREBRAS_MODEL?: string;
  readonly VITE_GEMINI_OCR_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
