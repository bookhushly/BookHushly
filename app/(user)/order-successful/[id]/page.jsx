"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  CalendarPlus,
  ChevronDown,
  Calendar,
  Video,
  ExternalLink,
} from "lucide-react";
import {
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  downloadICS,
} from "@/lib/calendar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const BOOKING_TYPES = {
  EVENT: "event",
  HOTEL: "hotel",
  APARTMENT: "apartment",
};

// ─── Add to Calendar (inline for order confirmation) ─────────────────────────
function AddToCalendarSection({ title, location, eventDate, eventTime, description }) {
  const [open, setOpen] = useState(false);
  const googleUrl = getGoogleCalendarUrl({ title, location, eventDate, eventTime, description });
  const outlookUrl = getOutlookCalendarUrl({ title, location, eventDate, eventTime, description });
  if (!eventDate) return null;

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <CalendarPlus className="w-4 h-4 text-purple-600" />
        Add to Calendar
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
            {googleUrl && (
              <a href={googleUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google Calendar
              </a>
            )}
            {outlookUrl && (
              <a href={outlookUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition-colors">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#0078D4">
                  <path d="M2 4l10 2v12L2 20V4zm11 2.5V7h9v10h-9v.5L13 18V6.5zM14 9v2h2V9h-2zm3 0v2h2V9h-2zm-3 3v2h2v-2h-2zm3 0v2h2v-2h-2z"/>
                </svg>
                Outlook Calendar
              </a>
            )}
            <button onClick={() => { downloadICS({ title, location, eventDate, eventTime, description }); setOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition-colors w-full">
              <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
              Apple / iCal (.ics)
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const OrderSuccessful = () => {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [bookingType, setBookingType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ref-based guard — survives re-renders without triggering effect re-runs
  const emailSentRef = useRef(false);

  const fetchBookingData = useCallback(
    async (bookingId) => {
      const { data: eventBooking } = await supabase
        .from("event_bookings")
        .select(
          `*,
          listing:listing_id (
            id, title, description, location,
            event_date, event_time, ticket_packages, category_data,
            vendors:vendor_id ( business_name, phone_number )
          )`,
        )
        .eq("id", bookingId)
        .single();

      if (eventBooking)
        return { data: eventBooking, type: BOOKING_TYPES.EVENT };

      const { data: hotelBooking } = await supabase
        .from("hotel_bookings")
        .select(
          `*,
          hotels:hotel_id ( id, name, city, state, address ),
          room_types:room_type_id ( id, name, base_price, max_occupancy )`,
        )
        .eq("id", bookingId)
        .single();

      if (hotelBooking)
        return { data: hotelBooking, type: BOOKING_TYPES.HOTEL };

      const { data: apartmentBooking } = await supabase
        .from("apartment_bookings")
        .select(
          `*,
          apartment:apartment_id (
            id, name, city, state, area, address,
            check_in_time, check_out_time, vendor_id
          )`,
        )
        .eq("id", bookingId)
        .single();

      if (apartmentBooking)
        return { data: apartmentBooking, type: BOOKING_TYPES.APARTMENT };

      throw new Error("Booking not found");
    },
    [supabase],
  );

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

      if (error || !data) throw new Error("Payment record not found");
      return data;
    },
    [supabase],
  );

  useEffect(() => {
    if (!params?.id) return;

    let isCancelled = false;

    const verifyOrder = async () => {
      try {
        setLoading(true);

        const bookingId = String(params.id).trim().toLowerCase();

        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(bookingId)) {
          throw new Error("Invalid booking ID format");
        }

        const { data: bookingData, type } = await fetchBookingData(bookingId);
        if (isCancelled) return;

        setBooking(bookingData);
        setBookingType(type);

        const paymentData = await fetchPaymentData(bookingId, type);
        if (isCancelled) return;

        setPayment(paymentData);

        if (
          paymentData.status === "completed" ||
          paymentData.status === "success"
        ) {
          toast.success("Order confirmed! Your booking is ready.", {
            action: {
              label: "My Bookings",
              onClick: () => { window.location.href = "/dashboard/customer"; },
            },
          });

          // Use ref so this fires exactly once regardless of re-renders
          if (!emailSentRef.current) {
            emailSentRef.current = true;
            try {
              const emailResponse = await fetch("/api/send-payment-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, bookingType: type }),
              });

              if (emailResponse.ok) {
                toast.success("Confirmation sent to your email!");
              } else {
                const body = await emailResponse.json().catch(() => ({}));
                console.error("Email API error:", body);
                // Don't surface this to user — booking is confirmed regardless
              }
            } catch (emailErr) {
              console.error("Email send failed:", emailErr);
              emailSentRef.current = false; // allow retry on hard network failure
            }
          }
        } else {
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
        if (!isCancelled) setLoading(false);
      }
    };

    verifyOrder();

    return () => {
      isCancelled = true;
    };
    // emailSentRef intentionally excluded — refs don't need to be deps
  }, [params?.id, fetchBookingData, fetchPaymentData]);

  const handleDownloadEventTickets = useCallback(async () => {
    if (!booking) return;
    try {
      const totalTickets = await generateEventTicketsZip(booking);
      toast.success(
        `Successfully generated ${totalTickets} ticket${totalTickets > 1 ? "s" : ""}`,
      );
    } catch (err) {
      toast.error(err.message || "Failed to generate tickets");
    }
  }, [booking]);

  const handleDownloadConfirmation = useCallback(async () => {
    if (!booking || !payment) return;
    try {
      await generateBookingConfirmationPDF(booking, payment, bookingType);
      toast.success("Confirmation downloaded successfully");
    } catch (err) {
      toast.error(err.message || "Failed to generate confirmation");
    }
  }, [booking, payment, bookingType]);

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

        {/* Add to Calendar — events only */}
        {bookingType === BOOKING_TYPES.EVENT && booking.listing?.event_date && (
          <AddToCalendarSection
            title={booking.listing.title}
            location={booking.listing.location}
            eventDate={booking.listing.event_date}
            eventTime={booking.listing.event_time}
            description={booking.listing.description}
          />
        )}

        {/* Stream link — virtual events only */}
        {bookingType === BOOKING_TYPES.EVENT && booking.listing?.category_data?.is_online && booking.listing?.category_data?.stream_url && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Virtual Event — Stream Link</span>
            </div>
            <p className="text-xs text-blue-600 mb-3">Use this link to join the event. Keep it private — it is for your ticket only.</p>
            <a
              href={booking.listing.category_data.stream_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900 underline break-all"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              {booking.listing.category_data.stream_url}
            </a>
          </div>
        )}

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
              {[
                "Bring your ticket (digital or printed)",
                "Arrive 30 minutes early",
                "Valid ID required for entry",
                "Check your email for updates",
              ].map((note) => (
                <li key={note} className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>{note}</span>
                </li>
              ))}
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
              {[
                "Check-in time is typically 2:00 PM",
                "Check-out time is typically 12:00 PM",
                "Valid ID required at check-in",
                "Contact property for early check-in/late check-out",
              ].map((note) => (
                <li key={note} className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>{note}</span>
                </li>
              ))}
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
