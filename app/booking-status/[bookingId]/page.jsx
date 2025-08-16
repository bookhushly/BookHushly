"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function BookingStatusPage() {
  const { bookingId } = useParams();
  const supabase = createClientComponentClient();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch booking info
  useEffect(() => {
    if (!bookingId) return;

    async function fetchBooking() {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (error) console.error("Error fetching booking:", error);
      else setBooking(data);

      setLoading(false);
    }

    fetchBooking();
  }, [bookingId]);

  // UI: Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <p className="text-purple-600 text-lg animate-pulse">
          Checking ticket...
        </p>
      </div>
    );
  }

  // UI: Not found
  if (!booking) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white text-center px-4">
        <XCircle className="w-20 h-20 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-500">Ticket Not Found</h1>
        <p className="text-gray-600 mt-2 max-w-md">
          We couldn’t find any booking with this ticket ID. Please check your QR
          code.
        </p>
      </div>
    );
  }

  // UI: Confirmed ticket
  if (booking.status === "confirmed") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white text-center px-4">
        <CheckCircle2 className="w-24 h-24 text-purple-600 mb-4 animate-bounce" />
        <h1 className="text-3xl font-bold text-purple-700">Ticket is Valid!</h1>
        <p className="text-gray-600 mt-2 max-w-md">
          Welcome! Your booking for{" "}
          <span className="font-semibold">{booking.booking_date}</span> at{" "}
          <span className="font-semibold">{booking.booking_time}</span> is
          confirmed.
        </p>
        <div className="mt-6 p-4 border-2 border-purple-600 rounded-lg bg-purple-50 shadow-lg">
          <p className="font-semibold text-purple-700">Booking ID:</p>
          <p className="text-sm text-gray-800">{booking.id}</p>
        </div>
      </div>
    );
  }

  // UI: Pending ticket
  if (booking.status === "pending") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white text-center px-4">
        <Clock className="w-20 h-20 text-yellow-500 mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold text-yellow-600">
          Ticket Pending Confirmation
        </h1>
        <p className="text-gray-600 mt-2 max-w-md">
          Your booking has been received but is awaiting confirmation from the
          event organizer.
        </p>
      </div>
    );
  }

  // UI: Cancelled or invalid
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white text-center px-4">
      <XCircle className="w-20 h-20 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-red-500">Ticket Invalid</h1>
      <p className="text-gray-600 mt-2 max-w-md">
        This ticket is either cancelled or not valid for entry.
      </p>
    </div>
  );
}
