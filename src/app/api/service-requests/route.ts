import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRequest, listServiceRequests } from "@/lib/repositories/service-request";
import { requireApiUser, isGuardFailure } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import { VALID_SERVICE_REQUEST_CATEGORIES, VALID_SERVICE_REQUEST_PRIORITIES } from "@/lib/state-transitions";
import { checkRateLimit, rateLimitHeaders, WRITE_RATE_LIMIT } from "@/lib/rate-limit";
import { log } from "@/lib/log";

const createServiceRequestSchema = z.object({
  category: z.enum(VALID_SERVICE_REQUEST_CATEGORIES),
  description: z.string().min(1).max(1000).trim(),
  location: z.string().max(200).trim().nullable().optional(),
  priority: z.enum(VALID_SERVICE_REQUEST_PRIORITIES).default("MEDIUM"),
});

export async function GET() {
  const guard = await requireApiUser();
  if (isGuardFailure(guard)) return guard.response;
  const user = guard.user;
  const data = await listServiceRequests(user.role === "GUEST" ? user.id : null);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const guard = await requireApiUser();
  if (isGuardFailure(guard)) return guard.response;
  const user = guard.user;

  const rl = checkRateLimit(`sr:${user.id}`, WRITE_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many requests. Please try again later.", code: "RATE_LIMITED" },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  try {
    const body = await request.json();
    const parsed = createServiceRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { category, description, location, priority } = parsed.data;

    const data = await createServiceRequest(
      { category, location: location ?? null, description, priority },
      user.id,
    );

    await auditLog({
      actorId: user.id,
      action: "SERVICE_REQUEST_CREATED",
      entityType: "ServiceRequest",
      entityId: data.id,
      metadata: { requestCode: data.requestCode, category },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    log.errorSafe("service_request.create_failed", error, { userId: user.id });
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
