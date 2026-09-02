# OpenCode Prompt Pack

## 1 — First audit
Read `ARCHITECTURE.md`, `PLAN.md`, `TODO.md`, `SESSIONS.md`, `DECISIONS.md`, `UI_SYSTEM.md`, `SECURITY.md`, and `TESTING.md`. Treat them as the source of truth. Audit the repository against them and report mismatches before changing anything.

## 2 — Continue the current phase
Implement only the highest-priority unfinished TODOs for the current phase. Preserve the architecture and approved UI direction. Run `npm run typecheck`, `npm run lint`, and `npm run build`. Fix issues caused by your work and update TODO.md and SESSIONS.md.

## 3 — UI verification
Review the implementation against `UI_SYSTEM.md`. Verify responsive behavior, hierarchy, spacing, contrast, keyboard focus, loading/error/empty states, and console errors in a browser. Improve only justified usability issues; do not add decorative complexity.

## 4 — Vertical slice
For a requested feature, implement UI + domain logic + database + validation + authorization + error handling + tests + browser verification + documentation. Do not call it complete when a layer is missing.

## 5 — Booking/pass security review
Audit booking creation for duplicate codes, unsafe client pricing, date validation, transaction integrity, token leakage, QR payload contents, replay/consumption behavior and authorization. Replace portfolio rules with provider-backed rules only when real requirements are available.

## 6 — Security audit
Audit auth, RBAC, input validation, secrets, cookies/sessions, PII exposure, QR payload handling, logging and privileged mutations. Fix verified issues and add tests.

## 7 — Final release
Run typecheck, lint, build, unit/integration tests and E2E/browser checks. Produce a release report with completed features, known limitations, security status and deployment readiness.

## Non-negotiable
Never fabricate a real GRS integration. Use demo providers/adapters until actual requirements and authorization exist.


## ZIP 06 audit prompt
Audit the Operations implementation. Verify that operations actions are represented by server-side boundaries and that no client-only state is treated as security. Check QR validation, request assignment, queue/capacity data, error handling and responsive UI. Do not invent real GRS integrations.
\n## ZIP 08 audit prompt\nAudit the Admin Console against ARCHITECTURE.md, SECURITY.md, DECISIONS.md and PLAN.md. Verify separation of admin, operations and guest concerns. Ensure no UI-only role check is treated as authorization. Do not invent real GRS integrations.\n