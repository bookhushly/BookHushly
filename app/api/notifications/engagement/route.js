/**
 * POST /api/notifications/engagement
 * Cron-triggered endpoint that sends re-engagement notifications.
 * Called by Vercel Cron (vercel.json) — secured with CRON_SECRET header.
 *
 * Engagement types sent:
 *  - Customers inactive 14+ days → re-engagement nudge
 *  - Customers with completed stays but no review → review reminder (hotels & apartments)
 *  - Event attendees whose event passed 1–7 days ago → post-event review prompt
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
      .select("id, name")
      .eq("role", "customer")
      .lt("updated_at", daysAgo(CUSTOMER_INACTIVE_DAYS));

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

    // ── 3. Post-event review requests ────────────────────────────────────────
    // Find event listings whose event_date was 1–7 days ago
    const { data: recentEventListings } = await supabase
      .from("listings")
      .select("id, title")
      .eq("category", "events")
      .gte("event_date", daysAgo(REVIEW_WINDOW_DAYS))
      .lt("event_date", new Date().toISOString().split("T")[0]);

    if (recentEventListings?.length) {
      const listingIds = recentEventListings.map((l) => l.id);
      const titleMap = Object.fromEntries(recentEventListings.map((l) => [l.id, l.title]));

      // Get confirmed bookings for those events (registered users only)
      const { data: eventBookings } = await supabase
        .from("event_bookings")
        .select("id, customer_id, listing_id")
        .in("listing_id", listingIds)
        .in("status", ["confirmed", "completed"])
        .not("customer_id", "is", null);

      if (eventBookings?.length) {
        // Dedup: don't re-send to the same user for the same booking
        const { data: alreadySent } = await supabase
          .from("notifications")
          .select("data")
          .eq("type", "review_request")
          .gte("created_at", daysAgo(REVIEW_WINDOW_DAYS));

        const notifiedBookingIds = new Set(
          (alreadySent || []).map((n) => n.data?.bookingId).filter(Boolean),
        );

        const toNotify = eventBookings.filter(
          (b) => b.customer_id && !notifiedBookingIds.has(b.id),
        );

        if (toNotify.length) {
          const settled = await Promise.allSettled(
            toNotify.map((b) =>
              notifyReviewRequest(b.customer_id, {
                bookingId: b.id,
                serviceName: titleMap[b.listing_id] || "the event",
              }),
            ),
          );
          logSettledErrors(settled, "event review requests", results);
          results.reviews += toNotify.length;
        }
      }
    }

    // ── 5. Re-engage inactive vendors ────────────────────────────────────────
    const { data: inactiveVendors } = await supabase
      .from("users")
      .select("id, name")
      .eq("role", "vendor")
      .lt("updated_at", daysAgo(VENDOR_INACTIVE_DAYS));

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

    // ── 6. Weekly platform digest for admins ─────────────────────────────────
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
