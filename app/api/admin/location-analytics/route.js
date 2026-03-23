import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request) {
  try {
    // Verify admin session
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get("days") || "30"), 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const admin = createAdminClient();

    const { data: rows, error } = await admin
      .from("location_analytics")
      .select("user_id, city, state, page, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[admin/location-analytics] fetch error:", error.message);
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }

    const allRows = rows || [];

    // Unique users
    const uniqueUsers = new Set(allRows.map((r) => r.user_id).filter(Boolean)).size;

    // Top states
    const stateCounts = {};
    for (const row of allRows) {
      if (row.state) stateCounts[row.state] = (stateCounts[row.state] || 0) + 1;
    }
    const states = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state, count]) => ({ state, count }));

    // Top cities
    const cityCounts = {};
    for (const row of allRows) {
      if (!row.city) continue;
      const key = `${row.city}__${row.state || ""}`;
      if (!cityCounts[key]) cityCounts[key] = { city: row.city, state: row.state, count: 0 };
      cityCounts[key].count++;
    }
    const cities = Object.values(cityCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Daily trend (last N days)
    const dailyCounts = {};
    for (const row of allRows) {
      const day = row.created_at.split("T")[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    }
    // Fill all days in range so chart has no gaps
    const daily = [];
    for (let d = 0; d < days; d++) {
      const date = new Date(Date.now() - (days - 1 - d) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      daily.push({ date, count: dailyCounts[date] || 0 });
    }

    // Top pages
    const pageCounts = {};
    for (const row of allRows) {
      const p = row.page || "/";
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    }
    const pages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([page, count]) => ({ page, count }));

    return NextResponse.json({
      totalGrants: allRows.length,
      uniqueUsers,
      topState: states[0]?.state || null,
      states,
      cities,
      daily,
      pages,
      days,
    });
  } catch (err) {
    console.error("[admin/location-analytics] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
