import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getAdminUser(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

// GET /api/admin/views — platform-wide view stats
export async function GET() {
  try {
    const supabase = await createClient();
    const admin = await getAdminUser(supabase);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const last7d  = new Date(now - 7  * 24 * 60 * 60 * 1000).toISOString();
    const last30d = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [totalRes, last7dRes, last30dRes, byTypeRes, topListingsRes, dailyRes] =
      await Promise.all([
        supabase.from("listing_views").select("id", { count: "exact", head: true }),
        supabase.from("listing_views").select("id", { count: "exact", head: true }).gte("viewed_at", last7d),
        supabase.from("listing_views").select("id", { count: "exact", head: true }).gte("viewed_at", last30d),

        // Views by listing type
        supabase.from("listing_views").select("listing_type").gte("viewed_at", last30d),

        // Top listings (last 30d)
        supabase.from("listing_views")
          .select("listing_id, listing_type, vendor_id")
          .gte("viewed_at", last30d),

        // Daily trend (last 30d) — count per day
        supabase.from("listing_views")
          .select("viewed_at")
          .gte("viewed_at", last30d)
          .order("viewed_at", { ascending: true }),
      ]);

    // Aggregate by type
    const typeCounts = {};
    for (const row of byTypeRes.data ?? []) {
      typeCounts[row.listing_type] = (typeCounts[row.listing_type] || 0) + 1;
    }
    const byType = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

    // Top listings
    const listingCounts = {};
    const listingVendors = {};
    for (const row of topListingsRes.data ?? []) {
      const key = `${row.listing_id}::${row.listing_type}`;
      listingCounts[key] = (listingCounts[key] || 0) + 1;
      if (row.vendor_id) listingVendors[key] = row.vendor_id;
    }
    const topListings = Object.entries(listingCounts)
      .map(([key, views]) => {
        const [listing_id, listing_type] = key.split("::");
        return { listing_id, listing_type, views, vendor_id: listingVendors[key] || null };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Daily trend
    const dailyMap = {};
    for (const row of dailyRes.data ?? []) {
      const day = row.viewed_at.split("T")[0];
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    }
    const daily = Object.entries(dailyMap)
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      total:    totalRes.count  ?? 0,
      last7d:   last7dRes.count ?? 0,
      last30d:  last30dRes.count ?? 0,
      byType,
      topListings,
      daily,
    }, {
      headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("GET /api/admin/views error:", err);
    return NextResponse.json({ error: "Failed to fetch view stats" }, { status: 500 });
  }
}
