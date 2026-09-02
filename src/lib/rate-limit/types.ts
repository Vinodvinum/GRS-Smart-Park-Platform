/**
 * Rate-limit provider abstraction.
 *
 * The application talks to a small provider interface so that the local
 * (process-memory) limiter and a future shared/distributed limiter (e.g.
 * Upstash Redis, Vercel KV) can be swapped without changing callers.
 *
 * Production readiness for a horizontally-scaled / serverless deployment
 * REQUIRES a shared provider. Until one is configured the application uses
 * the in-memory provider, which is correct for local development and single
 * instance deployment but is NOT a production-ready shared limiter.
 */

export type RateLimitConfig = {
  windowMs: number;
  max: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export interface RateLimitProvider {
  /** Fixed-window check for a key within the given config. */
  check(key: string, config: RateLimitConfig): RateLimitResult;
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}

export const AUTH_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 20,
};

export const REGISTER_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 60 * 1000,
  max: 5,
};

export const WRITE_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  max: 30,
};
