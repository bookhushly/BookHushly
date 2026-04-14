/**
 * utils/generatePdf.js
 *
 * Client-facing ticket generation — delegates to the shared ticketGenerator.
 * The templatePath parameter is accepted for backward compatibility but is
 * no longer used; the new design is fully code-drawn.
 *
 * Used by: app/api/send-tickets/route.js
 */

import { generateTicketPDF } from "@/lib/ticketGenerator";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Expand { [ticketType]: quantity } into an ordered flat list of type strings.
 * Order matches computeSeatAssignments() in the booking routes so that
 * seat_assignments[i] always corresponds to individualTickets[i].
 */
function expandTicketDetails(ticketDetails) {
  const tickets = [];
  for (const [ticketType, quantity] of Object.entries(ticketDetails)) {
    for (let i = 0; i < quantity; i++) {
      tickets.push(ticketType);
    }
  }
  return tickets;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a single ticket PDF.
 *
 * @param {Object}      booking        Booking object (with `.listing` join)
 * @param {number}      ticketNumber   1-indexed position (kept for compat, unused)
 * @param {string}      ticketType     Ticket tier name
 * @param {string}      baseUrl        App origin for QR code URL
 * @param {string}      [templatePath] Ignored — kept for backward compat
 * @param {string|null} [seatNumber]   Assigned seat label, or null
 * @returns {Promise<Buffer>}
 */
export async function generateSingleTicketPDF(
  booking,
  ticketNumber,
  ticketType,
  baseUrl,
  templatePath,
  seatNumber = null
) {
  return generateTicketPDF(booking, ticketType, baseUrl, seatNumber);
}

/**
 * Generate all ticket PDFs for a booking — one PDF per ticket.
 * Seat assignments (if any) are read from booking.seat_assignments.
 *
 * @param {Object} booking        Booking object (must include seat_assignments)
 * @param {string} baseUrl        App origin for QR code URLs
 * @param {string} [templatePath] Ignored — kept for backward compat
 * @returns {Promise<Array<{ filename: string, content: Buffer }>>}
 */
export async function generateAllTicketPDFs(booking, baseUrl, templatePath) {
  let ticketDetails = {};
  try {
    ticketDetails = booking.ticket_details
      ? JSON.parse(booking.ticket_details)
      : {};
  } catch (err) {
    console.error("[generateAllTicketPDFs] Error parsing ticket_details:", err);
    throw new Error("Invalid ticket details format");
  }

  const individualTickets = expandTicketDetails(ticketDetails);
  const totalTickets = individualTickets.length;

  if (totalTickets === 0 || totalTickets !== booking.guests) {
    throw new Error("Invalid ticket details or guest count mismatch");
  }

  // seat_assignments[i] maps to individualTickets[i] by index
  const seatAssignments = Array.isArray(booking.seat_assignments)
    ? booking.seat_assignments
    : [];

  const results = [];

  for (let i = 0; i < totalTickets; i++) {
    const ticketType = individualTickets[i];
    const seatNumber = seatAssignments[i]?.seat ?? null;
    const pdfBuffer  = await generateSingleTicketPDF(
      booking,
      i + 1,
      ticketType,
      baseUrl,
      templatePath,
      seatNumber
    );

    const seatSuffix = seatNumber ? `-${seatNumber.replace(/\s+/g, "")}` : "";
    results.push({
      filename: `Ticket-${i + 1}-${ticketType.replace(/\s+/g, "-")}${seatSuffix}.pdf`,
      content: pdfBuffer,
    });
  }

  return results;
}
