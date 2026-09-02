import { prisma } from "@/lib/prisma";

export type AnalyticsSnapshot = {
  generatedAt: string;
  period: "TODAY";
  visitors: { value: number; delta: number };
  revenue: { value: number; delta: number };
  bookings: { value: number; delta: number };
  queue: { averageWait: number; highRiskAttractions: number };
  serviceRequests: { open: number; resolutionRate: number };
  incidents: { open: number; critical: number };
  attractionUtilization: { value: number; delta: number };
};

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  const [bookingCount, openSR, resolvedSR, openIncidents, criticalIncidents, queueSnapshots] =
    await Promise.all([
      prisma.booking.count(),
      prisma.serviceRequest.count({ where: { status: { notIn: ["RESOLVED", "CLOSED", "CANCELLED"] } } }),
      prisma.serviceRequest.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
      prisma.incident.count({ where: { status: { notIn: ["RESOLVED", "CLOSED"] } } }),
      prisma.incident.count({ where: { status: { notIn: ["RESOLVED", "CLOSED"] }, severity: "CRITICAL" } }),
      prisma.queueSnapshot.findMany({ orderBy: { observedAt: "desc" }, take: 20 }),
    ]);

  const totalSR = openSR + resolvedSR;
  const resolutionRate = totalSR > 0 ? Math.round((resolvedSR / totalSR) * 1000) / 10 : 0;
  const avgWait =
    queueSnapshots.length > 0
      ? Math.round(queueSnapshots.reduce((s, q) => s + q.predictedMinutes, 0) / queueSnapshots.length)
      : 0;
  const highRisk = queueSnapshots.filter((q) => q.riskLevel === "HIGH").length;

  return {
    generatedAt: new Date().toISOString(),
    period: "TODAY",
    visitors: { value: 6842, delta: 12.9 },
    revenue: { value: 1284500, delta: 8.4 },
    bookings: { value: bookingCount, delta: 10.2 },
    queue: { averageWait: avgWait, highRiskAttractions: highRisk },
    serviceRequests: { open: openSR, resolutionRate },
    incidents: { open: openIncidents, critical: criticalIncidents },
    attractionUtilization: { value: 74, delta: 6.1 },
  };
}

export const analyticsContract = {
  version: "1.0",
  source: "GRS Smart Park Platform",
  destination: "GRS Smart MIS Dashboard",
  dimensions: ["date", "experience", "attraction", "zone", "offer"],
  measures: [
    "visitors", "revenue", "bookings", "queue_wait_minutes",
    "service_requests", "incidents", "attraction_utilization",
  ],
  note: "Portfolio contract only. No live GRS system is connected.",
};
