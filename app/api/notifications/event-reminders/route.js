/**
 * POST /api/notifications/event-reminders
 * Cron endpoint — runs every hour, sends reminders for events starting in the
 * next 24 hours (but not within the next hour, to avoid duplicate sends).
 *
 * Secured with Authorization: Bearer $CRON_SECRET
 *
 * Scale notes:
 * - Queries are indexed on event_date; no full table scan.
 * - We batch in-app notifications via notifyMany (single DB insert per batch).
 * - Email batch via Resend batch API (50/request).
 * - Uses an idempotency guard: stores sent booking IDs in listing.category_data
 *   to prevent duplicate reminders on multiple cron fires within the same window.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyMany } from "@/lib/notifications";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "events@bookhushly.com";
const BATCH_SIZE = 50;
const { CRON_SECRET } = process.env;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildReminderEmailHtml(eventTitle, eventDate, eventTime, location) {
  const dateStr = eventDate
    ? new Date(eventDate).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Soon";
  const timeStr = eventTime ? String(eventTime).slice(0, 5) : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px 40px;text-align:center">
      <div style="font-size:40px;margin-bottom:8px"></div>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">Your Event is Tomorrow!</h1>
    </div>
    <div style="padding:32px 40px">
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;font-weight:700">${eventTitle}</h2>
      <p style="color:#374151;font-size:15px;margin:0 0 20px">
        ${dateStr}${timeStr ? ` · ${timeStr}` : ""}${location ? `<br>${location}` : ""}
      </p>
      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="color:#374151;font-size:14px;margin:0 0 8px;font-weight:600">Before you go:</p>
        <ul style="color:#6b7280;font-size:14px;padding-left:20px;margin:0;line-height:1.8">
          <li>Download your ticket from your BookHushly dashboard</li>
          <li>Arrive 30 minutes early for smooth entry</li>
          <li>Bring a valid ID if the event requires it</li>
        </ul>
      </div>
      <a href="https://bookhushly.com/dashboard/customer/events"
        style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600">
        View My Ticket
      </a>
      <hr style="border:none;border-top:1px solid #f3f4f6;margin:28px 0">
      <p style="color:#9ca3af;font-size:12px;margin:0">
        Powered by <a href="https://bookhushly.com" style="color:#7c3aed;text-decoration:none">BookHushly</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Events starting between 23h and 25h from now
  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const windowStartDate = windowStart.toISOString().split("T")[0];
  const windowEndDate = windowEnd.toISOString().split("T")[0];

  // Fetch events in that date window
  const { data: listings } = await admin
    .from("listings")
    .select("id, title, event_date, event_time, location, category_data")
    .gte("event_date", windowStartDate)
    .lte("event_date", windowEndDate)
    .eq("visibility", "public");

  if (!listings?.length) {
    return NextResponse.json({ reminded: 0, message: "No events in reminder window" });
  }

  let totalReminded = 0;

  for (const listing of listings) {
    const reminderKey = `reminded_24h_${windowStartDate}`;
    if (listing.category_data?.[reminderKey]) continue; // already sent for this window

    // Fetch confirmed bookings for this event
    const { data: bookings } = await admin
      .from("event_bookings")
      .select("id, customer_id, contact_email, users:customer_id(email)")
      .eq("listing_id", listing.id)
      .in("status", ["confirmed"]);

    if (!bookings?.length) continue;

    // Collect user IDs for in-app push notification
    const userIds = [...new Set(bookings.map((b) => b.customer_id).filter(Boolean))];

    // In-app + push notification
    if (userIds.length > 0) {
      await notifyMany(userIds, {
        type: "booking_updated",
        title: `Reminder: ${listing.title} is tomorrow!`,
        message: `Your event starts ${listing.event_time ? `at ${String(listing.event_time).slice(0, 5)}` : "tomorrow"}. Remember to bring your ticket and arrive early.`,
        link: "/dashboard/customer/events",
      }).catch(() => {});
    }

    // Email reminder
    const emailSet = new Set();
    for (const b of bookings) {
      const addr = b.users?.email || b.contact_email;
      if (addr && /^\S+@\S+\.\S+$/.test(addr)) emailSet.add(addr.toLowerCase());
    }

    const html = buildReminderEmailHtml(
      listing.title,
      listing.event_date,
      listing.event_time,
      listing.location,
    );

    const batches = chunk([...emailSet], BATCH_SIZE);
    for (const batch of batches) {
      await resend.batch
        .send(
          batch.map((to) => ({
            from: FROM_EMAIL,
            to,
            subject: `Reminder: ${listing.title} is tomorrow!`,
            html,
          })),
        )
        .catch((err) => console.error("[event-reminders] email batch:", err.message));
    }

    totalReminded += bookings.length;

    // Mark as reminded (idempotency guard)
    await admin
      .from("listings")
      .update({
        category_data: {
          ...(listing.category_data || {}),
          [reminderKey]: new Date().toISOString(),
        },
      })
      .eq("id", listing.id)
      .catch(() => {});
  }

  return NextResponse.json({ reminded: totalReminded, events: listings.length });
}
