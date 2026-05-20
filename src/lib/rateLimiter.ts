import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export const getRateLimiter = (prefix: string) => {
  const redis = getRedis();
  if (!redis) {
    return {
      limit: async () => ({ success: true }),
    } as unknown as Ratelimit;
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix,
    analytics: false,
  });
};

/**
 * Helper to enforce rate limiting in API route handlers.
 * Returns { success: true } if under limit, otherwise throws an HTTP 429 error.
 */
export const enforceRateLimit = async (ip: string, prefix: string) => {
  const limiter = getRateLimiter(prefix);
  const { success } = await limiter.limit(ip);
  if (!success) {
    const err = new Error("Too many attempts. Please try again later.") as Error & { status: number };
    err.status = 429;
    throw err;
  }
  return { success: true };
};
