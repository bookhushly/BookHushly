/**
 * POST /api/events/[id]/checkin
 * Toggles the checked_in flag for a specific booking.
 * Only the event's vendor may call this.
 *
 * Body: { booking_id: string, checked_in: boolean }
 *
 * Scale: uses admin client; each toggle is a single-row update — O(1).
 * At 10k concurrent users this endpoint is safe: check-ins happen on the
 * day of the event and are serialised per booking_id (not per event).
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request, { params }) {
  const { id: listingId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { booking_id, checked_in } = body;

  if (!booking_id || typeof checked_in !== "boolean") {
    return NextResponse.json(
      { error: "booking_id and checked_in (boolean) are required" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Verify the user is the listing's vendor
  const { data: listing } = await admin
    .from("listings")
    .select("id, vendors!inner(user_id)")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing || listing.vendors?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify the booking belongs to this listing
  const { data: booking } = await admin
    .from("event_bookings")
    .select("id, listing_id, checked_in")
    .eq("id", booking_id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Update check-in status
  const { data: updated, error } = await admin
    .from("event_bookings")
    .update({
      checked_in,
      checked_in_at: checked_in ? new Date().toISOString() : null,
    })
    .eq("id", booking_id)
    .select("id, checked_in, checked_in_at")
    .single();

  if (error) {
    console.error("[checkin]", error.message);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ booking: updated });
}
