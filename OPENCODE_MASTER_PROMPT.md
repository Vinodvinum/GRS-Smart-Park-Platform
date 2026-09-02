# OpenCode Master Prompt — GRS Smart Park Platform

You are taking over an existing cumulative project. Do NOT rebuild it from scratch.

## First: understand the project
Read these files before making changes:
- PLAN.md
- ARCHITECTURE.md
- DECISIONS.md
- SECURITY.md
- TESTING.md
- TODO.md
- SESSIONS.md
- UI_SYSTEM.md
- FINAL_HANDOFF.md

Then inspect the full repository structure.

## Non-negotiable rules
1. Preserve the locked product architecture.
2. Do not delete working features merely to simplify the codebase.
3. Do not invent real GRS APIs, credentials, private endpoints or operational data.
4. Treat all current demo data as demo data.
5. Never treat UI role labels as authorization.
6. Privileged operations must be protected server-side.
7. Prefer incremental refactoring over rewrites.
8. Keep the existing GRS Smart MIS Dashboard as the intelligence-layer boundary.
9. Do not replace the Streamlit MIS concept with a generic analytics page.
10. Keep Guest, Operations, Admin and Intelligence concerns separated.
11. Validate inputs at API boundaries.
12. Do not expose secrets in client code.
13. Before changing architecture, explain the reason and check DECISIONS.md.

## Execution sequence
Phase A — Audit
- inspect repository
- identify build/runtime errors
- identify incomplete or mock-only workflows
- identify security gaps
- identify duplicated code
- identify accessibility/performance issues

Phase B — Verify
Run:
- dependency installation
- type checking
- linting
- production build
- database migration/seed checks
- API checks
- browser verification

Phase C — Complete production foundations
Implement only where appropriate:
- authentication
- server-side RBAC
- persistent repositories
- validation
- error handling
- rate limiting
- audit logging
- observability
- safe environment configuration

Phase D — Test end-to-end
Verify:
Guest:
Home → Experiences → Plan → Booking → Digital Pass → Help → My Visit

Operations:
Operations → Requests → Assignment → QR Validation → Attraction/Queue view

Staff:
Staff → Incidents → Assignment → Lifecycle

Admin:
Admin → Experiences → Attractions → Zones → Facilities → Offers → Users/Roles → Audit → Settings

Intelligence:
Platform data → Analytics Contract → MIS boundary

Phase E — Final report
Report:
- what was already working
- what you changed
- tests run and results
- remaining blockers
- security issues
- production configuration required
- integration assumptions
- exact commands to run
- deployment readiness

Do not claim production-ready status unless the configured environment has actually passed the relevant checks.
