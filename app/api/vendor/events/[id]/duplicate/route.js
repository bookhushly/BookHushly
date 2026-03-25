/**
 * POST /api/vendor/events/[id]/duplicate
 * Clones an event listing as a new draft owned by the same vendor.
 *
 * - Copies all listing fields except id, created_at, status (set to "pending"), visibility (set to "draft")
 * - Resets ticket remaining counts to equal total (fresh inventory)
 * - Returns the new listing id so the vendor can be redirected to the editor
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

  const admin = createAdminClient();

  // Fetch listing with vendor ownership check
  const { data: listing } = await admin
    .from("listings")
    .select("*, vendors!inner(user_id)")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (listing.vendors?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Reset ticket package remaining counts to total
  const clonedPackages = Array.isArray(listing.ticket_packages)
    ? listing.ticket_packages.map((pkg) => ({
        ...pkg,
        remaining: pkg.total ?? pkg.remaining ?? 0,
      }))
    : [];

  // Strip fields that must be fresh on the clone
  const { id, created_at, vendors, ...rest } = listing;

  const { data: newListing, error } = await admin
    .from("listings")
    .insert({
      ...rest,
      title: `${listing.title} (Copy)`,
      status: "pending",
      visibility: "draft",
      active: false,
      ticket_packages: clonedPackages,
      remaining_tickets: listing.total_tickets ?? 0,
      event_date: null,
      event_time: null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[duplicate-event]", error.message);
    return NextResponse.json({ error: "Failed to duplicate listing" }, { status: 500 });
  }

  return NextResponse.json({ id: newListing.id });
}
