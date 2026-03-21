/**
 * POST /api/booking-locks/cleanup
 * Removes expired booking locks to prevent listings from being permanently locked.
 * Called by Vercel Cron every 30 minutes (vercel.json).
 * Secured with CRON_SECRET header.
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const { CRON_SECRET } = process.env;

export async function POST(request) {
  // Fail-safe: block if CRON_SECRET is not configured
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { error, count } = await supabase
      .from("booking_locks")
      .delete({ count: "exact" })
      .lt("expires_at", now);

    if (error) {
      console.error("[booking-locks/cleanup] Delete failed:", error.message);
      return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
    }

    console.log(`[booking-locks/cleanup] Removed ${count ?? 0} expired lock(s)`);
    return NextResponse.json({ success: true, removed: count ?? 0 });
  } catch (err) {
    console.error("[booking-locks/cleanup] Unexpected error:", err.message);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
