/**
 * In-memory sliding window rate limiter.
 *
 * For production, swap with Redis-backed implementation (e.g. @upstash/ratelimit).
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  limit: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  if (!store.has(key)) {
    store.set(key, { timestamps: [] });
  }

  const entry = store.get(key)!;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const oldestInWindow = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetMs: oldestInWindow + windowMs - now,
      limit,
    };
  }

  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    resetMs: windowMs,
    limit,
  };
}

export const RATE_LIMITS = {
  api: { limit: 100, windowMs: 60_000 },
  auth: { limit: 10, windowMs: 60_000 },
  ai: { limit: 30, windowMs: 60_000 },
  upload: { limit: 10, windowMs: 60_000 },
} as const;
