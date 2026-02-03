// lib/hooks/use-vendor-payments.js
"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ─── helpers ─────────────────────────────────────────────────────────────────
// Normalise the many status strings in the payments table into three buckets
// the vendor actually cares about.
export function normaliseStatus(status) {
  if (!status) return "pending";
  const s = status.toLowerCase();
  if (["completed", "success", "confirmed", "finished"].includes(s))
    return "completed";
  if (["failed", "abandoned", "expired", "reversed"].includes(s))
    return "failed";
  if (["refunded"].includes(s)) return "refunded";
  // pending / confirming / waiting / sending / ongoing / queued / partially_paid
  return "pending";
}

// ─── query keys ──────────────────────────────────────────────────────────────
export const vendorPaymentKeys = {
  all: (vendorId) => ["vendor-payments", vendorId],
  list: (vendorId, filters) => [
    ...vendorPaymentKeys.all(vendorId),
    "list",
    filters,
  ],
  stats: (vendorId, range) => [
    ...vendorPaymentKeys.all(vendorId),
    "stats",
    range,
  ],
};

// ─── fetch: paginated payments list ─────────────────────────────────────────
// Joins payments → listings (via event/hotel/apartment booking FKs) to get
// listing.vendor_id. Falls back to request_type for quote-based payments.
async function fetchVendorPayments(
  vendorId,
  { page, pageSize, status, provider, search, dateRange },
) {
  let query = supabase
    .from("payments")
    .select(
      `
      id,
      reference,
      amount,
      vendor_amount,
      status,
      provider,
      request_type,
      email,
      created_at,
      paid_at,
      refund_amount,
      currency,
      event_booking_id,
      hotel_booking_id,
      apartment_booking_id,
      quote_id,
      event_bookings:event_booking_id (
        listing_id,
        listings:listing_id (vendor_id, title, category)
      ),
      hotel_bookings:hotel_booking_id (
        hotel_id,
        hotels:hotel_id (vendor_id, name)
      ),
      apartment_bookings:apartment_booking_id (
        apartment_id,
        serviced_apartments:apartment_id (vendor_id, name)
      )
    `,
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  // ── filters applied in-query where possible ───────────────────────────
  if (status !== "all") {
    // Map our normalised buckets back to the raw DB values
    const MAP = {
      completed: ["completed", "success", "confirmed", "finished"],
      failed: ["failed", "abandoned", "expired", "reversed"],
      pending: [
        "pending",
        "confirming",
        "waiting",
        "sending",
        "ongoing",
        "queued",
        "partially_paid",
      ],
      refunded: ["refunded"],
    };
    if (MAP[status]) query = query.in("status", MAP[status]);
  }

  if (provider !== "all") query = query.eq("provider", provider);

  if (search) {
    query = query.or(`reference.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (dateRange !== "all") {
    const now = new Date();
    let from;
    switch (dateRange) {
      case "today":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        from = new Date(now);
        from.setDate(now.getDate() - 7);
        break;
      case "month":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "3months":
        from = new Date(now);
        from.setMonth(now.getMonth() - 3);
        break;
      default:
        from = null;
    }
    if (from) query = query.gte("created_at", from.toISOString());
  }

  const { data, error, count } = await query;
  if (error) throw error;

  // ── post-filter to this vendor only ─────────────────────────────────────
  // We can't do a single SQL join across 3 optional FKs cleanly in one
  // PostgREST call, so filter client-side after fetch.  Page sizes are small
  // (≤50) so this is fine.
  const owned = (data || []).filter((p) => {
    const eb = p.event_bookings?.listings?.vendor_id;
    const hb = p.hotel_bookings?.hotels?.vendor_id;
    const ab = p.apartment_bookings?.serviced_apartments?.vendor_id;
    return eb === vendorId || hb === vendorId || ab === vendorId;
  });

  return { payments: owned, total: owned.length };
}

// ─── fetch: summary stats for stat cards ────────────────────────────────────
async function fetchVendorStats(vendorId, dateRange) {
  // Reuse the same query but pull only the fields we need for aggregation.
  // In production you'd write a Postgres function; this keeps it simple.
  const now = new Date();
  let from;
  switch (dateRange) {
    case "today":
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      from = new Date(now);
      from.setDate(now.getDate() - 7);
      break;
    case "month":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "3months":
      from = new Date(now);
      from.setMonth(now.getMonth() - 3);
      break;
    default:
      from = null;
  }

  let query = supabase.from("payments").select(
    `
      amount, vendor_amount, status, refund_amount,
      event_bookings:event_booking_id ( listings:listing_id (vendor_id) ),
      hotel_bookings:hotel_booking_id ( hotels:hotel_id (vendor_id) ),
      apartment_bookings:apartment_booking_id ( serviced_apartments:apartment_id (vendor_id) )
    `,
  );

  if (from) query = query.gte("created_at", from.toISOString());

  const { data, error } = await query;
  if (error) throw error;

  // filter to vendor
  const rows = (data || []).filter((p) => {
    return (
      p.event_bookings?.listings?.vendor_id === vendorId ||
      p.hotel_bookings?.hotels?.vendor_id === vendorId ||
      p.apartment_bookings?.serviced_apartments?.vendor_id === vendorId
    );
  });

  let totalEarnings = 0;
  let totalRefunded = 0;
  let completedCount = 0;
  let pendingCount = 0;
  let failedCount = 0;

  rows.forEach((p) => {
    const ns = normaliseStatus(p.status);
    const earned = parseFloat(p.vendor_amount || p.amount || 0);
    if (ns === "completed") {
      totalEarnings += earned;
      completedCount++;
    } else if (ns === "pending") {
      pendingCount++;
    } else if (ns === "failed") {
      failedCount++;
    }
    totalRefunded += parseFloat(p.refund_amount || 0);
  });

  return {
    totalEarnings,
    netEarnings: totalEarnings - totalRefunded,
    totalRefunded,
    completedCount,
    pendingCount,
    failedCount,
    totalTransactions: rows.length,
  };
}

// ─── hooks ───────────────────────────────────────────────────────────────────
export function useVendorPayments(vendorId, filters) {
  return useQuery({
    queryKey: vendorPaymentKeys.list(vendorId, filters),
    queryFn: () => fetchVendorPayments(vendorId, filters),
    enabled: !!vendorId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useVendorPaymentStats(vendorId, dateRange) {
  return useQuery({
    queryKey: vendorPaymentKeys.stats(vendorId, dateRange),
    queryFn: () => fetchVendorStats(vendorId, dateRange),
    enabled: !!vendorId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
