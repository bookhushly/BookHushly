"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { verifyPayment } from "@/lib/payments";
import { toast } from "sonner";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import NextImage from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  MapPin,
  Clock,
  Mail,
  Phone,
  Ticket,
  AlertCircle,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const OrderSuccessful = () => {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const verifyOrder = async () => {
      try {
        setLoading(true);
        const bookingId = params.id?.trim().toLowerCase();

        if (
          !bookingId ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            bookingId
          )
        ) {
          throw new Error("Invalid booking ID format");
        }

        const { data: bookingData, error: bookingError } = await supabase
          .from("event_bookings")
          .select(
            `
          id, listing_id, ticket_details, guests, total_amount, booking_date, booking_time,
          status, payment_status, contact_email, contact_phone,
          listing:listings (
            title, event_date, location, vendor_name, vendor_phone, ticket_packages, media_urls
          )
        `
          )
          .eq("id", bookingId)
          .single();

        if (bookingError || !bookingData) {
          throw new Error(
            `Booking not found: ${bookingError?.message || "No booking data"}`
          );
        }

        let ticketDetails;
        try {
          ticketDetails = bookingData.ticket_details
            ? JSON.parse(bookingData.ticket_details)
            : {};
        } catch (err) {
          throw new Error("Invalid ticket details format");
        }

        const totalTickets = Object.values(ticketDetails).reduce(
          (sum, qty) => sum + Number(qty),
          0
        );
        if (totalTickets !== bookingData.guests) {
          throw new Error("Ticket details do not match number of guests");
        }

        setBooking(bookingData);

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

        const { data: verificationData, error: verificationError } =
          await verifyPayment(paymentData.reference);
        if (verificationError || !verificationData) {
          throw new Error(
            `Payment verification failed: ${verificationError?.message || "Invalid payment status"}`
          );
        }
        console.log("Payment verification data:", verificationData);

        if (verificationData.status === "success") {
          if (!isCancelled) {
            toast.success("Order confirmed! Your tickets are ready.");
          }
          return;
        }

        const { data, error } = await supabase.rpc(
          "verify_and_update_booking",
          {
            p_booking_id: bookingId,
            p_payment_reference: paymentData.reference,
            p_verification_status: verificationData.status,
          }
        );

        if (error || data !== "Success") {
          throw new Error(`RPC failed: ${error?.message || data}`);
        }

        if (!isCancelled) {
          toast.success("Order confirmed! Your tickets are ready.");
        }
      } catch (err) {
        if (!isCancelled) {
          const message = err.message || "An unexpected error occurred";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    verifyOrder();

    return () => {
      isCancelled = true;
    };
  }, [params.id]);

  const pixelsToMm = (pixels) => (pixels * 25.4) / 96;

  const getImageDimensions = async (url) => {
    return new Promise((resolve, reject) => {
      const img = typeof window !== "undefined" ? new window.Image() : null;
      if (!img) {
        reject(new Error("Image constructor not available"));
        return;
      }
      img.src = url;
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
    });
  };

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

  const safeText = (value, fallback = "N/A") => {
    if (value === undefined || value === null || value === "") return fallback;
    return String(value);
  };

  const handleDownloadPDF = async (booking) => {
    if (!booking || !payment) return;

    try {
      const zip = new JSZip();
      const templateUrl = "/ticket.jpg";

      const { width: imgWidthPx, height: imgHeightPx } =
        await getImageDimensions(templateUrl);
      const imgWidthMm = pixelsToMm(imgWidthPx);
      const imgHeightMm = pixelsToMm(imgHeightPx);

      const templateDataUrl = await getBase64FromUrl(templateUrl);

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

      const ticketTypeText = Object.entries(ticketDetails)
        .filter(([_, qty]) => qty > 0)
        .map(([name, qty]) => `${name} x${qty}`)
        .join(", ");

      // Updated placeholders - removed vendorName
      const placeholders = {
        listingTitle: {
          x: 155.1,
          y: 104.6,
          fontSize: 140,
          color: [255, 255, 255],
          font: "BebasNeue", // Custom font
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

      for (let i = 0; i < totalTickets; i++) {
        const doc = new jsPDF({
          orientation: imgWidthPx > imgHeightPx ? "landscape" : "portrait",
          unit: "mm",
          format: [imgWidthMm, imgHeightMm],
        });

        // Load Bebas Neue font
        // NOTE: You need to add BebasNeue-Regular.ttf to your public folder
        // and convert it using https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
        // For now, using helvetica as fallback until font is properly embedded

        doc.addImage(templateDataUrl, "PNG", 0, 0, imgWidthMm, imgHeightMm);

        // Event Title with Bebas Neue (or helvetica as fallback)
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

        // Time
        doc.setFontSize(placeholders.time.fontSize);
        doc.setTextColor(...placeholders.time.color);
        doc.text(
          safeText(booking.booking_time),
          placeholders.time.x,
          placeholders.time.y
        );

        // Vendor Phone (removed vendor name)
        doc.setFontSize(placeholders.vendorPhone.fontSize);
        doc.setTextColor(...placeholders.vendorPhone.color);
        doc.text(
          safeText(booking.listing?.vendor_phone),
          placeholders.vendorPhone.x,
          placeholders.vendorPhone.y
        );

        // QR Code
        const ticketId = `${booking.id}-${i + 1}`;

        try {
          const qrCodeData = await QRCode.toDataURL(
            `${window.location.origin}/booking-status/${booking.id}`,
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
          continue;
        }

        const pdfBlob = doc.output("blob");
        zip.file(`Ticket-${safeText(booking.id, "0")}-${i + 1}.pdf`, pdfBlob);
      }

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

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Time TBD";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-900 text-sm font-medium">
            Verifying your order...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking || !payment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center max-w-md w-full">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-5 text-sm">
            {error || "We couldn't find your order. Please try again."}
          </p>
          <Link href="/services?category=events">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-5 rounded-lg flex items-center mx-auto text-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const ticketImage =
    booking.listing?.media_urls?.[0] || "/event_placeholder.jpg";

  const ticketItems = booking.ticket_details
    ? Object.entries(JSON.parse(booking.ticket_details))
        .filter(([_, qty]) => qty > 0)
        .map(([name, qty]) => ({ name, qty }))
    : [];

  const ticketSummary =
    ticketItems.length > 0
      ? ticketItems
          .map((item, idx) => {
            const plural = item.qty > 1 ? "s" : "";
            return `${item.qty} ${item.name} `;
          })
          .join(", ")
      : "N/A";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-full mb-3">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Order Confirmed
          </h1>
          <p className="text-sm text-gray-600">
            Your tickets have been sent to {booking.contact_email}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
          <div className="relative">
            <NextImage
              src={ticketImage}
              alt="Event"
              width={800}
              height={400}
              className="w-full h-64 object-cover"
              priority={true}
            />
          </div>

          <div className="p-5">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {booking.listing?.title || "Event"}
            </h2>

            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              You have{" "}
              <span className="font-semibold text-gray-900">
                {" "}
                {ticketSummary}
              </span>{" "}
              for{" "}
              <span className="font-semibold text-gray-900">
                {booking.listing?.title || "this event"}
              </span>{" "}
              on{" "}
              <span className="font-semibold text-gray-900">
                {formatDate(booking.listing?.event_date)}
              </span>{" "}
              at{" "}
              <span className="font-semibold text-gray-900">
                {formatTime(booking.booking_time)}
              </span>
              , taking place at{" "}
              <span className="font-semibold text-gray-900">
                {booking.listing?.location || "Venue TBD"}
              </span>
              .
            </p>

            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              You can download them directly from this page, or check your email
              for a copy. If you have any issues, feel free to reach out to our
              support team.
            </p>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Paid</span>
                <span className="text-xl font-bold text-gray-900">
                  {payment.vendor_currency || "NGN"}{" "}
                  {Number(booking.total_amount).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDownloadPDF(booking)}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download Ticket{booking.guests > 1 ? "s" : ""}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">
              Your Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 break-all">
                  {booking.contact_email}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{booking.contact_phone}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">
              Need Help?
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">
                  {booking.listing?.vendor_phone || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <a
                  href="mailto:support@bookhushly.com"
                  className="text-purple-600 hover:text-purple-700"
                >
                  support@bookhushly.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">
            Before You Go
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Bring your ticket (digital or printed)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Arrive 30 minutes early</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Valid ID required for entry</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Check your email for updates</span>
            </li>
          </ul>
        </div>

        <div className="text-center pt-5 border-t border-gray-100">
          <a
            href="/services?category=events"
            className="inline-block text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Explore More Events →
          </a>
          <p className="text-xs text-gray-400 mt-3">Powered by BookHushly</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessful;
