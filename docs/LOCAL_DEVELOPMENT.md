# Local Development — GRS Smart Park Platform

This document describes exactly what a local `DATABASE_URL` should be and how to get a
local PostgreSQL database running. It never invents a real GRS database or production
credentials.

## Expected DATABASE_URL

The application uses a single environment variable. Create a `.env` file from `.env.example`:

```bash
DATABASE_URL="postgresql://grs:grs_dev_password@localhost:5432/grs_smart_park?schema=public"
```

The user/password/database/port above match `docker-compose.yml` and are **local-development
values only**. Replace them with your own local credentials if you use an existing PostgreSQL
installation.

## Option A — Docker (recommended)

A `docker-compose.yml` is already included:

```bash
docker compose up -d
```

This starts `postgres:16-alpine` on `localhost:5432` with the credentials in the file.
Then:

```bash
npm install
npx prisma generate
npx prisma migrate dev   # creates the schema from migrations
npm run db:seed          # seeds demo experiences/offers/zones (tsx prisma/seed.ts)
npm run dev
```

## Option B — Existing local PostgreSQL

If you already run PostgreSQL locally:

1. Create a database and role, e.g.:
   ```sql
   CREATE USER grs WITH PASSWORD 'grs_dev_password';
   CREATE DATABASE grs_smart_park OWNER grs;
   ```
2. Point `DATABASE_URL` at it (update host/port/user/password to your setup).
3. Run `npx prisma migrate dev` and `npx prisma db seed`.

## What to install if neither is present

- PostgreSQL 14+ (or Docker Desktop for Windows to use `docker compose`)
- Node.js 20+ (matches the project's Next.js 15 / Prisma 6 toolchain)

## Important notes

- There is no real GRS database, credentials, or live integration in this project.
- `prisma validate` and `prisma generate` do NOT require a running database.
  Only `prisma migrate` / `db seed` / runtime DB access require a live PostgreSQL.
- Credentials here are local-only; never commit real secrets to the repository.
