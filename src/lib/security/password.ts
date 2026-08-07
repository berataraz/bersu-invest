import argon2 from "argon2";

export const passwordPolicy = {
  minLength: 12,
  maxLength: 128,
};

export function assertStrongPassword(password: string) {
  if (password.length < passwordPolicy.minLength || password.length > passwordPolicy.maxLength) {
    throw new Error(`Password must be ${passwordPolicy.minLength}-${passwordPolicy.maxLength} characters.`);
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw new Error("Password must contain uppercase, lowercase, and numeric characters.");
  }
}

export function hashPassword(password: string) {
  assertStrongPassword(password);
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });
}

export function verifyPassword(passwordHash: string, password: string) {
  return argon2.verify(passwordHash, password);
}
