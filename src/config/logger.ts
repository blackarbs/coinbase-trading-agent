export interface Logger {
  info(m: string, meta?: Record<string, unknown>): void;
  warn(m: string, meta?: Record<string, unknown>): void;
  error(m: string, meta?: Record<string, unknown>): void;
}

export function createLogger(): Logger {
  return {
    info: (m, meta) => console.log('[grid]', m, meta ?? ''),
    warn: (m, meta) => console.warn('[grid]', m, meta ?? ''),
    error: (m, meta) => console.error('[grid]', m, meta ?? ''),
  };
}
