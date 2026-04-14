/**
 * lib/ticketGenerator.js
 *
 * Core ticket PDF generator — produces a clean, branded Bookhushly ticket
 * entirely in code (no template image).  Handles dynamic content:
 *
 *  • Event name: scales font from 20 → 7pt, then wraps — never overflows.
 *  • Venue / long values: auto-wraps into the value column.
 *  • SEAT row: only rendered when a seat number is provided.
 *  • QR code: fits whatever vertical space remains above the footer.
 *
 * Exports a single async function used by both
 *   lib/generatePDFServer.js   (API routes)
 *   utils/generatePdf.js       (send-tickets route)
 */

import jsPDF from "jspdf";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const safeText = (v, fallback = "N/A") =>
  v === undefined || v === null || v === "" ? fallback : String(v);

function formatEventDate(dateStr) {
  if (!dateStr) return "TBD";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}

function formatEventTime(timeStr) {
  if (!timeStr) return "TBD";
  try {
    // booking_time is stored as TIMESTAMPTZ — extract HH:MM AM/PM
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    // Fallback: raw string (e.g. "19:00")
    return String(timeStr);
  } catch {
    return String(timeStr);
  }
}

/**
 * Fit text within maxWidth by progressively reducing the font size.
 * If the minimum font size is still too wide, wrap the text.
 * Returns { size: number, lines: string[] }
 */
function fitText(doc, text, maxWidth, fontFamily, fontStyle, maxSize, minSize) {
  doc.setFont(fontFamily, fontStyle);
  let size = maxSize;

  while (size > minSize) {
    doc.setFontSize(size);
    if (doc.getTextWidth(text) <= maxWidth) {
      return { size, lines: [text] };
    }
    size -= 0.5;
  }

  // At minimum size — wrap
  doc.setFontSize(minSize);
  return { size: minSize, lines: doc.splitTextToSize(text, maxWidth) };
}

// ─── Main generator ───────────────────────────────────────────────────────────

/**
 * Generate a single Bookhushly event ticket PDF.
 *
 * @param {Object}      booking     Booking record (must include .listing join)
 * @param {string}      ticketType  Ticket tier name shown below the QR code
 * @param {string}      baseUrl     App origin for the QR code URL
 * @param {string|null} seatNumber  Assigned seat (e.g. "A5"), or null
 * @returns {Promise<Buffer>}        PDF as a Node Buffer
 */
export async function generateTicketPDF(booking, ticketType, baseUrl, seatNumber = null) {
  // ── Geometry ──────────────────────────────────────────────────────────────
  const W      = 85;                    // page width  (mm)
  const H      = 155;                   // page height (mm)
  const CARD_M = 5;                     // inset from page edge
  const CARD_W = W - 2 * CARD_M;       // 75 mm
  const CARD_H = H - 2 * CARD_M;       // 145 mm
  const PAD_H  = 7;                     // horizontal padding inside card
  const PAD_T  = 7;                     // top padding inside card
  const CW     = CARD_W - 2 * PAD_H;   // usable content width = 61 mm
  const CX     = CARD_M + PAD_H;       // left edge of content = 12 mm
  const MID    = W / 2;                 // horizontal center

  // ── Colours ───────────────────────────────────────────────────────────────
  // All as [R, G, B] for doc.setTextColor / setFillColor / setDrawColor
  const C_BG     = [232, 232, 232]; // light gray page background
  const C_SHADOW = [196, 196, 196]; // card shadow
  const C_CARD   = [255, 255, 255]; // white card
  const C_NAVY   = [27,  42,  94 ]; // #1B2A5E — primary text
  const C_GRAY   = [120, 120, 120]; // secondary / footer text
  const C_DIVIDER= [210, 210, 210]; // thin horizontal rule
  const C_DOTS   = [180, 180, 180]; // dotted separator

  // ── jsPDF setup ───────────────────────────────────────────────────────────
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [W, H],
  });

  // ── Background ────────────────────────────────────────────────────────────
  doc.setFillColor(...C_BG);
  doc.rect(0, 0, W, H, "F");

  // ── Card shadow (offset 2 mm right + down) ────────────────────────────────
  doc.setFillColor(...C_SHADOW);
  doc.roundedRect(CARD_M + 2, CARD_M + 2, CARD_W, CARD_H, 7, 7, "F");

  // ── White card ────────────────────────────────────────────────────────────
  doc.setFillColor(...C_CARD);
  doc.roundedRect(CARD_M, CARD_M, CARD_W, CARD_H, 7, 7, "F");

  // ── Running Y cursor (relative to page top) ───────────────────────────────
  let y = CARD_M + PAD_T;

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  let logoRenderedH = 0;

  try {
    const rawBuf = await fs.readFile(logoPath);

    // Trim excessive white space so the image container tightly wraps the
    // actual logo art (the calendar icon + "Bookhushly" wordmark).
    const trimmedBuf = await sharp(rawBuf)
      .trim({ background: "#FFFFFF", threshold: 15 })
      .toBuffer();

    const { width: px, height: py } = await sharp(trimmedBuf).metadata();
    const aspect = px / py;

    // Target display width: 55 % of content width, capped at 36 mm
    const logoW = Math.min(CW * 0.55, 36);
    const logoH = logoW / aspect;
    const logoX = MID - logoW / 2;

    const logoB64 = `data:image/png;base64,${trimmedBuf.toString("base64")}`;
    doc.addImage(logoB64, "PNG", logoX, y, logoW, logoH);
    logoRenderedH = logoH;
  } catch {
    // Fallback: plain wordmark if the file can't be read/trimmed
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...C_NAVY);
    doc.text("Bookhushly", MID, y + 6, { align: "center" });
    logoRenderedH = 10;
  }

  y += logoRenderedH + 6;

  // ── Event name (replaces "EVENT TICKET") ─────────────────────────────────
  // Scale font from 20 pt down to 7 pt; wrap if even min size is too wide.
  const eventName = safeText(booking.listing?.title, "EVENT TICKET").toUpperCase();
  const { size: namePt, lines: nameLines } = fitText(
    doc, eventName, CW, "helvetica", "bold", 20, 7
  );

  const nameLineH = namePt * 0.352 * 1.45; // approximate mm line-height
  doc.setFont("helvetica", "bold");
  doc.setFontSize(namePt);
  doc.setTextColor(...C_NAVY);

  nameLines.forEach((line, i) => {
    doc.text(line, MID, y + nameLineH * (i + 1) - nameLineH * 0.25, {
      align: "center",
    });
  });
  y += nameLineH * nameLines.length + 2;

  // ── "YOUR BOOKING PLATFORM" subtitle ─────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(...C_NAVY);
  doc.text("YOUR BOOKING PLATFORM", MID, y + 3, { align: "center" });
  y += 8;

  // ── Thin horizontal rule ──────────────────────────────────────────────────
  doc.setDrawColor(...C_DIVIDER);
  doc.setLineWidth(0.2);
  doc.line(CX + 3, y, CX + CW - 3, y);
  y += 5;

  // ── Detail fields ─────────────────────────────────────────────────────────
  // Layout: [LABEL]  [value, possibly wrapping]
  // Label column is fixed-width; value fills the remainder.
  const LABEL_COL = 14;          // mm for bold label column
  const VAL_X     = CX + LABEL_COL; // value starts here
  const VAL_W     = CW - LABEL_COL; // value wraps within this width
  const FIELD_PT  = 7.5;         // font size for fields
  const FIELD_H   = 5;           // base row height in mm

  const fields = [
    { label: "DATE:", value: formatEventDate(booking.listing?.event_date) },
    { label: "TIME:", value: formatEventTime(booking.booking_time) },
    { label: "VENUE:", value: safeText(booking.listing?.location, "TBD") },
    ...(seatNumber ? [{ label: "SEAT:", value: String(seatNumber) }] : []),
  ];

  fields.forEach(({ label, value }) => {
    // Bold label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(FIELD_PT);
    doc.setTextColor(...C_NAVY);
    doc.text(label, CX, y);

    // Value — split into lines that fit within the value column
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C_NAVY);
    const valLines = doc.splitTextToSize(value, VAL_W);
    doc.text(valLines, VAL_X, y);

    y += FIELD_H * Math.max(1, valLines.length);
  });

  y += 4;

  // ── Dotted separator (full card width, like a tear-off perforation) ───────
  doc.setDrawColor(...C_DOTS);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([0.7, 1.8], 0);
  doc.line(CARD_M + 3, y, CARD_M + CARD_W - 3, y);
  doc.setLineDashPattern([], 0); // reset dash
  y += 6;

  // ── QR code ───────────────────────────────────────────────────────────────
  // Footer is pinned; QR gets whatever space is left, capped at 32 mm.
  const FOOTER_Y  = CARD_M + CARD_H - 7;
  const QR_MAX    = 32;
  const QR_AVAIL  = Math.max(0, FOOTER_Y - y - 8); // 8 mm clearance for type label
  const QR_SIZE   = Math.min(QR_MAX, QR_AVAIL);
  const QR_X      = MID - QR_SIZE / 2;

  if (QR_SIZE >= 16) {
    try {
      const qrData = await QRCode.toDataURL(
        `${baseUrl}/booking-status/${booking.id}`,
        {
          width: Math.round(QR_SIZE * 8), // target pixel density
          margin: 1,
          color: { dark: "#1B2A5E", light: "#FFFFFF" },
        }
      );
      doc.addImage(qrData, "PNG", QR_X, y, QR_SIZE, QR_SIZE);
      y += QR_SIZE + 3;
    } catch {
      // QR generation failed — skip silently
    }
  }

  // ── Ticket type label (below QR) ──────────────────────────────────────────
  if (y < FOOTER_Y - 4) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(...C_GRAY);
    doc.text(ticketType, MID, y, { align: "center" });
  }

  // ── Footer (pinned to card bottom) ────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(...C_GRAY);
  doc.text("Please present this ticket upon entry.", MID, FOOTER_Y, {
    align: "center",
  });

  return Buffer.from(doc.output("arraybuffer"));
}
