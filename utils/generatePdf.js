import jsPDF from "jspdf";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const pixelsToMm = (pixels) => (pixels * 25.4) / 96;

const getImageDimensions = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    return { width: metadata.width, height: metadata.height };
  } catch (error) {
    throw new Error(`Failed to get image dimensions: ${error.message}`);
  }
};

const getBase64FromFile = async (imagePath) => {
  try {
    const buffer = await fs.readFile(imagePath);
    const base64 = buffer.toString("base64");
    // Determine image type from file extension
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    throw new Error(`Failed to read image file: ${error.message}`);
  }
};

const safeText = (value, fallback = "N/A") => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
};

/**
 * Expand { [ticketType]: quantity } into an ordered flat array of ticket-type strings.
 * Order matches computeSeatAssignments() in the booking routes.
 */
const expandTicketDetails = (ticketDetails) => {
  const tickets = [];
  for (const [ticketType, quantity] of Object.entries(ticketDetails)) {
    for (let i = 0; i < quantity; i++) {
      tickets.push(ticketType);
    }
  }
  return tickets;
};

/**
 * Generate a single ticket PDF with exact positioning.
 *
 * @param {Object}      booking        - Booking object (with `.listing`)
 * @param {number}      ticketNumber   - 1-indexed position within this booking
 * @param {string}      ticketTypeText - Ticket tier name shown on the ticket
 * @param {string}      baseUrl        - App base URL for QR code
 * @param {string}      templatePath   - File-system path to template image
 * @param {string|null} seatNumber     - Assigned seat label (e.g. "A5"), or null
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateSingleTicketPDF(
  booking,
  ticketNumber,
  ticketTypeText,
  baseUrl,
  templatePath,
  seatNumber = null
) {
  // Get template dimensions
  const { width: imgWidthPx, height: imgHeightPx } =
    await getImageDimensions(templatePath);
  const imgWidthMm = pixelsToMm(imgWidthPx);
  const imgHeightMm = pixelsToMm(imgHeightPx);

  // Load template as base64
  const templateDataUrl = await getBase64FromFile(templatePath);

  // Create PDF
  const doc = new jsPDF({
    orientation: imgWidthPx > imgHeightPx ? "landscape" : "portrait",
    unit: "mm",
    format: [imgWidthMm, imgHeightMm],
  });

  // Exact positioning specifications
  const placeholders = {
    listingTitle: {
      x: 155.1,
      y: 104.6,
      fontSize: 140,
      color: [255, 255, 255],
      font: "BebasNeue",
    },
    ticketType: {
      x: 174.8,
      y: 144.2,
      fontSize: 25,
      color: [255, 255, 255],
    },
    date: { x: 289.1, y: 144.1, fontSize: 30, color: [255, 255, 255] },
    time: { x: 400.5, y: 144.2, fontSize: 30, color: [255, 255, 255] },
    vendorPhone: {
      x: 392.6,
      y: 172.5,
      fontSize: 14,
      color: [255, 255, 255],
    },
    qrCode: { x: 469, y: 15.5, size: 64.1 },
  };

  // Add template background
  doc.addImage(templateDataUrl, "PNG", 0, 0, imgWidthMm, imgHeightMm);

  // Event Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(placeholders.listingTitle.fontSize);
  doc.setTextColor(...placeholders.listingTitle.color);
  doc.text(
    safeText(booking.listing?.title),
    placeholders.listingTitle.x,
    placeholders.listingTitle.y
  );

  // Ticket Type (with optional seat number appended)
  const ticketDisplay = seatNumber
    ? `${ticketTypeText}  ·  Seat ${seatNumber}`
    : ticketTypeText;
  doc.setFontSize(placeholders.ticketType.fontSize);
  doc.setTextColor(...placeholders.ticketType.color);
  doc.text(ticketDisplay, placeholders.ticketType.x, placeholders.ticketType.y);

  // Date
  doc.setFontSize(placeholders.date.fontSize);
  doc.setTextColor(...placeholders.date.color);
  doc.text(
    safeText(
      booking.listing?.event_date
        ? new Date(booking.listing.event_date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
        : "Date TBD"
    ),
    placeholders.date.x,
    placeholders.date.y
  );

  // Time
  doc.setFontSize(placeholders.time.fontSize);
  doc.setTextColor(...placeholders.time.color);
  doc.text(
    safeText(booking.booking_time),
    placeholders.time.x,
    placeholders.time.y
  );

  // Vendor Phone
  doc.setFontSize(placeholders.vendorPhone.fontSize);
  doc.setTextColor(...placeholders.vendorPhone.color);
  doc.text(
    safeText(booking.listing?.vendor_phone),
    placeholders.vendorPhone.x,
    placeholders.vendorPhone.y
  );

  // QR Code
  const qrCodeData = await QRCode.toDataURL(
    `${baseUrl}/booking-status/${booking.id}`,
    {
      width: pixelsToMm(placeholders.qrCode.size) * 96,
      margin: 1,
      color: { dark: "#1F2937", light: "#FFFFFF" },
    }
  );

  doc.addImage(
    qrCodeData,
    "PNG",
    placeholders.qrCode.x,
    placeholders.qrCode.y,
    placeholders.qrCode.size,
    placeholders.qrCode.size
  );

  // Return as buffer
  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Generate all tickets for a booking, one PDF per ticket.
 * Expands ticket_details by type so each ticket shows its own tier and seat.
 *
 * @param {Object} booking      - Booking data (seat_assignments must be included)
 * @param {string} baseUrl      - Base URL for QR codes
 * @param {string} templatePath - File-system path to template image
 * @returns {Promise<Array<{filename: string, content: Buffer}>>}
 */
export async function generateAllTicketPDFs(booking, baseUrl, templatePath) {
  let ticketDetails = {};
  try {
    ticketDetails = booking.ticket_details
      ? JSON.parse(booking.ticket_details)
      : {};
  } catch (err) {
    console.error("Error parsing ticket_details:", err);
    throw new Error("Invalid ticket details format");
  }

  // Expand into individual ticket-type entries (matches booking-route order)
  const individualTickets = expandTicketDetails(ticketDetails);
  const totalTickets = individualTickets.length;

  if (totalTickets === 0 || totalTickets !== booking.guests) {
    throw new Error("Invalid ticket details or guest count mismatch");
  }

  // seat_assignments is ordered to match individualTickets by index
  const seatAssignments = Array.isArray(booking.seat_assignments)
    ? booking.seat_assignments
    : [];

  const tickets = [];

  for (let i = 0; i < totalTickets; i++) {
    const ticketType = individualTickets[i];
    const seatNumber = seatAssignments[i]?.seat ?? null;

    const pdfBuffer = await generateSingleTicketPDF(
      booking,
      i + 1,
      ticketType,
      baseUrl,
      templatePath,
      seatNumber
    );

    const seatSuffix = seatNumber ? `-${seatNumber.replace(/\s+/g, "")}` : "";
    tickets.push({
      filename: `Ticket-${i + 1}-${ticketType.replace(/\s+/g, "-")}${seatSuffix}.pdf`,
      content: pdfBuffer,
    });
  }

  return tickets;
}
