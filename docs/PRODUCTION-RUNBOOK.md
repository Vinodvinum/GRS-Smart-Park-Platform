# GRS Smart Park Platform — Production Runbook

Operational procedures for deploying, smoke-testing, backing up, and rolling
back the platform. Follow the exact sequence; never deviate from the safety
rules below.

> **Status legend**
> - **IMPLEMENTED** — code/config present and verified locally.
> - **DEPLOYMENT PREREQUISITE** — operator action / provider setup required.
> - **DEFERRED** — documented for follow-up.

---

## 1. Safety rules (non-negotiable)

1. **Never** use `prisma db push` against production. Use
   `prisma migrate deploy`.
2. **Never** auto-run destructive migrations. Review every migration before
   applying.
3. **Never** point production at `grs_smart_park_test` or local PostgreSQL.
4. **Never** seed demo accounts into production (`prisma/seed.ts` refuses when
   `NODE_ENV=production`).
5. **Never** log secrets/credentials/tokens (see `docs/OBSERVABILITY.md`).
6. **Never** expose stack traces / Prisma internals to clients (Phase 4
   sanitation is preserved).

## 2. Deployment sequence (IMPLEMENTED as documented procedure)

1. `npm ci` (runs `postinstall: prisma generate`).
2. `npx prisma generate`.
3. `npm test` and `npm run test:e2e` (against the **test** DB).
4. `npm run typecheck`, `npm run lint`, `npm run build`.
5. `vercel deploy` / promote the build to the target environment with the
   correct env vars (see `docs/DEPLOYMENT.md` environment mapping).
6. Apply migrations separately with `DATABASE_URL` pointed at the **target**
   environment's DB: `npx prisma migrate deploy`.
7. Run the non-destructive smoke checklist (section 3).

## 3. Non-destructive production smoke checklist

Run against the deployed URL. **Do not perform destructive tests.**

### Public
- [ ] Homepage loads (HTTP 200, no horizontal overflow, no console errors).
- [ ] `GET /api/experiences` returns the public experience list.
- [ ] Public park information (experiences / offers / guide) loads.

### Health / Readiness / Database
- [ ] `GET /api/health` → 200 `{ "status": "ok" }`.
- [ ] `GET /api/ready` → 200 `{ "status": "ok", "database": "ok" }`.

### Auth
- [ ] Invalid login is rejected (401 / rate-limit not tripped).
- [ ] Guest login succeeds; session persists.
- [ ] Staff login succeeds.

### Guest
- [ ] Authenticated session works (guarded pages render).
- [ ] Booking flow works against the configured environment.
- [ ] Digital pass generation works (QR rendered).
- [ ] Service request submission works and appears on My Visit.

### Staff
- [ ] Operations access works (staff role).
- [ ] RBAC remains enforced: guest cannot reach staff pages.

### Admin
- [ ] Admin access works.
- [ ] Non-admin access remains denied (403 / redirect).

### Security
- [ ] No secrets exposed in any HTML/JSON response.
- [ ] No stack traces in any response.
- [ ] HTTPS enforced.
- [ ] Security headers present (X-Content-Type-Options, X-Frame-Options,
      Referrer-Policy, Permissions-Policy).

## 4. Backup strategy (DEFERRED — operator responsibility)

Database backups rest with the **managed PostgreSQL provider** (e.g. Vercel
Postgres / Neon / Supabase / RDS automatic backups, PITR where available).
- **IMPLEMENTED** here: nothing in code performs backups; this is an operator
  concern. Enable automatic backups + periodic manual snapshots on the
  provider before relying on health checks.
- Recommended: schedule daily snapshots and retain N days; test restore
  periodically; document the provider's restore procedure (not automated in
  this repo — intentionally no destructive restore scripts).

## 5. Rollback strategy

### Application rollback (IMPLEMENTED capability via Vercel)
Vercel keeps prior deployments. To roll back the **application**:
- Redeploy / promote a previous healthy deployment (or `vercel rollback`).
- This restores the previous build immediately — app code, env wiring.

### Database rollback (DEPLOYMENT PREREQUISITE / DEFERRED)
- **Application rollback does NOT automatically roll back the database.**
  Database schema changes are forward-applied with `prisma migrate deploy`.
- If a migration must be undone, follow the provider's restore procedure
  (point-in-time recovery / snapshot restore), **not** an automated destructive
  migration script.
- **Preferred**: forward-compatible migrations (additive columns, defaults,
  nullable-then-fill) so new code works with the old schema and old code
  tolerates new nullable/optional columns. This is the recommended strategy;
  no reverse-migration automation is provided.

### Sequence if something goes wrong
1. **Immediately** stop traffic to the bad deployment (Vercel rollback / brief
  503 from health check if `ready` fails).
2. Restore the **previous application deployment** (fast).
3. Assess whether the **database** must change:
   - If only app code regressed → no DB action.
   - If a migration caused data/schema problems → follow provider restore/PITR.
4. Re-run the smoke checklist (section 3) on the restored deployment.
