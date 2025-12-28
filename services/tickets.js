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

  // Validate that we're in browser environment
  if (typeof window === "undefined") {
    throw new Error("This function can only be called in the browser");
  }

  try {
    console.log("🎫 Starting ticket generation for booking:", booking.id);

    const baseUrl = window.location.origin;
    const templateUrl = "/ticket.jpg";

    console.log("📍 Base URL:", baseUrl);
    console.log("🖼️ Template URL:", templateUrl);

    // Generate tickets using the universal function
    console.log("⚙️ Calling generateAllTicketPDFs...");
    const tickets = await generateAllTicketPDFs(booking, baseUrl, templateUrl);

    console.log(`✅ Generated ${tickets.length} tickets`);

    // Create ZIP file
    const zip = new JSZip();
    tickets.forEach((ticket) => {
      console.log(`📦 Adding ${ticket.filename} to ZIP`);
      zip.file(ticket.filename, ticket.content);
    });

    // Download ZIP
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
 * Generate general booking confirmation PDF (for non-event bookings)
 */
export const generateBookingConfirmationPDF = async (
  booking,
  payment,
  bookingType
) => {
  if (!booking || !payment) {
    throw new Error("Booking and payment data are required");
  }

  // Validate that we're in browser environment
  if (typeof window === "undefined") {
    throw new Error("This function can only be called in the browser");
  }

  try {
    console.log(
      "📄 Starting confirmation PDF generation for booking:",
      booking.id
    );

    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(124, 58, 237); // Purple
    doc.text("BookHushly", 20, 20);

    // Booking type title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    const bookingTypeName =
      bookingType === "hotel"
        ? "Hotel"
        : bookingType === "apartment"
          ? "Apartment"
          : "Service";
    doc.text(`${bookingTypeName} Booking Confirmation`, 20, 35);

    // Booking details
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);

    let yPos = 50;
    const lineHeight = 8;

    doc.text(`Booking ID: ${booking.id}`, 20, yPos);
    yPos += lineHeight;

    if (bookingType === "hotel") {
      doc.text(`Hotel: ${booking.hotel?.name || "N/A"}`, 20, yPos);
      yPos += lineHeight;
      doc.text(
        `Location: ${booking.hotel?.city || "N/A"}, ${booking.hotel?.state || "N/A"}`,
        20,
        yPos
      );
      yPos += lineHeight;
      doc.text(`Room Type: ${booking.room_type?.name || "N/A"}`, 20, yPos);
      yPos += lineHeight;
      doc.text(
        `Room Number: ${booking.room?.room_number || "Assigned at check-in"}`,
        20,
        yPos
      );
      yPos += lineHeight;
      doc.text(`Check-in: ${booking.check_in_date || "N/A"}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Check-out: ${booking.check_out_date || "N/A"}`, 20, yPos);
      yPos += lineHeight;
      doc.text(
        `Guests: ${booking.adults || 0} Adult${booking.adults !== 1 ? "s" : ""}${booking.children > 0 ? `, ${booking.children} Child${booking.children !== 1 ? "ren" : ""}` : ""}`,
        20,
        yPos
      );
    } else if (bookingType === "apartment") {
      doc.text(`Apartment: ${booking.apartment?.name || "N/A"}`, 20, yPos);
      yPos += lineHeight;
      doc.text(
        `Location: ${booking.apartment?.city || "N/A"}, ${booking.apartment?.state || "N/A"}`,
        20,
        yPos
      );
      yPos += lineHeight;
      doc.text(`Check-in: ${booking.check_in_date || "N/A"}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Check-out: ${booking.check_out_date || "N/A"}`, 20, yPos);
      yPos += lineHeight;
      doc.text(
        `Guests: ${booking.guests || 0} Guest${booking.guests !== 1 ? "s" : ""}`,
        20,
        yPos
      );
    }

    // Special requests
    if (booking.special_requests) {
      yPos += lineHeight * 1.5;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Special Requests:", 20, yPos);
      yPos += lineHeight * 0.8;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const requestLines = doc.splitTextToSize(booking.special_requests, 170);
      requestLines.forEach((line) => {
        doc.text(line, 20, yPos);
        yPos += lineHeight * 0.8;
      });
    }

    // Total amount
    yPos += lineHeight * 2;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Total Amount: ${payment.vendor_currency || "NGN"} ${Number(
        booking.total_amount || booking.total_price
      ).toLocaleString()}`,
      20,
      yPos
    );

    // Payment status
    yPos += lineHeight * 1.5;
    doc.setFontSize(12);
    doc.setTextColor(0, 128, 0);
    doc.text("Payment Status: Confirmed", 20, yPos);

    // Footer
    yPos += lineHeight * 3;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for booking with BookHushly", 20, yPos);
    yPos += lineHeight * 0.8;
    doc.text("For support, contact: support@bookhushly.com", 20, yPos);

    // Save PDF
    console.log("💾 Saving PDF...");
    doc.save(`BookHushly-Confirmation-${booking.id}.pdf`);

    console.log("✅ Confirmation PDF saved!");
  } catch (error) {
    console.error("❌ Error generating confirmation PDF:", error);
    console.error("Error stack:", error.stack);
    throw new Error(`Failed to generate confirmation: ${error.message}`);
  }
};
