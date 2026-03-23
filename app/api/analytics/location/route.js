import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { lat, lng, city, state, page } = body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: "Coordinates out of range" }, { status: 400 });
    }

    const supabase = await createClient();

    // Resolve user_id from session (nullable — anonymous visitors are also tracked)
    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user?.id ?? null;

    const { error } = await supabase
      .from("location_analytics")
      .insert({
        user_id,
        latitude: lat,
        longitude: lng,
        city: city || null,
        state: state || null,
        page: page || null,
      });

    if (error) {
      console.error("[location-analytics] insert error:", error.message);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[location-analytics] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
