const SERVICE_REQUEST_TRANSITIONS: Record<string, readonly string[]> = {
  OPEN: ["ASSIGNED", "IN_PROGRESS", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "OPEN", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "ASSIGNED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
  CANCELLED: [],
};

export function isValidServiceRequestTransition(
  current: string,
  next: string,
): boolean {
  const allowed = SERVICE_REQUEST_TRANSITIONS[current];
  if (!allowed) return false;
  return (allowed as readonly string[]).includes(next);
}

export function canTransitionServiceRequest(
  current: string,
  next: string,
): { valid: boolean; reason?: string } {
  if (current === next) {
    return { valid: false, reason: "Status is already " + current };
  }
  if (!isValidServiceRequestTransition(current, next)) {
    return {
      valid: false,
      reason: `Cannot transition from ${current} to ${next}. Allowed: ${(SERVICE_REQUEST_TRANSITIONS[current] ?? []).join(", ") || "none"}`,
    };
  }
  return { valid: true };
}

const INCIDENT_TRANSITIONS: Record<string, readonly string[]> = {
  OPEN: ["ASSIGNED", "IN_PROGRESS"],
  ASSIGNED: ["IN_PROGRESS", "OPEN"],
  IN_PROGRESS: ["RESOLVED", "ASSIGNED"],
  RESOLVED: [],
  CLOSED: [],
};

export function isValidIncidentTransition(
  current: string,
  next: string,
): boolean {
  const allowed = INCIDENT_TRANSITIONS[current];
  if (!allowed) return false;
  return (allowed as readonly string[]).includes(next);
}

export function canTransitionIncident(
  current: string,
  next: string,
): { valid: boolean; reason?: string } {
  if (current === next) {
    return { valid: false, reason: "Status is already " + current };
  }
  if (!isValidIncidentTransition(current, next)) {
    return {
      valid: false,
      reason: `Cannot transition from ${current} to ${next}. Allowed: ${(INCIDENT_TRANSITIONS[current] ?? []).join(", ") || "none"}`,
    };
  }
  return { valid: true };
}

export const VALID_SERVICE_REQUEST_STATUSES: readonly string[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
];

export const VALID_INCIDENT_STATUSES: readonly string[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

export const VALID_SERVICE_REQUEST_CATEGORIES = [
  "LOST_FOUND",
  "MEDICAL",
  "LOCKER",
  "FOOD",
  "RIDE",
  "CLEANING",
  "GENERAL",
] as const;

export const VALID_SERVICE_REQUEST_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;
