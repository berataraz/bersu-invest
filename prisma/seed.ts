import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const permissions = [
  ["users.read", "users", "read"], ["users.manage", "users", "manage"],
  ["roles.manage", "roles", "manage"], ["properties.read", "properties", "read"],
  ["properties.create", "properties", "create"], ["properties.update", "properties", "update"],
  ["properties.publish", "properties", "publish"], ["crm.read", "crm", "read"],
  ["crm.manage", "crm", "manage"], ["appointments.manage", "appointments", "manage"],
  ["reports.read", "reports", "read"], ["settings.manage", "settings", "manage"],
  ["content.manage", "content", "manage"],
  ["ai.use", "ai", "use"], ["ai.manage", "ai", "manage"], ["ai.analytics", "ai", "analytics"],
] as const;

const propertyTypes = [
  ["VILLA", "Villa"], ["APARTMENT", "Daire"], ["DETACHED_HOUSE", "Müstakil Ev"],
  ["RESIDENCE", "Rezidans"], ["LAND", "Arsa"], ["FIELD", "Tarla"],
  ["COMMERCIAL", "Ticari"], ["OFFICE", "Ofis"], ["SHOP", "Dükkan"],
  ["HOTEL", "Otel"], ["WAREHOUSE", "Depo"], ["BUILDING", "Bina"],
] as const;

async function main() {
  const languages = [["tr", "Türkçe", "Turkish", true, 0], ["en", "English", "English", false, 1], ["de", "Deutsch", "German", false, 2], ["ru", "Русский", "Russian", false, 3]] as const;
  for (const [code, nativeName, englishName, isDefault, sortOrder] of languages) {
    await prisma.language.upsert({ where: { code }, update: { nativeName, englishName, isEnabled: true, isDefault, sortOrder }, create: { code, nativeName, englishName, isEnabled: true, isDefault, sortOrder } });
  }
  for (const [key, resource, action] of permissions) {
    await prisma.permission.upsert({ where: { key }, update: {}, create: { key, resource, action } });
  }

  const all = await prisma.permission.findMany({ select: { id: true } });
  const manager = await prisma.role.upsert({ where: { key: "MANAGER" }, update: {}, create: { key: "MANAGER", name: "Manager", isSystem: true } });
  const agent = await prisma.role.upsert({ where: { key: "AGENT" }, update: {}, create: { key: "AGENT", name: "Agent", isSystem: true } });
  const superAdmin = await prisma.role.upsert({ where: { key: "SUPER_ADMIN" }, update: {}, create: { key: "SUPER_ADMIN", name: "Super Admin", isSystem: true } });
  const managerKeys = new Set(["users.read", "properties.read", "properties.create", "properties.update", "properties.publish", "crm.read", "crm.manage", "appointments.manage", "reports.read", "ai.use", "ai.analytics"]);
  const agentKeys = new Set(["properties.read", "properties.create", "properties.update", "crm.read", "appointments.manage", "ai.use"]);
  const records = await prisma.permission.findMany({ select: { id: true, key: true } });

  await prisma.rolePermission.createMany({ data: all.map(({ id }) => ({ roleId: superAdmin.id, permissionId: id })), skipDuplicates: true });
  await prisma.rolePermission.createMany({ data: records.filter((p) => managerKeys.has(p.key)).map((p) => ({ roleId: manager.id, permissionId: p.id })), skipDuplicates: true });
  await prisma.rolePermission.createMany({ data: records.filter((p) => agentKeys.has(p.key)).map((p) => ({ roleId: agent.id, permissionId: p.id })), skipDuplicates: true });

  for (const [position, [key, name]] of propertyTypes.entries()) {
    await prisma.propertyType.upsert({ where: { key }, update: { name, isActive: true, position }, create: { key, name, isActive: true, position } });
  }

  for (const key of ["homepage", "aiAssistant", "footer"]) {
    await prisma.siteContent.upsert({ where: { key }, update: {}, create: { key, content: {} } });
  }
  for (const [sortOrder, slug] of ["fethiye", "calis", "koca-calis", "gocek", "ovacik", "hisaronu", "oludeniz", "kayakoy", "karagozler", "faralya", "uzumlu", "seydikemer"].entries()) {
    await prisma.regionKnowledge.upsert({ where: { slug }, update: { sortOrder }, create: { slug, sortOrder, content: {}, isPublished: false } });
  }
}

main().finally(() => prisma.$disconnect());
