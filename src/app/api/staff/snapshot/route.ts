import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isGuardFailure } from "@/lib/auth-helpers";
import { STAFF_ROLES } from "@/lib/rbac";

export async function GET() {
  const guard = await requireApiRole(STAFF_ROLES);
  if (isGuardFailure(guard)) return guard.response;

  const [staff, incidents, serviceRequests] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["STAFF", "SUPERVISOR"] }, isActive: true },
      select: { name: true, role: true },
    }),
    prisma.incident.findMany({
      where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
    }),
    prisma.serviceRequest.findMany({
      where: { status: { notIn: ["RESOLVED", "CLOSED", "CANCELLED"] } },
    }),
  ]);

  const demoStaff = staff.map((s) => ({
    name: s.name,
    role: s.role,
    zone: "Operations",
  }));

  const demoIncidents = incidents.map((i) => ({
    id: i.id,
    incidentCode: i.incidentCode,
    title: i.title,
    location: i.location ?? "",
    severity: i.severity,
    status: i.status,
    assignedTo: i.assignedTo,
  }));

  return NextResponse.json({
    data: {
      staff: demoStaff,
      incidents: demoIncidents,
      onDuty: staff.length,
      available: staff.length,
      open: serviceRequests.length,
      critical: serviceRequests.filter((r) => r.priority === "CRITICAL").length,
    },
  });
}
