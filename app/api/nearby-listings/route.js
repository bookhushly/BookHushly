import { createStaticClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const LIMIT = 6;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city  = searchParams.get("city")?.trim();
  const state = searchParams.get("state")?.trim();
  const category = searchParams.get("category");

  // city and state are both optional — if neither provided, return national listings
  // Use static (non-SSR) client — only public SELECTs needed here, avoids cookie overhead
  const supabase = createStaticClient();

  try {
    const categories = category
      ? [category]
      : ["hotels", "serviced_apartments", "events"];

    // Run categories sequentially to avoid connection pool exhaustion in dev
    const payload = {};
    for (const cat of categories) {
      payload[cat] = await fetchWithProximity(supabase, cat, city, state);
    }

    return NextResponse.json({ data: payload, city, state }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    console.error("[nearby-listings]", err);
    return NextResponse.json({ error: "Failed to fetch nearby listings" }, { status: 500 });
  }
}

/**
 * Fetch listings in three tiers, always returning up to LIMIT items.
 * Each item gets a `proximity` tag: "city" | "state" | "national"
 * Result is sorted city-first, state-second, national-last.
 */
async function fetchWithProximity(supabase, category, city, state) {
  const [cityItems, stateItems, nationalItems] = await Promise.all([
    city  ? fetchTier(supabase, category, { city })   : [],
    state ? fetchTier(supabase, category, { state })  : [],   // state-only — no city here
    fetchTier(supabase, category, {}),                        // national — no filters
  ]);

  // Tag each tier
  const tagged = (items, proximity) =>
    items.map((item) => ({ ...item, proximity }));

  const cityTagged     = tagged(cityItems,     "city");
  const stateTagged    = tagged(stateItems,    "state");
  const nationalTagged = tagged(nationalItems, "national");

  // Deduplicate by id, city first, then state, then national
  const seen = new Set();
  const merged = [];
  for (const item of [...cityTagged, ...stateTagged, ...nationalTagged]) {
    if (!seen.has(item.id) && merged.length < LIMIT) {
      seen.add(item.id);
      merged.push(item);
    }
  }

  return merged;
}

async function fetchTier(supabase, category, { city, state } = {}) {
  if (category === "hotels") {
    let q = supabase
      .from("hotels")
      .select("id,name,description,city,state,address,image_urls,amenities,created_at")
      .limit(LIMIT)
      .order("created_at", { ascending: false });

    if (city)  q = q.ilike("city", `%${city}%`);
    else if (state) q = q.eq("state", state);

    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(normalizeHotel);
  }

  if (category === "serviced_apartments") {
    let q = supabase
      .from("serviced_apartments")
      .select("id,name,description,apartment_type,city,state,area,address,bedrooms,bathrooms,price_per_night,image_urls,amenities,created_at")
      .eq("status", "active")
      .limit(LIMIT)
      .order("created_at", { ascending: false });

    if (city)  q = q.ilike("city", `%${city}%`);
    else if (state) q = q.eq("state", state);

    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(normalizeApartment);
  }

  // events
  let q = supabase
    .from("listings")
    .select("id,title,location,price,media_urls,category,vendor_name,description,amenities,maximum_capacity,created_at")
    .eq("active", true)
    .eq("category", "events")
    .limit(LIMIT)
    .order("created_at", { ascending: false });

  if (city)  q = q.ilike("location", `%${city}%`);
  else if (state) q = q.ilike("location", `%${state}%`);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

function normalizeHotel(h) {
  return {
    id: h.id,
    title: h.name,
    location: [h.city, h.state].filter(Boolean).join(", ") || h.address || "Location not specified",
    // price intentionally omitted — fetching from hotel_rooms is a separate query
    media_urls: h.image_urls || [],
    category: "hotels",
    description: h.description,
    amenities: h.amenities,
    city: h.city,
    state: h.state,
  };
}

function normalizeApartment(a) {
  return {
    id: a.id,
    title: a.name,
    location: [a.city, a.state].filter(Boolean).join(", ") || a.address || "Location not specified",
    price: a.price_per_night || 0,
    media_urls: a.image_urls || [],
    category: "serviced_apartments",
    description: a.description,
    amenities: a.amenities,
    bedrooms: a.bedrooms,
    bathrooms: a.bathrooms,
    apartment_type: a.apartment_type,
    city: a.city,
    state: a.state,
    area: a.area,
    apartment_id: a.id,
  };
}
