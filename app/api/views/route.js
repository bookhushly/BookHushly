import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

// POST /api/views — fire-and-forget view tracking
// Body: { listing_id, listing_type, vendor_id }
// Dedup: same ip_hash + listing within 30 minutes is ignored
export async function POST(request) {
  try {
    const { listing_id, listing_type, vendor_id } = await request.json();

    if (!listing_id || !listing_type) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Privacy-safe IP hash (SHA-256 of IP + date keeps it non-reversible + daily-rotating)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const today = new Date().toISOString().split("T")[0];
    const ip_hash = createHash("sha256")
      .update(`${ip}-${today}`)
      .digest("hex")
      .slice(0, 16);

    const supabase = await createClient();

    // Dedup: skip if same listing was already viewed from this IP hash within 30 minutes
    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from("listing_views")
      .select("id")
      .eq("listing_id", listing_id)
      .eq("listing_type", listing_type)
      .eq("ip_hash", ip_hash)
      .gte("viewed_at", cutoff)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, counted: false });
    }

    await supabase.from("listing_views").insert({
      listing_id,
      listing_type,
      vendor_id: vendor_id || null,
      ip_hash,
    });

    return NextResponse.json({ ok: true, counted: true });
  } catch (err) {
    // Silent fail — views are non-critical
    console.error("POST /api/views error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
