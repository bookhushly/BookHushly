import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Shared Redis client — reused across all limiters
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Rate limiters by tier:
 *  - ai       : 10 req / 60s  — Claude API routes (expensive)
 *  - public   : 60 req / 60s  — public search, listings, reviews GET
 *  - user     : 30 req / 60s  — auth-gated user actions (saves, reviews POST)
 *  - admin    : 120 req / 60s — admin dashboard routes
 */
export const limiters = {
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "rl:ai",
    analytics: true,
  }),
  public: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    prefix: "rl:pub",
    analytics: true,
  }),
  user: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "60 s"),
    prefix: "rl:user",
    analytics: true,
  }),
  admin: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, "60 s"),
    prefix: "rl:admin",
    analytics: true,
  }),
};

/**
 * rateLimit(tier, identifier)
 *
 * Call from any route handler. Pass the tier name and a unique identifier
 * (IP address, user ID, etc.).
 *
 * Returns { success: boolean, limit, remaining, reset }
 * If Upstash is unreachable, fails OPEN (returns success: true) to avoid
 * blocking real users due to a Redis outage.
 *
 * Usage:
 *   const { success } = await rateLimit("ai", ip);
 *   if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */
export async function rateLimit(tier, identifier) {
  try {
    const limiter = limiters[tier] ?? limiters.public;
    return await limiter.limit(identifier);
  } catch {
    // Fail open — never block real users due to Redis outage
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

/**
 * getIP(request) — extracts the best available IP from a Next.js Request
 */
export function getIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}
