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
 * Generate a single ticket PDF with exact positioning
 * @param {Object} booking - Booking data
 * @param {number} ticketNumber - Ticket number (1-indexed)
 * @param {string} ticketTypeText - Formatted ticket type text
 * @param {string} baseUrl - Base URL for QR code
 * @param {string} templatePath - File system path to template image
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateSingleTicketPDF(
  booking,
  ticketNumber,
  ticketTypeText,
  baseUrl,
  templatePath
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

  // Ticket Type
  doc.setFontSize(placeholders.ticketType.fontSize);
  doc.setTextColor(...placeholders.ticketType.color);
  doc.text(
    ticketTypeText,
    placeholders.ticketType.x,
    placeholders.ticketType.y
  );

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
 * Generate all tickets for a booking
 * @param {Object} booking - Booking data
 * @param {string} baseUrl - Base URL for QR codes
 * @param {string} templatePath - File system path to template image
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

  const totalTickets = Object.values(ticketDetails).reduce(
    (sum, qty) => sum + Number(qty || 0),
    0
  );

  if (totalTickets === 0 || totalTickets !== booking.guests) {
    throw new Error("Invalid ticket details or guest count mismatch");
  }

  const ticketTypeText = Object.entries(ticketDetails)
    .filter(([_, qty]) => qty > 0)
    .map(([name, qty]) => `${name} x${qty}`)
    .join(", ");

  const tickets = [];

  for (let i = 0; i < totalTickets; i++) {
    const pdfBuffer = await generateSingleTicketPDF(
      booking,
      i + 1,
      ticketTypeText,
      baseUrl,
      templatePath
    );

    tickets.push({
      filename: `Ticket-${safeText(booking.id, "0")}-${i + 1}.pdf`,
      content: pdfBuffer,
    });
  }

  return tickets;
}
