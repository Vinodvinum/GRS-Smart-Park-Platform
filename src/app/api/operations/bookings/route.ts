import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isGuardFailure } from "@/lib/auth-helpers";
import { STAFF_ROLES } from "@/lib/rbac";

export async function GET() {
  const guard = await requireApiRole(STAFF_ROLES);
  if (isGuardFailure(guard)) return guard.response;

  try {
    const bookings = await prisma.booking.findMany({
      include: { experience: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      data: bookings.map((booking) => ({
        id: booking.id,
        bookingCode: booking.bookingCode,
        experience: booking.experience.name,
        visitDate: booking.visitDate,
        adults: booking.adults,
        children: booking.children,
        amount: booking.amount.toString(),
        status: booking.status,
        createdAt: booking.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Unable to load booking queue" }, { status: 500 });
  }
}
