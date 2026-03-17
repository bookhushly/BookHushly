import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/vendor/views — view stats for the authenticated vendor's listings
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Resolve vendor record
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const vendorId = vendor.id;

    // Parallel queries
    const now = new Date();
    const last7d  = new Date(now - 7  * 24 * 60 * 60 * 1000).toISOString();
    const last30d = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [totalRes, last7dRes, last30dRes, perListingRes] = await Promise.all([
      supabase
        .from("listing_views")
        .select("id", { count: "exact", head: true })
        .eq("vendor_id", vendorId),
      supabase
        .from("listing_views")
        .select("id", { count: "exact", head: true })
        .eq("vendor_id", vendorId)
        .gte("viewed_at", last7d),
      supabase
        .from("listing_views")
        .select("id", { count: "exact", head: true })
        .eq("vendor_id", vendorId)
        .gte("viewed_at", last30d),
      // Per-listing breakdown (listing_id, listing_type, count)
      supabase
        .from("listing_views")
        .select("listing_id, listing_type")
        .eq("vendor_id", vendorId)
        .gte("viewed_at", last30d),
    ]);

    // Aggregate per-listing
    const listingCounts = {};
    for (const row of perListingRes.data ?? []) {
      const key = `${row.listing_id}::${row.listing_type}`;
      listingCounts[key] = (listingCounts[key] || 0) + 1;
    }
    const perListing = Object.entries(listingCounts).map(([key, count]) => {
      const [listing_id, listing_type] = key.split("::");
      return { listing_id, listing_type, views: count };
    });
    perListing.sort((a, b) => b.views - a.views);

    return NextResponse.json({
      total: totalRes.count ?? 0,
      last7d: last7dRes.count ?? 0,
      last30d: last30dRes.count ?? 0,
      perListing: perListing.slice(0, 20),
    });
  } catch (err) {
    console.error("GET /api/vendor/views error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
