import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/reviews/[listingId] — submit a review
// Body: { listing_type, rating, comment }
export async function POST(request, { params }) {
  try {
    const { listingId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { listing_type, rating, comment } = await request.json();

    if (!listing_type || !rating || !comment?.trim()) {
      return NextResponse.json({ error: "listing_type, rating, and comment are required" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Check if user already reviewed this listing
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .eq("listing_type", listing_type)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this listing" }, { status: 409 });
    }

    // Check if user has a confirmed booking — determines verified_booking flag
    let verified_booking = false;

    if (listing_type === "hotel") {
      const { data: booking } = await supabase
        .from("hotel_bookings")
        .select("id")
        .eq("customer_id", user.id)
        .eq("hotel_id", listingId)
        .in("booking_status", ["confirmed", "completed", "checked_out"])
        .limit(1)
        .maybeSingle();
      verified_booking = !!booking;
    } else if (listing_type === "apartment") {
      const { data: booking } = await supabase
        .from("apartment_bookings")
        .select("id")
        .eq("user_id", user.id)
        .eq("apartment_id", listingId)
        .in("booking_status", ["confirmed", "completed", "checked_out"])
        .limit(1)
        .maybeSingle();
      verified_booking = !!booking;
    } else if (listing_type === "event") {
      const { data: booking } = await supabase
        .from("event_bookings")
        .select("id")
        .eq("customer_id", user.id)
        .eq("event_id", listingId)
        .in("status", ["confirmed", "completed"])
        .limit(1)
        .maybeSingle();
      verified_booking = !!booking;
    }

    // Get user's display name from profile
    const { data: profile } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const customer_name = profile?.full_name || user.email?.split("@")[0] || "Guest";

    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        listing_id: listingId,
        listing_type,
        rating: parseInt(rating),
        comment: comment.trim(),
        customer_name,
        verified_booking,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: review });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/reviews/[listingId]?type=hotel&page=1&limit=10
export async function GET(request, { params }) {
  try {
    const { listingId } = await params;
    const { searchParams } = new URL(request.url);
    const listingType = searchParams.get("type") || "hotel";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    const { data, error, count } = await supabase
      .from("reviews")
      .select("id, customer_name, rating, comment, verified_booking, created_at", { count: "exact" })
      .eq("listing_id", listingId)
      .eq("listing_type", listingType)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Compute stats
    const total = data.length;
    const avg = total > 0
      ? Math.round((data.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
      : 0;

    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });

    return NextResponse.json({
      data: {
        reviews: data,
        stats: { average: avg, total: count ?? total, distribution: dist },
        pagination: {
          page,
          limit,
          total: count ?? total,
          totalPages: Math.ceil((count ?? total) / limit),
          hasMore: offset + limit < (count ?? total),
        },
      },
    });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
