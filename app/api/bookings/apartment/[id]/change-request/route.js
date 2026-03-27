// app/api/bookings/apartment/[id]/change-request/route.js
// Guest-initiated date change requests for apartment bookings

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyBookingUpdated } from "@/lib/notifications";

// GET - list change requests for this booking
export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("booking_change_requests")
    .select("*")
    .eq("booking_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST - guest submits a change request
export async function POST(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify guest owns this booking
  const { data: booking } = await supabase
    .from("apartment_bookings")
    .select("id, user_id, booking_status, apartment_id")
    .eq("id", id)
    .single();

  if (!booking || booking.user_id !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (!["confirmed", "pending"].includes(booking.booking_status)) {
    return NextResponse.json({ error: "Only confirmed or pending bookings can be modified" }, { status: 400 });
  }

  const { new_check_in, new_check_out, reason } = await request.json();
  const today = new Date().toISOString().split("T")[0];

  if (!new_check_in || !new_check_out) {
    return NextResponse.json({ error: "new_check_in and new_check_out are required" }, { status: 400 });
  }
  if (new_check_in < today) {
    return NextResponse.json({ error: "Check-in date cannot be in the past" }, { status: 400 });
  }
  if (new_check_out <= new_check_in) {
    return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });
  }

  // Check for availability conflicts (excluding this booking)
  const { data: conflicts } = await supabase
    .from("apartment_bookings")
    .select("id")
    .eq("apartment_id", booking.apartment_id)
    .neq("id", id)
    .in("booking_status", ["confirmed", "checked_in"])
    .lt("check_in_date", new_check_out)
    .gt("check_out_date", new_check_in);

  if (conflicts?.length) {
    return NextResponse.json({ error: "New dates overlap with an existing booking" }, { status: 409 });
  }

  // Check vendor blocked dates
  const { data: blockedConflicts } = await supabase
    .from("apartment_blocked_dates")
    .select("id")
    .eq("apartment_id", booking.apartment_id)
    .lte("start_date", new_check_out)
    .gte("end_date", new_check_in);

  if (blockedConflicts?.length) {
    return NextResponse.json({ error: "Some of the requested dates are blocked by the host" }, { status: 409 });
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("booking_change_requests")
    .insert({
      booking_id: id,
      requested_by: user.id,
      new_check_in,
      new_check_out,
      reason: reason || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}

// PATCH - vendor approves or declines
export async function PATCH(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { request_id, status, vendor_note } = await request.json();
  if (!request_id || !["approved", "declined"].includes(status)) {
    return NextResponse.json({ error: "request_id and status (approved|declined) required" }, { status: 400 });
  }

  // Verify vendor owns the apartment
  const { data: booking } = await supabase
    .from("apartment_bookings")
    .select(`id, user_id, apartment_id, serviced_apartments!inner(vendor_id, vendors!inner(user_id))`)
    .eq("id", id)
    .single();

  if (!booking || booking.serviced_apartments?.vendors?.user_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const adminSupabase = createAdminClient();

  // Fetch the change request
  const { data: cr } = await adminSupabase
    .from("booking_change_requests")
    .select("*")
    .eq("id", request_id)
    .eq("booking_id", id)
    .single();

  if (!cr || cr.status !== "pending") {
    return NextResponse.json({ error: "Change request not found or already resolved" }, { status: 404 });
  }

  // Update the change request
  const { error: crError } = await adminSupabase
    .from("booking_change_requests")
    .update({ status, vendor_note: vendor_note || null, resolved_at: new Date().toISOString() })
    .eq("id", request_id);

  if (crError) return NextResponse.json({ error: crError.message }, { status: 500 });

  // If approved, update the actual booking dates
  if (status === "approved") {
    const nights = Math.ceil(
      (new Date(cr.new_check_out) - new Date(cr.new_check_in)) / (1000 * 60 * 60 * 24)
    );
    const { error: bookingError } = await adminSupabase
      .from("apartment_bookings")
      .update({
        check_in_date: cr.new_check_in,
        check_out_date: cr.new_check_out,
        number_of_nights: nights,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (bookingError) return NextResponse.json({ error: bookingError.message }, { status: 500 });

    // Notify guest
    try {
      await notifyBookingUpdated(booking.user_id, {
        bookingId: id,
        message: `Your date change request was approved. New dates: ${cr.new_check_in} → ${cr.new_check_out}`,
      });
    } catch { /* non-critical */ }
  }

  return NextResponse.json({ success: true, status });
}
