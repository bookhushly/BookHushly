"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import jsPDF from "jspdf";
import QRCode from "qrcode";

export default function BookingReceiptPage() {
  const { id } = useParams();
  const supabase = createClientComponentClient();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch booking details with listing information
  useEffect(() => {
    if (!id) return;

    async function fetchBooking() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(
            `
            *,
            listing:listings (
              title,
              description,
              category,
              price,
              location,
              capacity,
              duration,
              vendor_name,
              vendor_phone,
              price_unit,
              operating_hours,
              service_areas,
              bedrooms,
              bathrooms,
              check_in_time,
              check_out_time,
              minimum_stay,
              maximum_capacity,
              vehicle_type,
              security_deposit
            )
          `
          )
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching booking:", error);
          setBooking(null);
        } else {
          setBooking(data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setBooking(null);
      }
      setLoading(false);
    }

    fetchBooking();
  }, [id]);
  const getBase64FromUrl = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load image at ${url}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  // Helper: Always return a safe string
  const safeText = (value, fallback = "N/A") => {
    if (value === undefined || value === null || value === "") return fallback;
    return String(value);
  };

  const handleDownloadPDF = async (booking) => {
    if (!booking) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Colors
    const purple = [124, 58, 237];
    const lightPurple = [233, 213, 255];
    const dark = [31, 41, 55];
    const gray = [107, 114, 128];
    const lightGray = [156, 163, 175];

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, "F");

    // Header background
    const headerTop = 10;
    const headerHeight = 35;
    doc.setFillColor(...lightPurple);
    doc.rect(15, headerTop, 180, headerHeight, "F");

    // Logo
    try {
      const logoDataUrl = await getBase64FromUrl("/logo.png");
      const logoWidth = 70;
      const logoHeight = 70;
      const yCentered = headerTop + (headerHeight - logoHeight) / 2;
      const xPos = 1; // left inset
      doc.addImage(logoDataUrl, "PNG", xPos, yCentered, logoWidth, logoHeight);
    } catch (err) {
      console.error("Error loading logo:", err);
      doc.setTextColor(...purple);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("BH", 25, 30);
    }

    // QR Code (right-aligned in header)
    try {
      const qrCodeData = await QRCode.toDataURL(
        `${window.location.origin}/booking-status/${safeText(booking.id, "0")}`,
        {
          width: 150,
          margin: 1,
          color: { dark: "#1F2937", light: "#FFFFFF" },
        }
      );
      const qrSize = 25;
      const qrX = 160; // near right side of header
      const qrY = headerTop + (headerHeight - qrSize) / 2;
      doc.addImage(qrCodeData, "PNG", qrX, qrY, qrSize, qrSize);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }

    // Company name + tagline (centered in header)
    const centerX = 105; // (210 page width / 2)
    doc.setTextColor(...purple);
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("BookHushly", centerX, headerTop + 18, { align: "center" });

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(...gray);
    doc.text("Premium Event Ticketing", centerX, headerTop + 26, {
      align: "center",
    });

    // Main ticket border
    doc.setDrawColor(...purple);
    doc.setLineWidth(1);
    doc.rect(15, 10, 180, 230);

    // Ticket ID
    doc.setTextColor(...purple);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`TICKET #${safeText(booking.id, "0")}`, 20, 60);

    // Status
    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94);
    const status = booking?.status ? booking.status.toUpperCase() : "UNKNOWN";
    doc.text(`Status: ${status}`, 20, 68);

    // Event title
    doc.setTextColor(...dark);
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text(safeText(booking?.listing.title, "Event Booking"), 20, 80);

    // Horizontal line
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.5);
    doc.line(20, 85, 190, 85);

    // Event details
    doc.setTextColor(...gray);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("EVENT DETAILS", 20, 95);

    let yPos = 105;
    const addDetail = (label, value) => {
      doc.setTextColor(...dark);
      doc.setFont(undefined, "bold");
      doc.text(`${label}:`, 20, yPos);

      doc.setFont(undefined, "normal");
      doc.setTextColor(...gray);

      const safeValue = safeText(value);
      const displayValue =
        label === "Total Amount"
          ? `NGN ${Number(booking?.total_amount || 0).toLocaleString()}`
          : safeValue;

      doc.text(displayValue, 70, yPos);
      yPos += 8;
    };

    addDetail("Date", booking.booking_date);
    addDetail("Time", booking.booking_time);
    addDetail("Number of Guests", booking.guests);
    addDetail("Duration", booking.duration);
    addDetail("Total Amount", booking.total_amount);
    addDetail("Payment Status", booking.payment_status);

    // Important info
    doc.setTextColor(...purple);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("IMPORTANT TICKET INFORMATION", 20, yPos + 10);

    doc.setTextColor(...dark);
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text(
      "No app required - just your barcode receipt and ID (if requested).",
      20,
      yPos + 20
    );
    doc.text(
      "Download or screenshot this ticket in advance in case of weak signal.",
      20,
      yPos + 27
    );
    doc.text(
      "Both digital and printed tickets will be accepted.",
      20,
      yPos + 34
    );

    // Event day instructions
    doc.setTextColor(...purple);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("ON THE DAY OF THE EVENT:", 20, yPos + 50);

    doc.setTextColor(...dark);
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");

    const instructions = [
      "• Fully charge your phone - your ticket will be scanned at the door",
      "• Keep this ticket safe - do not share your QR code",
      "• Take pictures and enjoy the experience - memories are meant to last!",
    ];

    let instY = yPos + 60;
    instructions.forEach((instruction) => {
      doc.text(instruction, 20, instY);
      instY += 7;
    });

    // Contact section
    doc.setTextColor(...purple);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("CONTACT INFORMATION", 20, 255);

    doc.setTextColor(...gray);
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text(`Vendor: ${safeText(booking?.listing?.vendor_name)}`, 20, 265);
    doc.text(`Phone: ${safeText(booking?.listing?.vendor_phone)}`, 20, 272);

    // Footer
    doc.setTextColor(...purple);
    doc.setFontSize(8);
    doc.setFont(undefined, "italic");
    doc.text("No apps. No stress. Just BookHushly.", 20, 290);

    // Save PDF
    doc.save(`BookHushly-Ticket-${safeText(booking.id, "0")}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Ticket Not Found
          </h2>
          <p className="text-gray-600">
            We couldn't find your booking. Please check your booking ID.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">
            🎟️ Your Ticket
          </h1>
          <p className="text-gray-600">Ready for your amazing experience!</p>
        </div>

        {/* Premium Ticket Design */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100">
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-purple-800 to-purple-600 p-6 text-white relative">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1">BookHushly</h2>
                <p className="text-purple-200 text-sm font-medium">
                  EVENT TICKETING
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <img
                  src="/logo.png"
                  alt="BookHushly Logo"
                  className="w-20 h-20 rounded-xl object-contain bg-white"
                />
              </div>
            </div>

            {/* Ticket ID and Status */}
            <div className="mt-6 flex justify-between items-center">
              <div>
                <p className="text-yellow-300 font-bold text-lg">
                  #{booking.id}
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">{booking.status}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-purple-200 text-sm">Payment Status</p>
                <p className="text-green-300 font-bold">
                  {booking.payment_status}
                </p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6 bg-gradient-to-br from-purple-50 to-white">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {booking.listing?.title || "Event Booking"}
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">📅</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Date</p>
                    <p className="font-bold text-gray-800">
                      {booking.booking_date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">🕐</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Time</p>
                    <p className="font-bold text-gray-800">
                      {booking.booking_time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">👥</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Guests</p>
                    <p className="font-bold text-gray-800">{booking.guests}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">💰</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      Total Amount
                    </p>
                    <p className="font-bold text-gray-800">
                      ₦{Number(booking.total_amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dotted separator */}
          <div className="border-t-2 border-dashed border-purple-200 mx-6"></div>

          {/* Important Information */}
          <div className="p-6 bg-gradient-to-br from-purple-25 to-gray-50">
            <div className="bg-purple-100 rounded-2xl p-4 mb-6">
              <h4 className="font-bold text-purple-800 mb-2 flex items-center">
                <span className="mr-2">🎟️</span>
                Important Ticket Information
              </h4>
              <p className="text-purple-700 text-sm">
                You will be delivered directly to the page to download your
                ticket. No app required — just your barcode receipt and ID (if
                requested).
              </p>
            </div>

            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">📌</span>
              On the Day of the Event:
            </h4>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <span>📱</span>
                <span>
                  <strong>Charge your phone</strong> – your ticket will be
                  scanned at the door
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>💾</span>
                <span>
                  <strong>Download or screenshot</strong> your ticket in advance
                  in case of weak signal
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🖨️</span>
                <span>
                  <strong>Print it out if you prefer</strong> – both digital and
                  paper tickets are accepted
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📸</span>
                <span>
                  <strong>Take pictures and enjoy</strong> the experience –
                  memories are meant to last!
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-xl border border-purple-200">
              <p className="text-center text-gray-600 text-sm italic">
                We're keeping it simple, secure, and memorable.
                <br />
                <span className="font-bold text-purple-600">
                  No apps. No stress. Just BookHushly.
                </span>
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-6 bg-gray-50 border-t border-purple-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-purple-600">Contact Email:</p>
                <p>{booking.listing?.vendor_name}</p>
              </div>
              <div>
                <p className="font-semibold text-purple-600">Contact Phone:</p>
                <p>{booking.listing?.vendor_phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => handleDownloadPDF(booking)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <span>📥</span>
            <span>Download Ticket</span>
          </button>
          <p className="text-gray-500 text-sm mt-2">
            Get your beautifully designed ticket ready for the event
          </p>
        </div>
      </div>
    </div>
  );
}
