import { NextResponse } from "next/server";
import { z } from "zod";
import { assignServiceRequest, getServiceRequestByCode } from "@/lib/repositories/service-request";
import { requireApiRole, isGuardFailure } from "@/lib/auth-helpers";
import { STAFF_ROLES } from "@/lib/rbac";
import { auditLog } from "@/lib/audit";
import { canTransitionServiceRequest } from "@/lib/state-transitions";

const assignSchema = z.object({
  requestCode: z.string().min(1).max(50).trim(),
  staffName: z.string().min(1).max(100).trim(),
});

export async function POST(request: Request) {
  const guard = await requireApiRole(STAFF_ROLES);
  if (isGuardFailure(guard)) return guard.response;
  const user = guard.user;

  try {
    const body = await request.json();
    const parsed = assignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { requestCode, staffName } = parsed.data;

    const existing = await getServiceRequestByCode(requestCode);
    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const transition = canTransitionServiceRequest(existing.status, "ASSIGNED");
    if (!transition.valid) {
      return NextResponse.json(
        { error: "Invalid status transition", details: transition.reason },
        { status: 409 },
      );
    }

    const data = await assignServiceRequest(existing.id, staffName, user.name ?? "Staff");

    await auditLog({
      actorId: user.id,
      action: "SERVICE_REQUEST_ASSIGNED",
      entityType: "ServiceRequest",
      entityId: existing.id,
      metadata: { requestCode, assignedTo: staffName },
    });

    return NextResponse.json({ data: data.request });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
