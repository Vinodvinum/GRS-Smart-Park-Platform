import { NextResponse } from "next/server";
import { getServiceRequestById, getServiceRequestByCode } from "@/lib/repositories/service-request";
import { requireApiUser, isGuardFailure, notFoundResponse } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiUser();
  if (isGuardFailure(guard)) return guard.response;
  const user = guard.user;

  const { id } = await context.params;
  const data = await getServiceRequestById(id) ?? await getServiceRequestByCode(id);
  if (!data) return notFoundResponse("Service request not found", "SERVICE_REQUEST_NOT_FOUND");

  if (user.role === "GUEST" && data.userId !== user.id) {
    return notFoundResponse("Service request not found", "SERVICE_REQUEST_NOT_FOUND");
  }

  return NextResponse.json({ data });
}
