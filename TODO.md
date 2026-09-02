# FINAL TODO — OpenCode / Environment Execution

## Product implementation
- [x] Guest experience foundation
- [x] Visit planner foundation
- [x] Booking + digital pass foundation
- [x] Guest services
- [x] Operations console
- [x] Staff + incidents
- [x] Admin console
- [x] MIS + intelligence contract
- [x] Production-hardening foundation

## OpenCode repair baseline
Status: Completed — the cumulative project was repaired and verified in the working copy.

### Completed repair tasks
- [x] Prisma schema repair — reconciled/rewritten `prisma/schema.prisma` (deduplicated the duplicate ServiceRequest and Feedback models, multi-line enums, kept the newer design with ServiceRequestUpdate + feedback linked to `serviceRequestId`)
- [x] Corrupted TypeScript/TSX repair — reconstructed 10 files that contained literal `\n` / `\t` escape sequences into valid multi-line source, preserving logic
- [x] Missing shared components — created `Brand`, `GuestNav`, `DemoBanner`; resolved all `@/components/*` imports
- [x] ESLint configuration — added `eslint.config.mjs` (ESLint 9 flat config via FlatCompat; `eslint-config-next` 15.5 ships legacy config)
- [x] CSS repair — removed literal escape in `src/app/globals.css`, added CSS for new components (`.brand.light`, `.demoBanner`, `.demoDot`, `.hide-mobile`)
- [x] Local development documentation — added `docs/LOCAL_DEVELOPMENT.md`
- [x] API contract correction — aligned `BookingClient` with the `{ data }` response envelope from `/api/experiences`
- [x] QR validation unification — `/api/operations/qr/validate` now uses the same repository-backed `digitalPass.tokenHash` validation as `/api/passes/validate`; hardcoded acceptance removed
- [x] Typecheck verification — `npm run typecheck`, 0 errors
- [x] Lint verification — `npm run lint`, 0 errors / 0 warnings
- [x] Production build verification — `npm run build`, 42 pages + 23 API routes compiled

### Still pending (not claimed complete)
- [x] Database setup — PostgreSQL applied; 4 migrations run; seed applied
- [x] Server-side authentication
- [x] Server-side RBAC
- [x] Persistent operations/admin/service data (Phase 3)
- [x] Rate limiting (Phase 4 — process-local, documented limitations)
- [x] Audit logging (Phase 3)
- [x] Security hardening (Phase 4 — headers, validation, state transitions, error sanitization)
- [x] Testing (unit / integration / E2E — Phase 5: Vitest + Playwright, 198 tests passing)
- [x] UI / Accessibility / Performance audit (Phase 6 — focused audit, QR dialog fix, 8 E2E)
- [x] Structured logging + health/readiness (Phase 7 — `src/lib/log.ts`, `/api/health`, `/api/ready`)
- [x] Rate-limit provider abstraction + seed production guard (Phase 7)
- [x] Deployment config + docs (Phase 7 — postinstall/generate, engines, DEPLOYMENT/OBSERVABILITY/RUNBOOK)
- [ ] Observability / telemetry (Phase 7 — shared rate-limit store IS a deployment prerequisite; structured logging implemented)
- [ ] Deployment (Phase 7 — Vercel production + managed PostgreSQL are DEPLOYMENT PREREQUISITES, not yet performed)

Production readiness is NOT claimed.

## OpenCode execution checklist
- [x] Inspect the entire repository before modifying anything
- [x] Read PLAN.md, ARCHITECTURE.md, DECISIONS.md, SECURITY.md, TESTING.md, SESSIONS.md
- [x] Install dependencies
- [x] Type-check
- [x] Lint
- [x] Build
- [x] Run local database and migrations
- [x] Verify seed/demo environment
- [x] Browser-test guest flows
- [x] Browser-test operations flows
- [x] Browser-test admin flows
- [ ] Verify API error handling
- [x] Implement server-side authentication
- [x] Implement server-side RBAC
- [x] Review all privileged mutations (Phase 4)
- [x] Review QR validation against persistent repository
- [x] Add rate limiting (Phase 4 — process-local with documented limitations)
- [x] Add structured logging/observability (Phase 7 — JSON logger; shared store is a deployment prerequisite)
- [x] Review accessibility
- [x] Review performance
- [x] Configure deployment preparation (Phase 7 — env mapping, postinstall/generate, engines; actual Vercel deploy is a deployment prerequisite)
- [x] Run production build
- [x] Verify health/readiness endpoints (Phase 7)
- [x] Document production smoke checklist (docs/PRODUCTION-RUNBOOK.md; execution against a live deploy is a deployment prerequisite)

## Integration tasks requiring real authorization
- [ ] Real GRS booking/payment integration
- [ ] Real GRS ticket/entry integration
- [ ] Real GRS operational data
- [ ] Real GRS MIS data exchange

Do not invent credentials, endpoints, private APIs, or live data.