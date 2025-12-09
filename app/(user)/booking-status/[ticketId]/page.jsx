"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function BookingStatusPage() {
  const { ticketId } = useParams();
  const supabase = createClient();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remainingTickets, setRemainingTickets] = useState(null);
  const [scanProcessed, setScanProcessed] = useState(false);
  const [scanAttempted, setScanAttempted] = useState(false);

  useEffect(() => {
    if (!ticketId) return;

    async function fetchBooking() {
      setLoading(true);
      const { data, error } = await supabase
        .from("event_bookings")
        .select(
          `
          *,
          listing:listings (
            id,
            title,
            remaining_tickets
          )
        `
        )
        .eq("id", ticketId)
        .single();
      console.log(data);
      if (error) {
        console.error("Error fetching booking:", error);
      } else {
        setBooking(data);
        setRemainingTickets(data.listing?.remaining_tickets || 0);
        console.log("Fetched booking:", data);
        console.log("Listing ID:", data.listing?.id);
      }
      setLoading(false);
    }

    fetchBooking();
  }, [ticketId]);

  useEffect(() => {
    if (
      !booking ||
      !booking.listing ||
      loading ||
      remainingTickets === null ||
      scanProcessed ||
      scanAttempted
    )
      return;

    const processScan = async () => {
      let usageData = null;
      try {
        const { data, error } = await supabase
          .from("ticket_usage")
          .select("id")
          .eq("booking_id", ticketId)
          .single();
        if (error) {
          if (error.code === "PGRST116" && error.details.includes("0 rows")) {
            console.log("No existing scan found, proceeding with scan.");
          } else {
            console.error("Error checking ticket usage:", error);
            setScanAttempted(true);
            return;
          }
        } else {
          usageData = data;
        }
      } catch (e) {
        console.error("Unexpected error checking ticket usage:", e);
        setScanAttempted(true);
        return;
      }

      if (usageData) {
        setScanProcessed(true);
        return;
      }

      const listingId = booking.listing?.id;
      const ticketIdParam = booking.id;
      if (!listingId) {
        console.error("Listing ID is undefined, cannot proceed with scan");
        setScanAttempted(true);
        return;
      }

      if (booking.status === "confirmed" && remainingTickets > 0) {
        setRemainingTickets((prev) => prev - 1);
        const params = {
          listing_id_param: listingId,
          booking_id_param: ticketIdParam,
        };
        console.log("RPC Parameters:", params);
        const { data, error } = await supabase.rpc(
          "decrement_ticket_count",
          params
        );
        console.log("RPC Response:", { data, error });
        if (error) {
          console.error("Error updating ticket count:", error);
          setRemainingTickets((prev) => prev + 1);
          setScanAttempted(true);
        } else if (data !== null && data !== undefined) {
          setRemainingTickets(data);
          setScanProcessed(true);
        } else {
          console.log("No data returned, rolling back");
          setRemainingTickets((prev) => prev + 1);
          setScanAttempted(true);
        }
      }
    };

    processScan();
  }, [
    booking,
    loading,
    remainingTickets,
    scanProcessed,
    scanAttempted,
    ticketId,
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <p className="text-purple-600 text-lg animate-pulse">
          Checking ticket...
        </p>
      </div>
    );
  }

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
          <p className="font-semibold text-purple-700 mt-2">
            Remaining Tickets:
          </p>
          <p className="text-sm text-gray-800">{remainingTickets}</p>
          {scanProcessed && (
            <p className="text-green-600 text-sm mt-2">
              This ticket has been successfully scanned and counted.
            </p>
          )}
        </div>
      </div>
    );
  }

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
