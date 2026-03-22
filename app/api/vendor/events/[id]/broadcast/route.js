/**
 * POST /api/vendor/events/[id]/broadcast
 * Sends a notification to all confirmed ticket holders of an event.
 * Only the listing's vendor may call this endpoint.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyMany } from "@/lib/notifications";

export async function POST(request, { params }) {
  const { id } = await params;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, message } = body;

  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }
  if (title.length > 100) {
    return NextResponse.json({ error: "Title must be 100 characters or fewer" }, { status: 400 });
  }
  if (message.length > 1000) {
    return NextResponse.json({ error: "Message must be 1000 characters or fewer" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Confirm vendor owns the listing
  const { data: listing } = await admin
    .from("listings")
    .select("id, title, vendor_id, vendors!inner(user_id)")
    .eq("id", id)
    .maybeSingle();

  if (!listing || listing.vendors?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all confirmed attendees with a user_id (registered users only)
  const { data: bookings, error: bookingErr } = await admin
    .from("event_bookings")
    .select("customer_id")
    .eq("listing_id", id)
    .in("status", ["confirmed", "completed"])
    .not("customer_id", "is", null);

  if (bookingErr) {
    console.error("[broadcast] booking fetch error:", bookingErr.message);
    return NextResponse.json({ error: "Failed to fetch attendees" }, { status: 500 });
  }

  if (!bookings?.length) {
    return NextResponse.json({ sent: 0, message: "No confirmed attendees to notify." });
  }

  // De-duplicate customer IDs
  const customerIds = [...new Set(bookings.map((b) => b.customer_id))];

  await notifyMany(customerIds, {
    title: title.trim(),
    message: message.trim(),
    link: `/services/${id}`,
    type: "system",
  });

  return NextResponse.json({ sent: customerIds.length });
}
