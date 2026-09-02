# GRS Smart Park Platform — Security Baseline

## Authentication & Session
- Auth.js v5 (NextAuth) with Credentials provider.
- JWT session strategy, 8-hour max age.
- bcrypt password hashing (12 rounds).
- Inactive users cannot authenticate.
- Registration forces GUEST role server-side; client-supplied roles ignored.
- AUTH_SECRET environment-based, never exposed to client.

## Authorization (RBAC)
- Server-side RBAC via `src/lib/rbac.ts`.
- Route-handler guards (`requireApiUser()`/`requireApiRole()`) are the authoritative authorization layer.
- Middleware provides coarse page/API prefix classification.
- Ownership checks for user-scoped resources (bookings, service requests, feedback, passes).
- GUEST returns 404 (not 403) on other users' resources to prevent information disclosure.

## Input Validation
- Zod schemas on all POST mutation boundaries.
- Category validated against enum (LOST_FOUND, MEDICAL, LOCKER, FOOD, RIDE, CLEANING, GENERAL).
- Priority validated against enum (LOW, MEDIUM, HIGH, CRITICAL).
- Description max 1000 chars. staffName max 100 chars.
- Malformed input returns 400 with structured error details.

## Rate Limiting
- Provider facade (`src/lib/rate-limit.ts`) delegating to a swappable provider.
- Currently the **process-local in-memory** provider is the only implemented
  one (`src/lib/rate-limit/in-memory.ts`).
- Registration: 5 attempts/hour per IP (REGISTER_RATE_LIMIT).
- Login: 20 attempts/15min per IP (AUTH_RATE_LIMIT).
- Write operations (bookings, service requests, feedback): 30/min per user (WRITE_RATE_LIMIT).
- Returns 429 with X-RateLimit-Remaining and X-RateLimit-Reset headers.
- **LIMITATION (documented, not claimed as production-ready)**: The in-memory
  provider is process-local, lost on restart, and does NOT work across
  serverless instances. A shared/distributed store (Upstash Redis / Vercel KV)
  is a **deployment prerequisite** and is intentionally **not** implemented or
  claimed. See docs/OBSERVABILITY.md.

## State Transition Security
- ServiceRequest transitions enforced: OPEN→ASSIGNED/IN_PROGRESS/CANCELLED, ASSIGNED→IN_PROGRESS/OPEN/CANCELLED, IN_PROGRESS→RESOLVED/ASSIGNED, RESOLVED→CLOSED/IN_PROGRESS, CLOSED/CANCELLED→none.
- Incident transitions enforced: OPEN→ASSIGNED/IN_PROGRESS, ASSIGNED→IN_PROGRESS/OPEN, IN_PROGRESS→RESOLVED/ASSIGNED, RESOLVED/CLOSED→none.
- Invalid transitions return 409 with reason.
- resolvedAt automatically set on RESOLVED/CLOSED status.

## Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

## Audit Logging
- `auditLog()` writes to `AuditLog` model with typed `AuditAction` union.
- Actor always from authenticated server-side session.
- Never stores: passwords, passwordHash, AUTH_SECRET, session tokens, raw QR/pass tokens, unnecessary PII.
- Actions: BOOKING_CREATED, SERVICE_REQUEST_CREATED, SERVICE_REQUEST_ASSIGNED, SERVICE_REQUEST_STATUS_CHANGED, INCIDENT_ASSIGNED, INCIDENT_STATUS_CHANGED, ADMIN_SETTINGS_UPDATED, FEEDBACK_SUBMITTED.

## Error Handling
- Catch blocks return generic messages; no Prisma internals, stack traces, or connection strings leaked.
- 401/403 responses include `{error, message, code}` shape.
- Rate-limited responses include 429 status with rate limit headers.
- Unexpected API failures are logged server-side via a structured logger
  (`src/lib/log.ts`) with sanitized messages only; never secrets or stacks.

## Health / Readiness
- `GET /api/health` — lightweight liveness, `{ "status": "ok" }`, HTTP 200,
  no DB, no auth, no secrets.
- `GET /api/ready` — readiness probe verifying required config + DB
  connectivity; HTTP 200 when ready, 503 otherwise; generic messages only.

## Structured Logging
- `src/lib/log.ts` emits one JSON line per event (timestamp, level, event,
  context). Levels: info / warn / error.
- Never logs passwords, password hashes, AUTH_SECRET, DATABASE_URL, raw auth
  tokens, raw digital-pass tokens, or unnecessary sensitive PII.

## Digital Pass / QR Security
- Raw tokens generated via `crypto.randomBytes(24)` (base64url).
- Tokens hashed (SHA-256) before database lookup.
- Raw tokens never stored in database or AuditLog.
- Expired/revoked passes fail with 409 and reason code.
- Ownership enforced: GUESTs can only validate their own passes.

## Database Controls
- Prisma parameterized queries (no raw SQL).
- Foreign keys and restrictive delete behavior.
- Unique identifiers for business codes.
- Indexes for common lookups.
- No credentials committed to repository.

## Environment & Secrets
- `.env` in `.gitignore` (not committed).
- AUTH_SECRET and DATABASE_URL environment-based.
- Demo credentials available for local testing only.

## Remaining Deployment-Dependent Requirements
- External/shared rate-limit store (Redis/Upstash/Vercel KV) for
  horizontally-scaled / serverless production — **deployment prerequisite**.
- Email verification before account activation.
- CAPTCHA/bot protection on registration.
- Password reset/change flow.
- Session rotation on privilege escalation.

Refer to docs/DEPLOYMENT.md, docs/OBSERVABILITY.md, and
docs/PRODUCTION-RUNBOOK.md for the operational view.
