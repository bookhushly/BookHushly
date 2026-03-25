/**
 * GET /api/vendor/events/[id]/refunds
 * Returns all refund requests for a specific event listing.
 * Only the listing's vendor may call this.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request, { params }) {
  const { id: listingId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Verify vendor ownership
  const { data: listing } = await admin
    .from("listings")
    .select("id, vendors!inner(user_id)")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing || listing.vendors?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: requests, error } = await admin
    .from("refund_requests")
    .select("id, booking_id, contact_email, reason, status, vendor_note, requested_at, resolved_at")
    .eq("listing_id", listingId)
    .order("requested_at", { ascending: false });

  if (error) {
    console.error("[vendor-refunds]", error.message);
    return NextResponse.json({ error: "Failed to fetch refunds" }, { status: 500 });
  }

  return NextResponse.json(requests || []);
}
