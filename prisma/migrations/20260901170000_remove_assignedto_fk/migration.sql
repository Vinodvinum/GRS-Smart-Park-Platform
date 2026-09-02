ALTER TABLE "ServiceRequest" DROP CONSTRAINT "ServiceRequest_assignedTo_fkey";
ALTER TABLE "ServiceRequest" ALTER COLUMN "assignedTo" DROP NOT NULL;