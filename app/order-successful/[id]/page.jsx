"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { verifyPayment } from "@/lib/payments";
import { toast } from "sonner";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const OrderSuccessful = () => {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Update remaining tickets in listings table
  const updateRemainingTickets = async (
    bookingId,
    selectedTickets,
    listingId
  ) => {
    try {
      // Fetch current listing with FOR UPDATE to lock the row
      const { data: listing, error: fetchError } = await supabase
        .from("listings")
        .select("ticket_packages, remaining_tickets")
        .eq("id", listingId)
        .single();

      if (fetchError || !listing) {
        throw new Error(
          `Failed to fetch listing: ${fetchError?.message || "Unknown error"}`
        );
      }

      // Update ticket_packages
      const updatedTicketPackages = listing.ticket_packages.map((ticket) => ({
        ...ticket,
        remaining: ticket.remaining - (selectedTickets[ticket.name] || 0),
      }));

      // Calculate total tickets booked
      const totalTicketsBooked = Object.values(selectedTickets).reduce(
        (sum, qty) => sum + qty,
        0
      );

      // Update remaining_tickets
      const updatedRemainingTickets =
        listing.remaining_tickets - totalTicketsBooked;

      // Validate no negative remaining tickets
      if (
        updatedTicketPackages.some((ticket) => ticket.remaining < 0) ||
        updatedRemainingTickets < 0
      ) {
        throw new Error("Not enough tickets available");
      }

      // Update listings table
      const { error: updateError } = await supabase
        .from("listings")
        .update({
          ticket_packages: updatedTicketPackages,
          remaining_tickets: updatedRemainingTickets,
        })
        .eq("id", listingId);

      if (updateError) {
        throw new Error(
          `Failed to update ticket quantities: ${updateError.message}`
        );
      }
    } catch (err) {
      throw err;
    }
  };

  // Fetch booking and verify payment
  useEffect(() => {
    const verifyOrder = async () => {
      try {
        setLoading(true);
        const bookingId = params.id;

        if (!bookingId) {
          setError("Invalid booking ID");
          return;
        }

        // Fetch booking with listing details
        const { data: bookingData, error: bookingError } = await supabase
          .from("event_bookings")
          .select(
            `
            id, listing_id, ticket_details, guests, total_amount, booking_date, booking_time,
            status, payment_status, contact_email, contact_phone,
            listing:listings (
              title, event_date, location, vendor_name, vendor_phone, ticket_packages
            )
          `
          )
          .eq("id", bookingId)
          .single();

        if (bookingError || !bookingData) {
          setError(
            `Booking not found: ${bookingError?.message || "No booking data"}`
          );
          return;
        }

        // Validate ticket_details against guests
        const ticketDetails = bookingData.ticket_details
          ? JSON.parse(bookingData.ticket_details)
          : {};
        const totalTickets = Object.values(ticketDetails).reduce(
          (sum, qty) => sum + qty,
          0
        );
        if (totalTickets !== bookingData.guests) {
          throw new Error("Ticket details do not match number of guests");
        }

        setBooking(bookingData);

        // Fetch payment record
        const { data: paymentData, error: paymentError } = await supabase
          .from("payments")
          .select(
            "reference, status, provider, vendor_amount, admin_amount, vendor_currency"
          )
          .eq("event_booking_id", bookingId)
          .single();

        if (paymentError || !paymentData) {
          throw new Error(
            `Payment record not found: ${paymentError?.message || "No payment data"}`
          );
        }

        setPayment(paymentData);

        // Verify payment
        const { data: verificationData, error: verificationError } =
          await verifyPayment(paymentData.reference);

        if (verificationError || verificationData.status !== "success") {
          setError(
            `Payment verification failed: ${verificationError?.message || "Invalid payment status"}`
          );
          await supabase.from("bookings").delete().eq("id", bookingId);
          return;
        }

        // Update payment status
        const { error: paymentUpdateError } = await supabase
          .from("payments")
          .update({
            status: "completed",
            verified_at: new Date().toISOString(),
          })
          .eq("booking_id", bookingId);

        if (paymentUpdateError) {
          throw new Error(
            `Failed to update payment status: ${paymentUpdateError.message}`
          );
        }

        // Update booking status
        const { error: updateError } = await supabase
          .from("bookings")
          .update({ status: "confirmed", payment_status: "completed" })
          .eq("id", bookingId);

        if (updateError) {
          throw new Error(
            `Failed to update booking status: ${updateError.message}`
          );
        }

        // Update remaining tickets
        await updateRemainingTickets(
          bookingId,
          ticketDetails,
          bookingData.listing_id
        );

        toast.success("Payment verified and tickets updated successfully");
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
        if (booking) {
          await supabase.from("bookings").delete().eq("id", booking.id);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [params.id]);

  // Helper: Convert pixels to millimeters (assuming 96 DPI)
  const pixelsToMm = (pixels) => (pixels * 25.4) / 96;

  // Helper: Load image and get dimensions
  const getImageDimensions = async (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
    });
  };

  // Helper: Load image as base64
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
    if (!booking || !payment) return;

    try {
      // Initialize JSZip
      const zip = new JSZip();

      // Image template URL
      const templateUrl = "/ticket.jpg";

      // Get image dimensions
      const { width: imgWidthPx, height: imgHeightPx } =
        await getImageDimensions(templateUrl);
      const imgWidthMm = pixelsToMm(imgWidthPx);
      const imgHeightMm = pixelsToMm(imgHeightPx);

      // Load template image
      const templateDataUrl = await getBase64FromUrl(templateUrl);

      // Parse ticket_details to get total tickets
      let ticketDetails = {};
      let totalTickets = 0;
      try {
        ticketDetails = booking.ticket_details
          ? JSON.parse(booking.ticket_details)
          : {};
        totalTickets = Object.values(ticketDetails).reduce(
          (sum, qty) => sum + qty,
          0
        );
      } catch (err) {
        console.error("Error parsing ticket_details:", err);
        toast.error("Failed to parse ticket details");
        return;
      }

      if (totalTickets === 0 || totalTickets !== booking.guests) {
        toast.error("Invalid ticket details or guest count mismatch");
        return;
      }

      // Generate ticket type text
      const ticketTypeText = Object.entries(ticketDetails)
        .filter(([_, qty]) => qty > 0)
        .map(([name, qty]) => `${name} x${qty}`)
        .join(", ");

      // Define placeholder coordinates
      const placeholders = {
        listingTitle: {
          x: 72.8,
          y: 110.5,
          fontSize: 30,
          color: [255, 255, 255],
        },
        ticketType: {
          x: 54.1,
          y: 130.7,
          fontSize: 19,
          color: [255, 255, 255],
        },
        date: { x: 53.5, y: 142.9, fontSize: 19, color: [255, 255, 255] },
        time: { x: 53.7, y: 153.6, fontSize: 19, color: [255, 255, 255] },
        vendorName: {
          x: 333.4,
          y: 173.1,
          fontSize: 10,
          color: [255, 255, 255],
        },
        vendorPhone: {
          x: 342.6,
          y: 179.7,
          fontSize: 12,
          color: [255, 255, 255],
        },
        qrCode: { x: 469, y: 15.5, size: 64.1 },
      };

      // Generate a separate PDF for each ticket and add to ZIP
      for (let i = 0; i < totalTickets; i++) {
        // Initialize a new jsPDF document for each ticket
        const doc = new jsPDF({
          orientation: imgWidthPx > imgHeightPx ? "landscape" : "portrait",
          unit: "mm",
          format: [imgWidthMm, imgHeightMm],
        });

        // Add background image
        doc.addImage(templateDataUrl, "PNG", 0, 0, imgWidthMm, imgHeightMm);

        // Set font
        doc.setFont("helvetica", "bold");

        // Add text overlays
        // Listing Title
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

        // Date (use event_date from listings)
        doc.setFontSize(placeholders.date.fontSize);
        doc.setTextColor(...placeholders.date.color);
        doc.text(
          safeText(
            booking.listing?.event_date
              ? new Date(booking.listing.event_date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }
                )
              : "Date TBD"
          ),
          placeholders.date.x,
          placeholders.date.y
        );

        // Time (use booking_time from bookings)
        doc.setFontSize(placeholders.time.fontSize);
        doc.setTextColor(...placeholders.time.color);
        doc.text(
          safeText(booking.booking_time),
          placeholders.time.x,
          placeholders.time.y
        );

        // Vendor Name
        doc.setFontSize(placeholders.vendorName.fontSize);
        doc.setTextColor(...placeholders.vendorName.color);
        doc.text(
          safeText(booking.listing?.vendor_name),
          placeholders.vendorName.x,
          placeholders.listingTitle.y
        );

        // Vendor Phone
        doc.setFontSize(placeholders.vendorPhone.fontSize);
        doc.setTextColor(...placeholders.vendorPhone.color);
        doc.text(
          safeText(booking.listing?.vendor_phone),
          placeholders.vendorPhone.x,
          placeholders.vendorPhone.y
        );

        // Ticket Number
        const ticketId = `${booking.id}-${i + 1}`;

        // Add QR Code
        try {
          const qrCodeData = await QRCode.toDataURL(
            `${window.location.origin}/ticket-status/${ticketId}`,
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
        } catch (err) {
          console.error("Error generating QR code:", err);
          toast.error(`Failed to generate QR code for ticket ${ticketId}`);
          continue; // Skip this ticket but continue with others
        }

        // Convert PDF to Blob and add to ZIP
        const pdfBlob = doc.output("blob");
        zip.file(`Ticket-${safeText(booking.id, "0")}-${i + 1}.pdf`, pdfBlob);
      }

      // Generate and download ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `BookHushly-Tickets-${safeText(booking.id, "0")}.zip`);

      toast.success(
        `Successfully generated ZIP file with ${totalTickets} ticket PDF${totalTickets > 1 ? "s" : ""}`
      );
    } catch (err) {
      console.error("Error generating ticket ZIP:", err);
      toast.error("Failed to generate ticket ZIP file. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error || !booking || !payment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error ||
              "We couldn't find your booking. Please check your booking ID."}
          </p>
          <Link
            href="/services?category=events"
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
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
                      {safeText(
                        booking.listing?.event_date
                          ? new Date(
                              booking.listing.event_date
                            ).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })
                          : "Date TBD"
                      )}
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
                      {safeText(booking.booking_time)}
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
                      {payment.vendor_currency || "NGN"}{" "}
                      {Number(booking.total_amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Type */}
            <div className="mt-4">
              <p className="text-sm text-gray-500 font-medium">Ticket Type</p>
              <p className="font-bold text-gray-800">
                {booking.ticket_details
                  ? Object.entries(JSON.parse(booking.ticket_details))
                      .filter(([_, qty]) => qty > 0)
                      .map(([name, qty]) => `${name} x${qty}`)
                      .join(", ") || "N/A"
                  : "N/A"}
              </p>
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
                Download your tickets below. Each ticket has a unique QR code
                for entry. No app required — just your barcode receipt and ID
                (if requested).
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
                  <strong>Download or screenshot</strong> your tickets in
                  advance in case of weak signal
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🖨️</span>
                <span>
                  <strong>Print them out if you prefer</strong> – both digital
                  and paper tickets are accepted
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
                <p className="font-semibold text-purple-600">Vendor Name:</p>
                <p>{safeText(booking.listing?.vendor_name)}</p>
              </div>
              <div>
                <p className="font-semibold text-purple-600">Vendor Phone:</p>
                <p>{safeText(booking.listing?.vendor_phone)}</p>
              </div>
              <div>
                <p className="font-semibold text-purple-600">Contact Email:</p>
                <p>{safeText(booking.contact_email)}</p>
              </div>
              <div>
                <p className="font-semibold text-purple-600">Contact Phone:</p>
                <p>{safeText(booking.contact_phone)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => handleDownloadPDF(booking)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <span>📥</span>
            <span>
              Download {booking.guests} Ticket{booking.guests > 1 ? "s" : ""}{" "}
              (ZIP)
            </span>
          </Button>
          <p className="text-gray-500 text-sm mt-2">
            Get your beautifully designed tickets in a single ZIP file
          </p>
        </div>

        {/* Back to Events */}
        <div className="mt-4 text-center">
          <Link
            href="/services?category=events"
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessful;
