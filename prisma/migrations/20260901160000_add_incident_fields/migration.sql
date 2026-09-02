ALTER TABLE "Incident" ADD COLUMN "incidentCode" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Incident" ADD COLUMN "location" TEXT;
ALTER TABLE "Incident" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'OPEN';
ALTER TABLE "Incident" ADD COLUMN "assignedTo" TEXT;
CREATE UNIQUE INDEX "Incident_incidentCode_key" ON "Incident"("incidentCode");
CREATE INDEX "Incident_status_idx" ON "Incident"("status");