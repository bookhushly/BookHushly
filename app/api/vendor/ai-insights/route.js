import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { trackAIUsage } from "@/lib/track-ai-usage";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Feature flag
    const { data: setting } = await supabase
      .from("ai_feature_settings")
      .select("enabled")
      .eq("feature_key", "vendor_insights")
      .single();

    if (setting && !setting.enabled) {
      return NextResponse.json({ error: "Feature disabled" }, { status: 403 });
    }

    const { analytics, range } = await request.json();

    if (!analytics) {
      return NextResponse.json({ error: "analytics data required" }, { status: 400 });
    }

    const { growth, totalBookings, byService, statusBreakdown, timeline } = analytics;

    // Build a plain-text summary for Claude
    const topService = [...(byService ?? [])]
      .sort((a, b) => b.value - a.value)[0];

    const cancelledCount = statusBreakdown?.find((s) => s.name === "cancelled")?.value ?? 0;
    const pendingCount   = statusBreakdown?.find((s) => s.name === "pending")?.value ?? 0;
    const completedCount = statusBreakdown?.find((s) => s.name === "completed")?.value ?? 0;

    const recentTrend = timeline?.slice(-3) ?? [];
    const trendText = recentTrend.length >= 2
      ? `Recent revenue trend: ${recentTrend.map((t) => `${t.label}: ₦${t.revenue?.toLocaleString()}`).join(", ")}.`
      : "";

    const prompt = `You are a business advisor for a Nigerian hospitality and services vendor on Bookhushly.

Here is their performance data for the last ${range}:
- Total revenue: ₦${growth?.current?.toLocaleString() ?? 0}
- Revenue growth vs previous period: ${growth?.growthPercent ?? 0}%
- Total bookings: ${totalBookings ?? 0}
- Top earning service: ${topService?.name ?? "N/A"} (₦${topService?.value?.toLocaleString() ?? 0})
- Completed bookings: ${completedCount}, Pending: ${pendingCount}, Cancelled: ${cancelledCount}
${trendText}

Give exactly 3 short, actionable, specific business insights in plain English. Each insight should:
- Be one sentence (max 20 words)
- Be directly relevant to the data above
- Include a concrete suggested action

Respond ONLY with valid JSON:
{"insights": ["...", "...", "..."]}`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0]?.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to generate insights." }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    trackAIUsage("vendor_insights", user.id);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("ai-insights error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
