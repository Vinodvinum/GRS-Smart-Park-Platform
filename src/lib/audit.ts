import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type AuditAction =
  | "BOOKING_CREATED"
  | "SERVICE_REQUEST_CREATED"
  | "SERVICE_REQUEST_ASSIGNED"
  | "SERVICE_REQUEST_STATUS_CHANGED"
  | "INCIDENT_ASSIGNED"
  | "INCIDENT_STATUS_CHANGED"
  | "ADMIN_SETTINGS_UPDATED"
  | "FEEDBACK_SUBMITTED";

export async function auditLog(params: {
  actorId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  metadata?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: (params.metadata as Prisma.InputJsonValue) ?? undefined,
    },
  });
}
