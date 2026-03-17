import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/saved-listings — fetch all saved listings for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("saved_listings")
      .select("id, listing_id, listing_type, listing_title, listing_image, listing_location, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/saved-listings — toggle save/unsave
// Body: { listing_id, listing_type, listing_title?, listing_image?, listing_location? }
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { listing_id, listing_type, listing_title, listing_image, listing_location } =
      await request.json();

    if (!listing_id || !listing_type) {
      return NextResponse.json({ error: "listing_id and listing_type required" }, { status: 400 });
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from("saved_listings")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listing_id)
      .eq("listing_type", listing_type)
      .maybeSingle();

    if (existing) {
      // Unsave
      await supabase.from("saved_listings").delete().eq("id", existing.id);
      return NextResponse.json({ saved: false });
    }

    // Save
    await supabase.from("saved_listings").insert({
      user_id: user.id,
      listing_id,
      listing_type,
      listing_title: listing_title ?? null,
      listing_image: listing_image ?? null,
      listing_location: listing_location ?? null,
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
