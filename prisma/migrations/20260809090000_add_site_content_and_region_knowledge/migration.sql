CREATE TABLE "SiteContent" (
  "id" UUID NOT NULL,
  "key" VARCHAR(120) NOT NULL,
  "content" JSONB NOT NULL,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SiteContent_key_key" ON "SiteContent"("key");
CREATE INDEX "SiteContent_isPublished_deletedAt_idx" ON "SiteContent"("isPublished", "deletedAt");

CREATE TABLE "RegionKnowledge" (
  "id" UUID NOT NULL,
  "slug" VARCHAR(120) NOT NULL,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "content" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "RegionKnowledge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RegionKnowledge_slug_key" ON "RegionKnowledge"("slug");
CREATE INDEX "RegionKnowledge_isPublished_sortOrder_deletedAt_idx" ON "RegionKnowledge"("isPublished", "sortOrder", "deletedAt");
