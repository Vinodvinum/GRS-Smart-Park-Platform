import { prisma } from "@/lib/prisma";
import type { ServiceRequestStatus, ServiceRequestPriority } from "@prisma/client";

export type CreateServiceRequestInput = {
  category: string;
  location?: string | null;
  description: string;
  priority: ServiceRequestPriority;
};

export async function createServiceRequest(
  input: CreateServiceRequestInput,
  userId: string
) {
  const requestCode = `GRS${Math.floor(10000 + Math.random() * 89999)}`;

  return prisma.$transaction(async (tx) => {
    const request = await tx.serviceRequest.create({
      data: {
        requestCode,
        userId,
        category: input.category,
        location: input.location ?? null,
        description: input.description,
        priority: input.priority,
        status: "OPEN",
      },
    });

    await tx.serviceRequestUpdate.create({
      data: {
        serviceRequestId: request.id,
        status: "OPEN",
        note: "Request received.",
        actorName: "Guest",
      },
    });

    return request;
  });
}

export async function getServiceRequestById(id: string) {
  return prisma.serviceRequest.findUnique({
    where: { id },
    include: { updates: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getServiceRequestByCode(requestCode: string) {
  return prisma.serviceRequest.findUnique({
    where: { requestCode },
    include: { updates: { orderBy: { createdAt: "asc" } } },
  });
}

export async function listServiceRequests(userId?: string | null) {
  const where = userId ? { userId } : {};
  return prisma.serviceRequest.findMany({
    where,
    include: { updates: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateServiceRequestStatus(
  id: string,
  status: ServiceRequestStatus,
  actorName: string,
  note?: string
) {
  return prisma.$transaction(async (tx) => {
    const update = await tx.serviceRequestUpdate.create({
      data: {
        serviceRequestId: id,
        status,
        note: note ?? null,
        actorName,
      },
    });

    const data: Record<string, unknown> = { status };
    if (status === "RESOLVED" || status === "CLOSED") {
      data.resolvedAt = new Date();
    }

    const request = await tx.serviceRequest.update({
      where: { id },
      data,
    });

    return { request, update };
  });
}

export async function assignServiceRequest(
  id: string,
  assignedTo: string,
  actorName: string
) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.serviceRequest.update({
      where: { id },
      data: { assignedTo, status: "ASSIGNED" },
    });

    const update = await tx.serviceRequestUpdate.create({
      data: {
        serviceRequestId: id,
        status: "ASSIGNED",
        note: `Assigned to ${assignedTo}.`,
        actorName,
      },
    });

    return { request, update };
  });
}
