/**
 * POST /api/bookings/hotel/[id]/cancel
 *
 * Cancels a hotel booking. Rules:
 *  - Only the booking owner may cancel (or an admin).
 *  - Bookings in 'cancelled' or 'checked_in' / 'checked_out' status cannot be cancelled.
 *  - Check-in date must not have already passed.
 *  - If payment_status is 'paid', a Paystack refund is initiated automatically.
 *  - The held room is released back to 'available'.
 *  - Both the customer and the vendor receive in-app notifications.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  notifyBookingCancelled,
  notifySystem,
} from "@/lib/notifications";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

async function initiatePaystackRefund(reference, amountKobo) {
  const body = { transaction: reference };
  if (amountKobo) body.amount = amountKobo; // partial refund support

  const res = await fetch("https://api.paystack.co/refund", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json;
}

export async function POST(request, { params }) {
  const { id: bookingId } = await params;

  const supabase = await createClient();
  const admin = createAdminClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch booking
  const { data: booking, error: fetchErr } = await admin
    .from("hotel_bookings")
    .select(
      `id, customer_id, hotel_id, room_id, booking_status, payment_status,
       check_in_date, total_price, guest_email, guest_name,
       hotels:hotel_id ( name, vendor_id, vendors!inner(user_id) )`
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (fetchErr || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Ownership check (customer or admin)
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";
  const isOwner = booking.customer_id === user.id;

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Non-cancellable statuses
  const nonCancellable = ["cancelled", "checked_in", "checked_out", "no_show"];
  if (nonCancellable.includes(booking.booking_status)) {
    return NextResponse.json(
      { error: `This booking cannot be cancelled (status: ${booking.booking_status})` },
      { status: 400 }
    );
  }

  // Cannot cancel after check-in date has passed
  const checkInDate = new Date(booking.check_in_date);
  checkInDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    return NextResponse.json(
      { error: "Check-in date has already passed. Please contact support." },
      { status: 400 }
    );
  }

  // Cancel the booking
  const { error: cancelErr } = await admin
    .from("hotel_bookings")
    .update({ booking_status: "cancelled" })
    .eq("id", bookingId);

  if (cancelErr) {
    console.error("[hotel-cancel] booking update error:", cancelErr.message);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }

  // Release the room back to available
  if (booking.room_id) {
    await admin
      .from("hotel_rooms")
      .update({ status: "available" })
      .eq("id", booking.room_id);
  }

  // Attempt Paystack refund if the booking was paid
  let refundResult = null;
  if (booking.payment_status === "paid" && PAYSTACK_SECRET) {
    // Look up the payment reference
    const { data: payment } = await admin
      .from("payments")
      .select("reference, amount")
      .eq("hotel_booking_id", bookingId)
      .eq("status", "successful")
      .maybeSingle();

    if (payment?.reference) {
      try {
        // Paystack refund amount is in kobo (multiply NGN × 100)
        const amountKobo = Math.round(parseFloat(booking.total_price) * 100);
        refundResult = await initiatePaystackRefund(payment.reference, amountKobo);
        if (!refundResult?.status) {
          console.warn("[hotel-cancel] Paystack refund failed:", refundResult?.message);
        }
      } catch (err) {
        // Refund failure must not block the cancellation response
        console.error("[hotel-cancel] Paystack refund error:", err.message);
      }
    }
  }

  // Notify customer
  if (booking.customer_id) {
    notifyBookingCancelled(booking.customer_id, {
      bookingId,
      serviceName: booking.hotels?.name || "your hotel",
      bookingType: "hotel",
    }).catch(() => {});
  }

  // Notify vendor
  const vendorUserId = booking.hotels?.vendors?.user_id;
  if (vendorUserId) {
    notifySystem(vendorUserId, {
      title: "Booking Cancelled",
      message: `A booking at ${booking.hotels?.name ?? "your hotel"} by ${booking.guest_name} has been cancelled.`,
      link: `/vendor/dashboard`,
    }).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    refund_initiated: !!(refundResult?.status),
    refund_message: refundResult?.message ?? null,
  });
}
