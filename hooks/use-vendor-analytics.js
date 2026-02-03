// lib/hooks/use-vendor-analytics.js
"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ─── keys ────────────────────────────────────────────────────────────────────
export const analyticsKeys = {
  all: (vendorId) => ["vendor-analytics", vendorId],
  payments: (vendorId, range) => [
    ...analyticsKeys.all(vendorId),
    "payments",
    range,
  ],
  bookings: (vendorId, range) => [
    ...analyticsKeys.all(vendorId),
    "bookings",
    range,
  ],
};

// ─── date helpers ────────────────────────────────────────────────────────────
function getFrom(range) {
  const now = new Date();
  switch (range) {
    case "7d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "30d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return d;
    }
    case "90d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 90);
      return d;
    }
    case "1y": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return d;
    }
    default:
      return new Date(now.getFullYear(), now.getMonth() - 6, 1);
  }
}

// Bucket a date into "YYYY-MM-DD", "YYYY-Www", or "YYYY-MM" depending on range
function bucketKey(dateStr, range) {
  const d = new Date(dateStr);
  if (range === "7d") {
    // daily
    return d.toISOString().slice(0, 10);
  }
  if (range === "30d") {
    // weekly  — ISO week
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }
  // monthly for 90d / 1y / 6m
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatBucket(key, range) {
  if (range === "7d") {
    return new Date(key + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  if (range === "30d") {
    return key; // "2025-W03"
  }
  // monthly
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

// ─── fetch payments (raw, vendor-scoped) ─────────────────────────────────────
async function fetchPaymentsRaw(vendorId, range) {
  const from = getFrom(range);
  const { data, error } = await supabase
    .from("payments")
    .select(
      `id, amount, vendor_amount, status, provider, created_at, request_type,
       event_booking_id, hotel_booking_id, apartment_booking_id,
       event_bookings:event_booking_id ( listings:listing_id (vendor_id, category) ),
       hotel_bookings:hotel_booking_id ( hotels:hotel_id (vendor_id) ),
       apartment_bookings:apartment_booking_id ( serviced_apartments:apartment_id (vendor_id) )`,
    )
    .gte("created_at", from.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw error;

  // filter to this vendor
  return (data || []).filter(
    (p) =>
      p.event_bookings?.listings?.vendor_id === vendorId ||
      p.hotel_bookings?.hotels?.vendor_id === vendorId ||
      p.apartment_bookings?.serviced_apartments?.vendor_id === vendorId,
  );
}

// ─── fetch bookings (all types, vendor-scoped) ──────────────────────────────
async function fetchBookingsRaw(vendorId, range) {
  const from = getFrom(range);

  const [evRes, hotelRes, apRes] = await Promise.all([
    // event_bookings → listings.vendor_id
    supabase
      .from("event_bookings")
      .select(
        "id, status, created_at, total_amount, listing_id, listings:listing_id (vendor_id, category)",
      )
      .gte("created_at", from.toISOString()),
    // hotel_bookings — fetch via hotels join
    supabase
      .from("hotel_bookings")
      .select(
        "id, status, created_at, total_amount, hotel_id, hotels:hotel_id (vendor_id)",
      )
      .gte("created_at", from.toISOString()),
    // apartment_bookings
    supabase
      .from("apartment_bookings")
      .select(
        "id, booking_status as status, created_at, total_amount, apartment_id, serviced_apartments:apartment_id (vendor_id)",
      )
      .gte("created_at", from.toISOString()),
  ]);

  const events = (evRes.data || [])
    .filter((b) => b.listings?.vendor_id === vendorId)
    .map((b) => ({ ...b, _type: "event" }));

  const hotels = (hotelRes.data || [])
    .filter((b) => b.hotels?.vendor_id === vendorId)
    .map((b) => ({ ...b, _type: "hotel" }));

  const apartments = (apRes.data || [])
    .filter((b) => b.serviced_apartments?.vendor_id === vendorId)
    .map((b) => ({ ...b, _type: "apartment" }));

  return [...events, ...hotels, ...apartments].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at),
  );
}

// ─── aggregate: timeline (revenue + bookings per bucket) ─────────────────────
function buildTimeline(payments, bookings, range) {
  const map = {};

  payments.forEach((p) => {
    if (
      !["completed", "success", "confirmed", "finished"].includes(
        (p.status || "").toLowerCase(),
      )
    )
      return;
    const key = bucketKey(p.created_at, range);
    if (!map[key])
      map[key] = { label: formatBucket(key, range), revenue: 0, bookings: 0 };
    map[key].revenue += parseFloat(p.vendor_amount || p.amount || 0);
  });

  bookings.forEach((b) => {
    const key = bucketKey(b.created_at, range);
    if (!map[key])
      map[key] = { label: formatBucket(key, range), revenue: 0, bookings: 0 };
    map[key].bookings += 1;
  });

  return Object.keys(map)
    .sort()
    .map((k) => map[k]);
}

// ─── aggregate: revenue by service type ──────────────────────────────────────
function buildByService(payments) {
  const map = { event: 0, hotel: 0, apartment: 0, logistics: 0, security: 0 };

  payments.forEach((p) => {
    if (
      !["completed", "success", "confirmed", "finished"].includes(
        (p.status || "").toLowerCase(),
      )
    )
      return;
    const amt = parseFloat(p.vendor_amount || p.amount || 0);

    if (p.event_booking_id) map.event += amt;
    else if (p.hotel_booking_id) map.hotel += amt;
    else if (p.apartment_booking_id) map.apartment += amt;
    else if (p.request_type === "logistics") map.logistics += amt;
    else if (p.request_type === "security") map.security += amt;
  });

  return Object.entries(map)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));
}

// ─── aggregate: provider split per bucket ────────────────────────────────────
function buildProviderSplit(payments, range) {
  const map = {};

  payments.forEach((p) => {
    if (
      !["completed", "success", "confirmed", "finished"].includes(
        (p.status || "").toLowerCase(),
      )
    )
      return;
    const key = bucketKey(p.created_at, range);
    if (!map[key])
      map[key] = { label: formatBucket(key, range), Paystack: 0, Crypto: 0 };
    const provider =
      (p.provider || "").toLowerCase() === "paystack" ? "Paystack" : "Crypto";
    map[key][provider] += parseFloat(p.vendor_amount || p.amount || 0);
  });

  return Object.keys(map)
    .sort()
    .map((k) => map[k]);
}

// ─── aggregate: booking status breakdown ─────────────────────────────────────
function buildStatusBreakdown(bookings) {
  const map = { confirmed: 0, pending: 0, completed: 0, cancelled: 0 };

  bookings.forEach((b) => {
    const s = (b.status || "pending").toLowerCase();
    if (s in map) map[s]++;
    else if (s === "checked_in" || s === "checked_out") map.completed++;
    else map.pending++;
  });

  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

// ─── aggregate: growth rate (current vs previous period) ─────────────────────
function buildGrowth(payments, range) {
  const now = new Date();
  const from = getFrom(range);
  const midpoint = new Date((from.getTime() + now.getTime()) / 2);

  let current = 0,
    previous = 0;

  payments.forEach((p) => {
    if (
      !["completed", "success", "confirmed", "finished"].includes(
        (p.status || "").toLowerCase(),
      )
    )
      return;
    const amt = parseFloat(p.vendor_amount || p.amount || 0);
    if (new Date(p.created_at) >= midpoint) current += amt;
    else previous += amt;
  });

  const pct =
    previous === 0
      ? current > 0
        ? 100
        : 0
      : ((current - previous) / previous) * 100;
  return { current, previous, growthPercent: parseFloat(pct.toFixed(1)) };
}

// ─── main hook ───────────────────────────────────────────────────────────────
export function useVendorAnalytics(vendorId, range = "30d") {
  const paymentsQ = useQuery({
    queryKey: analyticsKeys.payments(vendorId, range),
    queryFn: () => fetchPaymentsRaw(vendorId, range),
    enabled: !!vendorId,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });

  const bookingsQ = useQuery({
    queryKey: analyticsKeys.bookings(vendorId, range),
    queryFn: () => fetchBookingsRaw(vendorId, range),
    enabled: !!vendorId,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });

  const payments = paymentsQ.data || [];
  const bookings = bookingsQ.data || [];
  const isLoading = paymentsQ.isLoading || bookingsQ.isLoading;

  // memoised aggregations — recompute only when raw data or range changes
  const analytics = {
    timeline: buildTimeline(payments, bookings, range),
    byService: buildByService(payments),
    providerSplit: buildProviderSplit(payments, range),
    statusBreakdown: buildStatusBreakdown(bookings),
    growth: buildGrowth(payments, range),
    totalBookings: bookings.length,
  };

  return { analytics, isLoading };
}
