import { prisma } from "@/lib/prisma";

export async function listIncidents(status?: string) {
  const where = status ? { status } : {};
  return prisma.incident.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getIncidentByCode(incidentCode: string) {
  return prisma.incident.findUnique({ where: { incidentCode } });
}

export async function assignIncident(
  incidentCode: string,
  assignedTo: string
) {
  return prisma.incident.update({
    where: { incidentCode },
    data: { assignedTo, status: "ASSIGNED" },
  });
}

export async function updateIncidentStatus(
  incidentCode: string,
  status: string
) {
  const data: Record<string, unknown> = { status };
  if (status === "RESOLVED" || status === "CLOSED") {
    data.resolvedAt = new Date();
  }
  return prisma.incident.update({
    where: { incidentCode },
    data,
  });
}
