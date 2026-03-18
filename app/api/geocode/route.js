import { NextResponse } from "next/server";

const GOOGLE_API = "https://maps.googleapis.com/maps/api/geocode/json";
const NOMINATIM_API = "https://nominatim.openstreetmap.org/reverse";

// ── Google Maps extraction ────────────────────────────────────────────────────
function extractFromGoogle(results) {
  const allComponents = results.flatMap((r) => r.address_components || []);

  const cityTypes = [
    "locality",
    "sublocality_level_1",
    "sublocality",
    "administrative_area_level_2",
    "neighborhood",
  ];

  let city = null;
  for (const type of cityTypes) {
    const match = allComponents.find((c) => c.types.includes(type));
    if (match) { city = match.long_name; break; }
  }

  const stateComp = allComponents.find((c) =>
    c.types.includes("administrative_area_level_1")
  );
  const state = stateComp
    ? stateComp.long_name.replace(/\s+State$/i, "").trim()
    : null;

  return normalizeNigerian(city, state);
}

// ── OpenStreetMap Nominatim extraction (free fallback) ───────────────────────
async function extractFromNominatim(lat, lng) {
  const url = `${NOMINATIM_API}?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  const res = await fetch(url, {
    headers: { "User-Agent": "Bookhushly/1.0 (contact@bookhushly.com)" },
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));

  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  const data = await res.json();
  console.log("[geocode/nominatim] raw address:", JSON.stringify(data.address));

  const addr = data.address || {};
  // Try progressively broader city-level fields
  const city =
    addr.city || addr.town || addr.village || addr.suburb ||
    addr.city_district || addr.county || null;

  let state = addr.state || null;
  if (state) state = state.replace(/\s+State$/i, "").trim();

  return normalizeNigerian(city, state);
}

function normalizeNigerian(city, state) {
  if (state === "Federal Capital Territory" || city === "Abuja") {
    return { city: city || "Abuja", state: "FCT" };
  }
  return { city: city || null, state: state || null };
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  // ── 1. Try Google Maps first ──
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEOCODING_KEY;
  if (apiKey) {
    try {
      const url = `${GOOGLE_API}?latlng=${lat},${lng}&key=${apiKey}&language=en`;
      const gc = new AbortController();
      const gt = setTimeout(() => gc.abort(), 5000);
      const res = await fetch(url, { cache: "no-store", signal: gc.signal }).finally(() => clearTimeout(gt));
      const data = await res.json();

      console.log("[geocode/google] status:", data.status);
      if (data.error_message) console.error("[geocode/google] error:", data.error_message);

      if (data.status === "OK" && data.results?.length) {
        const location = extractFromGoogle(data.results);
        console.log("[geocode/google] extracted:", location);
        if (location.city || location.state) {
          return NextResponse.json({ ...location, source: "google", status: "OK" });
        }
        console.warn("[geocode/google] OK but city/state empty — falling back to Nominatim");
      } else {
        console.warn(`[geocode/google] non-OK: ${data.status} — falling back to Nominatim`);
      }
    } catch (err) {
      console.error("[geocode/google] fetch error:", err.message, "— falling back to Nominatim");
    }
  } else {
    console.warn("[geocode] No Google API key — using Nominatim directly");
  }

  // ── 2. Fallback: OpenStreetMap Nominatim (free, no key required) ──
  try {
    const location = await extractFromNominatim(lat, lng);
    console.log("[geocode/nominatim] extracted:", location);
    return NextResponse.json({ ...location, source: "nominatim", status: "OK" });
  } catch (err) {
    console.error("[geocode/nominatim] error:", err.message);
    // Both providers failed — return nulls so component shows national listings
    return NextResponse.json(
      { city: null, state: null, source: "none", status: "FAILED" },
      { status: 200 }
    );
  }
}
