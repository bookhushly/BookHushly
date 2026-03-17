import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getAdminUser(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? user : null;
}

// GET /api/admin/ai-analytics?days=30
export async function GET(request) {
  try {
    const supabase = await createClient();
    const admin = await getAdminUser(supabase);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get("days") || "30"), 90);

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceISO = since.toISOString();

    // Fetch all usage rows in the window
    const { data: rows, error } = await supabase
      .from("ai_feature_usage")
      .select("feature_key, user_id, created_at")
      .gte("created_at", sinceISO)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Fetch settings for feature names
    const { data: settings } = await supabase
      .from("ai_feature_settings")
      .select("feature_key, feature_name, enabled");

    const settingsMap = {};
    (settings || []).forEach((s) => {
      settingsMap[s.feature_key] = s;
    });

    // Build per-feature stats
    const featureStats = {};
    const todayStr = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    (rows || []).forEach(({ feature_key, user_id, created_at }) => {
      if (!featureStats[feature_key]) {
        featureStats[feature_key] = {
          feature_key,
          feature_name: settingsMap[feature_key]?.feature_name ?? feature_key,
          enabled: settingsMap[feature_key]?.enabled ?? true,
          total: 0,
          unique_users: new Set(),
          today: 0,
          this_week: 0,
          daily: {},
        };
      }
      const s = featureStats[feature_key];
      s.total++;
      if (user_id) s.unique_users.add(user_id);
      const day = created_at.slice(0, 10);
      s.daily[day] = (s.daily[day] || 0) + 1;
      if (day === todayStr) s.today++;
      if (new Date(created_at) >= weekAgo) s.this_week++;
    });

    // Serialise Sets → counts
    const features = Object.values(featureStats).map((s) => ({
      ...s,
      unique_users: s.unique_users.size,
    }));

    // Summary totals
    const totalCalls = features.reduce((a, f) => a + f.total, 0);
    const totalUniqueUsers = new Set(
      (rows || []).filter((r) => r.user_id).map((r) => r.user_id)
    ).size;
    const mostUsed = features.sort((a, b) => b.total - a.total)[0] ?? null;

    // Build daily trend across all features (last N days)
    const allDays = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      allDays.push(d.toISOString().slice(0, 10));
    }

    const dailyTrend = allDays.map((day) => {
      const entry = { date: day };
      features.forEach((f) => {
        entry[f.feature_key] = f.daily[day] ?? 0;
      });
      entry.total = features.reduce((sum, f) => sum + (f.daily[day] ?? 0), 0);
      return entry;
    });

    return NextResponse.json({
      data: {
        summary: {
          total_calls: totalCalls,
          unique_users: totalUniqueUsers,
          most_used: mostUsed?.feature_name ?? "—",
          days,
        },
        features,
        daily_trend: dailyTrend,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/ai-analytics error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
