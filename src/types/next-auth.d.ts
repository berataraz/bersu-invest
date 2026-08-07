import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string; mustChangePassword?: boolean };
    accessExpiresAt?: number;
    mustChangePassword?: boolean;
    error?: "RefreshAccessTokenError";
  }

  interface User {
    refreshToken?: string;
    accessExpiresAt?: number;
    mustChangePassword?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    refreshToken?: string;
    accessExpiresAt?: number;
    error?: "RefreshAccessTokenError";
  }
}

export {};
