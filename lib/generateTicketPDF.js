import jsPDF from "jspdf";
import QRCode from "qrcode";

// Server-side imports (only available in Node.js)
let fs, path, sharp;
if (typeof window === "undefined") {
  fs = require("fs/promises");
  path = require("path");
  sharp = require("sharp");
}

const pixelsToMm = (pixels) => (pixels * 25.4) / 96;

/**
 * Get image dimensions - works in both browser and Node.js
 */
const getImageDimensions = async (urlOrPath) => {
  if (typeof window === "undefined") {
    // Server-side using sharp
    try {
      const metadata = await sharp(urlOrPath).metadata();
      return { width: metadata.width, height: metadata.height };
    } catch (error) {
      throw new Error(`Failed to get image dimensions: ${error.message}`);
    }
  } else {
    // Client-side using Image constructor
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = urlOrPath;
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () =>
        reject(new Error(`Failed to load image at ${urlOrPath}`));
    });
  }
};

/**
 * Convert image to base64 - works in both browser and Node.js
 */
const getBase64FromImageSource = async (urlOrPath) => {
  if (typeof window === "undefined") {
    // Server-side: read file and convert to base64
    try {
      const buffer = await fs.readFile(urlOrPath);
      const base64 = buffer.toString("base64");
      const ext = path.extname(urlOrPath).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      throw new Error(`Failed to read image file: ${error.message}`);
    }
  } else {
    // Client-side: fetch and convert to base64
    const res = await fetch(urlOrPath);
    if (!res.ok) throw new Error(`Failed to load image at ${urlOrPath}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
    });
  }
};

const safeText = (value, fallback = "N/A") => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
};

/**
 * Fit text dynamically with multi-line wrapping and font scaling
 */
const fitTextToSpace = (doc, text, maxWidth, maxHeight, initialFontSize) => {
  let fontSize = initialFontSize;
  let lines = [];

  while (fontSize > 20) {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);

    if (textWidth <= maxWidth) {
      return { fontSize, lines: [text], lineHeight: fontSize * 0.35 };
    }

    const words = text.split(" ");
    lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = doc.getTextWidth(testLine);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);

    const lineHeight = fontSize * 0.35;
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxHeight) {
      return { fontSize, lines, lineHeight };
    }

    fontSize -= 10;
  }

  doc.setFontSize(20);
  const maxChars = Math.floor((maxWidth / doc.getTextWidth("M")) * 1.2);
  const truncated =
    text.length > maxChars ? text.substring(0, maxChars - 3) + "..." : text;

  return {
    fontSize: 20,
    lines: [truncated],
    lineHeight: 7,
  };
};

/**
 * Expand ticket details object into individual ticket array
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
 * Generate a single ticket PDF with exact positioning
 * @param {Object} booking - Booking data
 * @param {number} ticketNumber - Ticket number (1-indexed)
 * @param {string} ticketType - Individual ticket type
 * @param {string} baseUrl - Base URL for QR code
 * @param {string} templatePath - File system path or URL to template image
 * @returns {Promise<Buffer|jsPDF>} PDF buffer (server) or jsPDF instance (client)
 */
export async function generateSingleTicketPDF(
  booking,
  ticketNumber,
  ticketType,
  baseUrl,
  templatePath
) {
  // Get template dimensions
  const { width: imgWidthPx, height: imgHeightPx } =
    await getImageDimensions(templatePath);
  const imgWidthMm = pixelsToMm(imgWidthPx);
  const imgHeightMm = pixelsToMm(imgHeightPx);

  // Load template as base64
  const templateDataUrl = await getBase64FromImageSource(templatePath);

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
      fontSize: 100,
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

  // Event Title with dynamic fitting
  const titleText = safeText(booking.listing?.title);
  const maxTitleWidth = 270;
  const maxTitleHeight = 50;

  const {
    fontSize: titleFontSize,
    lines: titleLines,
    lineHeight,
  } = fitTextToSpace(
    doc,
    titleText,
    maxTitleWidth,
    maxTitleHeight,
    placeholders.listingTitle.fontSize
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(titleFontSize);
  doc.setTextColor(...placeholders.listingTitle.color);

  let currentY = placeholders.listingTitle.y;
  titleLines.forEach((line) => {
    doc.text(line, placeholders.listingTitle.x, currentY);
    currentY += lineHeight;
  });

  // Ticket Type (individual type, not summary)
  doc.setFontSize(placeholders.ticketType.fontSize);
  doc.setTextColor(...placeholders.ticketType.color);
  doc.text(ticketType, placeholders.ticketType.x, placeholders.ticketType.y);

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

  // Return buffer for server-side, jsPDF instance for client-side
  if (typeof window === "undefined") {
    return Buffer.from(doc.output("arraybuffer"));
  } else {
    return doc;
  }
}

/**
 * Generate all tickets for a booking
 * @param {Object} booking - Booking data
 * @param {string} baseUrl - Base URL for QR codes
 * @param {string} templatePath - File system path or URL to template image
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

  // Expand ticket details into individual tickets
  const individualTickets = expandTicketDetails(ticketDetails);
  const totalTickets = individualTickets.length;

  if (totalTickets === 0 || totalTickets !== booking.guests) {
    throw new Error("Invalid ticket details or guest count mismatch");
  }

  const tickets = [];

  for (let i = 0; i < totalTickets; i++) {
    const ticketType = individualTickets[i];
    const pdfBufferOrDoc = await generateSingleTicketPDF(
      booking,
      i + 1,
      ticketType,
      baseUrl,
      templatePath
    );

    // Server-side returns Buffer, client-side returns jsPDF
    const content =
      typeof window === "undefined"
        ? pdfBufferOrDoc
        : pdfBufferOrDoc.output("blob");

    tickets.push({
      filename: `Ticket-${i + 1}-${ticketType.replace(/\s+/g, "-")}.pdf`,
      content: content,
    });
  }

  return tickets;
}
