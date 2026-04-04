/**
 * GET /api/bookings/hotel/invoice?booking_id=xxx
 * Generates a Nigerian VAT invoice PDF for a confirmed hotel booking.
 * Only the booking owner or an admin may download it.
 *
 * Nigerian VAT rate: 7.5% (FIRS — Finance Act 2019)
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import jsPDF from "jspdf";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const VAT_RATE = 0.075; // 7.5%
const COMPANY_NAME = "Bookhushly";
const COMPANY_ADDRESS = "Lagos, Nigeria";
const COMPANY_EMAIL = "support@bookhushly.com";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(n);
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function nightsBetween(checkIn, checkOut) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

// ── PDF builder ───────────────────────────────────────────────────────────────

async function buildInvoicePDF(booking, invoiceNumber) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 16;
  const col2 = 120; // right column x

  // ── Colours & helpers ──────────────────────────────────────────────────────
  const purple = [124, 58, 237];
  const gray = [107, 114, 128];
  const black = [17, 24, 39];
  const lightGray = [249, 250, 251];

  const text = (str, x, y, opts = {}) => {
    doc.setTextColor(...(opts.color || black));
    doc.setFontSize(opts.size || 10);
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.text(String(str ?? ""), x, y, { align: opts.align || "left" });
  };

  const line = (y, color = [229, 231, 235]) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(margin, y, W - margin, y);
  };

  const rect = (x, y, w, h, fillColor) => {
    doc.setFillColor(...fillColor);
    doc.rect(x, y, w, h, "F");
  };

  // ── Header band ────────────────────────────────────────────────────────────
  rect(0, 0, W, 38, purple);

  // Logo — top-left of header band, 28 × 28 mm (square logo, aspect 1:1)
  // Industry standard: logo anchored to top-left of document header
  const LOGO_SIZE = 28; // mm — 90% of typical UI logo footprint (minimum per design spec)
  try {
    // Convert via sharp → JPEG to strip alpha channel (required for jsPDF Node compat)
    const logoJpeg = await sharp(path.join(process.cwd(), "public", "logo.png"))
      .flatten({ background: { r: 124, g: 58, b: 237 } }) // blend transparency onto brand purple
      .jpeg({ quality: 95 })
      .toBuffer();
    const logoBase64 = `data:image/jpeg;base64,${logoJpeg.toString("base64")}`;
    doc.addImage(logoBase64, "JPEG", margin - 2, 5, LOGO_SIZE, LOGO_SIZE);
  } catch (err) {
    console.error("[hotel invoice] logo load failed:", err);
    // Fall back to text wordmark only
    text("BOOKHUSHLY", margin, 14, {
      color: [255, 255, 255],
      size: 18,
      bold: true,
    });
  }

  // Company info — right of logo
  const infoX = margin - 2 + LOGO_SIZE + 4; // 4 mm gap after logo
  text("BOOKHUSHLY", infoX, 14, {
    color: [255, 255, 255],
    size: 14,
    bold: true,
  });
  text("VAT INVOICE", infoX, 21, { color: [221, 214, 254], size: 9 });
  text(COMPANY_ADDRESS, infoX, 28, { color: [221, 214, 254], size: 8 });
  text(COMPANY_EMAIL, infoX, 34, { color: [221, 214, 254], size: 8 });

  text(`Invoice #${invoiceNumber}`, W - margin, 14, {
    color: [255, 255, 255],
    size: 11,
    bold: true,
    align: "right",
  });
  text(`Date: ${fmtDate(new Date().toISOString())}`, W - margin, 22, {
    color: [221, 214, 254],
    size: 9,
    align: "right",
  });
  let y = 52;

  // ── Billed to ─────────────────────────────────────────────────────────────
  text("BILLED TO", margin, y, { color: gray, size: 8, bold: true });
  text("BOOKING REFERENCE", col2, y, { color: gray, size: 8, bold: true });
  y += 6;
  text(booking.guest_name || "Guest", margin, y, { bold: true });
  text(booking.id.slice(0, 8).toUpperCase(), col2, y, { bold: true });
  y += 5;
  text(booking.guest_email || "", margin, y, { color: gray, size: 9 });
  text(`Status: ${(booking.booking_status || "").toUpperCase()}`, col2, y, {
    size: 9,
  });
  y += 5;
  text(booking.guest_phone || "", margin, y, { color: gray, size: 9 });

  y += 12;
  line(y);
  y += 8;

  // ── Property details ───────────────────────────────────────────────────────
  text("PROPERTY", margin, y, { color: gray, size: 8, bold: true });
  y += 6;
  text(booking.hotel?.name || "Hotel", margin, y, { bold: true, size: 11 });
  y += 5;
  text(
    [booking.hotel?.address, booking.hotel?.city, booking.hotel?.state]
      .filter(Boolean)
      .join(", "),
    margin,
    y,
    { color: gray, size: 9 },
  );
  y += 5;
  text(`Room type: ${booking.room_type?.name || "Standard Room"}`, margin, y, {
    size: 9,
  });
  const vendorPhone = booking.hotel?.vendors?.phone_number;
  if (vendorPhone) {
    y += 5;
    text(`Emergency contact: ${vendorPhone}`, margin, y, { size: 9, color: gray });
  }

  y += 12;
  line(y);
  y += 8;

  // ── Stay details table ─────────────────────────────────────────────────────
  rect(margin, y - 3, W - margin * 2, 8, lightGray);
  text("Description", margin + 3, y + 2, { bold: true, size: 9 });
  text("Nights", 120, y + 2, { bold: true, size: 9, align: "center" });
  text("Rate / Night", 152, y + 2, { bold: true, size: 9, align: "right" });
  text("Amount", W - margin, y + 2, { bold: true, size: 9, align: "right" });
  y += 10;

  const nights = nightsBetween(booking.check_in_date, booking.check_out_date);
  const securityDeposit = parseFloat(booking.hotel?.security_deposit) || 0;
  const totalPaid = parseFloat(booking.total_price) || 0;
  // Room amount is total minus security deposit (deposit is not VAT-able)
  const roomAmount = totalPaid - securityDeposit;
  const netAmount = roomAmount / (1 + VAT_RATE);
  const vatAmount = roomAmount - netAmount;
  const ratePerNight = nights > 0 ? netAmount / nights : netAmount;

  const rowDesc = `${booking.room_type?.name || "Room"} — ${fmtDate(booking.check_in_date)} to ${fmtDate(booking.check_out_date)}`;
  text(rowDesc, margin + 3, y, { size: 9 });
  text(String(nights), 120, y, { size: 9, align: "center" });
  text(fmt(ratePerNight), 152, y, { size: 9, align: "right" });
  text(fmt(netAmount), W - margin, y, { size: 9, align: "right" });
  y += 6;

  // Breakfast inclusion note
  const breakfastOffered = booking.hotel?.breakfast_offered;
  if (breakfastOffered && breakfastOffered !== "none") {
    const breakfastType = booking.hotel?.breakfast_type;
    const breakfastLabel =
      breakfastOffered === "included"
        ? `Breakfast — ${breakfastType ? breakfastType.replace(/_/g, " ") : "included in room rate"}`
        : `Breakfast — available for purchase (${breakfastType || "ask at check-in"})`;
    text(breakfastLabel, margin + 3, y, { size: 9, color: [22, 101, 52] });
    text(
      breakfastOffered === "included" ? "Complimentary" : "Paid separately",
      W - margin,
      y,
      {
        size: 9,
        align: "right",
        color: [22, 101, 52],
      },
    );
    y += 6;
  }

  // Security deposit line item
  if (securityDeposit > 0) {
    const depositLabel = booking.hotel?.security_deposit_notes
      ? `Security Deposit (${booking.hotel.security_deposit_notes})`
      : "Security / Caution Deposit";
    text(depositLabel, margin + 3, y, { size: 9, color: gray });
    text("—", 120, y, { size: 9, align: "center", color: gray });
    text("—", 152, y, { size: 9, align: "right", color: gray });
    text(fmt(securityDeposit), W - margin, y, { size: 9, align: "right" });
    y += 6;
  }

  line(y, [229, 231, 235]);
  y += 10;

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totX = 130;
  const valX = W - margin;

  text("Room subtotal (excl. VAT)", totX, y, { size: 9 });
  text(fmt(netAmount), valX, y, { size: 9, align: "right" });
  y += 6;

  text(`VAT (7.5% — FIRS)`, totX, y, { size: 9, color: gray });
  text(fmt(vatAmount), valX, y, { size: 9, align: "right", color: gray });
  y += 6;

  if (securityDeposit > 0) {
    text("Security deposit", totX, y, { size: 9, color: gray });
    text(fmt(securityDeposit), valX, y, {
      size: 9,
      align: "right",
      color: gray,
    });
    y += 6;
  }

  y -= 4;
  line(y);
  y += 6;

  rect(totX - 4, y - 4, W - margin - totX + 4 + 4, 9, [237, 233, 254]);
  text("TOTAL PAID", totX, y + 2, { bold: true, size: 10 });
  text(fmt(totalPaid), valX, y + 2, {
    bold: true,
    size: 10,
    align: "right",
    color: purple,
  });
  y += 14;

  // ── Payment info ───────────────────────────────────────────────────────────
  if (booking.payment_status === "completed") {
    rect(margin, y - 3, W - margin * 2, 8, [240, 253, 244]);
    doc.setDrawColor(134, 239, 172);
    doc.setLineWidth(0.4);
    doc.rect(margin, y - 3, W - margin * 2, 8);
    text(
      "✓  PAYMENT RECEIVED — Thank you for your business",
      margin + 4,
      y + 2,
      {
        size: 9,
        bold: true,
        color: [22, 163, 74],
      },
    );
    y += 14;
  }

  // ── Legal footer ───────────────────────────────────────────────────────────
  y = 270;
  line(y);
  y += 5;
  text(
    "This is a computer-generated VAT invoice issued pursuant to FIRS requirements (Finance Act 2019, 7.5% VAT).",
    W / 2,
    y,
    { size: 7, color: gray, align: "center" },
  );
  y += 4;
  text(
    `${COMPANY_NAME} · ${COMPANY_ADDRESS} · ${COMPANY_EMAIL}`,
    W / 2,
    y,
    { size: 7, color: gray, align: "center" },
  );

  return doc.output("arraybuffer");
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const bookingId = searchParams.get("booking_id");

  if (!bookingId) {
    return NextResponse.json(
      { error: "booking_id is required" },
      { status: 400 },
    );
  }

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Fetch booking with hotel and room type
  const { data: booking, error } = await admin
    .from("hotel_bookings")
    .select(
      `
      id, guest_name, guest_email, guest_phone,
      check_in_date, check_out_date, total_price,
      booking_status, payment_status,
      user_id,
      hotel:hotel_id(name, address, city, state, security_deposit, security_deposit_notes, breakfast_offered, breakfast_type, vendors:vendor_id(phone_number)),
      room_type:room_type_id(name)
    `,
    )
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Only owner or admin can download
  const { data: userRecord } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = userRecord?.role === "admin";
  if (!isAdmin && booking.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only issue invoice for confirmed/completed bookings
  const INVOICEABLE = ["confirmed", "checked_in", "completed", "pay_at_hotel"];
  if (!INVOICEABLE.includes(booking.booking_status)) {
    return NextResponse.json(
      { error: "Invoice only available for confirmed bookings" },
      { status: 422 },
    );
  }

  const invoiceNumber = `BH-HTL-${booking.id.slice(0, 8).toUpperCase()}`;

  try {
    const pdfBuffer = await buildInvoicePDF(booking, invoiceNumber);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bookhushly-invoice-${invoiceNumber}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[hotel invoice]", err);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 },
    );
  }
}
