"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { verifyPayment } from "@/lib/payments";
import { toast } from "sonner";
import {
  generateEventTicketsZip,
  generateBookingConfirmationPDF,
} from "@/services/tickets";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  detectBookingType,
  fetchBooking,
  fetchPayment,
  updateBookingStatus,
  supportsTickets,
  getBookingTypeName,
  validateBookingData,
  BOOKING_TYPES,
} from "@/services/booking";
import {
  EventBookingDisplay,
  HotelBookingDisplay,
  ApartmentBookingDisplay,
} from "@/components/shared/book/display";

const OrderSuccessful = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoize booking type to prevent unnecessary re-renders
  const bookingType = useMemo(() => {
    return detectBookingType(searchParams);
  }, [searchParams?.get("type")]);

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailAttempted, setEmailAttempted] = useState(false);

  useEffect(() => {
    if (!params?.id) {
      console.log("❌ No booking ID found in params");
      return;
    }

    let isCancelled = false;

    const verifyOrder = async () => {
      console.log("🔄 Starting order verification...");
      try {
        setLoading(true);

        const bookingId = String(params.id).trim().toLowerCase();
        console.log("📦 Booking ID:", bookingId);

        // Validate UUID format
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(bookingId)) {
          console.log("❌ Invalid booking ID format");
          throw new Error("Invalid booking ID format");
        }

        console.log("✅ Booking ID format verified");
        console.log("📋 Booking type:", bookingType);

        // Fetch booking data
        console.log("📡 Fetching booking from database...");
        const bookingData = await fetchBooking(bookingId, bookingType);
        console.log("✅ Booking data fetched successfully:", bookingData);

        // Validate booking data
        validateBookingData(bookingData, bookingType);
        console.log("✅ Booking data validated");

        if (!isCancelled) {
          setBooking(bookingData);
        }

        // Fetch payment record
        console.log("📡 Fetching payment record...");
        const paymentData = await fetchPayment(bookingId, bookingType);
        console.log("✅ Payment data fetched:", paymentData);

        if (!isCancelled) {
          setPayment(paymentData);
        }

        // Verify payment externally
        console.log("🔍 Verifying payment with provider...");
        const { data: verificationData, error: verificationError } =
          await verifyPayment(paymentData.reference);

        if (verificationError || !verificationData) {
          console.log("❌ Payment verification failed:", verificationError);
          throw new Error(
            `Payment verification failed: ${
              verificationError?.message || "Invalid payment status"
            }`
          );
        }

        console.log("✅ Payment verification response:", verificationData);

        if (verificationData.status === "success") {
          console.log("💰 Payment verified successfully, updating booking...");
          await updateBookingStatus(
            bookingId,
            bookingType,
            bookingType !== "hotel" ? undefined : "confirmed"
          );
          console.log("✅ Booking status updated to 'confirmed'");

          if (!isCancelled) {
            console.log("🎉 Order confirmed! Showing success toast...");
            toast.success("Order confirmed! Your booking is ready.");
          }

          // Send confirmation email (only once)
          if (!emailAttempted && !isCancelled) {
            setEmailAttempted(true); // Set immediately to prevent double-sending

            try {
              console.log("📧 Sending confirmation email...");
              const emailResponse = await fetch("/api/send-payment-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bookingId: bookingId,
                  bookingType: bookingType,
                }),
              });

              const emailResult = await emailResponse.json();

              if (emailResponse.ok && emailResult.success) {
                console.log("✅ Confirmation email sent successfully!");
                if (!isCancelled) {
                  setEmailSent(true);
                  toast.success("Confirmation sent to your email!");
                }
              } else {
                console.error("❌ Email failed:", emailResult);
                if (!isCancelled) {
                  toast.warning(
                    "Order confirmed, but email delivery failed. You can still download your confirmation."
                  );
                }
              }
            } catch (emailErr) {
              console.error("❌ Failed to send confirmation email:", emailErr);
              if (!isCancelled) {
                toast.info(
                  "Order confirmed! Download your confirmation below (email will arrive shortly)."
                );
              }
            }
          }
        }
      } catch (err) {
        console.log("❌ Error during verification:", err);
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : "An unexpected error occurred";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        } else {
          console.log("⚠️ Cleanup skipped, component unmounted");
        }
        console.log("🏁 Verification flow complete.");
      }
    };

    verifyOrder();

    return () => {
      isCancelled = true;
    };
  }, [params?.id, bookingType, emailAttempted]); // Stable dependencies

  const handleDownloadEventTickets = async () => {
    if (!booking) return;

    try {
      const totalTickets = await generateEventTicketsZip(booking);
      toast.success(
        `Successfully generated ${totalTickets} ticket${totalTickets > 1 ? "s" : ""}`
      );
    } catch (err) {
      console.error("Error generating tickets:", err);
      toast.error(err.message || "Failed to generate tickets");
    }
  };

  const handleDownloadConfirmation = async () => {
    if (!booking || !payment) return;

    try {
      await generateBookingConfirmationPDF(booking, payment, bookingType);
      toast.success("Confirmation downloaded successfully");
    } catch (err) {
      console.error("Error generating confirmation:", err);
      toast.error(err.message || "Failed to generate confirmation");
    }
  };

  const getContactEmail = () => {
    if (bookingType === BOOKING_TYPES.EVENT) {
      return booking?.contact_email;
    } else if (bookingType === BOOKING_TYPES.HOTEL) {
      return booking?.guest_email;
    } else if (bookingType === BOOKING_TYPES.APARTMENT) {
      return booking?.guest_email;
    }
    return "N/A";
  };

  const getContactPhone = () => {
    if (bookingType === BOOKING_TYPES.EVENT) {
      return booking?.contact_phone;
    } else if (bookingType === BOOKING_TYPES.HOTEL) {
      return booking?.guest_phone;
    } else if (bookingType === BOOKING_TYPES.APARTMENT) {
      return booking?.guest_phone;
    }
    return "N/A";
  };

  const getTotalAmount = () => {
    return booking?.total_amount || booking?.total_price || 0;
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
          <Link href="/services">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-5 rounded-lg flex items-center mx-auto text-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Services
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
            Your confirmation has been sent to {getContactEmail()}
          </p>
        </div>

        {/* Render appropriate booking display */}
        <div className="mb-5">
          {bookingType === BOOKING_TYPES.EVENT && (
            <EventBookingDisplay booking={booking} />
          )}
          {bookingType === BOOKING_TYPES.HOTEL && (
            <HotelBookingDisplay booking={booking} />
          )}
          {bookingType === BOOKING_TYPES.APARTMENT && (
            <ApartmentBookingDisplay booking={booking} />
          )}
        </div>

        {/* Total amount */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Paid</span>
            <span className="text-xl font-bold text-gray-900">
              {payment.vendor_currency || "NGN"}{" "}
              {Number(getTotalAmount()).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={() => {
            if (
              bookingType === BOOKING_TYPES.EVENT &&
              supportsTickets(bookingType)
            ) {
              handleDownloadEventTickets();
            } else {
              handleDownloadConfirmation();
            }
          }}
          className="w-full mb-5 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          {bookingType === BOOKING_TYPES.EVENT
            ? "Download Tickets"
            : "Download Confirmation"}
        </button>

        {/* Contact details */}
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">
              Your Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 break-all">
                  {getContactEmail()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{getContactPhone()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">
              Need Help?
            </h3>
            <div className="space-y-2">
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

        {/* Important notes */}
        {bookingType === BOOKING_TYPES.EVENT && (
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
        )}

        {(bookingType === BOOKING_TYPES.HOTEL ||
          bookingType === BOOKING_TYPES.APARTMENT) && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Check-in time is typically 2:00 PM</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Check-out time is typically 12:00 PM</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Valid ID required at check-in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Contact property for early check-in/late check-out</span>
              </li>
            </ul>
          </div>
        )}

        <div className="text-center pt-5 border-t border-gray-100">
          <a
            href="/services"
            className="inline-block text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Explore More Services →
          </a>
          <p className="text-xs text-gray-400 mt-3">Powered by BookHushly</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessful;
