/**
 * POST /api/bookings/event/[id]/transfer
 * Transfers an event booking to a new attendee email.
 *
 * Rules:
 * - Only the booking owner (customer_id) may transfer
 * - Booking must be confirmed + paid
 * - Event must not have already occurred
 * - New email must be different and valid
 * - Looks up user by new email; updates customer_id if found, otherwise guest transfer
 *
 * Scale: single-row update — O(1). Safe under high concurrency.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifySystem } from "@/lib/notifications";

export async function POST(request, { params }) {
  const { id: bookingId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { new_email } = body;

  if (!new_email || !/^\S+@\S+\.\S+$/.test(new_email)) {
    return NextResponse.json({ error: "A valid new_email is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch the booking
  const { data: booking } = await admin
    .from("event_bookings")
    .select(
      "id, listing_id, customer_id, contact_email, status, payment_status, listing:listing_id(title, event_date)",
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (booking.customer_id !== user.id) {
    return NextResponse.json({ error: "You can only transfer your own bookings" }, { status: 403 });
  }

  if (booking.status !== "confirmed" || booking.payment_status !== "completed") {
    return NextResponse.json(
      { error: "Only confirmed and paid bookings can be transferred" },
      { status: 400 },
    );
  }

  if (booking.listing?.event_date && new Date(booking.listing.event_date) < new Date()) {
    return NextResponse.json(
      { error: "Cannot transfer a booking after the event has occurred" },
      { status: 400 },
    );
  }

  const normalizedNewEmail = new_email.trim().toLowerCase();
  if (normalizedNewEmail === booking.contact_email?.toLowerCase()) {
    return NextResponse.json({ error: "The new email is the same as the current one" }, { status: 400 });
  }

  // Look up if new_email belongs to a registered user
  const { data: newUser } = await admin
    .from("users")
    .select("id")
    .eq("email", normalizedNewEmail)
    .maybeSingle();

  // Perform the transfer
  const { error: updateErr } = await admin
    .from("event_bookings")
    .update({
      customer_id: newUser?.id ?? null,
      contact_email: normalizedNewEmail,
    })
    .eq("id", bookingId);

  if (updateErr) {
    console.error("[ticket-transfer]", updateErr.message);
    return NextResponse.json({ error: "Transfer failed" }, { status: 500 });
  }

  const eventTitle = booking.listing?.title ?? "your event";

  // Notify previous owner
  notifySystem(user.id, {
    title: "Ticket Transferred",
    message: `Your ticket for "${eventTitle}" has been transferred to ${normalizedNewEmail}.`,
    link: "/dashboard/customer/events",
  }).catch(() => {});

  // Notify new owner (if registered)
  if (newUser?.id) {
    notifySystem(newUser.id, {
      title: "Ticket Received",
      message: `A ticket for "${eventTitle}" has been transferred to you.`,
      link: "/dashboard/customer/events",
    }).catch(() => {});
  }

  return NextResponse.json({ transferred_to: normalizedNewEmail });
}
