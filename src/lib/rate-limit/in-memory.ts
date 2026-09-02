/**
 * Process-local in-memory rate-limit provider.
 *
 * Correct for local development and single-instance deployment. NOT suitable
 * for horizontally-scaled / serverless production: state is held in process
 * memory, is lost on restart, and does not span multiple instances.
 */
import type { RateLimitProvider, RateLimitConfig, RateLimitResult } from "./types";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

export const inMemoryRateLimitProvider: RateLimitProvider = {
  check(key: string, config: RateLimitConfig): RateLimitResult {
    cleanup();

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      const resetAt = now + config.windowMs;
      store.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: config.max - 1, resetAt };
    }

    entry.count++;

    if (entry.count > config.max) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt };
  },
};
