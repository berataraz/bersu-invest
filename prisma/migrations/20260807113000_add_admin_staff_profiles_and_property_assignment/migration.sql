-- Extend existing staff records without rewriting or deleting operational data.
ALTER TABLE "User"
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "whatsapp" TEXT,
  ADD COLUMN "jobTitle" TEXT,
  ADD COLUMN "biography" TEXT,
  ADD COLUMN "preferredLocales" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "socialLinks" JSONB,
  ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Property"
  ADD COLUMN "assignedAgentId" UUID;

ALTER TABLE "Property"
  ADD CONSTRAINT "Property_assignedAgentId_fkey"
  FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Property_assignedAgentId_status_deletedAt_idx"
  ON "Property"("assignedAgentId", "status", "deletedAt");
