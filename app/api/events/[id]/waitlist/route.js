/**
 * POST /api/events/[id]/waitlist  — join the waitlist for a sold-out event
 * DELETE /api/events/[id]/waitlist — leave the waitlist
 * GET  /api/events/[id]/waitlist  — check if the current user/email is on the waitlist
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !email) {
    return NextResponse.json({ onWaitlist: false });
  }

  const admin = createAdminClient();
  let query = admin.from("event_waitlist").select("id").eq("listing_id", id);

  if (user) {
    query = query.eq("user_id", user.id);
  } else {
    query = query.ilike("email", email);
  }

  const { data } = await query.maybeSingle();
  return NextResponse.json({ onWaitlist: !!data, id: data?.id ?? null });
}

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { email, name } = body;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verify the event exists and is actually sold out
  const admin = createAdminClient();
  const { data: listing } = await admin
    .from("listings")
    .select("id, remaining_tickets, ticket_packages")
    .eq("id", id)
    .maybeSingle();

  if (!listing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Check if tickets are actually available (don't allow waitlist when tickets are available)
  const hasPkgs = Array.isArray(listing.ticket_packages) && listing.ticket_packages.length > 0;
  const soldOut = hasPkgs
    ? listing.ticket_packages.every((p) => (parseInt(p.remaining) || 0) === 0)
    : (parseInt(listing.remaining_tickets) || 0) === 0;

  if (!soldOut) {
    return NextResponse.json({ error: "Tickets are still available — no need to join waitlist" }, { status: 400 });
  }

  const { error } = await admin.from("event_waitlist").upsert(
    {
      listing_id: id,
      user_id: user?.id ?? null,
      email: email.toLowerCase(),
      name: name?.trim() || null,
    },
    { onConflict: "listing_id,email", ignoreDuplicates: true }
  );

  if (error) {
    console.error("[waitlist] join error:", error.message);
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !email) {
    return NextResponse.json({ error: "Must be logged in or provide email" }, { status: 401 });
  }

  const admin = createAdminClient();
  let query = admin.from("event_waitlist").delete().eq("listing_id", id);

  if (user) {
    query = query.eq("user_id", user.id);
  } else {
    query = query.ilike("email", email);
  }

  const { error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to leave waitlist" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
