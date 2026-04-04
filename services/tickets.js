import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { generateAllTicketPDFs } from "@/lib/generateTicketPDF";

/**
 * Ticket Generation Service
 * Handles PDF generation for event tickets and booking confirmations
 */

/**
 * Generate all event tickets as a ZIP file (client-side)
 */
export const generateEventTicketsZip = async (booking) => {
  if (!booking) {
    throw new Error("Booking data is required");
  }

  if (typeof window === "undefined") {
    throw new Error("This function can only be called in the browser");
  }

  try {
    console.log("🎫 Starting ticket generation for booking:", booking.id);

    const baseUrl = window.location.origin;
    const templateUrl = "/ticket.jpg";

    console.log("📍 Base URL:", baseUrl);
    console.log("🖼️ Template URL:", templateUrl);

    console.log("⚙️ Calling generateAllTicketPDFs...");
    const tickets = await generateAllTicketPDFs(booking, baseUrl, templateUrl);

    console.log(`✅ Generated ${tickets.length} tickets`);

    const zip = new JSZip();
    tickets.forEach((ticket) => {
      console.log(`📦 Adding ${ticket.filename} to ZIP`);
      zip.file(ticket.filename, ticket.content);
    });

    console.log("💾 Generating ZIP file...");
    const zipBlob = await zip.generateAsync({ type: "blob" });

    console.log("⬇️ Triggering download...");
    saveAs(zipBlob, `BookHushly-Tickets-${booking.id}.zip`);

    console.log("🎉 Ticket generation complete!");
    return tickets.length;
  } catch (error) {
    console.error("❌ Error generating event tickets:", error);
    console.error("Error stack:", error.stack);
    throw new Error(`Failed to generate tickets: ${error.message}`);
  }
};

/**
 * Generate general booking confirmation PDF (hotel / apartment)
 * Design: professional receipt inspired by Booking.com / Marriott confirmation style
 */
export const generateBookingConfirmationPDF = async (
  booking,
  payment,
  bookingType,
) => {
  if (!booking || !payment) {
    throw new Error("Booking and payment data are required");
  }

  if (typeof window === "undefined") {
    throw new Error("This function can only be called in the browser");
  }

  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const W = 210;
    const ML = 15; // margin left
    const MR = 195; // margin right (W - ML)
    const IW = MR - ML; // inner width: 180mm

    // ── Palette ────────────────────────────────────────────────────────────────
    const purple = [124, 58, 237];
    const headerSub = [220, 215, 255]; // secondary text on purple — ~6:1 contrast, WCAG AA
    const purplePale = [237, 233, 254]; // light tint for highlights
    const dark = [17, 24, 39];
    const gray = [107, 114, 128];
    const borderGray = [229, 231, 235];
    const rowAlt = [248, 247, 255]; // very light purple-tinted row alt
    const green = [22, 163, 74];
    const greenBg = [240, 253, 244];
    const greenBorder = [134, 239, 172];
    const white = [255, 255, 255];

    // ── Helpers ────────────────────────────────────────────────────────────────
    const fill = (x, y, w, h, color) => {
      doc.setFillColor(...color);
      doc.rect(x, y, w, h, "F");
    };
    const hline = (y, x1 = ML, x2 = MR, color = borderGray, lw = 0.25) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(lw);
      doc.line(x1, y, x2, y);
    };
    const t = (str, x, y, opts = {}) => {
      doc.setTextColor(...(opts.color || dark));
      doc.setFontSize(opts.size || 9);
      doc.setFont("helvetica", opts.bold ? "bold" : "normal");
      doc.text(String(str ?? ""), x, y, { align: opts.align || "left" });
    };
    const fmtDate = (d) =>
      d
        ? new Date(d).toLocaleDateString("en-NG", {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "N/A";
    // jsPDF built-in fonts are Latin-1 only — the Naira sign (U+20A6) falls
    // outside that range and renders as dashes. Use "NGN" prefix instead.
    const fmtAmount = (n) =>
      "NGN " +
      new Intl.NumberFormat("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n);

    // ── Load logo — recoloured white via canvas so it reads on the purple header ─
    let logoBase64 = null;
    try {
      const res = await fetch("/logo.png");
      if (res.ok) {
        const blob = await res.blob();
        const originalDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
        });

        // Draw logo onto a canvas, then flood every non-transparent pixel white
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = originalDataUrl;
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        ctx.globalCompositeOperation = "source-in"; // keep alpha, replace colour
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        logoBase64 = canvas.toDataURL("image/png");
      }
    } catch (_) {}

    // ══════════════════════════════════════════════════════════════════════════
    //  1. HEADER — purple band with logo, document title, booking ref
    // ══════════════════════════════════════════════════════════════════════════
    const HEADER_H = 46;
    fill(0, 0, W, HEADER_H, purple);

    // Logo — left side, vertically centred in header (+25% from 28 → 35 mm)
    const LOGO = 35;
    const logoY = (HEADER_H - LOGO) / 2;
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", ML, logoY, LOGO, LOGO);
    }

    // Document title block — right of logo
    const titleX = ML + LOGO + 6;
    const bookingTypeName = bookingType === "hotel" ? "Hotel" : "Apartment";
    t(`${bookingTypeName} Booking Confirmation`, titleX, 19, {
      color: white,
      size: 13,
      bold: true,
    });
    t("support@bookhushly.com  ·  bookhushly.com", titleX, 27, {
      color: headerSub,
      size: 8,
    });

    // Booking ref + date — far right, vertically centred
    const ref = booking.id.slice(0, 8).toUpperCase();
    t("BOOKING REF", MR, 16, { color: headerSub, size: 7, align: "right" });
    t(ref, MR, 25, { color: white, size: 15, bold: true, align: "right" });
    t(
      new Date().toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      MR,
      33,
      { color: headerSub, size: 8, align: "right" },
    );

    // ══════════════════════════════════════════════════════════════════════════
    //  2. PROPERTY CARD — name, full address, room / emergency contact
    // ══════════════════════════════════════════════════════════════════════════
    let y = HEADER_H + 12;

    t("PROPERTY", ML, y, { color: gray, size: 7, bold: true });
    y += 7;

    let propertyName, fullAddress, roomLabel, emergencyPhone, checkTimes,
        securityDeposit, securityDepositLabel;

    if (bookingType === "hotel") {
      const h = booking.hotels || {};
      propertyName = h.name || "Hotel";
      fullAddress = [h.address, h.city, h.state].filter(Boolean).join(", ");
      roomLabel = booking.room_types?.name || null;
      emergencyPhone = h.vendors?.phone_number || null;
      securityDeposit = parseFloat(h.security_deposit) || 0;
      securityDepositLabel = h.security_deposit_notes
        ? `Security Deposit (${h.security_deposit_notes})`
        : "Security / Caution Deposit";
    } else {
      const a = booking.apartment || {};
      propertyName = a.name || "Apartment";
      fullAddress = [a.address, a.city, a.state].filter(Boolean).join(", ");
      roomLabel = null;
      emergencyPhone = a.agent_phone || null;
      securityDeposit = parseFloat(a.caution_deposit) || 0;
      securityDepositLabel = "Caution Deposit";
      checkTimes =
        a.check_in_time || a.check_out_time
          ? `Check-in from ${a.check_in_time || "2:00 PM"}  ·  Check-out by ${a.check_out_time || "12:00 PM"}`
          : null;
    }

    // Property name
    t(propertyName, ML, y, { size: 14, bold: true });
    y += 7;

    // Full address (wrapped if long)
    if (fullAddress) {
      const addrLines = doc.splitTextToSize(fullAddress, IW * 0.72);
      addrLines.forEach((line) => {
        t(line, ML, y, { color: gray, size: 9 });
        y += 5.5;
      });
    }

    // Room type / check times
    if (roomLabel) {
      t(`Room type:  ${roomLabel}`, ML, y, { color: gray, size: 9 });
      y += 5.5;
    }
    if (checkTimes) {
      t(checkTimes, ML, y, { color: gray, size: 9 });
      y += 5.5;
    }

    // Emergency contact — visually distinct
    if (emergencyPhone) {
      y += 1;
      fill(ML, y - 3, IW, 9, purplePale);
      t(`Emergency contact:`, ML + 3, y + 2.5, { color: gray, size: 8 });
      t(emergencyPhone, ML + 45, y + 2.5, {
        color: purple,
        size: 8,
        bold: true,
      });
      y += 12;
    } else {
      y += 4;
    }

    hline(y);
    y += 10;

    // ══════════════════════════════════════════════════════════════════════════
    //  3. STAY DETAILS TABLE — alternating rows, right-aligned values
    // ══════════════════════════════════════════════════════════════════════════
    t("STAY DETAILS", ML, y, { color: gray, size: 7, bold: true });
    y += 7;

    // Table header row
    const ROW_H = 9;
    fill(ML, y - 3, IW, ROW_H, purple);
    t("Detail", ML + 4, y + 2.5, { color: white, size: 8, bold: true });
    t("Information", MR - 4, y + 2.5, {
      color: white,
      size: 8,
      bold: true,
      align: "right",
    });
    y += ROW_H;

    const guestStr =
      bookingType === "hotel"
        ? `${booking.adults || 0} Adult${booking.adults !== 1 ? "s" : ""}${
            booking.children > 0
              ? `, ${booking.children} Child${booking.children !== 1 ? "ren" : ""}`
              : ""
          }`
        : (() => {
            const n = booking.number_of_guests || booking.guests || 0;
            return `${n} Guest${n !== 1 ? "s" : ""}`;
          })();

    const tableRows = [
      ["Check-in", fmtDate(booking.check_in_date)],
      ["Check-out", fmtDate(booking.check_out_date)],
      ["Guests", guestStr],
      ...(bookingType === "hotel" && booking.room_types?.name
        ? [["Room type", booking.room_types.name]]
        : []),
      ...(bookingType === "apartment" && booking.number_of_nights
        ? [["Nights", String(booking.number_of_nights)]]
        : []),
      ...(securityDeposit > 0
        ? [[securityDepositLabel, fmtAmount(securityDeposit)]]
        : []),
    ];

    tableRows.forEach(([label, value], i) => {
      if (i % 2 === 0) fill(ML, y - 3, IW, ROW_H, rowAlt);
      t(label, ML + 4, y + 2.5, { color: gray, size: 9 });
      t(value, MR - 4, y + 2.5, { size: 9, align: "right" });
      y += ROW_H;
    });

    // Special requests (if any)
    if (booking.special_requests) {
      y += 4;
      fill(ML, y - 3, IW, 6, [252, 251, 255]);
      t("Special Requests", ML + 4, y + 1, {
        color: gray,
        size: 7,
        bold: true,
      });
      y += 7;
      const srLines = doc.splitTextToSize(booking.special_requests, IW - 8);
      srLines.forEach((line) => {
        t(line, ML + 4, y, { size: 9 });
        y += 5.5;
      });
    }

    y += 10;

    // ══════════════════════════════════════════════════════════════════════════
    //  4. TOTAL PAID — prominent full-width purple bar
    // ══════════════════════════════════════════════════════════════════════════
    const totalPaid = Number(booking.total_amount || booking.total_price || 0);
    const currency = payment.currency || "NGN";
    const amountStr =
      currency === "NGN"
        ? fmtAmount(totalPaid)
        : `${currency} ${totalPaid.toLocaleString()}`;

    // Breakdown: accommodation + deposit lines when a deposit applies
    if (securityDeposit > 0) {
      const accommodationAmount = totalPaid - securityDeposit;
      const subRows = [
        ["Accommodation", fmtAmount(accommodationAmount)],
        [securityDepositLabel, fmtAmount(securityDeposit)],
      ];
      subRows.forEach(([label, value]) => {
        t(label, ML + 4, y + 2.5, { color: gray, size: 8.5 });
        t(value, MR - 4, y + 2.5, { color: gray, size: 8.5, align: "right" });
        y += 7;
      });
      y += 2;
    }

    const TOTAL_H = 14;
    fill(ML, y, IW, TOTAL_H, purple);
    t("TOTAL PAID", ML + 5, y + 9, { color: white, size: 10, bold: true });
    t(amountStr, MR - 5, y + 9, {
      color: white,
      size: 13,
      bold: true,
      align: "right",
    });
    y += TOTAL_H + 3;

    // ── Payment confirmed pill ────────────────────────────────────────────────
    fill(ML, y, IW, 10, greenBg);
    doc.setDrawColor(...greenBorder);
    doc.setLineWidth(0.35);
    doc.rect(ML, y, IW, 10);
    t("✓  PAYMENT CONFIRMED", ML + 5, y + 6.5, {
      color: green,
      size: 9,
      bold: true,
    });
    y += 18;

    // ══════════════════════════════════════════════════════════════════════════
    //  5. IMPORTANT NOTES — brief checklist
    // ══════════════════════════════════════════════════════════════════════════
    t("IMPORTANT", ML, y, { color: gray, size: 7, bold: true });
    y += 6;

    const notes = [
      "Present a valid government-issued ID at check-in.",
      "Contact the property directly for early check-in or late check-out.",
      "Save or print this confirmation for your records.",
    ];
    notes.forEach((note) => {
      t(`•  ${note}`, ML + 2, y, { color: gray, size: 8.5 });
      y += 6;
    });

    // ══════════════════════════════════════════════════════════════════════════
    //  6. FOOTER
    // ══════════════════════════════════════════════════════════════════════════
    const FY = 279;
    hline(FY, ML, MR, borderGray, 0.35);
    t(
      "Bookhushly ·  Lagos, Nigeria  ·  support@bookhushly.com",
      W / 2,
      FY + 6,
      { color: gray, size: 7.5, align: "center" },
    );
    t(
      "This is a system-generated confirmation. No signature is required.",
      W / 2,
      FY + 11,
      { color: [180, 185, 195], size: 6.5, align: "center" },
    );

    doc.save(`BookHushly-Confirmation-${booking.id}.pdf`);
  } catch (error) {
    console.error("❌ Error generating confirmation PDF:", error);
    throw new Error(`Failed to generate confirmation: ${error.message}`);
  }
};
