import { NextResponse } from "next/server";
import { z } from "zod";
import { assignIncident, getIncidentByCode } from "@/lib/repositories/incident";
import { requireApiRole, isGuardFailure } from "@/lib/auth-helpers";
import { SUPERVISOR_ROLES } from "@/lib/rbac";
import { auditLog } from "@/lib/audit";
import { canTransitionIncident } from "@/lib/state-transitions";

const assignIncidentSchema = z.object({
  incidentCode: z.string().min(1).max(50).trim(),
  staffName: z.string().min(1).max(100).trim(),
});

export async function POST(r: Request) {
  const guard = await requireApiRole(SUPERVISOR_ROLES);
  if (isGuardFailure(guard)) return guard.response;
  const user = guard.user;

  try {
    const body = await r.json();
    const parsed = assignIncidentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { incidentCode, staffName } = parsed.data;

    const existing = await getIncidentByCode(incidentCode);
    if (!existing) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const transition = canTransitionIncident(existing.status, "ASSIGNED");
    if (!transition.valid) {
      return NextResponse.json(
        { error: "Invalid status transition", details: transition.reason },
        { status: 409 },
      );
    }

    const data = await assignIncident(incidentCode, staffName);

    await auditLog({
      actorId: user.id,
      action: "INCIDENT_ASSIGNED",
      entityType: "Incident",
      entityId: data.id,
      metadata: { incidentCode, assignedTo: staffName },
    });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
