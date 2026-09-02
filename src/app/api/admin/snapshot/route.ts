import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isGuardFailure } from "@/lib/auth-helpers";
import { ADMIN_ROLES } from "@/lib/rbac";

export async function GET() {
  const guard = await requireApiRole(ADMIN_ROLES);
  if (isGuardFailure(guard)) return guard.response;

  const [experiences, attractions, facilities, offers, zones] = await Promise.all([
    prisma.experience.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.attraction.findMany({
      include: { experience: true },
      orderBy: { name: "asc" },
    }),
    prisma.facility.findMany({ orderBy: { name: "asc" } }),
    prisma.offer.findMany({ orderBy: { code: "asc" } }),
    prisma.zone.findMany({ orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({
    data: {
      experiences: experiences.map((e) => ({
        id: e.id,
        name: e.name,
        type: e.shortName ?? e.name,
        status: e.active ? "PUBLISHED" : "DRAFT",
        sortOrder: e.sortOrder,
      })),
      attractions: attractions.map((a) => ({
        id: a.id,
        name: a.name,
        zone: a.experience?.name ?? "Unknown",
        status: a.status,
        capacity: 100,
      })),
      zones: zones.map((z) => z.name),
      facilities: facilities.map((f) => f.name),
      offers: offers.map((o) => ({
        id: o.id,
        name: o.name,
        type: o.code,
        status: o.status,
      })),
      settings: { parkName: "GRS Smart Park", timezone: "Asia/Kolkata", currency: "INR" },
    },
  });
}
