import { NextRequest } from "next/server";
import { hashSensitiveValue } from "@/lib/security/tokens";

export function requestMetadata(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  return {
    ipHash: hashSensitiveValue(ip),
    userAgent: request.headers.get("user-agent")?.slice(0, 1024) ?? null,
  };
}
