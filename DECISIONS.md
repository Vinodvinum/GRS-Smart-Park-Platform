# Architecture Decisions

## ADR-001 — Modular monolith
One Next.js application with strict internal domain modules initially.

## ADR-002 — Demo data before integrations
The portfolio build must never imply access to private GRS systems.

## ADR-003 — UI approved before backend
The visual language is established before transactional workflows are implemented.

## ADR-004 — Three UX modes
Guest = premium/simple. Operations = fast/actionable. Management = analytical.

## ADR-005 — Existing MIS remains intelligence layer
The current Python/Streamlit GRS Smart MIS Dashboard is not rewritten into the transactional platform.

## ADR-006 — Service request workflow
Guest requests are first-class domain objects with status, priority, assignment, timeline and feedback.

## ADR-007 — Safe integration boundaries
External systems must be represented by explicit adapters/providers and only implemented when actual requirements and authorization exist.

## ADR-008 — Operations UX
Operations screens prioritize speed, status visibility and quick actions over decorative UI.

## ADR-009 — QR validation
QR validation has an API boundary now, but production validation must be server-side, authenticated, repository-backed and audited.

## ADR-010 — Incident accountability
Incidents use explicit lifecycle states and timelines. Assignment/resolution actions must become auditable server-side operations.

## ADR-011 — RBAC
Staff roles are modeled independently from UI. Final authorization will be enforced server-side using authenticated sessions and permission checks.

## ADR-012 — Admin boundary
Admin configuration is separated from guest and operations UX. Privileged changes require authentication, authorization, validation and audit logging.

## ADR-013 — Analytics contract
The transactional platform exposes stable analytics dimensions/measures through an explicit contract. The existing GRS Smart MIS remains the intelligence layer and is integrated through this contract.

## ADR-014 — Server-side RBAC implementation (Phase 2)
Implemented RBAC using three layers: (1) coarse middleware for page/API prefix classification and 401/403/redirect, (2) route-handler guards as the authoritative authorization layer (`requireApiUser()`/`requireApiRole()`), (3) ownership checks for user-scoped resources (bookings, service-requests, feedback, passes).

**Roles**: GUEST, STAFF, SUPERVISOR, ADMIN. No new roles added.

**Permission matrix**: Defined in `src/lib/rbac.ts`. GUEST = own bookings/service-requests/feedback/passes. STAFF = operations/staff/intelligence/incidents (read+manage). SUPERVISOR = STAFF + incident assignment. ADMIN = admin config/settings/users + all.

**Middleware**: Coarse filter only. Pages: GUEST (booking/pass/my-visit/help/new), STAFF (operations/staff/incidents/intelligence/readiness), ADMIN (admin). APIs: GUEST (bookings/service-requests/feedback/passes/validate), STAFF (operations/staff/incidents/intelligence/db-status), ADMIN (admin). Middleware is NOT the sole authorization system.

**Route handlers**: Authoritative. All protected routes use `requireApiUser()`/`requireApiRole()`. Ownership checks verify `userId === session.user.id` for GUEST role; staff/supervisor/admin can access any.

**Error contract**: 401/403 responses include `{error, message, code}` shape. Code values: `UNAUTHENTICATED` (401), `FORBIDDEN` (403).

**Booking creation**: Any authenticated user (not just GUEST) can create bookings. Ownership enforced on read.

**In-memory demo store**: ~~Service-requests use in-memory demo store for Phase 2 verification. Will be replaced by persistent store in Phase 3.~~ All in-memory demo stores removed in Phase 3. All operational data now persists in PostgreSQL.

## ADR-015 — Database persistence for operational data (Phase 3)

Service requests, incidents, feedback, and intelligence analytics are now DB-backed. Architecture: API route → auth/RBAC guard → domain/service layer → repository → Prisma → PostgreSQL.

**ServiceRequest.assignedTo**: Kept as plain `String?` (no FK to User). Demo assignment names like "Operations Team" and "Ravi S." are descriptive labels, not user IDs. A production system would model assignment via a join table or user FK.

**Incident**: Extended with `incidentCode` (unique, human-readable), `location`, `status` (default OPEN), `assignedTo`. No FK constraint to User.

**Admin settings**: Left as hardcoded placeholder. No Settings model created — existing admin menu items remain "coming soon" with placeholder data. Creating unnecessary tables was explicitly excluded.

**Audit logging**: `auditLog()` helper writes to `AuditLog` model. Actor always from authenticated session. Never stores passwords, AUTH_SECRET, or raw QR tokens. Actions typed as `AuditAction` union.

**Transactions**: Mutations that change multiple records (service request create + update + audit) use `prisma.$transaction`.

**Operations snapshot**: `visitorsToday`, `visitorsChange`, and `capacity` remain hardcoded placeholders. Only business state (service requests, incidents, attraction status) is persisted.

**Seed**: Extended with demo ServiceRequests (GRS10451, GRS10452), ServiceRequestUpdate history, and demo Incidents (INC-1005, INC-1006, INC-1007). Existing seeded reference data (users, experiences, attractions, facilities, offers, zones) unchanged.

## ADR-016 — Security hardening (Phase 4)

### Rate limiting
Process-local in-memory rate limiter (`src/lib/rate-limit.ts`). Configuration: registration 5/hour, login 20/15min, write operations 30/min per user.

**Limitation**: State is held in process memory. Lost on restart. Does NOT work across multiple serverless instances or horizontal replicas. For production, replace with Redis/Upstash/Vercel KV. This is a local-development safety boundary, NOT production readiness.

### Security headers
Added via middleware: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-XSS-Protection: 1; mode=block, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy: camera=(), microphone=(), geolocation=().

### State transition rules
ServiceRequest: OPEN→ASSIGNED/IN_PROGRESS/CANCELLED, ASSIGNED→IN_PROGRESS/OPEN/CANCELLED, IN_PROGRESS→RESOLVED/ASSIGNED, RESOLVED→CLOSED/IN_PROGRESS, CLOSED/CANCELLED→none.

Incident: OPEN→ASSIGNED/IN_PROGRESS, ASSIGNED→IN_PROGRESS/OPEN, IN_PROGRESS→RESOLVED/ASSIGNED, RESOLVED/CLOSED→none.

Invalid transitions return 409 with reason. Applied to incident assignment and service request assignment endpoints.

### Input validation
Zod schemas on all POST mutation boundaries. Category validated against enum (LOST_FOUND, MEDICAL, LOCKER, FOOD, RIDE, CLEANING, GENERAL). Priority validated against enum (LOW, MEDIUM, HIGH, CRITICAL). Description max 1000 chars. staffName/requestCode max 100/50 chars.

### Error sanitization
Catch blocks no longer return raw error messages. Generic messages returned to client. Prisma internals, stack traces, and connection strings never reach client responses.

### Remaining deployment-dependent requirements
- External rate-limit store (Redis/Upstash) for multi-instance production
- Email verification before account activation
- CAPTCHA/bot protection on registration
- Password reset/change flow
- Session rotation on privilege escalation

## ADR-017 — Automated testing architecture (Phase 5)

### Frameworks
- **Vitest** for unit and API/integration tests (native TypeScript, ESNext, `@`→`./src` alias).
- **Playwright** (`@playwright/test`, Chromium) for browser E2E.
- No overlapping frameworks; each layer has a single, purpose-fit tool.

### Dedicated test database
- A separate **`grs_smart_park_test`** PostgreSQL database (migrated and seeded) is always used.
- **Test DB guard**: the suite refuses to run unless `DATABASE_URL` contains `grs_smart_park_test`. There is NO fallback to the dev database, protecting production/dev data from test writes.

### Integration testing strategy
- Route handlers are invoked **directly** inside Vitest; `@/lib/auth` is mocked globally to supply the session user (`mockAuthUser()`).
- **Prisma is never mocked for persistence tests** — every persistence path runs against the real test DB, so persistence, ownership, transactions and constraints are exercised for real.
- Middleware is tested via `NextRequest` from `next/server`.

### E2E strategy
- A real `next dev` server (port 3100) is booted by Playwright against the test DB, exercising handlers, middleware and the browser end-to-end.

### Determinism / isolation
- No `.only`/`.skip`, no trivial assertions.
- `fileParallelism: false` and sequential execution for the integration suite.
- Each suite run migrates and reseeds the test DB via global setup, giving a clean, deterministic baseline.

### Rationale
- Regression protection for the critical runtime/security surface (auth, RBAC, booking, pass validation, service requests, incidents, feedback, security headers/rate limits) that was previously verified with throwaway ad-hoc scripts.
- The real-DB, no-mocking rule intentionally trades a little speed for high-fidelity persistence coverage and catches bugs (e.g., token-hash normalization, un-awaited-`??` user helpers, weak `bookingCode()` entropy) that mocked tests would miss.

## ADR-018 — UI, Accessibility & Performance audit scope (Phase 6)

### Scope decision
Phase 6 is a **focused audit**, not a redesign. The existing approved screens (ADR-003 "UI approved before backend") were audited in-browser for accessibility, responsive layout, console cleanliness, and performance. Only **justified** defects were fixed; no business features were added and no working screens were redesigned.

### Dialog accessibility (the one justified fix)
The operations QR dialog was a non-`<dialog>` overlay that was not accessible to assistive tech and keyboard users. Applied the WAI-ARIA dialog pattern **without** introducing a dependency or redesigning:
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="qr-dialog-title"` on the overlay.
- `aria-label="Close"` on the close button; `htmlFor`/`id` on the input label; `role="status"` on the result area.
- Keyboard: close on Escape, trap/move focus into the dialog on open (`useEffect`), and restore focus to the trigger on close (`qrTriggerRef.current?.focus()`, `useCallback`).
- Close-on-backdrop via `onMouseDown`.

This is the documented accessibility pattern for modals in this codebase going forward. A future full component library could replace this with a shared `Dialog` primitive, but no such library exists and none was introduced.

### Performance non-issues (no fix)
- `home JS chunk 7.6MB` is dev-mode unminified output — not a production concern (production `next build` compiles normally).
- TTFB ~135–229ms, DCL ~229–384ms, load ~758–829ms, HTML payloads 6–11KB — acceptable for the local/dev environment.

### Accessibility regression coverage
Added `tests/e2e/accessibility.spec.ts` to lock in the dialog behavior and responsive (no-horizontal-overflow) baseline, extending the Phase 5 Playwright suite (6 → 8 E2E).

### Dev rate-limit note for E2E
All local logins share one `login:unknown` rate-limit key (20/15min) because `getClientIp()` yields `'unknown'` in dev. E2E overflow test signs in once per role and sweeps viewports via `setViewportSize()` to stay under the limit. This is a dev-only artifact of the in-memory limiter (ADR-016), not a production concern.

## ADR-019 — Deployment & observability hardening (Phase 7)

### Scope
Deployment + observability only. No redesigns, no new business features, no
speculative schema/models, no fake GRS integrations, no unnecessary package
changes. Preserves all approved Phase 1–6 behavior.

### Structured logging (`src/lib/log.ts`)
A small, dependency-free JSON line logger (timestamp/level/event/context).
Events: `info`/`warn`/`error`. `errorSafe()` captures only `Error.message`,
never stack traces/internals. Never logs passwords, hashes, AUTH_SECRET,
DATABASE_URL, raw tokens, or unnecessary PII. Used in the primary write
mutation routes (bookings, service requests, feedback) while keeping client
responses generic. Pre-existing business audit logging (`AuditLog`) is
unchanged and separate from operational logging.

### Health vs readiness
- `GET /api/health` is a **liveness** probe: `{ "status": "ok" }`, HTTP 200,
  no DB query, no auth, no secrets. (Previously returned a `degraded` status
  derived from static metadata; retired in favor of a pure liveness contract.)
- `GET /api/ready` is a **readiness** probe: verifies `DATABASE_URL` +
  `AUTH_SECRET` presence and DB connectivity (`SELECT 1`). 200 when ready,
  503 otherwise. Exposes only generic public messages (logical names, never
  values).

### Rate-limit provider abstraction (honest about not being shared)
Refactored `src/lib/rate-limit.ts` into a **facade** over a provider interface
(`src/lib/rate-limit/types.ts`, `in-memory.ts`) keeping the exact synchronous
API and limits. The only implemented provider is process-local in-memory.
A shared distributed store (Upstash/Vercel KV) is a **deployment
prerequisite**, selected via `RATE_LIMIT_PROVIDER`, and is **intentionally not
claimed as implemented**. Unknown/missing provider value fails safe to
in-memory so requests never break. Rationale per the phase constraints: do not
fake an external integration that cannot be genuinely verified/tested here.

### Seed protection
`prisma/seed.ts` refuses to seed demo accounts when `NODE_ENV=production`
(an explicit `--force` exists but is not used by any automated path). Demo
passwords remain bcrypt hashes with optional dev/test env overrides. Production
is brought up by migrations only; no demo credentials are injected.

### Deployment config
- `package.json`: added `postinstall: prisma generate` and
  `engines.node: ">=20.0.0"` (minimal justified change for Next 15 / Prisma).
- No `vercel.json` added — Next auto-detection suffices; avoiding it keeps the
  deployment config minimal.
- Production migrations use `prisma migrate deploy` only; never `db push`.
  No speculative connection-pooling config was added.

### Migration caution (documented)
Migration `20260901160000_add_incident_fields` adds `incidentCode`
`NOT NULL DEFAULT ''` with a unique index — safe on a fresh deploy, but would
fail on a pre-existing DB that already contains `Incident` rows (duplicate
`''`). Documented as a deploy-time constraint; no migration was modified
because none is a blocker for a fresh production deployment.

### Backup / rollback (operator responsibility)
No destructive automated DB rollback scripts are introduced. Application
rollback is via Vercel's previous-deployment promotion/rollback; database
rollback is via the provider's snapshot/PITR restore and forward-compatible
migrations (documented, not automated).

### Honesty about production readiness
A real Vercel deployment, managed PostgreSQL, a unique production AUTH_SECRET,
and a shared rate-limit store are **deployment prerequisites** that cannot be
verified in the local dev environment. They are documented in
`docs/DEPLOYMENT.md`, `docs/OBSERVABILITY.md`, `docs/PRODUCTION-RUNBOOK.md`.
No claim of a live production deployment is made.
