/**
 * POST /api/refunds/request
 * Customer submits a refund request for an event booking.
 *
 * Rules:
 * - Only confirmed bookings with completed payment can be refunded
 * - One active request per booking (duplicate prevented by UNIQUE constraint)
 * - Event must not have already occurred
 * - Guest (no auth) bookings: must match contact_email in booking
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifySystem } from "@/lib/notifications";

export async function POST(request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const body = await request.json().catch(() => ({}));
  const { booking_id, reason, contact_email } = body;

  if (!booking_id || !reason?.trim()) {
    return NextResponse.json({ error: "booking_id and reason are required" }, { status: 400 });
  }
  if (reason.length > 500) {
    return NextResponse.json({ error: "Reason must be ≤ 500 characters" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the booking
  const { data: booking } = await admin
    .from("event_bookings")
    .select("id, listing_id, customer_id, contact_email, status, payment_status, listing:listing_id(event_date, title)")
    .eq("id", booking_id)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Authorization: must be the booking owner or matching guest email
  const isOwner = user && booking.customer_id === user.id;
  const isGuest =
    !booking.customer_id &&
    contact_email &&
    booking.contact_email?.toLowerCase() === contact_email.toLowerCase();

  if (!isOwner && !isGuest) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only refund confirmed + paid bookings
  if (booking.status !== "confirmed" || booking.payment_status !== "completed") {
    return NextResponse.json(
      { error: "Only confirmed and paid bookings can be refunded" },
      { status: 400 },
    );
  }

  // Don't allow refunds after the event has passed
  if (booking.listing?.event_date) {
    const eventDate = new Date(booking.listing.event_date);
    if (eventDate < new Date()) {
      return NextResponse.json(
        { error: "Refund requests cannot be submitted after the event has passed" },
        { status: 400 },
      );
    }
  }

  // Insert refund request (UNIQUE(booking_id) prevents duplicates)
  const { data: refundRequest, error: insertErr } = await admin
    .from("refund_requests")
    .insert({
      booking_id,
      listing_id: booking.listing_id,
      customer_id: user?.id ?? null,
      contact_email: (user?.email || contact_email || booking.contact_email || "").toLowerCase(),
      reason: reason.trim(),
    })
    .select()
    .single();

  if (insertErr) {
    if (insertErr.code === "23505") {
      return NextResponse.json(
        { error: "A refund request for this booking already exists" },
        { status: 409 },
      );
    }
    console.error("[refund-request]", insertErr.message);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }

  // Notify vendor (best-effort)
  const { data: listing } = await admin
    .from("listings")
    .select("vendor_id, vendors!inner(user_id)")
    .eq("id", booking.listing_id)
    .maybeSingle();

  if (listing?.vendors?.user_id) {
    notifySystem(listing.vendors.user_id, {
      title: "New Refund Request",
      message: `A customer has requested a refund for "${booking.listing?.title ?? "your event"}".`,
      link: `/vendor/dashboard/event-management/${booking.listing_id}`,
    }).catch(() => {});
  }

  return NextResponse.json({ refund_request: refundRequest }, { status: 201 });
}
