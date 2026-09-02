# GRS Smart Park Platform — Observability

Operational logging, health, readiness, and the rate-limit provider. This
document distinguishes what is already implemented from what remains a
deployment prerequisite.

> **Status legend**
> - **IMPLEMENTED** — code is present in the repository.
> - **DEPLOYMENT PREREQUISITE** — required in production; may need provider setup.
> - **DEFERRED** — out of scope; documented for follow-up.

## 1. Structured logging (IMPLEMENTED)

`src/lib/log.ts` provides a lightweight structured logger. It emits **one JSON
line per event** with a stable shape:

```json
{ "timestamp": "2026-09-03T00:00:00.000Z", "level": "error", "event": "booking.create_failed", "userId": "...", "error": "..." }
```

Levels: `info`, `warn`, `error`. No dependency was added; Vercel log streams
remain parseable.

**Never logged**: passwords, password hashes, `AUTH_SECRET`, `DATABASE_URL`,
raw auth tokens, raw digital-pass tokens, or unnecessary sensitive PII.
Unexpected failures are logged with a **sanitized** message only (`errorSafe`
captures `Error.message`, never a stack trace or internals).

**Current usage** (IMPLEMENTED): the primary write mutation routes
(bookings, service requests, feedback) log unexpected failures with request
context (`userId`). Server responses remain generic; no internal detail leaks
to clients.

**Recommended additions** (DEFERRED / incremental): per-request correlation IDs,
Auth.js failure logging, and structured logs on every API entry. These can be
added without changing the client contract.

## 2. Health endpoint (IMPLEMENTED)

`GET /api/health` — application liveness.
- Returns `{ "status": "ok" }` with **HTTP 200** when the process functions.
- Lightweight: **no database query**, no authentication.
- Never exposes secrets or stack traces.
- Suitable for a load-balancer / uptime liveness check.

## 3. Readiness endpoint (IMPLEMENTED)

`GET /api/ready` — readiness to serve traffic.
- Verifies required configuration: `DATABASE_URL` and `AUTH_SECRET` are present.
- Verifies **database connectivity** (`SELECT 1`).
- **HTTP 200** + `{ "status": "ok", "database": "ok" }` when ready.
- **HTTP 503** + `{ "status": "not_ready", "details": { missing: [], database: "unavailable" } }`
  when not ready.
- Only generic public messages are returned — never `DATABASE_URL`,
  `AUTH_SECRET`, Prisma internals, or stack traces.
- `missing` lists only logical names (`database`, `auth_secret`), never values.

## 4. Rate limiting (IMPLEMENTED abstraction; production store is a PREREQUISITE)

`src/lib/rate-limit.ts` is now a **provider facade** (see
`src/lib/rate-limit/types.ts` and `src/lib/rate-limit/in-memory.ts`):

- The application keeps its synchronous API (`checkRateLimit`, `rateLimitHeaders`,
  `AUTH_RATE_LIMIT`, `REGISTER_RATE_LIMIT`, `WRITE_RATE_LIMIT`).
- The only implemented provider is the **process-local in-memory** limiter.
- A future shared provider (Upstash Redis / Vercel KV) is selected via
  `RATE_LIMIT_PROVIDER`; unknown/absent values fail safe to in-memory.

**Production reality (DEPLOYMENT PREREQUISITE, not claimed):**
- The in-memory limiter does **NOT** provide a shared limit across serverless
  instances or horizontal replicas. For multi-instance production, a shared
  distributed store **must** be implemented and configured. Until then,
  production rate limiting is **not** production-ready for horizontally-scaled
  deployments — this is documented, not silently claimed.

**Counts (unchanged):** registration 5/hour/IP, login 20/15min/IP, write
operations 30/min/user. `429` + `X-RateLimit-Remaining` / `X-RateLimit-Reset`
headers are preserved.

**Fail-safe behavior (IMPLEMENTED):** if a provider is unavailable or unknown,
the limiter falls back to in-memory instead of breaking requests. (There is no
configured external provider, so no external outage path is currently
exercised.)

## 5. Audit logging (IMPLEMENTED, pre-existing)

Business audit events continue to write to the `AuditLog` table
(`src/lib/audit.ts`) — typed `AuditAction` union, actor from the
authenticated session, never storing passwords/tokens/PII. This is separate
from operational JSON logging.

## 6. Not yet implemented

- Shared/distributed rate-limit store (DEPLOYMENT PREREQUISITE).
- Trace / correlation IDs across requests (DEFERRED).
- Structured access logs for every request (DEFERRED).
- Integration with an external log aggregator / metrics (DEFERRED).
