import { NextResponse } from "next/server";
import { requireApiRole, isGuardFailure } from "@/lib/auth-helpers";
import { ADMIN_ROLES } from "@/lib/rbac";

export async function GET() {
  const guard = await requireApiRole(ADMIN_ROLES);
  if (isGuardFailure(guard)) return guard.response;
  return NextResponse.json({
    data: { parkName: "GRS Smart Park", timezone: "Asia/Kolkata", currency: "INR" },
  });
}
