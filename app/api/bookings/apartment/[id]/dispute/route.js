// app/api/bookings/apartment/[id]/dispute/route.js

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAdminPaymentIssue } from "@/lib/notifications";

async function getParticipant(supabase, bookingId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, role: null, booking: null };

  const { data: booking } = await supabase
    .from("apartment_bookings")
    .select(`id, user_id, apartment_id, serviced_apartments!inner(vendor_id, vendors!inner(user_id))`)
    .eq("id", bookingId)
    .single();

  if (!booking) return { user, role: null, booking: null };

  let role = null;
  if (booking.user_id === user.id) role = "guest";
  else if (booking.serviced_apartments?.vendors?.user_id === user.id) role = "vendor";

  return { user, role, booking };
}

export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { user, role } = await getParticipant(supabase, id);
  if (!user || !role) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("booking_disputes")
    .select("*")
    .eq("booking_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, role });
}

export async function POST(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { user, role, booking } = await getParticipant(supabase, id);
  if (!user || !role) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { type, description, amount_claimed } = body;

  if (!type || !description) {
    return NextResponse.json({ error: "type and description are required" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("booking_disputes")
    .insert({
      booking_id: id,
      raised_by: user.id,
      raised_by_role: role,
      type,
      description,
      amount_claimed: amount_claimed || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify admins
  try {
    await notifyAdminPaymentIssue({
      message: `New ${type} dispute raised on booking ${id.slice(0, 8)} by ${role}. Amount: ${amount_claimed ? `₦${amount_claimed}` : "N/A"}.`,
      data: { bookingId: id, disputeId: data.id },
    });
  } catch { /* non-critical */ }

  return NextResponse.json({ data }, { status: 201 });
}
