// app/api/bookings/apartment/[id]/messages/route.js
// Guest-host messaging for apartment bookings

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getBookingAndRole(supabase, bookingId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, booking: null, role: null };

  const { data: booking } = await supabase
    .from("apartment_bookings")
    .select(`
      id, user_id, apartment_id,
      serviced_apartments!inner (
        vendor_id,
        vendors!inner ( user_id )
      )
    `)
    .eq("id", bookingId)
    .single();

  if (!booking) return { user, booking: null, role: null };

  let role = null;
  if (booking.user_id === user.id) role = "guest";
  else if (booking.serviced_apartments?.vendors?.user_id === user.id) role = "vendor";

  return { user, booking, role };
}

// GET /api/bookings/apartment/[id]/messages
export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { user, role } = await getBookingAndRole(supabase, id);

  if (!user || !role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: messages, error } = await supabase
    .from("booking_messages")
    .select("id, sender_id, sender_role, message, read_at, created_at")
    .eq("booking_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark unread messages from other party as read
  const unread = (messages || [])
    .filter((m) => m.sender_id !== user.id && !m.read_at)
    .map((m) => m.id);

  if (unread.length) {
    supabase
      .from("booking_messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unread)
      .then()
      .catch(() => {});
  }

  return NextResponse.json({ messages: messages || [], role });
}

// POST /api/bookings/apartment/[id]/messages
export async function POST(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { user, role } = await getBookingAndRole(supabase, id);

  if (!user || !role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await request.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: "Message too long (max 2000 chars)" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("booking_messages")
    .insert({
      booking_id: id,
      sender_id: user.id,
      sender_role: role,
      message: message.trim(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
