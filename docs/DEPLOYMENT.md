# GRS Smart Park Platform — Deployment

This document describes how to deploy GRS Smart Park to Vercel + managed
PostgreSQL while preserving all approved Phase 1–6 behavior.

> **Status legend**
> - **IMPLEMENTED** — code/config is present in the repository.
> - **DEPLOYMENT PREREQUISITE** — required at deploy time; may require provider
>   setup that cannot be performed in a local environment.
> - **DEFERRED** — out of scope for this phase; documented for follow-up.

> **Not claimed**: A real Vercel production deployment has **not** been
> performed or verified in the development environment. The steps below are
> the *recommended*, *reviewed* sequence. No live Vercel project, managed
> PostgreSQL instance, or production database is currently connected.

---

## 1. Environment separation

Four environments are used. Their `.env*` files and runtime variables are
**never committed** (`.gitignore` excludes `.env`, `.env.local`, `.env.*.local`).

| Environment | DATABASE_URL must point to | AUTH_SECRET | Notes |
| --- | --- | --- | --- |
| LOCAL (`npm run dev`) | local `grs_smart_park` | unique local value | `.env` |
| TEST (`npm test`, `test:e2e`) | local `grs_smart_park_test` | unique test value | `.env.test`; suite refuses to run on any other DB |
| PREVIEW / STAGING (Vercel Preview) | a **separate** managed DB (e.g. `grs_smart_park_preview`) | unique preview value | never production DB |
| PRODUCTION (Vercel Production) | the managed production DB (e.g. `grs_smart_park_prod`) | unique production value | never test/local DB |

**Required variables in every environment**: `DATABASE_URL`, `AUTH_SECRET`.

**Guards (IMPLEMENTED):**
- The test suite **refuses to start** unless `DATABASE_URL` contains
  `grs_smart_park_test` (`tests/global-setup.ts`).
- The seed script **refuses to seed demo accounts** when `NODE_ENV=production`
  (`prisma/seed.ts`). See Seed Strategy.

The middleware rate-limiter keys on `x-forwarded-for` (Vercel sets this in
production). In local dev, `getClientIp()` yields `'unknown'`, so all local
logins share one key — this is a documented dev-only artifact, not a
production concern.

## 2. Vercel deployment configuration

- **IMPLEMENTED**: `package.json` adds `postinstall: prisma generate` so the
  Prisma client is generated during `npm install` on Vercel.
- **IMPLEMENTED**: `package.json` declares `engines.node: ">=20.0.0"` (Next 15
  requirement). Vercel will use a compatible Node runtime.
- **No `vercel.json` is required** — Next.js framework detection, the `build`
  command (`next build`), the deploy command (`next start`), and the API
  routes are auto-detected. Do not add `vercel.json` unless a specific need
  arises.
- **No speculative artifacts**: `vercel.json` was intentionally not added.

### Recommended `package.json` scripts (IMPLEMENTED)
- `db:deploy` → `prisma migrate deploy` (production migrations).
- `db:generate` → `prisma generate`.
- `postinstall` → `prisma generate`.

## 3. Database (managed PostgreSQL)

- **IMPLEMENTED**: migrations live in `prisma/migrations` and are applied with
  `prisma migrate deploy`. `db push` is **never** used for production.
- The current schema produces 4 deterministic migrations. They are compatible
  with managed PostgreSQL.
- **Connection pooling** (e.g. PgBouncer / Prisma Accelerate) is **DEFERRED**:
  it was not required for the local setup and is only needed once production
  traffic/connection limits demand it. The Prisma client already caches a
  single instance in `globalThis` to survive serverless warm starts.

### Migration note
Migration `20260901160000_add_incident_fields` adds `incidentCode` as
`NOT NULL DEFAULT ''` with a unique index. This is safe on a **fresh** deploy
(no pre-existing `Incident` rows). It must **not** be applied to an existing
production DB that already contains `Incident` rows with empty codes, because
duplicate `''` values would violate the unique index. This is a DEFERRED
concern unless/until the DB is non-empty before deploy.

## 4. Recommended deployment sequence

> Never `db push`. Never auto-run destructive migrations. Never seed demo data
> into production.

1. Install dependencies → `npm ci` (Vercel runs this; `postinstall` runs
   `prisma generate`).
2. Prisma generate → `npx prisma generate`.
3. Run tests → `npm test` and `npm run test:e2e` (against the test DB).
4. Type check / lint / build → `npm run typecheck`, `npm run lint`,
   `npm run build`.
5. Deploy the application to Vercel (build production bundle, set env vars).
6. **Apply production migrations** → `prisma migrate deploy` with
   `DATABASE_URL` pointed at the **production** DB. This is a separate step so
   a deploy failure never auto-migrates the database.
7. Run non-destructive smoke checks against the deployed URL
   (see `docs/PRODUCTION-RUNBOOK.md`).

## 5. Interpreting `/api/health` and `/api/ready`

- `GET /api/health` (IMPLEMENTED) — lightweight liveness. Returns
  `{ "status": "ok" }` with HTTP 200 when the process is functioning. No DB
  query, no auth, no secrets.
- `GET /api/ready` (IMPLEMENTED) — readiness. Verifies required configuration
  (`DATABASE_URL`, `AUTH_SECRET`) and database connectivity. HTTP 200 when
  ready, HTTP 503 otherwise, with generic public messages only.

## 6. What remains to actually deploy (DEPLOYMENT PREREQUISITES)

The following must be provisioned by an operator; they cannot be fully
verified in the local development environment:

1. A **managed PostgreSQL** instance and its connection string
   (`DATABASE_URL`) for preview and production.
2. A **unique `AUTH_SECRET`** per environment (32+ random bytes).
3. A **shared / distributed rate-limit store** (e.g. Upstash Redis, Vercel KV)
   if production will run horizontally-scaled / serverless and needs a
   production-safe shared rate limit. Until implemented, the in-process
   limiter is used (correct for single instance only). See
   `docs/OBSERVABILITY.md` and `docs/DEPLOYMENT.md` seed notes.
4. Vercel project + environment variables wired per the mapping in section 1.

## 7. Seed strategy

- **Development seed** (`npm run db:seed` against local dev DB): seeds demo
  accounts, catalog, zones, sample service requests and incidents.
- **Test seed** (run by `tests/global-setup.ts` against the test DB): same as
  dev; refuses to run if the DB is not `grs_smart_park_test`.
- **Production behavior**: the seed **refuses to run** when
  `NODE_ENV=production` (a `--force` flag exists but is intentionally not the
  default and not used by any automated path). Production should be brought up
  by migrations only, with real accounts created through operator-controlled
  administrative processes — never demo credentials.
- Demo passwords are **bcrypt hashes** (or env-overridable via
  `GRS_DEMO_*_PASSWORD`). No plaintext production passwords are stored in
  source.
