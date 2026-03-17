import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { trackAIUsage } from "@/lib/track-ai-usage";

const anthropic = new Anthropic();

async function getAdminUser(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

// POST /api/admin/ai-evaluate
// Accepts a focus: 'overview' | 'vendors' | 'listings' | 'payments'
// Fetches relevant data and returns Claude's structured evaluation
export async function POST(request) {
  try {
    const supabase = await createClient();
    const admin = await getAdminUser(supabase);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Feature flag
    const { data: setting } = await supabase
      .from("ai_feature_settings")
      .select("enabled")
      .eq("feature_key", "vendor_insights")
      .maybeSingle();
    if (setting && !setting.enabled) {
      return NextResponse.json({ error: "AI features are disabled" }, { status: 403 });
    }

    const { focus = "overview" } = await request.json();
    const now = new Date();
    const last30d = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const last7d  = new Date(now - 7  * 24 * 60 * 60 * 1000).toISOString();

    // ── Fetch platform data ───────────────────────────────────────────────────
    const [
      vendorsRes,
      usersCountRes,
      bookingsCountRes,
      paymentsRes,
      viewsRes,
      aiUsageRes,
    ] = await Promise.all([
      // Vendors: id, business_name, kyc_status, created_at
      supabase
        .from("vendors")
        .select("id, business_name, kyc_status, created_at")
        .order("created_at", { ascending: false })
        .limit(50),

      // Total users
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .neq("role", "admin"),

      // Bookings by status (last 30d from hotel_bookings + apartment_bookings)
      supabase
        .from("hotel_bookings")
        .select("booking_status, total_amount, created_at")
        .gte("created_at", last30d),

      // Payments data
      supabase
        .from("payments")
        .select("amount, status, currency, created_at")
        .gte("created_at", last30d)
        .order("created_at", { ascending: false })
        .limit(200),

      // Views summary
      supabase
        .from("listing_views")
        .select("listing_type, viewed_at")
        .gte("viewed_at", last30d),

      // AI usage last 30d
      supabase
        .from("ai_feature_usage")
        .select("feature_key, created_at")
        .gte("created_at", last30d),
    ]);

    // ── Aggregate ─────────────────────────────────────────────────────────────
    const vendors = vendorsRes.data ?? [];
    const totalUsers = usersCountRes.count ?? 0;
    const totalVendors = vendors.length;
    const verifiedVendors = vendors.filter((v) => v.kyc_status === "verified").length;
    const pendingVendors  = vendors.filter((v) => v.kyc_status === "pending").length;

    // Bookings
    const bookings = bookingsCountRes.data ?? [];
    const bookingsByStatus = bookings.reduce((acc, b) => {
      acc[b.booking_status] = (acc[b.booking_status] || 0) + 1;
      return acc;
    }, {});
    const totalBookingsLast30d = bookings.length;

    // Payments
    const payments = paymentsRes.data ?? [];
    const successPayments = payments.filter((p) => p.status === "success");
    const totalRevenueLast30d = successPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const avgPaymentValue = successPayments.length > 0
      ? Math.round(totalRevenueLast30d / successPayments.length)
      : 0;

    // Revenue last 7d vs prev 7d
    const rev7d = payments
      .filter((p) => p.status === "success" && p.created_at >= last7d)
      .reduce((s, p) => s + (p.amount || 0), 0);
    const prev7dStart = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();
    const prevRev7d = payments
      .filter((p) => p.status === "success" && p.created_at >= prev7dStart && p.created_at < last7d)
      .reduce((s, p) => s + (p.amount || 0), 0);
    const revenueGrowth = prevRev7d > 0
      ? Math.round(((rev7d - prevRev7d) / prevRev7d) * 100)
      : rev7d > 0 ? 100 : 0;

    // Views
    const views = viewsRes.data ?? [];
    const totalViews = views.length;
    const viewsByType = views.reduce((acc, v) => {
      acc[v.listing_type] = (acc[v.listing_type] || 0) + 1;
      return acc;
    }, {});

    // AI usage
    const aiUsage = aiUsageRes.data ?? [];
    const totalAICalls = aiUsage.length;
    const aiByFeature = aiUsage.reduce((acc, u) => {
      acc[u.feature_key] = (acc[u.feature_key] || 0) + 1;
      return acc;
    }, {});
    const topAIFeature = Object.entries(aiByFeature)
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

    // ── Build prompt based on focus ───────────────────────────────────────────
    const platformSnapshot = `
PLATFORM SNAPSHOT (Last 30 days):
- Total registered users: ${totalUsers}
- Total vendors: ${totalVendors} (${verifiedVendors} verified, ${pendingVendors} pending KYC)
- Bookings last 30 days: ${totalBookingsLast30d} [${Object.entries(bookingsByStatus).map(([k, v]) => `${k}: ${v}`).join(", ") || "none"}]
- Total revenue last 30 days: ₦${totalRevenueLast30d.toLocaleString()} (avg ₦${avgPaymentValue.toLocaleString()} per payment)
- Revenue 7d change: ${revenueGrowth > 0 ? "+" : ""}${revenueGrowth}% vs prior week
- Listing page views last 30d: ${totalViews} [${Object.entries(viewsByType).map(([k, v]) => `${k}: ${v}`).join(", ") || "none"}]
- AI feature usage last 30d: ${totalAICalls} calls, top feature: ${topAIFeature}
`.trim();

    let focusPrompt = "";
    if (focus === "vendors") {
      focusPrompt = `
Focus area: VENDOR ECOSYSTEM
Vendor details:
${vendors.slice(0, 15).map((v) => `- ${v.business_name} (KYC: ${v.kyc_status})`).join("\n")}

Provide insights specifically about:
1. Vendor onboarding health (verified vs pending ratio)
2. Risk factors in the vendor pipeline
3. Recommended actions to improve vendor quality
`;
    } else if (focus === "listings") {
      focusPrompt = `
Focus area: LISTINGS PERFORMANCE
View data by type: ${Object.entries(viewsByType).map(([k, v]) => `${k}: ${v} views`).join(", ") || "no views yet"}

Provide insights specifically about:
1. Which listing categories are driving the most traffic
2. Conversion rate concerns (views vs bookings)
3. Recommended improvements to listing performance
`;
    } else if (focus === "payments") {
      focusPrompt = `
Focus area: PAYMENTS & REVENUE
Revenue details:
- Total 30d revenue: ₦${totalRevenueLast30d.toLocaleString()}
- Successful payments: ${successPayments.length}
- Failed/pending payments: ${payments.length - successPayments.length}
- Avg payment value: ₦${avgPaymentValue.toLocaleString()}
- Revenue growth (7d vs prev 7d): ${revenueGrowth}%

Provide insights specifically about:
1. Revenue trend interpretation
2. Payment success rate health
3. Recommended actions to increase revenue
`;
    } else {
      // overview
      focusPrompt = `
Focus area: OVERALL PLATFORM HEALTH

Provide a balanced evaluation covering:
1. Platform growth momentum
2. Biggest risk or concern right now
3. Top opportunity to act on immediately
4. One specific metric that is performing well
`;
    }

    const systemPrompt = `You are a senior business analyst for Bookhushly, a Nigerian hospitality and services marketplace.
You have deep expertise in platform metrics, vendor management, and marketplace economics.
Be direct, specific, and actionable. Avoid generic advice. Always tie recommendations to the actual data provided.`;

    const userPrompt = `${platformSnapshot}

${focusPrompt}

Respond ONLY with valid JSON in exactly this format:
{
  "score": <overall health score 0-100>,
  "summary": "<2 sentence executive summary>",
  "insights": [
    { "title": "<short title>", "body": "<1-2 sentence insight>", "priority": "high|medium|low", "type": "positive|warning|action" },
    { "title": "<short title>", "body": "<1-2 sentence insight>", "priority": "high|medium|low", "type": "positive|warning|action" },
    { "title": "<short title>", "body": "<1-2 sentence insight>", "priority": "high|medium|low", "type": "positive|warning|action" },
    { "title": "<short title>", "body": "<1-2 sentence insight>", "priority": "high|medium|low", "type": "positive|warning|action" }
  ]
}`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw = message.content[0]?.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to generate evaluation." }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    trackAIUsage("vendor_insights", admin.id);

    return NextResponse.json({
      data: result,
      meta: {
        focus,
        totalUsers,
        totalVendors,
        verifiedVendors,
        totalRevenueLast30d,
        revenueGrowth,
        totalViews,
        totalAICalls,
      },
    });
  } catch (err) {
    console.error("POST /api/admin/ai-evaluate error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
