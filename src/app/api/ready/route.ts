import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/log";

/**
 * GET /api/ready — readiness probe.
 *
 * Verifies that the application is ready to serve traffic:
 *  - required production configuration is present (without exposing it)
 *  - database connectivity works
 *
 * 200 when ready, 503 when not ready. Only generic public messages are
 * returned; DATABASE_URL, AUTH_SECRET, Prisma internals and stack traces are
 * never exposed to clients.
 */

function required(envKey: string): boolean {
  const value = process.env[envKey];
  return Boolean(value && value.length > 0);
}

async function databaseReady(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const configOk =
    required("DATABASE_URL") && required("AUTH_SECRET");

  const missing: string[] = [];
  if (!required("DATABASE_URL")) {
    missing.push("database");
    log.warn("ready.config_missing_database");
  }
  if (!required("AUTH_SECRET")) {
    missing.push("auth_secret");
    log.warn("ready.config_missing_auth_secret");
  }

  const dbOk = await databaseReady();
  if (!dbOk) {
    log.warn("ready.database_unreachable");
  }

  const ready = configOk && dbOk;

  if (!ready) {
    return NextResponse.json(
      {
        status: "not_ready",
        details: { missing, database: dbOk ? "ok" : "unavailable" },
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ status: "ok", database: "ok" });
}
