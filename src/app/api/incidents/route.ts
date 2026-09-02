import { NextResponse } from "next/server";
import { listIncidents } from "@/lib/repositories/incident";
import { requireApiRole, isGuardFailure } from "@/lib/auth-helpers";
import { STAFF_ROLES } from "@/lib/rbac";

export async function GET() {
  const guard = await requireApiRole(STAFF_ROLES);
  if (isGuardFailure(guard)) return guard.response;
  const data = await listIncidents();
  return NextResponse.json({ data });
}
