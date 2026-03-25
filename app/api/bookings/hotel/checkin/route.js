/**
 * POST /api/bookings/hotel/checkin
 *
 * Marks a hotel booking as checked-in.
 * Called by the receptionist portal (or vendor dashboard) when a guest arrives.
 *
 * Body: { code: "XXXXXXXX" }   — the 8-char check-in code shown on the guest's QR
 *    OR { booking_id: "uuid" } — direct lookup if the receptionist types the ID
 *
 * Auth: vendor or admin only (enforced by checking the hotel's vendor ownership).
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifySystem } from "@/lib/notifications";

export async function POST(request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Caller must be vendor or admin
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!["vendor", "admin", "receptionist"].includes(profile?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { code, booking_id } = body;

  if (!code && !booking_id) {
    return NextResponse.json(
      { error: "Provide either 'code' or 'booking_id'" },
      { status: 400 },
    );
  }

  // Fetch the booking
  const query = admin
    .from("hotel_bookings")
    .select(
      `id, hotel_id, customer_id, guest_name, guest_email,
       booking_status, payment_status, checked_in, check_in_date, check_out_date,
       check_in_code,
       hotels:hotel_id ( name, vendor_id, vendors!inner(user_id) )`
    );

  const { data: booking } = code
    ? await query.eq("check_in_code", code.toUpperCase().trim()).maybeSingle()
    : await query.eq("id", booking_id).maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Vendor ownership check — vendor may only check-in guests at their own hotel
  if (profile?.role === "vendor") {
    const { data: vendor } = await admin
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (booking.hotels?.vendor_id !== vendor?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Validate booking state
  if (booking.checked_in) {
    return NextResponse.json(
      { error: "Guest is already checked in", booking },
      { status: 409 },
    );
  }

  if (booking.booking_status === "cancelled") {
    return NextResponse.json({ error: "Booking is cancelled" }, { status: 400 });
  }

  if (booking.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Payment has not been completed for this booking" },
      { status: 400 },
    );
  }

  // Perform check-in
  const { error: updateErr } = await admin
    .from("hotel_bookings")
    .update({
      checked_in:    true,
      checked_in_at: new Date().toISOString(),
      booking_status: "checked_in",
    })
    .eq("id", booking.id);

  if (updateErr) {
    console.error("[hotel-checkin] update error:", updateErr.message);
    return NextResponse.json({ error: "Failed to check in guest" }, { status: 500 });
  }

  // Notify guest (best-effort)
  if (booking.customer_id) {
    notifySystem(booking.customer_id, {
      title: "Welcome! You're checked in",
      message: `You have been checked in at ${booking.hotels?.name ?? "the hotel"}. Enjoy your stay!`,
      link: `/dashboard/customer/hotels`,
    }).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    booking: {
      id:             booking.id,
      guest_name:     booking.guest_name,
      check_in_date:  booking.check_in_date,
      check_out_date: booking.check_out_date,
      hotel_name:     booking.hotels?.name,
    },
  });
}

/**
 * GET /api/bookings/hotel/checkin?code=XXXXXXXX
 *
 * Look up a booking by its check-in code without marking it as checked in.
 * Used by the receptionist UI to preview before confirming.
 */
export async function GET(request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!["vendor", "admin", "receptionist"].includes(profile?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const code = new URL(request.url).searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code param required" }, { status: 400 });

  const { data: booking } = await admin
    .from("hotel_bookings")
    .select(
      `id, guest_name, guest_email, guest_phone, check_in_date, check_out_date,
       adults, children, booking_status, payment_status, checked_in, check_in_code,
       hotels:hotel_id ( name, city, state )`
    )
    .eq("check_in_code", code.toUpperCase().trim())
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}
