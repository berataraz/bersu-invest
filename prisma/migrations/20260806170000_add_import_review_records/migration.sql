-- Review queue for data discovered from the company-owned legacy website.
CREATE TYPE "ImportRecordStatus" AS ENUM ('DISCOVERED', 'DRAFT', 'REVIEWED', 'PUBLISHED', 'SKIPPED', 'DUPLICATE', 'FAILED');

CREATE TABLE "ImportRecord" (
  "id" UUID NOT NULL,
  "sourceType" VARCHAR(80) NOT NULL,
  "sourceUrl" TEXT NOT NULL,
  "externalId" VARCHAR(160),
  "fingerprint" VARCHAR(64) NOT NULL,
  "entityType" VARCHAR(80),
  "entityId" UUID,
  "status" "ImportRecordStatus" NOT NULL DEFAULT 'DISCOVERED',
  "payload" JSONB,
  "missingFields" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "validationErrors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "reviewedById" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ImportRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ImportRecord_fingerprint_key" ON "ImportRecord"("fingerprint");
CREATE UNIQUE INDEX "ImportRecord_sourceType_sourceUrl_key" ON "ImportRecord"("sourceType", "sourceUrl");
CREATE INDEX "ImportRecord_status_entityType_retrievedAt_idx" ON "ImportRecord"("status", "entityType", "retrievedAt" DESC);
CREATE INDEX "ImportRecord_reviewedById_reviewedAt_idx" ON "ImportRecord"("reviewedById", "reviewedAt" DESC);

ALTER TABLE "ImportRecord" ADD CONSTRAINT "ImportRecord_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
