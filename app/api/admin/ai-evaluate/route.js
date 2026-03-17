import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { trackAIUsage } from "@/lib/track-ai-usage";

const anthropic = new Anthropic();

// Matches STATUS_CATEGORIES.SUCCESS in lib/paystack/constants/payment-status.js
const SUCCESS_STATUSES = ["completed", "success", "finished"];
const FAILED_STATUSES  = ["failed", "abandoned", "expired"];

async function getAdminUser(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

// POST /api/admin/ai-evaluate
// focus: 'overview' | 'vendors' | 'listings' | 'payments'
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
    const last30d     = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const last7d      = new Date(now - 7  * 24 * 60 * 60 * 1000).toISOString();
    const prev7dStart = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();

    // ── Parallel DB fetches ───────────────────────────────────────────────────
    const [
      vendorsRes,
      usersCountRes,
      // Listing counts by table
      hotelsCountRes,
      aptsCountRes,
      listingsCountRes,
      listingsByCategoryRes,
      // Bookings — all 4 tables, last 30d
      hotelBookingsRes,
      aptBookingsRes,
      generalBookingsRes,
      eventBookingsRes,
      // Payments last 30d
      paymentsRes,
      paymentsLast7dRes,
      paymentsPrev7dRes,
      // Views
      viewsRes,
      // AI usage
      aiUsageRes,
    ] = await Promise.all([

      // Vendors — use `approved` boolean + `status` for KYC state
      supabase
        .from("vendors")
        .select("id, business_name, approved, status, business_category, created_at")
        .order("created_at", { ascending: false })
        .limit(200),

      // Non-admin users
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .neq("role", "admin"),

      // Hotels count
      supabase
        .from("hotels")
        .select("id", { count: "exact", head: true }),

      // Active serviced apartments
      supabase
        .from("serviced_apartments")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),

      // Active listings (events, food, logistics, security, car_rentals)
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("active", true),

      // Listings breakdown by category
      supabase
        .from("listings")
        .select("category")
        .eq("active", true),

      // Hotel bookings — booking_status, total_price
      supabase
        .from("hotel_bookings")
        .select("id, booking_status, total_price, created_at")
        .gte("created_at", last30d),

      // Apartment bookings — booking_status, total_amount
      supabase
        .from("apartment_bookings")
        .select("id, booking_status, total_amount, created_at")
        .gte("created_at", last30d),

      // General bookings (events/food/etc via listings) — status, total_amount
      supabase
        .from("bookings")
        .select("id, status, total_amount, created_at")
        .gte("created_at", last30d),

      // Event bookings — status, total_amount
      supabase
        .from("event_bookings")
        .select("id, status, total_amount, created_at")
        .gte("created_at", last30d),

      // Payments last 30d — amount, status, currency, request_type
      supabase
        .from("payments")
        .select("amount, status, currency, request_type, created_at")
        .gte("created_at", last30d),

      // Successful payments last 7d (for WoW trend)
      supabase
        .from("payments")
        .select("amount")
        .gte("created_at", last7d)
        .in("status", SUCCESS_STATUSES),

      // Successful payments prior 7d window
      supabase
        .from("payments")
        .select("amount")
        .gte("created_at", prev7dStart)
        .lt("created_at", last7d)
        .in("status", SUCCESS_STATUSES),

      // Views last 30d
      supabase
        .from("listing_views")
        .select("listing_id, listing_type, viewed_at")
        .gte("viewed_at", last30d),

      // AI usage last 30d
      supabase
        .from("ai_feature_usage")
        .select("feature_key")
        .gte("created_at", last30d),
    ]);

    // ── Aggregate vendors ─────────────────────────────────────────────────────
    const vendors        = vendorsRes.data ?? [];
    const totalVendors   = vendors.length;
    const approvedVendors  = vendors.filter((v) => v.approved === true).length;
    const reviewingVendors = vendors.filter((v) => !v.approved && v.status === "reviewing").length;
    const pendingVendors   = vendors.filter((v) => !v.approved && v.status !== "reviewing").length;

    const vendorsByCategory = vendors.reduce((acc, v) => {
      if (v.business_category) acc[v.business_category] = (acc[v.business_category] || 0) + 1;
      return acc;
    }, {});

    // ── Aggregate listings ────────────────────────────────────────────────────
    const totalUsers    = usersCountRes.count ?? 0;
    const hotelsCount   = hotelsCountRes.count ?? 0;
    const aptsCount     = aptsCountRes.count ?? 0;
    const listingsCount = listingsCountRes.count ?? 0;
    const totalListings = hotelsCount + aptsCount + listingsCount;

    const listingsByCategory = (listingsByCategoryRes.data ?? []).reduce((acc, l) => {
      acc[l.category] = (acc[l.category] || 0) + 1;
      return acc;
    }, { hotels: hotelsCount, serviced_apartments: aptsCount });

    // ── Aggregate bookings (all 4 tables) ────────────────────────────────────
    // Normalize status: confirmed + checked_in + checked_out = active/successful
    const hotelBookings   = hotelBookingsRes.data   ?? [];
    const aptBookings     = aptBookingsRes.data     ?? [];
    const genBookings     = generalBookingsRes.data ?? [];
    const eventBookings   = eventBookingsRes.data   ?? [];

    const totalBookings = hotelBookings.length + aptBookings.length + genBookings.length + eventBookings.length;

    // Confirmed = paid and active (different status names per table)
    const confirmedCount =
      hotelBookings.filter((b) => ["confirmed", "checked_in", "checked_out"].includes(b.booking_status)).length +
      aptBookings.filter((b) => ["confirmed", "checked_in", "checked_out"].includes(b.booking_status)).length +
      genBookings.filter((b) => ["confirmed", "completed"].includes(b.status)).length +
      eventBookings.filter((b) => ["confirmed", "completed"].includes(b.status)).length;

    const cancelledCount =
      hotelBookings.filter((b) => b.booking_status === "cancelled").length +
      aptBookings.filter((b) => b.booking_status === "cancelled").length +
      genBookings.filter((b) => b.status === "cancelled").length +
      eventBookings.filter((b) => b.status === "cancelled").length;

    const pendingBookings = totalBookings - confirmedCount - cancelledCount;
    const cancellationRate = totalBookings > 0 ? Math.round((cancelledCount / totalBookings) * 100) : 0;

    // ── Aggregate payments ────────────────────────────────────────────────────
    const payments30d     = paymentsRes.data ?? [];
    const successPmts     = payments30d.filter((p) => SUCCESS_STATUSES.includes(p.status?.toLowerCase()));
    const failedPmts      = payments30d.filter((p) => FAILED_STATUSES.includes(p.status?.toLowerCase()));
    const pendingPmts     = payments30d.filter((p) =>
      !SUCCESS_STATUSES.includes(p.status?.toLowerCase()) &&
      !FAILED_STATUSES.includes(p.status?.toLowerCase())
    );

    const totalRevenue30d = successPmts.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const avgPaymentValue = successPmts.length > 0 ? Math.round(totalRevenue30d / successPmts.length) : 0;
    const paymentSuccessRate = payments30d.length > 0
      ? Math.round((successPmts.length / payments30d.length) * 100)
      : 0;

    const rev7d     = (paymentsLast7dRes.data  ?? []).reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const revPrev7d = (paymentsPrev7dRes.data   ?? []).reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const revenueGrowth = revPrev7d > 0
      ? Math.round(((rev7d - revPrev7d) / revPrev7d) * 100)
      : rev7d > 0 ? 100 : 0;

    // Revenue by request type
    const revenueByType = successPmts.reduce((acc, p) => {
      const t = p.request_type || "general";
      acc[t] = (acc[t] || 0) + parseFloat(p.amount || 0);
      return acc;
    }, {});

    const ngnRevenue    = successPmts.filter((p) => (p.currency || "NGN") === "NGN")
      .reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const cryptoRevenue = totalRevenue30d - ngnRevenue;

    // ── Aggregate views ───────────────────────────────────────────────────────
    const views = viewsRes.data ?? [];
    const totalViews   = views.length;
    const viewsByType  = views.reduce((acc, v) => {
      acc[v.listing_type] = (acc[v.listing_type] || 0) + 1;
      return acc;
    }, {});

    // View-to-booking conversion
    const viewToBooking = totalViews > 0 && confirmedCount > 0
      ? `1 booking per ${Math.round(totalViews / confirmedCount)} views`
      : totalViews > 0 ? "views recorded but no confirmed bookings yet"
      : "no views tracked yet (run listing_views migration)";

    // ── AI usage ──────────────────────────────────────────────────────────────
    const aiUsage = aiUsageRes.data ?? [];
    const aiByFeature = aiUsage.reduce((acc, u) => {
      acc[u.feature_key] = (acc[u.feature_key] || 0) + 1;
      return acc;
    }, {});
    const topAIFeature = Object.entries(aiByFeature).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "none";

    // ── Build prompt ──────────────────────────────────────────────────────────
    const platformSnapshot = `
BOOKHUSHLY PLATFORM — LIVE DATABASE SNAPSHOT (Last 30 days)

USERS & VENDORS:
- Non-admin registered users: ${totalUsers}
- Total vendors: ${totalVendors} | Approved (KYC verified): ${approvedVendors} | Under review: ${reviewingVendors} | Not yet submitted: ${pendingVendors}
- Vendor approval rate: ${totalVendors > 0 ? Math.round((approvedVendors / totalVendors) * 100) : 0}%
- Vendors by category: ${Object.entries(vendorsByCategory).map(([k, v]) => `${k}: ${v}`).join(", ") || "none"}

ACTIVE LISTINGS (total: ${totalListings}):
- Hotels: ${hotelsCount} | Serviced apartments: ${aptsCount}
- Other listings by category: ${Object.entries(listingsByCategory).filter(([k]) => !["hotels","serviced_apartments"].includes(k)).map(([k, v]) => `${k}: ${v}`).join(", ") || "none"}

BOOKINGS LAST 30 DAYS (all booking types combined):
- Total: ${totalBookings} | Confirmed/Active: ${confirmedCount} | Pending: ${pendingBookings} | Cancelled: ${cancelledCount}
- Cancellation rate: ${cancellationRate}%
- Hotel bookings: ${hotelBookings.length} | Apartment bookings: ${aptBookings.length} | Event/general bookings: ${genBookings.length + eventBookings.length}

PAYMENTS LAST 30 DAYS:
- Total transactions: ${payments30d.length} | Successful: ${successPmts.length} | Failed: ${failedPmts.length} | Pending: ${pendingPmts.length}
- Payment success rate: ${paymentSuccessRate}% (industry standard: >85%)
- Total revenue (NGN): ₦${totalRevenue30d.toLocaleString()}
- Average transaction value: ₦${avgPaymentValue.toLocaleString()}
- Revenue last 7 days: ₦${rev7d.toLocaleString()} (${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% vs prior week)
- Revenue by service type: ${Object.entries(revenueByType).map(([k, v]) => `${k}: ₦${Math.round(v).toLocaleString()}`).join(", ") || "none"}
- NGN revenue: ₦${ngnRevenue.toLocaleString()} | Crypto revenue: ₦${cryptoRevenue.toLocaleString()}

LISTING VIEWS LAST 30 DAYS:
- Total views: ${totalViews}
- By listing type: ${Object.entries(viewsByType).map(([k, v]) => `${k}: ${v}`).join(", ") || "none yet"}
- View-to-booking conversion: ${viewToBooking}

AI FEATURE USAGE LAST 30 DAYS:
- Total AI calls: ${aiUsage.length} | Top feature: ${topAIFeature}
- By feature: ${Object.entries(aiByFeature).map(([k, v]) => `${k}: ${v}`).join(", ") || "none"}
`.trim();

    let focusPrompt = "";

    if (focus === "vendors") {
      focusPrompt = `
FOCUS: VENDOR ECOSYSTEM ANALYSIS

KYC pipeline detail:
- Approved vendors: ${approvedVendors}/${totalVendors} (${totalVendors > 0 ? Math.round((approvedVendors / totalVendors) * 100) : 0}% approval rate)
- Under admin review: ${reviewingVendors}
- Never submitted KYC: ${pendingVendors}
- Vendor categories on platform: ${Object.entries(vendorsByCategory).map(([k, v]) => `${k}: ${v}`).join(", ") || "not categorised"}
- Total active listings they manage: hotels=${hotelsCount}, apartments=${aptsCount}, other=${listingsCount}

Analyse specifically:
1. Is the ${Math.round((approvedVendors / totalVendors) * 100) || 0}% approval rate healthy for this marketplace stage?
2. The risk of ${pendingVendors} vendors who haven't submitted KYC
3. Which vendor categories are over or under-represented vs what customers likely search for (hotels, apartments, events are key in Nigeria)
4. One specific action to accelerate vendor KYC completion
`;
    } else if (focus === "listings") {
      focusPrompt = `
FOCUS: LISTINGS PERFORMANCE ANALYSIS

Listing inventory:
- Hotels: ${hotelsCount} | Serviced apartments: ${aptsCount} | Other (events/food/logistics/security): ${listingsCount}
- Total active listings: ${totalListings}

Traffic:
- Total views last 30d: ${totalViews}
- By type: ${Object.entries(viewsByType).map(([k, v]) => `${k}: ${v}`).join(", ") || "no views yet"}
- View-to-booking conversion: ${viewToBooking}

Bookings context:
- Hotel bookings: ${hotelBookings.length} | Apartment bookings: ${aptBookings.length} | Events/general: ${genBookings.length + eventBookings.length}
- Cancellation rate: ${cancellationRate}%

Analyse specifically:
1. Is the listing inventory (${totalListings} listings across ${totalVendors} vendors) sufficient for a growing Nigerian marketplace?
2. What does the ${viewToBooking} conversion tell us?
3. Which listing category appears to be underserved based on the data
4. One concrete improvement to drive more bookings from current traffic
`;
    } else if (focus === "payments") {
      focusPrompt = `
FOCUS: PAYMENTS & REVENUE ANALYSIS

Payment health:
- Success rate: ${paymentSuccessRate}% | ${successPmts.length} succeeded, ${failedPmts.length} failed, ${pendingPmts.length} pending
- Total 30d revenue: ₦${totalRevenue30d.toLocaleString()}
- Average transaction: ₦${avgPaymentValue.toLocaleString()}
- 7d revenue: ₦${rev7d.toLocaleString()} vs ₦${revPrev7d.toLocaleString()} prior week = ${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% growth
- NGN vs crypto split: ₦${ngnRevenue.toLocaleString()} NGN vs ₦${cryptoRevenue.toLocaleString()} crypto
- Revenue by service: ${Object.entries(revenueByType).map(([k, v]) => `${k}: ₦${Math.round(v).toLocaleString()}`).join(", ") || "not categorised"}

Bookings that generated this revenue:
- ${confirmedCount} confirmed bookings from ${totalBookings} total
- ${cancellationRate}% cancellation rate

Analyse specifically:
1. Is ${paymentSuccessRate}% payment success rate acceptable? What's likely causing failures?
2. The ${revenueGrowth}% week-over-week revenue trend — positive or concerning?
3. NGN vs crypto split — strategic implications for a Nigerian marketplace
4. Which service type should be prioritised to increase total revenue
`;
    } else {
      // overview
      focusPrompt = `
FOCUS: OVERALL PLATFORM HEALTH

Provide a balanced executive evaluation. Cite actual numbers. Cover:
1. Overall growth momentum — are users, listings, bookings, and revenue trending in the right direction?
2. The single biggest bottleneck or risk that could hurt growth in the next 30 days
3. A metric that is performing better than expected — what's working?
4. The one most impactful action the team should take this week
`;
    }

    const systemPrompt = `You are a senior business analyst for Bookhushly, a Nigerian hospitality and services marketplace (hotels, serviced apartments, events, food, logistics, security).
You are given REAL live data queried directly from the production database. Every number is accurate.
Be direct and specific — always cite the exact figures provided. Give Nigerian-market-relevant insights (Paystack, crypto payments, Lagos/Abuja market dynamics).
Do not make up numbers or give generic advice that ignores the actual data.`;

    const userPrompt = `${platformSnapshot}

${focusPrompt}

Respond ONLY with this exact JSON (no markdown, no extra text):
{"score":0,"summary":"","insights":[{"title":"","body":"","priority":"high","type":"action"},{"title":"","body":"","priority":"medium","type":"warning"},{"title":"","body":"","priority":"low","type":"positive"}]}

Fill in the values. score=integer 0-100. summary=2 sentences max. Each insight: title under 6 words, body 1 sentence citing a specific number, priority=high|medium|low, type=positive|warning|action.`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw = message.content[0]?.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI raw response (no JSON found):", raw.slice(0, 300));
      return NextResponse.json({ error: "AI did not return valid JSON. Please try again." }, { status: 500 });
    }

    let result;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr.message);
      console.error("Raw JSON attempted:", jsonMatch[0].slice(0, 500));
      return NextResponse.json({ error: "AI response could not be parsed. Please try again." }, { status: 500 });
    }

    // Sanitise — ensure required fields exist
    if (typeof result.score !== "number") result.score = 50;
    if (!result.summary) result.summary = "Evaluation complete.";
    if (!Array.isArray(result.insights)) result.insights = [];
    trackAIUsage("vendor_insights", admin.id);

    return NextResponse.json({
      data: result,
      meta: {
        focus,
        totalUsers,
        totalVendors,
        approvedVendors,
        totalRevenue30d,
        revenueGrowth,
        paymentSuccessRate,
        totalViews,
        totalListings,
        totalBookings,
        confirmedCount,
        cancellationRate,
      },
    });
  } catch (err) {
    console.error("POST /api/admin/ai-evaluate error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
