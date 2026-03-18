import { NextResponse } from "next/server";

const GEOCODE_API = "https://maps.googleapis.com/maps/api/geocode/json";

function extractNigerianLocation(results) {
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

  // Normalize FCT / Abuja
  if (state === "Federal Capital Territory" || city === "Abuja") {
    return { city: city || "Abuja", state: "FCT" };
  }

  return { city, state };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEOCODING_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Geocoding API key not configured" }, { status: 500 });
  }

  try {
    const url = `${GEOCODE_API}?latlng=${lat},${lng}&key=${apiKey}&language=en`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    console.log("[geocode] status:", data.status);
    console.log("[geocode] result count:", data.results?.length ?? 0);
    if (data.results?.[0]) {
      console.log("[geocode] first result types:", data.results[0].types);
      console.log("[geocode] address_components:", JSON.stringify(data.results[0].address_components));
    }
    if (data.error_message) {
      console.error("[geocode] error_message:", data.error_message);
    }

    if (data.status !== "OK") {
      console.error(`[geocode] non-OK status: ${data.status}`, data.error_message || "");
      // Return partial response — caller will fall back to showing national listings
      return NextResponse.json(
        { error: `Geocoding API returned: ${data.status}`, status: data.status, city: null, state: null },
        { status: 200 } // 200 so the hook doesn't treat it as a hard failure
      );
    }

    const location = extractNigerianLocation(data.results);
    console.log("[geocode] extracted:", location);
    return NextResponse.json({ ...location, status: "OK" });
  } catch (err) {
    console.error("[geocode] fetch error:", err);
    return NextResponse.json({ error: "Geocoding request failed", city: null, state: null }, { status: 200 });
  }
}
