import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isGuardFailure } from "@/lib/auth-helpers";
import { ADMIN_ROLES } from "@/lib/rbac";

export async function GET() {
  const guard = await requireApiRole(ADMIN_ROLES);
  if (isGuardFailure(guard)) return guard.response;

  const [experiences, attractions, facilities, offers, zones, users, auditLogs] = await Promise.all([
    prisma.experience.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.attraction.findMany({ include: { experience: true }, orderBy: { name: "asc" } }),
    prisma.facility.findMany({ orderBy: { name: "asc" } }),
    prisma.offer.findMany({ orderBy: { code: "asc" } }),
    prisma.zone.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.auditLog.findMany({
      include: { actor: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return NextResponse.json({
    data: {
      experiences: experiences.map((e) => ({ id: e.id, name: e.name, type: e.shortName ?? e.name, status: e.active ? "PUBLISHED" : "DRAFT", sortOrder: e.sortOrder })),
      attractions: attractions.map((a) => ({ id: a.id, name: a.name, zone: a.experience?.name ?? "Unknown", status: a.status })),
      zones: zones.map((z) => z.name),
      facilities: facilities.map((f) => f.name),
      offers: offers.map((o) => ({ id: o.id, name: o.name, type: o.code, status: o.status })),
      users: users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive, createdAt: u.createdAt })),
      auditLogs: auditLogs.map((log) => ({ id: log.id, action: log.action, entityType: log.entityType, entityId: log.entityId, actorName: log.actor?.name ?? "System", actorRole: log.actor?.role ?? null, createdAt: log.createdAt, metadata: log.metadata })),
      settings: { parkName: "GRS Smart Park", timezone: "Asia/Kolkata", currency: "INR" },
    },
  });
}
