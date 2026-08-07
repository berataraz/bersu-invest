import "dotenv/config";
import { PrismaClient, UserStatus } from "@prisma/client";
import { hashPassword } from "@/lib/security/password";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD are required.");

  const passwordHash = await hashPassword(password);
  const superAdmin = await prisma.role.findUniqueOrThrow({ where: { key: "SUPER_ADMIN" } });
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, status: UserStatus.ACTIVE, mustChangePassword: true, deletedAt: null },
    create: { email, firstName: "Bersu", lastName: "Administrator", passwordHash, status: UserStatus.ACTIVE, mustChangePassword: true },
  });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: superAdmin.id } }, update: {}, create: { userId: user.id, roleId: superAdmin.id } });
  console.log(`Initial administrator is ready for ${email}.`);
}

main().finally(() => prisma.$disconnect());
