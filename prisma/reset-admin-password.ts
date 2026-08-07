import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { AuditAction, PrismaClient, UserStatus } from "@prisma/client";
import { assertStrongPassword, hashPassword } from "@/lib/security/password";

const prisma = new PrismaClient();
const defaultEmail = "arazberat48@gmail.com";

async function askHidden(question: string) {
  const cli = createInterface({ input: stdin, output: stdout, terminal: true });
  const originalWrite = (cli as unknown as { _writeToOutput: (value: string) => void })._writeToOutput;
  (cli as unknown as { _writeToOutput: (value: string) => void })._writeToOutput = () => undefined;
  try {
    return await cli.question(question);
  } finally {
    (cli as unknown as { _writeToOutput: (value: string) => void })._writeToOutput = originalWrite;
    cli.close();
    stdout.write("\n");
  }
}

async function askForValidPassword() {
  while (true) {
    const password = await askHidden("Yeni panel parolasi (gizli): ");
    const confirmation = await askHidden("Parolayi tekrar yazin (gizli): ");
    if (password !== confirmation) {
      console.error("Parolalar ayni degil. Tekrar deneyin.");
      continue;
    }
    try {
      assertStrongPassword(password);
      return password;
    } catch {
      console.error("Parola en az 12 karakter olmali; en az bir buyuk harf, kucuk harf ve rakam icermeli. Tekrar deneyin.");
    }
  }
}

async function main() {
  const email = (process.env.ADMIN_RESET_EMAIL ?? defaultEmail).trim().toLowerCase();
  const password = await askForValidPassword();
  const passwordHash = await hashPassword(password);
  const superAdmin = await prisma.role.upsert({ where: { key: "SUPER_ADMIN" }, update: { isSystem: true }, create: { key: "SUPER_ADMIN", name: "Super Admin", isSystem: true } });
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, status: UserStatus.ACTIVE, mustChangePassword: false, failedLoginCount: 0, lockedUntil: null, deletedAt: null },
    create: { email, firstName: "Bersu", lastName: "Administrator", passwordHash, status: UserStatus.ACTIVE, mustChangePassword: false },
  });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: superAdmin.id } }, update: {}, create: { userId: user.id, roleId: superAdmin.id } });
  await prisma.authSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date(), revokeReason: "admin_password_reset" } });
  await prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: AuditAction.PASSWORD_CHANGED, entityType: "User", entityId: user.id, after: { resetMethod: "local_admin_cli" } } });
  console.log(`Administrator password reset completed for ${email}.`);
}

main().finally(() => prisma.$disconnect());
