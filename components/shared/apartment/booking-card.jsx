"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, Phone, Mail, User } from "lucide-react";
import { toast } from "sonner";

export default function ApartmentBookingCard({ apartment }) {
  const router = useRouter();
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const calculateTotalPrice = () => {
    const nights = calculateNights();
    if (nights === 0) return 0;

    if (apartment.price_per_month && nights >= 30) {
      const months = Math.floor(nights / 30);
      const remainingNights = nights % 30;
      return (
        months * apartment.price_per_month +
        remainingNights * apartment.price_per_night
      );
    }

    if (apartment.price_per_week && nights >= 7) {
      const weeks = Math.floor(nights / 7);
      const remainingNights = nights % 7;
      return (
        weeks * apartment.price_per_week +
        remainingNights * apartment.price_per_night
      );
    }

    return nights * apartment.price_per_night;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("apartment_id", apartment.id);
      formData.append("check_in_date", checkInDate);
      formData.append("check_out_date", checkOutDate);
      formData.append("number_of_guests", guests.toString());
      formData.append("guest_name", bookingDetails.guestName);
      formData.append("guest_email", bookingDetails.guestEmail);
      formData.append("guest_phone", bookingDetails.guestPhone);
      formData.append("special_requests", bookingDetails.specialRequests);
      formData.append("price_per_night", apartment.price_per_night.toString()); // ADD THIS
      formData.append(
        "caution_deposit",
        (apartment.caution_deposit || 0).toString(),
      );
      const response = await fetch("/api/bookings/apartment", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      toast.success("Booking created! Redirecting to payment...");
      router.push(`/payment/apartment/${data.data.id}`);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();
  const isValid =
    checkInDate &&
    checkOutDate &&
    nights > 0 &&
    nights >= apartment.minimum_stay &&
    guests >= 1 &&
    guests <= apartment.max_guests;

  return (
    <div className="sticky top-24">
      <div className="border border-gray-300 rounded-2xl p-6 shadow-xl bg-white">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-semibold text-gray-900">
              ₦{apartment.price_per_night.toLocaleString()}
            </span>
            <span className="text-gray-600">/ night</span>
          </div>

          {apartment.price_per_week && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm text-gray-700">Weekly:</span>
                <span className="font-semibold text-gray-900">
                  ₦{apartment.price_per_week.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {apartment.price_per_month && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm text-gray-700">Monthly:</span>
                <span className="font-semibold text-gray-900">
                  ₦{apartment.price_per_month.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {!showBookingForm ? (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guests
                </label>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  min="1"
                  max={apartment.max_guests}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max {apartment.max_guests}
                </p>
              </div>
            </div>

            {nights > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    ₦{apartment.price_per_night.toLocaleString()} × {nights}{" "}
                    night{nights !== 1 ? "s" : ""}
                  </span>
                  <span className="font-medium">
                    ₦{totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₦{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowBookingForm(true)}
              disabled={!isValid}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-lg"
            >
              {apartment.instant_booking ? "Book Now" : "Request to Book"}
            </button>
          </>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setShowBookingForm(false)}
              className="text-sm text-purple-600"
            >
              ← Back
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={bookingDetails.guestName}
                onChange={(e) =>
                  setBookingDetails({
                    ...bookingDetails,
                    guestName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={bookingDetails.guestEmail}
                onChange={(e) =>
                  setBookingDetails({
                    ...bookingDetails,
                    guestEmail: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={bookingDetails.guestPhone}
                onChange={(e) =>
                  setBookingDetails({
                    ...bookingDetails,
                    guestPhone: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                value={bookingDetails.specialRequests}
                onChange={(e) =>
                  setBookingDetails({
                    ...bookingDetails,
                    specialRequests: e.target.value,
                  })
                }
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-lg"
            >
              {submitting ? "Processing..." : "Continue to Payment"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
