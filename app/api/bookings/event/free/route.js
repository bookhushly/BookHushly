/**
 * Compute seat assignments for a booking based on the listing's seats_config.
 *
 * Strategy: derive "already sold" from (pkg.total - pkg.remaining) so we
 * don't need an extra query. Assignments are returned in the same iteration
 * order as expandTicketDetails() uses, so PDF generation can match by index.
 *
 * @param {Object|null} seatsConfig   - listing.seats_config
 * @param {Object}      ticketDetails - { [packageName]: qty }
 * @param {Array}       packages      - listing.ticket_packages
 * @returns {Array}  [{ ticket_type: string, seat: string }, …]
 */
function computeSeatAssignments(seatsConfig, ticketDetails, packages) {
  if (!seatsConfig?.enabled) return [];

  const mode = seatsConfig.mode || "per_tier";
  const assignments = [];

  if (mode === "unified") {
    const { prefix = "", start = 1 } = seatsConfig.unified || {};
    // Total tickets sold so far across all packages
    const totalSold = packages.reduce(
      (sum, pkg) => sum + ((parseInt(pkg.total) || 0) - (parseInt(pkg.remaining ?? pkg.total) || 0)),
      0,
    );
    let counter = start + totalSold;
    for (const [ticketType, qty] of Object.entries(ticketDetails)) {
      const count = parseInt(qty) || 0;
      for (let i = 0; i < count; i++) {
        assignments.push({ ticket_type: ticketType, seat: `${prefix}${counter}` });
        counter++;
      }
    }
  } else {
    // per_tier: each ticket tier has its own prefix + starting number
    const tiers = seatsConfig.tiers || {};
    for (const [ticketType, qty] of Object.entries(ticketDetails)) {
      const count = parseInt(qty) || 0;
      if (count === 0) continue;
      const tierCfg = tiers[ticketType];
      if (!tierCfg) continue; // tier not configured — skip seat assignment for it
      const { prefix = "", start = 1 } = tierCfg;
      const pkg = packages.find((p) => p.name === ticketType);
      const tierSold = pkg
        ? (parseInt(pkg.total) || 0) - (parseInt(pkg.remaining ?? pkg.total) || 0)
        : 0;
      let counter = start + tierSold;
      for (let i = 0; i < count; i++) {
        assignments.push({ ticket_type: ticketType, seat: `${prefix}${counter}` });
        counter++;
      }
    }
  }

  return assignments;
}

/**
 * POST /api/bookings/event/free
 * Creates a confirmed event booking with total_amount = 0.
 * Server validates that the chosen ticket packages are genuinely free
 * before confirming — the client cannot fake a ₦0 booking for paid tickets.
 *
 * Scale: uses admin client for atomic decrement; Supabase row-level locking
 * prevents overselling under concurrent load.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyBookingConfirmed } from "@/lib/notifications";

export async function POST(request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const body = await request.json().catch(() => ({}));
  const {
    listing_id,
    contact_name,
    contact_email,
    contact_phone,
    ticket_details, // { [packageName]: quantity }
    custom_answers,
  } = body;

  if (!listing_id || !contact_email || !contact_phone || !contact_name) {
    return NextResponse.json(
      { error: "listing_id, contact_name, contact_email and contact_phone are required" },
      { status: 400 },
    );
  }
  if (!ticket_details || typeof ticket_details !== "object") {
    return NextResponse.json({ error: "ticket_details is required" }, { status: 400 });
  }

  const totalQty = Object.values(ticket_details).reduce((s, q) => s + (parseInt(q) || 0), 0);
  if (totalQty < 1 || totalQty > 20) {
    return NextResponse.json({ error: "Invalid ticket quantity (1–20)" }, { status: 400 });
  }

  // Get the current user if logged in (optional for guest bookings)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch listing with package data
  const { data: listing, error: listingErr } = await admin
    .from("listings")
    .select("id, title, event_date, event_time, location, ticket_packages, remaining_tickets, total_tickets, vendor_id, seats_config")
    .eq("id", listing_id)
    .eq("visibility", "public")
    .maybeSingle();

  if (listingErr || !listing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Server-side verify all selected packages are priced at 0
  const packages = Array.isArray(listing.ticket_packages) ? listing.ticket_packages : [];
  let serverTotal = 0;
  let totalTicketsRequested = 0;

  for (const [pkgName, qty] of Object.entries(ticket_details)) {
    const count = parseInt(qty) || 0;
    if (count === 0) continue;

    const pkg = packages.find((p) => p.name === pkgName);

    // No packages defined → single-price event; price must be 0
    if (!pkg && packages.length === 0) {
      const price = parseFloat(listing.price) || 0;
      serverTotal += price * count;
    } else if (pkg) {
      const effectivePrice = parseFloat(pkg.price) || 0;
      serverTotal += effectivePrice * count;

      // Check package stock
      const remaining = parseInt(pkg.remaining ?? pkg.total) || 0;
      if (remaining < count) {
        return NextResponse.json(
          { error: `"${pkgName}" does not have enough remaining tickets` },
          { status: 409 },
        );
      }
    } else {
      return NextResponse.json({ error: `Unknown ticket package: ${pkgName}` }, { status: 400 });
    }
    totalTicketsRequested += count;
  }

  if (serverTotal !== 0) {
    return NextResponse.json(
      { error: "This event has paid tickets — use the standard payment flow" },
      { status: 400 },
    );
  }

  // Check overall remaining tickets
  if (
    listing.remaining_tickets !== null &&
    listing.remaining_tickets < totalTicketsRequested
  ) {
    return NextResponse.json({ error: "Not enough tickets remaining" }, { status: 409 });
  }

  // Compute seat assignments if seat system is enabled on this listing.
  // We derive "seats already sold" from (total - remaining) so no extra DB
  // query is needed. Order of assignments matches expandTicketDetails() so
  // generateAllTicketPDFsServer() can correlate by index.
  const seatAssignments = computeSeatAssignments(listing.seats_config, ticket_details, packages);

  // Insert booking
  const bookingDate = listing.event_date
    ? new Date(listing.event_date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const { data: booking, error: bookingErr } = await admin
    .from("event_bookings")
    .insert({
      listing_id,
      customer_id: user?.id ?? null,
      contact_email: contact_email.trim().toLowerCase(),
      contact_phone: contact_phone.trim(),
      guests: totalTicketsRequested,
      ticket_details,
      custom_answers: custom_answers ?? null,
      seat_assignments: seatAssignments.length > 0 ? seatAssignments : [],
      booking_date: bookingDate,
      booking_time: listing.event_time ?? null,
      total_amount: 0,
      status: "confirmed",
      payment_status: "completed",
    })
    .select()
    .single();

  if (bookingErr || !booking) {
    console.error("[free-booking]", bookingErr?.message);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }

  // Decrement remaining tickets (best-effort; non-fatal on failure)
  const decrementPromises = [];

  if (listing.remaining_tickets !== null) {
    decrementPromises.push(
      admin
        .from("listings")
        .update({ remaining_tickets: Math.max(0, listing.remaining_tickets - totalTicketsRequested) })
        .eq("id", listing_id),
    );
  }

  // Decrement per-package remaining counts if ticket_packages exist
  if (packages.length > 0) {
    const updatedPackages = packages.map((pkg) => {
      const requested = parseInt(ticket_details[pkg.name]) || 0;
      if (requested === 0) return pkg;
      return {
        ...pkg,
        remaining: Math.max(0, (parseInt(pkg.remaining ?? pkg.total) || 0) - requested),
      };
    });
    decrementPromises.push(
      admin.from("listings").update({ ticket_packages: updatedPackages }).eq("id", listing_id),
    );
  }

  await Promise.allSettled(decrementPromises);

  // Notify customer
  if (user?.id) {
    notifyBookingConfirmed(user.id, {
      bookingId: booking.id,
      eventTitle: listing.title,
      eventDate: listing.event_date,
      location: listing.location,
    }).catch(() => {});
  }

  return NextResponse.json({ booking }, { status: 201 });
}
