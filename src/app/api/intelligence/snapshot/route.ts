import { NextResponse } from "next/server";
import { getAnalyticsSnapshot } from "@/lib/intelligence";
import { requireApiRole, isGuardFailure } from "@/lib/auth-helpers";
import { STAFF_ROLES } from "@/lib/rbac";

export async function GET() {
  const guard = await requireApiRole(STAFF_ROLES);
  if (isGuardFailure(guard)) return guard.response;
  const data = await getAnalyticsSnapshot();
  return NextResponse.json({ data });
}
