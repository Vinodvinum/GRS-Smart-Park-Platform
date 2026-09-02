import { NextResponse } from "next/server";

/**
 * GET /api/health — basic application liveness.
 *
 * Lightweight, unauthenticated, no database query. Returns HTTP 200 when the
 * Next.js process is functioning. Never exposes secrets or stack traces.
 */
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
