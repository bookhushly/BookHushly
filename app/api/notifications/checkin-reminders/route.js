/**
 * POST /api/notifications/checkin-reminders
 * Cron endpoint — runs every 6 hours, finds apartment bookings
 * with check-in within 48h and sends check-in instructions if not yet sent.
 *
 * Secured with Authorization: Bearer $CRON_SECRET
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifySystem } from "@/lib/notifications";

const { CRON_SECRET } = process.env;

export async function POST(request) {
  // Auth
  const auth = request.headers.get("authorization");
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Find confirmed bookings with check-in within the next 48 hours
  // that haven't had a check-in reminder sent yet
  const { data: bookings, error } = await supabase
    .from("apartment_bookings")
    .select(`
      id,
      user_id,
      guest_name,
      check_in_date,
      check_out_date,
      check_in_time,
      apartment_id,
      serviced_apartments!inner (
        name,
        address,
        area,
        city,
        state,
        landmark,
        check_in_time,
        check_out_time,
        house_rules,
        agent_phone,
        agent_name
      )
    `)
    .in("booking_status", ["confirmed"])
    .eq("payment_status", "paid")
    .gte("check_in_date", now.toISOString().split("T")[0])
    .lte("check_in_date", in48h.toISOString().split("T")[0])
    .is("checkin_reminder_sent_at", null); // track if already sent

  if (error) {
    console.error("[checkin-reminders] query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  const errors = [];

  for (const booking of bookings || []) {
    if (!booking.user_id) continue;
    const apt = booking.serviced_apartments;

    const checkInTime = apt.check_in_time || "12:00 PM";
    const checkOutTime = apt.check_out_time || "11:00 AM";
    const location = [apt.area, apt.city, apt.state].filter(Boolean).join(", ");
    const landmark = apt.landmark ? `\nLandmark: ${apt.landmark}` : "";
    const agentLine = apt.agent_name && apt.agent_phone
      ? `\nYour host: ${apt.agent_name} — ${apt.agent_phone}`
      : apt.agent_phone ? `\nHost contact: ${apt.agent_phone}` : "";

    const message =
      `Your check-in at ${apt.name} is tomorrow! ` +
      `Check-in time: ${checkInTime} · Check-out: ${checkOutTime}. ` +
      `Location: ${location}.${landmark}${agentLine} ` +
      `The full address will be provided on this page. See you soon!`;

    try {
      await notifySystem(booking.user_id, {
        title: `Check-in reminder — ${apt.name}`,
        message,
        link: `/dashboard/customer/apartments`,
        data: { bookingId: booking.id, type: "checkin_reminder" },
      });

      // Mark as sent
      await supabase
        .from("apartment_bookings")
        .update({ checkin_reminder_sent_at: new Date().toISOString() })
        .eq("id", booking.id);

      sent++;
    } catch (err) {
      errors.push({ bookingId: booking.id, error: err.message });
    }
  }

  return NextResponse.json({
    success: true,
    sent,
    errors: errors.length ? errors : undefined,
  });
}
