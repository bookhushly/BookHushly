/**
 * POST /api/notifications/hotel-reminders
 * Cron endpoint — runs twice daily, sends pre-arrival emails/notifications
 * to guests whose check-in is in ~48 hours.
 *
 * Secured with Authorization: Bearer $CRON_SECRET
 *
 * Idempotency: we store a `reminder_sent_48h` flag on each booking row so
 * the same reminder is never sent twice even if the cron fires multiple times.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyMany } from "@/lib/notifications";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "hotels@bookhushly.com";
const BATCH_SIZE = 50;
const { CRON_SECRET } = process.env;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildPreArrivalEmailHtml(booking) {
  const { hotel, room_type, check_in_date, check_in_code, guest_name } = booking;

  const checkInStr = check_in_date
    ? new Date(check_in_date).toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const hotelAddress = [hotel.address, hotel.city, hotel.state]
    .filter(Boolean)
    .join(", ");

  const whatsappLink = hotel.whatsapp_number
    ? `https://wa.me/${hotel.whatsapp_number.replace(/\D/g, "")}`
    : null;

  const checkoutPolicy =
    hotel.checkout_policy === "24_hours"
      ? "24 hours from your check-in time"
      : "12:00 PM (noon) on your check-out date";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px 40px;text-align:center">
      <div style="font-size:40px;margin-bottom:8px">🏨</div>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">Your stay is in 2 days!</h1>
      <p style="color:#e9d5ff;margin:8px 0 0;font-size:14px">Here's everything you need to know</p>
    </div>

    <div style="padding:32px 40px">

      <!-- Greeting -->
      <p style="color:#374151;font-size:15px;margin:0 0 20px">
        Hi ${guest_name || "Guest"},<br><br>
        We're looking forward to welcoming you at <strong>${hotel.name}</strong>.
        Your check-in date is <strong>${checkInStr}</strong>.
      </p>

      <!-- Hotel info card -->
      <div style="background:#f5f3ff;border-radius:10px;padding:20px;margin-bottom:24px;border-left:4px solid #7c3aed">
        <p style="color:#111827;font-size:16px;font-weight:700;margin:0 0 4px">${hotel.name}</p>
        ${room_type?.name ? `<p style="color:#6b7280;font-size:13px;margin:0 0 12px">Room type: ${room_type.name}</p>` : ""}
        ${hotelAddress ? `<p style="color:#374151;font-size:14px;margin:0 0 8px">📍 ${hotelAddress}</p>` : ""}
        <p style="color:#374151;font-size:14px;margin:0">🕐 Checkout: ${checkoutPolicy}</p>
      </div>

      ${
        check_in_code
          ? `<!-- QR Check-in Code -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center">
        <p style="color:#166534;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px">Your Digital Check-in Code</p>
        <p style="color:#111827;font-size:32px;font-weight:800;letter-spacing:0.2em;margin:0 0 8px;font-family:monospace">${check_in_code}</p>
        <p style="color:#6b7280;font-size:12px;margin:0">Show this code (or the QR in your dashboard) at the front desk</p>
      </div>`
          : ""
      }

      <!-- Pre-arrival checklist -->
      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 10px">Before you arrive:</p>
        <ul style="color:#6b7280;font-size:14px;padding-left:20px;margin:0;line-height:2">
          <li>Bring a valid government-issued ID (required for check-in)</li>
          <li>Have your booking confirmation / check-in code ready</li>
          <li>Note any special requests you made — the hotel has been informed</li>
        </ul>
      </div>

      <!-- CTA buttons -->
      <div style="margin-bottom:28px">
        <a href="https://bookhushly.com/dashboard/customer/hotels"
          style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;margin-right:12px">
          View Booking
        </a>
        ${
          whatsappLink
            ? `<a href="${whatsappLink}"
            style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600">
            💬 WhatsApp Hotel
          </a>`
            : ""
        }
      </div>

      <hr style="border:none;border-top:1px solid #f3f4f6;margin:0 0 20px">
      <p style="color:#9ca3af;font-size:12px;margin:0">
        You're receiving this because you have an upcoming stay booked through
        <a href="https://bookhushly.com" style="color:#7c3aed;text-decoration:none">BookHushly</a>.
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

  // Target: check_in_date is 47–49 hours from now (catches both 48h cron fires)
  const now = new Date();
  const windowStart = new Date(now.getTime() + 47 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 49 * 60 * 60 * 1000);
  const windowStartDate = windowStart.toISOString().split("T")[0];
  const windowEndDate = windowEnd.toISOString().split("T")[0];

  // Fetch upcoming confirmed bookings that haven't been reminded yet
  const { data: bookings, error } = await admin
    .from("hotel_bookings")
    .select(
      `id, guest_name, guest_email, check_in_date, check_in_code,
       user_id,
       hotel:hotel_id(name, address, city, state, whatsapp_number, checkout_policy),
       room_type:room_type_id(name)`
    )
    .gte("check_in_date", windowStartDate)
    .lte("check_in_date", windowEndDate)
    .eq("booking_status", "confirmed")
    .eq("payment_status", "completed")
    .is("reminder_sent_48h", null); // only unsent reminders

  if (error) {
    console.error("[hotel-reminders] query error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!bookings?.length) {
    return NextResponse.json({ reminded: 0, message: "No upcoming check-ins in window" });
  }

  // In-app + push notification (batch)
  const userIds = [...new Set(bookings.map((b) => b.user_id).filter(Boolean))];
  if (userIds.length > 0) {
    await notifyMany(userIds, {
      type: "booking_updated",
      title: "🏨 Check-in reminder: 2 days to go!",
      message: "Your hotel stay is coming up. Tap to view your check-in code and hotel details.",
      link: "/dashboard/customer/hotels",
    }).catch((err) =>
      console.error("[hotel-reminders] notify error:", err.message)
    );
  }

  // Email batch
  const validBookings = bookings.filter(
    (b) => b.guest_email && /^\S+@\S+\.\S+$/.test(b.guest_email)
  );

  const emailPayloads = validBookings.map((b) => ({
    from: FROM_EMAIL,
    to: b.guest_email,
    subject: `🏨 Check-in reminder: ${b.hotel?.name} — ${b.check_in_date}`,
    html: buildPreArrivalEmailHtml(b),
  }));

  const batches = chunk(emailPayloads, BATCH_SIZE);
  for (const batch of batches) {
    await resend.batch
      .send(batch)
      .catch((err) =>
        console.error("[hotel-reminders] email batch error:", err.message)
      );
  }

  // Mark as reminded (idempotency) — best-effort update
  const remindedIds = bookings.map((b) => b.id);
  await admin
    .from("hotel_bookings")
    .update({ reminder_sent_48h: new Date().toISOString() })
    .in("id", remindedIds)
    .catch((err) =>
      console.error("[hotel-reminders] flag update error:", err.message)
    );

  return NextResponse.json({
    reminded: bookings.length,
    emails_sent: validBookings.length,
  });
}
