// app/api/listings/route.js
// Server-side listings fetch with Redis response caching + single JOIN for hotels
import { NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/server";
import { Redis } from "@upstash/redis";
import { createHash } from "crypto";

const PAGE_SIZE = 20;
const CACHE_TTL = 60; // seconds

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// ── Cache helpers ────────────────────────────────────────────────────────────

function makeCacheKey(params) {
  const stable = JSON.stringify(params, Object.keys(params).sort());
  const hash = createHash("sha1").update(stable).digest("hex").slice(0, 20);
  return `listings:v1:${hash}`;
}

async function getFromCache(key) {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

async function setCache(key, value) {
  if (!redis) return;
  try {
    await redis.setex(key, CACHE_TTL, value);
  } catch {
    /* ignore redis errors */
  }
}

// ── Hotel enrichment (from embedded JOIN data) ───────────────────────────────

function enrichHotel(hotel) {
  const rooms = hotel.hotel_rooms || [];
  const roomTypes = hotel.hotel_room_types || [];
  const prices = [];
  const bedSizes = new Set();
  const floors = new Set();
  const roomAmenities = new Set();
  let availableRooms = 0;

  rooms.forEach((room) => {
    if (room.status === "available") availableRooms++;
    if (room.price_per_night) prices.push(parseFloat(room.price_per_night));
    const beds = Array.isArray(room.beds) ? room.beds : room.beds ? [room.beds] : [];
    beds.forEach((bed) => bed.type && bedSizes.add(bed.type.toLowerCase()));
    if (room.floor) floors.add(room.floor);
    room.amenities?.items?.forEach((a) => roomAmenities.add(a));
  });

  let maxOccupancy = 0;
  roomTypes.forEach((rt) => {
    maxOccupancy = Math.max(maxOccupancy, rt.max_occupancy || 0);
    rt.amenities?.items?.forEach((a) => roomAmenities.add(a));
  });

  const availableRoomIds = rooms.filter((r) => r.status === "available").map((r) => r.id);

  const { hotel_rooms, hotel_room_types, ...base } = hotel;
  return {
    ...base,
    total_rooms: rooms.length,
    available_rooms: availableRooms,
    available_room_ids: availableRoomIds,
    room_types_count: roomTypes.length,
    min_price: prices.length ? Math.min(...prices) : 0,
    max_price: prices.length ? Math.max(...prices) : 0,
    bed_sizes: Array.from(bedSizes),
    max_occupancy: maxOccupancy,
    floors: Array.from(floors).sort((a, b) => a - b),
    room_amenities: Array.from(roomAmenities),
  };
}

// ── Normalisation ────────────────────────────────────────────────────────────

function normalizeHotel(h) {
  return {
    id: h.id,
    title: h.name,
    location:
      [h.city, h.state].filter(Boolean).join(", ") ||
      h.address ||
      "Location not specified",
    price: h.min_price || 0,
    media_urls: h.image_urls || [],
    category: "hotels",
    vendor_name: h.name,
    description: h.description,
    amenities: h.amenities,
    hotel_id: h.id,
    city: h.city,
    state: h.state,
    address: h.address,
    checkout_policy: h.checkout_policy,
    policies: h.policies,
    generator_available: h.generator_available,
    breakfast_offered: h.breakfast_offered,
    pay_at_hotel_enabled: h.pay_at_hotel_enabled,
    nihotour_certified: h.nihotour_certified,
    nihotour_number: h.nihotour_number,
    avg_rating: h.avg_rating || null,
    review_count: h.review_count || 0,
    total_rooms: h.total_rooms,
    available_rooms: h.available_rooms,
    available_room_ids: h.available_room_ids || [],
    room_types_count: h.room_types_count,
    max_price: h.max_price,
    bed_sizes: h.bed_sizes,
    max_occupancy: h.max_occupancy,
    floors: h.floors,
    room_amenities: h.room_amenities,
  };
}

function normalizeApartment(a) {
  return {
    id: a.id,
    title: a.name,
    location:
      [a.city, a.state].filter(Boolean).join(", ") ||
      a.address ||
      "Location not specified",
    price: a.price_per_night || 0,
    media_urls: a.image_urls || [],
    category: "serviced_apartments",
    vendor_name: a.name,
    description: a.description,
    amenities: a.amenities,
    apartment_id: a.id,
    apartment_type: a.apartment_type,
    city: a.city,
    state: a.state,
    area: a.area,
    landmark: a.landmark,
    address: a.address,
    bedrooms: a.bedrooms,
    bathrooms: a.bathrooms,
    max_guests: a.max_guests,
    square_meters: a.square_meters,
    price_per_week: a.price_per_week,
    price_per_month: a.price_per_month,
    minimum_stay: a.minimum_stay,
    furnished: a.furnished,
    kitchen_equipped: a.kitchen_equipped,
    parking_spaces: a.parking_spaces,
    has_balcony: a.has_balcony,
    has_terrace: a.has_terrace,
    utilities_included: a.utilities_included,
    electricity_included: a.electricity_included,
    generator_available: a.generator_available,
    generator_hours: a.generator_hours,
    inverter_available: a.inverter_available,
    solar_power: a.solar_power,
    water_supply: a.water_supply,
    internet_included: a.internet_included,
    internet_speed: a.internet_speed,
    security_features: a.security_features,
    check_in_time: a.check_in_time,
    check_out_time: a.check_out_time,
    cancellation_policy: a.cancellation_policy,
    house_rules: a.house_rules,
    caution_deposit: a.caution_deposit,
    status: a.status,
    available_from: a.available_from,
    available_until: a.available_until,
    instant_booking: a.instant_booking,
    is_verified: a.is_verified || false,
    agent_phone: a.agent_phone || null,
    avg_rating: a.avg_rating ? parseFloat(a.avg_rating) : null,
    review_count: a.review_count || 0,
  };
}

// ── Post-enrichment filters (run server-side, after JOIN data is processed) ──

function filterAmenities(items, amenities) {
  if (!amenities?.length) return items;
  return items.filter((item) => {
    let base = [];
    if (Array.isArray(item.amenities?.items)) {
      base = item.amenities.items;
    } else if (item.amenities && typeof item.amenities === "object") {
      base = Object.entries(item.amenities)
        .filter(([, v]) => v === true)
        .map(([k]) => k);
    }
    const all = [...base, ...(item.room_amenities || [])];
    return amenities.every((a) => all.includes(a));
  });
}

function filterBedSizes(items, bedSizes) {
  if (!bedSizes?.length) return items;
  return items.filter((item) =>
    bedSizes.some((s) => (item.bed_sizes || []).includes(s)),
  );
}

function filterSecurityFeatures(items, features) {
  if (!features?.length) return items;
  return items.filter((item) =>
    features.every((f) => (item.security_features || {})[f] === true),
  );
}

// ── Query builders ────────────────────────────────────────────────────────────

function buildHotelQuery(supabase, p) {
  const offset = p.page * PAGE_SIZE;

  let q = supabase
    .from("hotels")
    .select(
      `id,name,description,address,city,state,image_urls,amenities,checkout_policy,policies,created_at,
       generator_available,breakfast_offered,pay_at_hotel_enabled,nihotour_certified,nihotour_number,
       avg_rating,review_count,
       hotel_room_types(id,name,max_occupancy,base_price,size_sqm,amenities),
       hotel_rooms(id,hotel_id,price_per_night,status,beds,floor,amenities)`,
      { count: "exact" },
    )
    .range(offset, offset + PAGE_SIZE - 1)
    .order("created_at", { ascending: false });

  if (p.search)
    q = q.or(
      `name.ilike.%${p.search}%,city.ilike.%${p.search}%,state.ilike.%${p.search}%,address.ilike.%${p.search}%`,
    );
  if (p.city) q = q.ilike("city", p.city);
  if (p.state) q = q.eq("state", p.state);
  if (p.hotel_has_generator) q = q.in("generator_available", ["24h", "partial"]);
  if (p.breakfast_offered) q = q.eq("breakfast_offered", p.breakfast_offered);
  if (p.pay_at_hotel) q = q.eq("pay_at_hotel_enabled", true);
  if (p.nihotour_only) q = q.eq("nihotour_certified", true);

  return q;
}

function buildApartmentQuery(supabase, p) {
  const offset = p.page * PAGE_SIZE;
  const fields = `id,name,description,apartment_type,address,city,state,area,landmark,bedrooms,bathrooms,max_guests,square_meters,price_per_night,price_per_week,price_per_month,minimum_stay,utilities_included,electricity_included,generator_available,generator_hours,inverter_available,solar_power,water_supply,internet_included,internet_speed,furnished,kitchen_equipped,parking_spaces,has_balcony,has_terrace,security_features,amenities,image_urls,check_in_time,check_out_time,cancellation_policy,house_rules,caution_deposit,status,available_from,available_until,instant_booking,is_verified,agent_phone,avg_rating,review_count,created_at`;

  let q = supabase
    .from("serviced_apartments")
    .select(fields, { count: "exact" })
    .eq("status", "active")
    .range(offset, offset + PAGE_SIZE - 1);

  if (p.sort === "price_asc") q = q.order("price_per_night", { ascending: true });
  else if (p.sort === "price_desc")
    q = q.order("price_per_night", { ascending: false });
  else q = q.order("created_at", { ascending: false });

  if (p.search)
    q = q.or(
      `name.ilike.%${p.search}%,city.ilike.%${p.search}%,state.ilike.%${p.search}%,area.ilike.%${p.search}%,address.ilike.%${p.search}%`,
    );
  if (p.city) q = q.ilike("city", p.city);
  if (p.state) q = q.eq("state", p.state);
  if (p.apartment_type) q = q.eq("apartment_type", p.apartment_type);
  if (p.bedrooms) q = q.gte("bedrooms", p.bedrooms);
  if (p.bathrooms) q = q.gte("bathrooms", p.bathrooms);
  if (p.max_guests) q = q.gte("max_guests", p.max_guests);
  if (p.price_min) q = q.gte("price_per_night", p.price_min);
  if (p.price_max) q = q.lte("price_per_night", p.price_max);
  if (p.furnished != null) q = q.eq("furnished", p.furnished);
  if (p.utilities_included != null)
    q = q.eq("utilities_included", p.utilities_included);
  if (p.internet_included != null)
    q = q.eq("internet_included", p.internet_included);
  if (p.water_supply) q = q.eq("water_supply", p.water_supply);
  if (p.generator_available) q = q.eq("generator_available", true);
  if (p.inverter_available) q = q.eq("inverter_available", true);
  if (p.solar_power) q = q.eq("solar_power", true);
  if (p.instant_booking) q = q.eq("instant_booking", true);

  return q;
}

function buildEventsQuery(supabase, p) {
  const offset = p.page * PAGE_SIZE;

  let q = supabase
    .from("listings")
    .select(
      "id,title,location,price,media_urls,category,vendor_name,description,amenities,maximum_capacity,event_date,event_time,category_data,created_at",
      { count: "exact" },
    )
    .eq("active", true)
    .eq("category", p.category)
    .range(offset, offset + PAGE_SIZE - 1);

  if (p.sort === "price_asc") q = q.order("price", { ascending: true });
  else if (p.sort === "price_desc") q = q.order("price", { ascending: false });
  else q = q.order("created_at", { ascending: false });

  if (p.search)
    q = q.or(`title.ilike.%${p.search}%,location.ilike.%${p.search}%`);
  if (p.price_min) q = q.gte("price", p.price_min);
  if (p.price_max) q = q.lte("price", p.price_max);
  if (p.capacity) q = q.gte("maximum_capacity", p.capacity);

  return q;
}

// ── Parameter parsing ─────────────────────────────────────────────────────────

function parseParams(sp) {
  const arr = (key) =>
    sp.get(key)
      ? sp
          .get(key)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const int = (key) => {
    const v = sp.get(key);
    return v ? parseInt(v, 10) : null;
  };

  const bool = (key) => {
    const v = sp.get(key);
    if (v === "true") return true;
    if (v === "false") return false;
    return null;
  };

  return {
    category: sp.get("category"),
    page: parseInt(sp.get("page") || "0", 10),
    search: sp.get("search")?.trim() || "",
    sort: sp.get("sort") || "newest",
    // Location
    city: sp.get("city") || null,
    state: sp.get("state") || null,
    // Price
    price_min: int("price_min"),
    price_max: int("price_max"),
    // Hotels
    hotel_has_generator: sp.get("hotel_has_generator") === "true",
    breakfast_offered: sp.get("breakfast_offered") || null,
    pay_at_hotel: sp.get("pay_at_hotel") === "true",
    nihotour_only: sp.get("nihotour_only") === "true",
    min_rating: parseFloat(sp.get("min_rating") || "0") || null,
    avail_checkin: sp.get("avail_checkin") || null,
    avail_checkout: sp.get("avail_checkout") || null,
    amenities: arr("amenities"),
    bed_sizes: arr("bed_sizes"),
    max_occupancy: int("max_occupancy"),
    floor: int("floor"),
    // Apartments
    apartment_type: sp.get("apartment_type") || null,
    bedrooms: int("bedrooms"),
    bathrooms: int("bathrooms"),
    max_guests: int("max_guests"),
    furnished: bool("furnished"),
    utilities_included: bool("utilities_included"),
    internet_included: bool("internet_included"),
    water_supply: sp.get("water_supply") || null,
    generator_available: sp.get("generator_available") === "true",
    inverter_available: sp.get("inverter_available") === "true",
    solar_power: sp.get("solar_power") === "true",
    security_features: arr("security_features"),
    instant_booking: sp.get("instant_booking") === "true",
    // Events
    capacity: int("capacity"),
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(request) {
  const sp = request.nextUrl.searchParams;
  const p = parseParams(sp);

  if (!p.category) {
    return NextResponse.json({ error: "category is required" }, { status: 400 });
  }

  const cacheKey = makeCacheKey(p);

  // Cache read
  const cached = await getFromCache(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
        "X-Cache": "HIT",
      },
    });
  }

  const supabase = createStaticClient();

  try {
    let items = [];
    let rawCount = 0;

    if (p.category === "hotels") {
      const { data, error, count } = await buildHotelQuery(supabase, p);
      if (error) throw error;
      rawCount = count || 0;

      // Enrich via JOIN data (single round-trip instead of 3)
      let enriched = (data || []).map(enrichHotel).map(normalizeHotel);

      // Post-enrichment filters (can't be done in SQL without a materialized view)
      if (p.price_min) enriched = enriched.filter((h) => h.price >= p.price_min);
      if (p.price_max) enriched = enriched.filter((h) => h.price <= p.price_max);
      if (p.min_rating) enriched = enriched.filter((h) => (h.avg_rating || 0) >= p.min_rating);
      if (p.amenities.length) enriched = filterAmenities(enriched, p.amenities);
      if (p.bed_sizes.length) enriched = filterBedSizes(enriched, p.bed_sizes);
      if (p.max_occupancy)
        enriched = enriched.filter((h) => h.max_occupancy >= p.max_occupancy);
      if (p.floor)
        enriched = enriched.filter((h) => (h.floors || []).includes(p.floor));

      // Date availability filter — if dates provided, check for non-conflicting rooms
      if (p.avail_checkin && p.avail_checkout) {
        const { data: conflicts } = await supabase
          .from("hotel_bookings")
          .select("room_id")
          .lt("check_in_date", p.avail_checkout)
          .gt("check_out_date", p.avail_checkin)
          .in("booking_status", ["confirmed", "checked_in", "pay_at_hotel"]);
        const bookedRoomIds = new Set((conflicts || []).map((b) => b.room_id));
        enriched = enriched.filter((h) =>
          (h.available_room_ids || []).some((id) => !bookedRoomIds.has(id))
        );
      }

      // Price sort is post-enrichment for hotels
      if (p.sort === "price_asc") enriched.sort((a, b) => a.price - b.price);
      if (p.sort === "price_desc") enriched.sort((a, b) => b.price - a.price);

      items = enriched;
    } else if (p.category === "serviced_apartments") {
      const { data, error, count } = await buildApartmentQuery(supabase, p);
      if (error) throw error;
      rawCount = count || 0;

      let normalized = (data || []).map(normalizeApartment);
      if (p.amenities.length) normalized = filterAmenities(normalized, p.amenities);
      if (p.security_features.length)
        normalized = filterSecurityFeatures(normalized, p.security_features);

      items = normalized;
    } else {
      const { data, error, count } = await buildEventsQuery(supabase, p);
      if (error) throw error;
      rawCount = count || 0;
      items = data || [];
    }

    const result = {
      items,
      // nextPage based on raw SQL count (before post-enrichment filters) so
      // pagination continues even when some items are filtered out client-side
      nextPage:
        (p.page + 1) * PAGE_SIZE < rawCount ? p.page + 1 : undefined,
      totalCount: rawCount,
    };

    // Cache write (fire-and-forget)
    setCache(cacheKey, result);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
        "X-Cache": "MISS",
      },
    });
  } catch (err) {
    console.error("[GET /api/listings]", err);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 },
    );
  }
}
