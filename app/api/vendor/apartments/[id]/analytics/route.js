import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { subMonths, startOfMonth, format } from "date-fns";

export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify caller owns this apartment
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: apt } = await supabase
    .from("serviced_apartments")
    .select("id, vendor_id, views_count, vendors!inner(user_id)")
    .eq("id", id)
    .single();

  if (!apt || apt.vendors?.user_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all bookings for this apartment in the last 6 months
  const since = format(startOfMonth(subMonths(new Date(), 5)), "yyyy-MM-dd");

  const { data: bookings, error } = await supabase
    .from("apartment_bookings")
    .select("id, booking_status, payment_status, check_in_date, check_out_date, total_amount, number_of_guests, created_at")
    .eq("apartment_id", id)
    .gte("check_in_date", since)
    .order("check_in_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    bookings: bookings || [],
    views_count: apt.views_count ?? null,
  });
}
