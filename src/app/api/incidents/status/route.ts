import { NextResponse } from "next/server";
import { z } from "zod";
import { getIncidentByCode, updateIncidentStatus } from "@/lib/repositories/incident";
import { requireApiRole, isGuardFailure } from "@/lib/auth-helpers";
import { SUPERVISOR_ROLES } from "@/lib/rbac";
import { auditLog } from "@/lib/audit";
import { canTransitionIncident } from "@/lib/state-transitions";

const schema = z.object({
  incidentCode: z.string().min(1).max(50).trim(),
  status: z.enum(["ASSIGNED", "IN_PROGRESS", "OPEN", "RESOLVED"]),
});

export async function POST(request: Request) {
  const guard = await requireApiRole(SUPERVISOR_ROLES);
  if (isGuardFailure(guard)) return guard.response;
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const { incidentCode, status } = parsed.data;
    const existing = await getIncidentByCode(incidentCode);
    if (!existing) return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    const transition = canTransitionIncident(existing.status, status);
    if (!transition.valid) return NextResponse.json({ error: "Invalid status transition" }, { status: 409 });
    const data = await updateIncidentStatus(incidentCode, status);
    await auditLog({
      actorId: guard.user.id,
      action: "INCIDENT_STATUS_CHANGED",
      entityType: "Incident",
      entityId: data.id,
      metadata: { incidentCode, from: existing.status, to: status },
    });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Unable to update incident" }, { status: 400 });
  }
}
