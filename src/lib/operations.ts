import { prisma } from "@/lib/prisma";

export async function getOperationsSnapshot() {
  const [attractions, serviceRequests, incidents, queueSnapshots] = await Promise.all([
    prisma.attraction.findMany({
      where: { active: true },
      include: { experience: true },
    }),
    prisma.serviceRequest.findMany({
      where: { status: { notIn: ["RESOLVED", "CLOSED", "CANCELLED"] } },
    }),
    prisma.incident.findMany({
      where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
    }),
    prisma.queueSnapshot.findMany({
      orderBy: { observedAt: "desc" },
      take: 20,
    }),
  ]);

  const latestByZone = new Map<string, typeof queueSnapshots[0]>();
  for (const qs of queueSnapshots) {
    if (!latestByZone.has(qs.zoneId)) latestByZone.set(qs.zoneId, qs);
  }

  const attractionsWithQueue = attractions.map((a) => {
    const qs = queueSnapshots.find((q) => q.attractionId === a.id);
    return {
      id: a.id,
      name: a.name,
      zone: a.experience?.name ?? "Unknown",
      capacity: 100,
      queueMinutes: qs?.predictedMinutes ?? 0,
      status: a.status,
    };
  });

  const highRisk = attractionsWithQueue.filter(
    (a) => a.capacity >= 85 || a.queueMinutes >= 40
  ).length;

  return {
    visitorsToday: 6842,
    visitorsChange: 12.9,
    activeRequests: serviceRequests.length,
    urgentRequests: serviceRequests.filter((r) =>
      ["HIGH", "CRITICAL"].includes(r.priority)
    ).length,
    openIncidents: incidents.length,
    queueRisk: highRisk > 0 ? "HIGH" : "LOW",
    attractions: attractionsWithQueue,
    requests: serviceRequests.map((r) => ({
      id: r.id,
      requestCode: r.requestCode,
      category: r.category,
      location: r.location ?? "",
      priority: r.priority,
      status: r.status,
      assignedTo: r.assignedTo,
      ageMinutes: Math.floor(
        (Date.now() - new Date(r.createdAt).getTime()) / 60000
      ),
    })),
  };
}

export async function assignRequest(requestCode: string, staffName: string) {
  const request = await prisma.serviceRequest.findUnique({
    where: { requestCode },
  });
  if (!request) return null;

  return prisma.serviceRequest.update({
    where: { id: request.id },
    data: { assignedTo: staffName, status: "ASSIGNED" },
  });
}
