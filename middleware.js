import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only instantiate if env vars are present (skips during local dev without Upstash)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Tier definitions: [requests, window]
const TIERS = {
  ai: [10, "60 s"],      // Claude API — expensive, strict
  admin: [120, "60 s"],  // Admin routes — trusted but protected
  user: [30, "60 s"],    // Auth-required user actions
  public: [60, "60 s"],  // Public reads
};

// Build limiters only if Redis is available
const limiters = redis
  ? Object.fromEntries(
      Object.entries(TIERS).map(([tier, [reqs, window]]) => [
        tier,
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(reqs, window),
          prefix: `rl:${tier}`,
          analytics: true,
        }),
      ])
    )
  : null;

function getTier(pathname) {
  // AI feature routes — most restrictive
  if (
    pathname.includes("/api/vendor/generate-listing") ||
    pathname.includes("/api/reviews/summarize") ||
    pathname.includes("/api/quotes/ai-assistant") ||
    pathname.includes("/api/vendor/ai-insights") ||
    pathname.includes("/api/search/parse-query") ||
    pathname.includes("/api/admin/draft-quote") ||
    pathname.includes("/api/support/chat")
  )
    return "ai";

  // Admin routes
  if (pathname.startsWith("/api/admin/")) return "admin";

  // Auth-required user write actions
  if (
    pathname.startsWith("/api/saved-listings") ||
    pathname.startsWith("/api/reviews/")
  )
    return "user";

  // Everything else public
  return "public";
}

function getIP(req) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith("/api/")) return NextResponse.next();

  // Skip if Redis not configured (graceful dev fallback)
  if (!limiters) return NextResponse.next();

  const tier = getTier(pathname);
  const ip = getIP(request);

  try {
    const { success, limit, remaining, reset } = await limiters[tier].limit(ip);

    const res = success
      ? NextResponse.next()
      : new NextResponse(
          JSON.stringify({ error: "Too many requests. Please slow down." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );

    // Always expose rate limit headers so clients can back off gracefully
    res.headers.set("X-RateLimit-Limit", String(limit));
    res.headers.set("X-RateLimit-Remaining", String(remaining));
    res.headers.set("X-RateLimit-Reset", String(reset));

    return res;
  } catch {
    // Fail open on Redis error — never block real users
    return NextResponse.next();
  }
}

export const config = {
  matcher: "/api/:path*",
};
