"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { createClient } from "@/lib/supabase/client";

const BOOKING_TYPES = {
  EVENT: "event",
  HOTEL: "hotel",
  APARTMENT: "apartment",
};

const OrderSuccessful = () => {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [bookingType, setBookingType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Detect booking type from URL or data
  const detectBookingType = useCallback((bookingData) => {
    if (bookingData?.ticket_details) return BOOKING_TYPES.EVENT;
    if (bookingData?.room_type_id) return BOOKING_TYPES.HOTEL; // hotel has room_type_id
    if (bookingData?.apartment_id) return BOOKING_TYPES.APARTMENT; // apartment has apartment_id
    if (bookingData?.listing_id) return BOOKING_TYPES.EVENT;
    return BOOKING_TYPES.EVENT;
  }, []);

  // Fetch booking data
  const fetchBookingData = useCallback(
    async (bookingId) => {
      // Try event_bookings first
      let { data: eventBooking, error: eventError } = await supabase
        .from("event_bookings")
        .select(
          `
        *,
        listing:listing_id (
          id,
          title,
          description,
          location,
          event_date,
          event_time,
          ticket_packages,
          vendors:vendor_id (
            business_name,
            phone_number
          )
        )
      `,
        )
        .eq("id", bookingId)
        .single();

      if (eventBooking) {
        return { data: eventBooking, type: BOOKING_TYPES.EVENT };
      }

      // Try hotel_bookings - FIXED with correct field names
      let { data: hotelBooking, error: hotelError } = await supabase
        .from("hotel_bookings")
        .select(
          `
        *,
        hotels:hotel_id (
          id,
          name,
          city,
          state,
          address
        ),
        room_types:room_type_id (
          id,
          name,
          base_price,
          max_occupancy
        )
      `,
        )
        .eq("id", bookingId)
        .single();

      if (hotelBooking) {
        return { data: hotelBooking, type: BOOKING_TYPES.HOTEL };
      }

      // Try apartment_bookings
      // Try apartment_bookings
      let { data: apartmentBooking } = await supabase
        .from("apartment_bookings")
        .select(
          `
    *,
    apartment:apartment_id (
      id,
      name,
      city,
      state,
      area,
      address,
      check_in_time,
      check_out_time,
      vendor_id
    )
  `,
        )
        .eq("id", bookingId)
        .single();

      if (apartmentBooking) {
        return { data: apartmentBooking, type: BOOKING_TYPES.APARTMENT };
      }
      throw new Error("Booking not found");
    },
    [supabase],
  );

  // Fetch payment record
  const fetchPaymentData = useCallback(
    async (bookingId, type) => {
      const column =
        type === BOOKING_TYPES.EVENT
          ? "event_booking_id"
          : type === BOOKING_TYPES.HOTEL
            ? "hotel_booking_id"
            : "apartment_booking_id";

      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq(column, bookingId)
        .single();

      if (error || !data) {
        throw new Error("Payment record not found");
      }

      return data;
    },
    [supabase],
  );

  // Verify and process order
  useEffect(() => {
    if (!params?.id) return;

    let isCancelled = false;

    const verifyOrder = async () => {
      try {
        setLoading(true);

        const bookingId = String(params.id).trim().toLowerCase();

        // Validate UUID format
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(bookingId)) {
          throw new Error("Invalid booking ID format");
        }

        // Fetch booking data
        const { data: bookingData, type } = await fetchBookingData(bookingId);

        if (isCancelled) return;

        setBooking(bookingData);
        setBookingType(type);

        // Fetch payment record
        const paymentData = await fetchPaymentData(bookingId, type);

        if (isCancelled) return;

        setPayment(paymentData);

        // Check if payment is already verified
        if (
          paymentData.status === "completed" ||
          paymentData.status === "success"
        ) {
          // Payment already verified, show success
          toast.success("Order confirmed! Your booking is ready.");

          // Send confirmation email (only if not already sent)
          if (!emailSent && bookingData.payment_status !== "completed") {
            setEmailSent(true);
            try {
              const emailResponse = await fetch("/api/send-payment-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bookingId: bookingId,
                  bookingType: type,
                }),
              });

              if (emailResponse.ok) {
                toast.success("Confirmation sent to your email!");
              }
            } catch (emailErr) {
              console.error("Email send failed:", emailErr);
            }
          }
        } else {
          // Payment not verified yet
          throw new Error(
            "Payment verification pending. Please wait a moment.",
          );
        }
      } catch (err) {
        console.error("Order verification error:", err);
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : "An unexpected error occurred";
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
  }, [params?.id, fetchBookingData, fetchPaymentData, emailSent]);

  // Download event tickets
  const handleDownloadEventTickets = useCallback(async () => {
    if (!booking) return;

    try {
      const totalTickets = await generateEventTicketsZip(booking);
      toast.success(
        `Successfully generated ${totalTickets} ticket${totalTickets > 1 ? "s" : ""}`,
      );
    } catch (err) {
      console.error("Error generating tickets:", err);
      toast.error(err.message || "Failed to generate tickets");
    }
  }, [booking]);

  // Download booking confirmation
  const handleDownloadConfirmation = useCallback(async () => {
    if (!booking || !payment) return;

    try {
      await generateBookingConfirmationPDF(booking, payment, bookingType);
      toast.success("Confirmation downloaded successfully");
    } catch (err) {
      console.error("Error generating confirmation:", err);
      toast.error(err.message || "Failed to generate confirmation");
    }
  }, [booking, payment, bookingType]);

  // Get contact details based on booking type
  const getContactEmail = useCallback(() => {
    if (!booking) return "N/A";
    return booking.contact_email || booking.guest_email || "N/A";
  }, [booking]);

  const getContactPhone = useCallback(() => {
    if (!booking) return "N/A";
    return booking.contact_phone || booking.guest_phone || "N/A";
  }, [booking]);

  const getTotalAmount = useCallback(() => {
    if (!booking) return 0;
    return booking.total_amount || booking.total_price || 0;
  }, [booking]);

  // Get number of guests - FIXED for hotel bookings
  const getNumberOfGuests = useCallback(() => {
    if (!booking) return 0;

    // Hotel bookings: adults + children
    if (bookingType === BOOKING_TYPES.HOTEL) {
      return (booking.adults || 0) + (booking.children || 0);
    }

    // Events and apartments use number_of_guests or guests
    return booking.number_of_guests || booking.guests || 0;
  }, [booking, bookingType]);

  // Loading state
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

  // Error state
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
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Success Header */}
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

        {/* Booking Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">
            Booking Details
          </h3>
          <div className="space-y-2 text-sm">
            {bookingType === BOOKING_TYPES.EVENT && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event</span>
                  <span className="text-gray-900 font-medium">
                    {booking.listing?.title || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="text-gray-900">
                    {booking.listing?.event_date
                      ? new Date(
                          booking.listing.event_date,
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="text-gray-900">
                    {booking.listing?.location || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tickets</span>
                  <span className="text-gray-900">{booking.guests || 0}</span>
                </div>
              </>
            )}

            {bookingType === BOOKING_TYPES.HOTEL && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hotel</span>
                  <span className="text-gray-900 font-medium">
                    {booking.hotels?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room Type</span>
                  <span className="text-gray-900">
                    {booking.room_types?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="text-gray-900">
                    {booking.hotels?.city && booking.hotels?.state
                      ? `${booking.hotels.city}, ${booking.hotels.state}`
                      : booking.hotels?.address || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="text-gray-900">
                    {booking.check_in_date
                      ? new Date(booking.check_in_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="text-gray-900">
                    {booking.check_out_date
                      ? new Date(booking.check_out_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="text-gray-900">
                    {booking.adults || 0} Adult{booking.adults !== 1 ? "s" : ""}
                    {booking.children > 0 &&
                      `, ${booking.children} Child${booking.children !== 1 ? "ren" : ""}`}
                  </span>
                </div>
              </>
            )}

            {bookingType === BOOKING_TYPES.APARTMENT && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Apartment</span>
                  <span className="text-gray-900 font-medium">
                    {booking.apartment?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="text-gray-900">
                    {booking.apartment?.city && booking.apartment?.state
                      ? `${booking.apartment.city}, ${booking.apartment.state}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="text-gray-900">
                    {booking.check_in_date
                      ? new Date(booking.check_in_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="text-gray-900">
                    {booking.check_out_date
                      ? new Date(booking.check_out_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights</span>
                  <span className="text-gray-900">
                    {booking.number_of_nights}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="text-gray-900">
                    {booking.number_of_guests}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Paid</span>
            <span className="text-xl font-bold text-gray-900">
              {payment.currency || "NGN"}{" "}
              {Number(getTotalAmount()).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={
            bookingType === BOOKING_TYPES.EVENT
              ? handleDownloadEventTickets
              : handleDownloadConfirmation
          }
          className="w-full mb-5 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          {bookingType === BOOKING_TYPES.EVENT
            ? "Download Tickets"
            : "Download Confirmation"}
        </button>

        {/* Contact Details */}
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

        {/* Important Notes */}
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

        {/* Footer */}
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
