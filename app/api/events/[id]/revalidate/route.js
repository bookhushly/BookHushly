/**
 * POST /api/events/[id]/revalidate
 * Clears the Next.js unstable_cache for a specific event listing.
 * Called by the vendor dashboard after ticket count changes so the public
 * detail page reflects fresh data on the next request.
 *
 * Secured: only the listing's vendor (via session) may call this.
 */

import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request, { params }) {
  const { id } = await params;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the caller owns this listing
  const admin = createAdminClient();
  const { data: listing } = await admin
    .from("listings")
    .select("vendor_id, vendors!inner(user_id)")
    .eq("id", id)
    .maybeSingle();

  if (!listing || listing.vendors?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  revalidateTag(`event-listing-${id}`);
  return NextResponse.json({ revalidated: true });
}
