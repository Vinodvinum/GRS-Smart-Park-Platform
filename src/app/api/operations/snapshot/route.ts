import { NextResponse } from "next/server";
import { getOperationsSnapshot } from "@/lib/operations";
import { requireApiRole, isGuardFailure } from "@/lib/auth-helpers";
import { STAFF_ROLES } from "@/lib/rbac";

export async function GET() {
  const guard = await requireApiRole(STAFF_ROLES);
  if (isGuardFailure(guard)) return guard.response;
  return NextResponse.json({ data: getOperationsSnapshot() });
}
