export type HealthCheck = {
  name: string;
  status: "ok" | "degraded" | "unknown";
  detail: string;
};

export function applicationHealth(): HealthCheck[] {
  return [
    { name: "Application", status: "ok", detail: "Next.js runtime responding" },
    { name: "Analytics Contract", status: "ok", detail: "Contract v1.0 available" },
    { name: "External GRS Integration", status: "unknown", detail: "No live GRS system connected in portfolio build" },
    { name: "Authentication", status: "degraded", detail: "Production auth provider must be configured before deployment" }
  ];
}
