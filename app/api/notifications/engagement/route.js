/**
 * POST /api/notifications/engagement
 * Cron-triggered endpoint that sends re-engagement notifications.
 * Called by Vercel Cron (vercel.json) — secured with CRON_SECRET header.
 *
 * Engagement types sent:
 *  - Customers inactive 14+ days → re-engagement nudge
 *  - Customers with completed stays but no review → review reminder
 *  - Vendors with pending/unapproved listings → listing completion nudge
 *  - Vendors inactive 21+ days → re-engagement nudge
 *  - Admins: weekly platform summary notification
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifySystem, notifyReviewRequest } from "@/lib/notifications";

const { CRON_SECRET } = process.env;

// Days thresholds
const CUSTOMER_INACTIVE_DAYS = 14;
const VENDOR_INACTIVE_DAYS   = 21;
const REVIEW_WINDOW_DAYS     = 7; // request review within 7 days of check-out

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/** Log any rejected promises from allSettled and count them */
function logSettledErrors(settled, label, results) {
  settled.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[engagement] ${label}[${i}] failed:`, r.reason?.message || r.reason);
      results.errors++;
    }
  });
}

export async function POST(request) {
  // Verify cron secret — fail-safe: block if CRON_SECRET is not configured
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const results  = { customers: 0, reviews: 0, vendors: 0, admins: 0, errors: 0 };

  try {
    // ── 1. Re-engage inactive customers ─────────────────────────────────────
    const { data: inactiveCustomers } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("role", "customer")
      .lt("last_sign_in_at", daysAgo(CUSTOMER_INACTIVE_DAYS));

    if (inactiveCustomers?.length) {
      const settled = await Promise.allSettled(
        inactiveCustomers.map((u) =>
          notifySystem(u.id, {
            title:   "We miss you at BookHushly!",
            message: "Your next adventure awaits. Browse new hotels, apartments, and events available near you.",
            link:    "/search",
          }),
        ),
      );
      logSettledErrors(settled, "customer re-engagement", results);
      results.customers = inactiveCustomers.length;
    }

    // ── 2. Review reminders for recently checked-out bookings ────────────────
    // hotel_bookings: check check_out_date within the past REVIEW_WINDOW_DAYS
    const { data: recentHotelCheckouts } = await supabase
      .from("hotel_bookings")
      .select("id, user_id, hotels:hotel_id(name)")
      .eq("booking_status", "completed")
      .gte("check_out_date", daysAgo(REVIEW_WINDOW_DAYS))
      .lt("check_out_date", new Date().toISOString());

    if (recentHotelCheckouts?.length) {
      const settled = await Promise.allSettled(
        recentHotelCheckouts
          .filter((b) => b.user_id)
          .map((b) =>
            notifyReviewRequest(b.user_id, {
              bookingId:   b.id,
              serviceName: b.hotels?.name || "your hotel",
            }),
          ),
      );
      logSettledErrors(settled, "hotel review requests", results);
      results.reviews += recentHotelCheckouts.length;
    }

    // apartment_bookings
    const { data: recentAptCheckouts } = await supabase
      .from("apartment_bookings")
      .select("id, user_id, serviced_apartments:apartment_id(name)")
      .eq("booking_status", "completed")
      .gte("check_out_date", daysAgo(REVIEW_WINDOW_DAYS))
      .lt("check_out_date", new Date().toISOString());

    if (recentAptCheckouts?.length) {
      const settled = await Promise.allSettled(
        recentAptCheckouts
          .filter((b) => b.user_id)
          .map((b) =>
            notifyReviewRequest(b.user_id, {
              bookingId:   b.id,
              serviceName: b.serviced_apartments?.name || "your apartment",
            }),
          ),
      );
      logSettledErrors(settled, "apartment review requests", results);
      results.reviews += recentAptCheckouts.length;
    }

    // ── 3. Re-engage inactive vendors ────────────────────────────────────────
    const { data: inactiveVendors } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("role", "vendor")
      .lt("last_sign_in_at", daysAgo(VENDOR_INACTIVE_DAYS));

    if (inactiveVendors?.length) {
      const settled = await Promise.allSettled(
        inactiveVendors.map((u) =>
          notifySystem(u.id, {
            title:   "Your dashboard is waiting",
            message: "Check your bookings, respond to reviews, and keep your listings up-to-date on BookHushly.",
            link:    "/vendor/dashboard",
          }),
        ),
      );
      logSettledErrors(settled, "vendor re-engagement", results);
      results.vendors = inactiveVendors.length;
    }

    // ── 4. Weekly platform digest for admins ─────────────────────────────────
    // Only send on Mondays (day 1) — cron runs daily, we gate on weekday
    const isMonday = new Date().getDay() === 1;
    if (isMonday) {
      const { data: admins } = await supabase
        .from("users")
        .select("id")
        .eq("role", "admin");

      if (admins?.length) {
        // Summarise last 7 days of activity
        const { count: newBookings } = await supabase
          .from("hotel_bookings")
          .select("id", { count: "exact", head: true })
          .gte("created_at", daysAgo(7));

        const { count: newVendors } = await supabase
          .from("vendors")
          .select("id", { count: "exact", head: true })
          .gte("created_at", daysAgo(7));

        const settled = await Promise.allSettled(
          admins.map((a) =>
            notifySystem(a.id, {
              title:   "Weekly Platform Summary",
              message: `Last 7 days: ${newBookings ?? 0} new hotel bookings, ${newVendors ?? 0} new vendor registrations.`,
              link:    "/admin/dashboard",
            }),
          ),
        );
        logSettledErrors(settled, "admin digest", results);
        results.admins = admins.length;
      }
    }

    return NextResponse.json({ success: true, sent: results });
  } catch (error) {
    console.error("[engagement] Error:", error.message);
    return NextResponse.json(
      { error: "Engagement notification job failed", details: error.message },
      { status: 500 },
    );
  }
}
