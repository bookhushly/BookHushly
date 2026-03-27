// app/api/vendor/apartments/ical/route.js
// iCal export for vendor apartment availability
// GET /api/vendor/apartments/ical?apartment_id=xxx  → .ics download
// POST /api/vendor/apartments/ical                   → import .ics and block dates

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ── helpers ──────────────────────────────────────────────────────────────────

function toICalDate(dateStr) {
  return dateStr.replace(/-/g, "");
}

function formatICalEvent({ uid, summary, start, end, description = "" }) {
  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SUMMARY:${summary.replace(/[,;\\]/g, "\\$&")}`,
    `DTSTART;VALUE=DATE:${toICalDate(start)}`,
    `DTEND;VALUE=DATE:${toICalDate(end)}`,
    description ? `DESCRIPTION:${description.replace(/[,;\\]/g, "\\$&").replace(/\n/g, "\\n")}` : "",
    "END:VEVENT",
  ].filter(Boolean).join("\r\n");
}

// Parse iCal DTSTART/DTEND into YYYY-MM-DD
function parseICalDate(raw) {
  const clean = raw.replace(/VALUE=DATE:/i, "").replace(/T\d{6}Z?$/i, "").trim();
  if (/^\d{8}$/.test(clean)) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
  }
  return null;
}

// Minimal iCal parser — extracts VEVENT blocks
function parseICal(text) {
  const events = [];
  const lines = text.replace(/\r\n|\r/g, "\n").split("\n");
  let inEvent = false;
  let current = {};

  for (let line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) { inEvent = true; current = {}; continue; }
    if (line.startsWith("END:VEVENT")) {
      inEvent = false;
      if (current.start && current.end) events.push(current);
      continue;
    }
    if (!inEvent) continue;

    const [key, ...rest] = line.split(":");
    const value = rest.join(":");
    const baseKey = key.split(";")[0].toUpperCase();

    if (baseKey === "SUMMARY") current.summary = value;
    if (baseKey === "DTSTART") current.start = parseICalDate(value || key.split(";")[1]);
    if (baseKey === "DTEND") current.end = parseICalDate(value || key.split(";")[1]);
    if (baseKey === "UID") current.uid = value;
    if (baseKey === "DESCRIPTION") current.description = value.replace(/\\n/g, "\n").replace(/\\,/g, ",");
  }
  return events;
}

async function getVendorId(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("vendors").select("id").eq("user_id", user.id).single();
  return data?.id || null;
}

// ── GET — export iCal ────────────────────────────────────────────────────────

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const apartmentId = searchParams.get("apartment_id");
  if (!apartmentId) return new Response("apartment_id required", { status: 400 });

  const supabase = await createClient();

  const [{ data: apt }, { data: bookings }, { data: blocked }] = await Promise.all([
    supabase.from("serviced_apartments").select("name, city, state").eq("id", apartmentId).single(),
    supabase.from("apartment_bookings").select("id, check_in_date, check_out_date, guest_name, booking_status")
      .eq("apartment_id", apartmentId)
      .in("booking_status", ["confirmed", "checked_in"])
      .gte("check_out_date", new Date().toISOString().split("T")[0]),
    supabase.from("apartment_blocked_dates").select("id, start_date, end_date, reason")
      .eq("apartment_id", apartmentId)
      .gte("end_date", new Date().toISOString().split("T")[0]),
  ]);

  const aptName = apt ? `${apt.name} — ${apt.city}` : "Apartment";

  const events = [
    ...(bookings || []).map((b) =>
      formatICalEvent({
        uid: `booking-${b.id}@bookhushly.com`,
        summary: `Booked: ${b.guest_name || "Guest"}`,
        start: b.check_in_date,
        end: b.check_out_date,
        description: `Booking ID: ${b.id}`,
      })
    ),
    ...(blocked || []).map((b) =>
      formatICalEvent({
        uid: `blocked-${b.id}@bookhushly.com`,
        summary: `Blocked: ${b.reason || "Unavailable"}`,
        start: b.start_date,
        end: b.end_date,
      })
    ),
  ];

  const ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BookHushly//Apartment Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${aptName}`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookhushly-${apartmentId}.ics"`,
    },
  });
}

// ── POST — import iCal ───────────────────────────────────────────────────────

export async function POST(request) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const apartmentId = formData.get("apartment_id");
  const file = formData.get("file");

  if (!apartmentId || !file) {
    return NextResponse.json({ error: "apartment_id and file are required" }, { status: 400 });
  }

  // Verify vendor owns apartment
  const { data: apt } = await supabase.from("serviced_apartments").select("id").eq("id", apartmentId).eq("vendor_id", vendorId).single();
  if (!apt) return NextResponse.json({ error: "Apartment not found or not yours" }, { status: 403 });

  const text = await file.text();
  const events = parseICal(text);

  if (!events.length) {
    return NextResponse.json({ error: "No valid events found in the iCal file" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];
  const futureEvents = events.filter((e) => e.end >= today);

  if (!futureEvents.length) {
    return NextResponse.json({ imported: 0, message: "All events are in the past — nothing imported" });
  }

  const adminSupabase = createAdminClient();
  const rows = futureEvents.map((e) => ({
    apartment_id: apartmentId,
    vendor_id: vendorId,
    start_date: e.start,
    end_date: e.end,
    reason: e.summary || e.description || "Imported from external calendar",
  }));

  const { data, error } = await adminSupabase
    .from("apartment_blocked_dates")
    .insert(rows)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ imported: data.length, events: data });
}
