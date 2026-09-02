# GRS Smart Park Platform — Testing

Automated regression suite covering the critical runtime/security surface. Three layers: **Unit** (Vitest), **API / Integration** (Vitest against a real PostgreSQL test DB), and **E2E** (Playwright against a live dev server on the test DB).

## Test Database

Tests run only against `grs_smart_park_test` (PostgreSQL on localhost:5432). The suite refuses to run if `DATABASE_URL` does not contain `grs_smart_park_test`, so production/dev data is never touched. The test DB is migrated (`prisma migrate deploy`) and seeded via `tests/global-setup.ts` before the integration suite and Playwright `tests/e2e/global-setup.ts`.

Demo credentials (seeded): `demo.guest / demo.staff / demo.supervisor / demo.admin @grs.local`.

## Commands

| Command | What it runs |
| --- | --- |
| `npm run test` | All Vitest tests (unit + integration). |
| `npm run test:unit` | Unit tests in `tests/unit`. |
| `npm run test:integration` | API/integration tests in `tests/integration`. |
| `npm run test:e2e` | Playwright E2E in `tests/e2e` (boots `next dev` on port 3100 against the test DB). |

## Unit (`tests/unit`)
Vitest, node env, no DB. Covers RBAC helpers, state transitions, booking token helpers, rate limiting and auth helpers.

## Integration (`tests/integration`)
Route handlers are invoked directly inside Vitest; `@/lib/auth` is mocked globally (`tests/setup.ts`) so every route knows the session user via `mockAuthUser(...)`, while Prisma uses the real test DB (never mocked). Middleware is exercised through `NextRequest`. Covered: smoke/health, auth/register, RBAC authorization matrix, booking, digital pass validation, service requests, incidents, feedback, admin and security (headers, structured 401/403, error sanitization, rate limits).

### Phase 7 health/readiness coverage (added)
`tests/integration/smoke.test.ts` now also verifies:
- `/api/health` returns lightweight `{ "status": "ok" }` with no leaked
  `DATABASE_URL` / `AUTH_SECRET` / connection-string details.
- `/api/ready` returns 200 `{ "status": "ok" }` when configuration + DB are
  present, and never leaks `postgresql://` / `AUTH_SECRET` in any status.

## E2E (`tests/e2e`)
Playwright + Chromium against a running dev server on the test DB. Covered: guest booking → digital pass happy path, guest service-request self-service, layer-level role authorization (anonymous redirect, guest vs. staff console access), and Phase 6 accessibility regression (operations QR dialog keyboard accessibility; no horizontal overflow across 5 critical screens × 3 viewports).

### Dev rate-limit key-collision caveat (E2E login)
The login rate limiter is keyed `login:{ip}`. In dev, `getClientIp()` resolves to `'unknown'`, so **all local logins share one key** against the 20/15min limit. When a Playwright spec performs many sign-ins in one run, a shared key can be exhausted mid-suite and cause intermittent `Something went wrong. Try again.` responses / `waitForURL` timeouts.
- Mitigation adopted: the overflow test signs in **once per role** and then uses `setViewportSize()` to sweep viewports within the already-authenticated session, keeping total sign-ins per run well under the limit (15 → 4).
- When adding E2E that signs in, keep the per-run login count small, or add a wait/delay between sign-ins.

## Quality Gates (must all pass)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — `eslint .` (test files are validated by `tsc` + the runners, so they are excluded from ESLint)
- `npx next build` — production build
- `npx prisma validate` and `npx prisma migrate status` — schema and migrations up to date
- Full test suite: unit + integration + E2E

No release if any gate fails, or a security-sensitive route lacks authorization.

## Phase 6 accessibility coverage (added)
`tests/e2e/accessibility.spec.ts` adds two regression tests on top of the Phase 5 E2E suite:
1. **Operations QR dialog keyboard accessibility** — verifies the dialog exposes `role="dialog"`, `aria-modal="true"` and `aria-labelledby`; opens with focus moved inside the dialog; closes on Escape; and restores focus to the trigger button on close.
2. **No horizontal overflow** — asserts `document.scrollWidth <= window.innerWidth` on the sign-in, guest dashboard, booking, operations and my-visit screens across 1440/768/390 viewports (signed in once per role, then `setViewportSize()` swept to stay under the dev login rate limit).

Combined suite: 194 unit/integration + 8 E2E = **202 tests passing**.
