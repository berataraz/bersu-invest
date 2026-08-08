CREATE TYPE "PropertyInteractionType" AS ENUM (
  'VIEW', 'WHATSAPP_CLICK', 'PHONE_CLICK', 'CONTACT_SUBMITTED', 'SHARE',
  'MAP_INTERACTION', 'GALLERY_INTERACTION', 'AI_IMPRESSION', 'AI_CLICK', 'FAVORITE'
);

ALTER TABLE "PropertyAnalytics"
  ADD COLUMN "uniqueViews" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "whatsappClicks" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "phoneClicks" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "shareClicks" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "mapInteractions" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "galleryInteractions" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "aiImpressions" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "aiClicks" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "PropertyInteractionEvent" (
  "id" UUID NOT NULL,
  "propertyId" UUID NOT NULL,
  "type" "PropertyInteractionType" NOT NULL,
  "visitorHash" VARCHAR(64) NOT NULL,
  "source" VARCHAR(240),
  "locale" VARCHAR(12),
  "deviceCategory" VARCHAR(20),
  "metadata" JSONB,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PropertyInteractionEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PropertyInteractionEvent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "PropertyAnalyticsVisitor" (
  "id" UUID NOT NULL,
  "propertyId" UUID NOT NULL,
  "metricDate" DATE NOT NULL,
  "visitorHash" VARCHAR(64) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PropertyAnalyticsVisitor_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PropertyAnalyticsVisitor_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PropertyInteractionEvent_propertyId_type_occurredAt_idx" ON "PropertyInteractionEvent"("propertyId", "type", "occurredAt" DESC);
CREATE INDEX "PropertyInteractionEvent_propertyId_visitorHash_type_occurredAt_idx" ON "PropertyInteractionEvent"("propertyId", "visitorHash", "type", "occurredAt" DESC);
CREATE INDEX "PropertyInteractionEvent_occurredAt_idx" ON "PropertyInteractionEvent"("occurredAt" DESC);
CREATE UNIQUE INDEX "PropertyAnalyticsVisitor_propertyId_metricDate_visitorHash_key" ON "PropertyAnalyticsVisitor"("propertyId", "metricDate", "visitorHash");
CREATE INDEX "PropertyAnalyticsVisitor_metricDate_idx" ON "PropertyAnalyticsVisitor"("metricDate");
