// app/api/vendor/apartments/blocked-dates/route.js
// Manage vendor-controlled date blocks for serviced apartments

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getVendorId(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();
  return data?.id || null;
}

// GET /api/vendor/apartments/blocked-dates?apartment_id=xxx&year=2026&month=3
export async function GET(request) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const apartmentId = searchParams.get("apartment_id");
  const year = parseInt(searchParams.get("year") || new Date().getFullYear());
  const month = parseInt(searchParams.get("month") || new Date().getMonth() + 1);

  if (!apartmentId) {
    return NextResponse.json({ error: "apartment_id is required" }, { status: 400 });
  }

  // Date range for the requested month (with 1-month buffer each side for calendar display)
  const start = `${year}-${String(month - 1 || 12).padStart(2, "0")}-01`;
  const endMonth = month + 1 > 12 ? 1 : month + 1;
  const endYear = month + 1 > 12 ? year + 1 : year;
  const end = `${endYear}-${String(endMonth).padStart(2, "0")}-28`;

  const [{ data: blocked }, { data: booked }] = await Promise.all([
    supabase
      .from("apartment_blocked_dates")
      .select("id, start_date, end_date, reason")
      .eq("apartment_id", apartmentId)
      .gte("end_date", start)
      .lte("start_date", end),
    supabase
      .from("apartment_bookings")
      .select("check_in_date, check_out_date, booking_status, guest_name")
      .eq("apartment_id", apartmentId)
      .in("booking_status", ["confirmed", "checked_in", "pending"])
      .gte("check_out_date", start)
      .lte("check_in_date", end),
  ]);

  return NextResponse.json({ blocked: blocked || [], booked: booked || [] });
}

// POST /api/vendor/apartments/blocked-dates
// Body: { apartment_id, start_date, end_date, reason }
export async function POST(request) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { apartment_id, start_date, end_date, reason } = body;

  if (!apartment_id || !start_date || !end_date) {
    return NextResponse.json({ error: "apartment_id, start_date and end_date are required" }, { status: 400 });
  }

  // Verify this apartment belongs to this vendor
  const { data: apt } = await supabase
    .from("serviced_apartments")
    .select("id")
    .eq("id", apartment_id)
    .eq("vendor_id", vendorId)
    .single();

  if (!apt) {
    return NextResponse.json({ error: "Apartment not found or not yours" }, { status: 403 });
  }

  // Check for conflicting confirmed bookings
  const { data: conflicts } = await supabase
    .from("apartment_bookings")
    .select("id, guest_name, check_in_date, check_out_date")
    .eq("apartment_id", apartment_id)
    .in("booking_status", ["confirmed", "checked_in"])
    .lt("check_in_date", end_date)
    .gt("check_out_date", start_date);

  if (conflicts?.length) {
    return NextResponse.json(
      { error: `Cannot block: ${conflicts.length} confirmed booking(s) overlap these dates`, conflicts },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("apartment_blocked_dates")
    .insert({ apartment_id, vendor_id: vendorId, start_date, end_date, reason: reason || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

// DELETE /api/vendor/apartments/blocked-dates?id=xxx
export async function DELETE(request) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("apartment_blocked_dates")
    .delete()
    .eq("id", id)
    .eq("vendor_id", vendorId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
