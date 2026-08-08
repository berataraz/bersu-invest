import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/http";
import { equalHashes, hashToken, randomToken } from "@/lib/security/tokens";

const CSRF_COOKIE = "bersu.csrf";

function appOrigin() {
  const value = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL;
  if (!value) throw new Error("NEXT_PUBLIC_APP_URL or AUTH_URL is required.");
  return new URL(value).origin;
}

function isLocalOrigin(value: string) {
  const hostname = new URL(value).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function shouldUseSecureCookie() {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL;
  return configuredOrigin ? new URL(configuredOrigin).protocol === "https:" : process.env.NODE_ENV === "production";
}

export function assertTrustedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  if (origin === appOrigin()) return;

  // Local ports change between dev and `next start`; deployed origins remain pinned exactly.
  if (isLocalOrigin(appOrigin()) && isLocalOrigin(origin)) return;

  throw new ApiError(403, "Invalid request origin.", "INVALID_ORIGIN");
}

export function assertCsrf(request: NextRequest) {
  assertTrustedOrigin(request);
  const cookie = request.cookies.get(CSRF_COOKIE)?.value;
  const token = request.headers.get("x-csrf-token");
  if (!cookie || !token || !equalHashes(hashToken(cookie), hashToken(token))) {
    throw new ApiError(403, "Invalid CSRF token.", "INVALID_CSRF_TOKEN");
  }
}

export function issueCsrf(response: NextResponse) {
  const token = randomToken();
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    // Local `next start` also runs with NODE_ENV=production, but localhost commonly uses HTTP.
    secure: shouldUseSecureCookie(),
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60,
  });
  return token;
}
