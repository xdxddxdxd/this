import * as Sentry from '@sentry/react';

/**
 * Sentry'yi yalnızca bir DSN tanımlıysa başlatır.
 * VITE_SENTRY_DSN verilmediğinde tüm çağrılar sessizce no-op davranır;
 * uygulama hiçbir ek yapılandırma olmadan da çalışmaya devam eder.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false
  });
}

/** Yakalanan hatayı Sentry'ye bildirir; DSN yoksa hiçbir şey yapmaz. */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
