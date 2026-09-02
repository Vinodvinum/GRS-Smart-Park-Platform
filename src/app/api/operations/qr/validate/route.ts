import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashToken, normalizePassToken } from "@/lib/booking";
import { requireApiRole, isGuardFailure } from "@/lib/auth-helpers";
import { STAFF_ROLES } from "@/lib/rbac";

const schema = z.object({ token: z.string().min(20).max(300) });

export async function POST(request: Request) {
  const guard = await requireApiRole(STAFF_ROLES);
  if (isGuardFailure(guard)) return guard.response;

  try {
    const { token } = schema.parse(await request.json());
    const pass = await prisma.digitalPass.findUnique({
      where: { tokenHash: hashToken(normalizePassToken(token)) },
      include: { booking: { include: { experience: true } } },
    });

    if (!pass || !pass.booking) {
      return NextResponse.json({ data: { valid: false, result: "INVALID_PASS", message: "Pass not found." } });
    }

    const now = new Date();
    if (pass.revokedAt) {
      return NextResponse.json({ data: { valid: false, result: "INVALID_PASS", message: "Pass has been revoked." } });
    }
    if (pass.expiresAt < now) {
      return NextResponse.json({ data: { valid: false, result: "INVALID_PASS", message: "Pass has expired." } });
    }
    if (pass.booking.status === "CANCELLED") {
      return NextResponse.json({ data: { valid: false, result: "INVALID_PASS", message: "Booking has been cancelled." } });
    }

    return NextResponse.json({
      data: {
        valid: true,
        result: "VALID_PASS",
        message: `Digital pass accepted for ${pass.booking.experience.name} (${pass.booking.bookingCode}).`,
        booking: {
          bookingCode: pass.booking.bookingCode,
          experience: pass.booking.experience.name,
          visitDate: pass.booking.visitDate,
          status: pass.booking.status,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ data: { valid: false, result: "INVALID_PASS", message: "Invalid QR token." } }, { status: 400 });
    }
    console.error("operations.qr.validate_failed");
    return NextResponse.json({ data: { valid: false, result: "INVALID_PASS", message: "Validation unavailable." } }, { status: 500 });
  }
}
