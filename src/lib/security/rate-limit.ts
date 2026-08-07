import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { ApiError } from "@/lib/http";

type Window = "login" | "password-reset" | "sensitive" | "ai";
type RateLimitDuration = Parameters<typeof Ratelimit.slidingWindow>[1];

const policies: Record<Window, { limit: number; window: RateLimitDuration }> = {
  login: { limit: 10, window: "15 m" },
  "password-reset": { limit: 5, window: "1 h" },
  sensitive: { limit: 10, window: "15 m" },
  ai: { limit: 30, window: "1 m" },
};

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

const limiters = redis
  ? Object.fromEntries(Object.entries(policies).map(([key, value]) => [key, new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(value.limit, value.window), prefix: `bersu:${key}` })])) as Record<Window, Ratelimit>
  : null;

const developmentBuckets = new Map<string, { count: number; resetAt: number }>();

function isLocalApplicationRuntime() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL;
  if (!configuredUrl) return false;
  try {
    const hostname = new URL(configuredUrl).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export async function enforceRateLimit(window: Window, key: string) {
  if (limiters) {
    const result = await limiters[window].limit(key);
    if (!result.success) throw new ApiError(429, "Too many requests. Please try again later.", "RATE_LIMITED");
    return;
  }

  // `next start` is production mode even on a developer laptop. Remote deployments still require Redis.
  if (process.env.NODE_ENV === "production" && !isLocalApplicationRuntime()) throw new Error("Redis-backed rate limiting is required in production.");
  const policy = policies[window];
  const now = Date.now();
  const bucketKey = `${window}:${key}`;
  const bucket = developmentBuckets.get(bucketKey);
  const windowMs = window === "password-reset" ? 3_600_000 : window === "ai" ? 60_000 : 900_000;
  if (!bucket || bucket.resetAt <= now) {
    developmentBuckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > policy.limit) throw new ApiError(429, "Too many requests. Please try again later.", "RATE_LIMITED");
}
