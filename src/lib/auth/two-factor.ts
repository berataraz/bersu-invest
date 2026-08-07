import { authenticator } from "otplib";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { decryptSecret, encryptSecret, randomToken } from "@/lib/security/tokens";

authenticator.options = { step: 30, window: 1 };

export function createTwoFactorSecret(email: string) {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(email, "Bersu Invest Yatirim", secret);
  return { secret, otpauthUrl };
}

export function verifyTotp(encryptedSecret: string, token: string) {
  return authenticator.check(token.replace(/\s/g, ""), decryptSecret(encryptedSecret));
}

export async function createRecoveryCodeHashes() {
  const codes = Array.from({ length: 10 }, () => randomToken(6).toUpperCase());
  return { codes, hashes: await Promise.all(codes.map((code) => hashPassword(code))) };
}

export async function consumeRecoveryCode(hashes: string[], candidate: string) {
  for (const [index, hash] of hashes.entries()) {
    if (await verifyPassword(hash, candidate.toUpperCase())) {
      return { valid: true, hashes: hashes.filter((_, current) => current !== index) };
    }
  }
  return { valid: false, hashes };
}

export { encryptSecret };
