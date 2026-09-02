/**
 * Rate-limiter facade.
 *
 * Keeps the application's existing synchronous API (used by middleware and
 * the write API routes) while delegating the actual accounting to a swappable
 * provider. The only implemented provider is the process-local in-memory
 * limiter (src/lib/rate-limit/in-memory.ts), which is correct for local
 * development and single-instance deployment.
 *
 * PRODUCTION (serverless / horizontally-scaled) READINESS:
 *   A shared/distributed limiter (e.g. Upstash Redis, Vercel KV) is a
 *   DEPLOYMENT PREREQUISITE. Until one is implemented and configured via
 *   RATE_LIMIT_PROVIDER, the in-memory provider is used, which does NOT
 *   provide a production-safe shared limit. See docs/DEPLOYMENT.md and
 *   docs/PRODUCTION-RUNBOOK.md.
 *
 * Fail-safe: if an unknown provider is requested, fall back to in-memory
 * rather than breaking requests.
 */
import { inMemoryRateLimitProvider } from "./rate-limit/in-memory";
import type { RateLimitProvider, RateLimitConfig, RateLimitResult } from "./rate-limit/types";

export type { RateLimitConfig, RateLimitResult, RateLimitProvider };

const selectorEnv = (process.env.RATE_LIMIT_PROVIDER || "in-memory").toLowerCase();

// Only "in-memory" is implemented. Shared providers are a deployment
// prerequisite and intentionally not claimed.
function selectProvider(): RateLimitProvider {
  switch (selectorEnv) {
    // Future shared providers belong here, e.g.:
    // case "upstash": return upstashProvider();
    default:
      return inMemoryRateLimitProvider;
  }
}

const provider: RateLimitProvider = selectProvider();

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  return provider.check(key, config);
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
