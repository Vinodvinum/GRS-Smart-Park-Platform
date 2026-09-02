import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiUser, isGuardFailure, notFoundResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import { checkRateLimit, rateLimitHeaders, WRITE_RATE_LIMIT } from "@/lib/rate-limit";
import { log } from "@/lib/log";

const feedbackSchema = z.object({
  serviceRequestId: z.string().min(1).max(100).trim(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).trim().nullable().optional(),
});

const ratingMap: Record<number, "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE"> = {
  1: "ONE", 2: "TWO", 3: "THREE", 4: "FOUR", 5: "FIVE",
};

export async function POST(request: Request) {
  const guard = await requireApiUser();
  if (isGuardFailure(guard)) return guard.response;
  const user = guard.user;

  const rl = checkRateLimit(`feedback:${user.id}`, WRITE_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many requests. Please try again later.", code: "RATE_LIMITED" },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  try {
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { serviceRequestId, rating, comment } = parsed.data;

    const requestRecord = await prisma.serviceRequest.findFirst({
      where: { OR: [{ id: serviceRequestId }, { requestCode: serviceRequestId }] },
    });
    if (!requestRecord) return notFoundResponse("Service request not found", "SERVICE_REQUEST_NOT_FOUND");

    if (user.role === "GUEST" && requestRecord.userId !== user.id) {
      return notFoundResponse("Service request not found", "SERVICE_REQUEST_NOT_FOUND");
    }

    const existing = await prisma.feedback.findUnique({
      where: { serviceRequestId: requestRecord.id },
    });
    if (existing) {
      return NextResponse.json({ error: "Feedback already submitted for this request" }, { status: 409 });
    }

    const data = await prisma.feedback.create({
      data: {
        serviceRequestId: requestRecord.id,
        rating: ratingMap[rating],
        comment: comment ?? null,
      },
    });

    await auditLog({
      actorId: user.id,
      action: "FEEDBACK_SUBMITTED",
      entityType: "Feedback",
      entityId: data.id,
      metadata: { serviceRequestId, rating },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    log.errorSafe("feedback.create_failed", error, { userId: user.id });
    return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  }
}
