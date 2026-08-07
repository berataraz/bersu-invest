import "dotenv/config";
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const sourceUrl = process.env.LEGACY_SOURCE_URL ?? "https://www.bersuinvest.com/tr/";
const write = process.argv.includes("--write");
const confirmation = process.env.LEGACY_IMPORT_CONFIRM === "I_UNDERSTAND_DRAFTS_ONLY";

function absoluteUrl(value: string) {
  try {
    const url = new URL(value, sourceUrl);
    return url.hostname === new URL(sourceUrl).hostname ? url.toString() : null;
  } catch {
    return null;
  }
}

async function main() {
  const response = await fetch(sourceUrl, { headers: { "user-agent": "BersuInvestLegacyImporter/1.0 (+manual-review)" } });
  if (!response.ok) throw new Error(`Legacy source returned HTTP ${response.status}.`);

  const html = await response.text();
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? null;
  const urls = [...html.matchAll(/href=["']([^"'#]+)["']/gi)]
    .map((match) => absoluteUrl(match[1]))
    .filter((url): url is string => Boolean(url))
    .filter((url, index, values) => values.indexOf(url) === index)
    .slice(0, 250);

  const discovery = {
    sourceUrl,
    title,
    discoveredUrlCount: urls.length,
    discoveredUrls: urls,
    retrievalNotice: "Automatically discovered only. No listing, article, staff, or media record has been published.",
  };

  console.info(JSON.stringify({ mode: write ? "write-review-queue" : "dry-run", ...discovery }, null, 2));
  if (!write) return;
  if (!confirmation) throw new Error("Refusing to write. Set LEGACY_IMPORT_CONFIRM=I_UNDERSTAND_DRAFTS_ONLY and rerun with --write.");

  const fingerprint = createHash("sha256").update(sourceUrl).digest("hex");
  await prisma.importRecord.upsert({
    where: { sourceType_sourceUrl: { sourceType: "legacy-site", sourceUrl } },
    create: { sourceType: "legacy-site", sourceUrl, fingerprint, entityType: "SITE_DISCOVERY", status: "DRAFT", payload: discovery, missingFields: ["content classification", "ownership review", "translation review"], validationErrors: [] },
    update: { payload: discovery, retrievedAt: new Date(), missingFields: ["content classification", "ownership review", "translation review"], validationErrors: [] },
  });
  console.info("Stored one review-only discovery record. No public content was created or published.");
}

main().finally(() => prisma.$disconnect());
