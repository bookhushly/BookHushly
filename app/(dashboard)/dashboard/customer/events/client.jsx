"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Ticket, MapPin, Calendar, Users, Clock, Download, RefreshCcw, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { getEventBookings } from "@/app/actions/customers";
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  CardSkeleton,
  Pagination,
  Amount,
} from "@/components/shared/customer/shared-ui";

// ─── Transfer Ticket Modal ────────────────────────────────────────────────────
function TransferModal({ booking, onClose }) {
  const [newEmail, setNewEmail] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/bookings/event/${booking.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_email: newEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer failed");
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Ticket transferred to ${data.transferred_to}.`);
      queryClient.invalidateQueries({ queryKey: ["event-bookings"] });
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const isValidEmail = /^\S+@\S+\.\S+$/.test(newEmail.trim());

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white text-lg">Transfer Ticket</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Transfer your ticket for <strong>{booking.listing?.title}</strong> to another person.
          Once transferred, you will no longer have access to this ticket.
        </p>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient email</label>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="e.g. friend@example.com"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 mb-4"
        />
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!isValidEmail || isPending}
            onClick={() => mutate()}
          >
            {isPending ? "Transferring..." : "Transfer Ticket"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Refund Request Modal ─────────────────────────────────────────────────────
function RefundModal({ booking, onClose }) {
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/refunds/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: booking.id, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      return data;
    },
    onSuccess: () => {
      toast.success("Refund request submitted. The organiser will respond within 2–3 business days.");
      queryClient.invalidateQueries({ queryKey: ["event-bookings"] });
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white text-lg">Request Refund</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Tell the organiser why you'd like a refund for <strong>{booking.listing?.title}</strong>.
          They will review and respond within 2–3 business days.
        </p>
        <textarea
          rows={4}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. I can no longer attend due to travel plans..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none mb-1"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 text-right mb-4">{reason.length}/500</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!reason.trim() || isPending}
            onClick={() => mutate()}
          >
            {isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EventBookingsClient({ userId, initialData, userEmail }) {
  const [page, setPage] = useState(1);
  const [refundBooking, setRefundBooking] = useState(null);
  const [transferBooking, setTransferBooking] = useState(null);
  const PAGE_SIZE = 10;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["event-bookings", userId, page],
    queryFn: () => getEventBookings(userId, userEmail, page, PAGE_SIZE),
    initialData: page === 1 ? initialData : undefined,
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  });

  const bookings = data?.data || [];
  const totalPages = Math.ceil((data?.count || 0) / PAGE_SIZE);

  return (
    <div>
      {transferBooking && (
        <TransferModal booking={transferBooking} onClose={() => setTransferBooking(null)} />
      )}
      {refundBooking && (
        <RefundModal booking={refundBooking} onClose={() => setRefundBooking(null)} />
      )}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/customer" },
          { label: "Event Bookings" },
        ]}
        title="Event Bookings"
        description={`${data?.count || 0} total`}
        action={
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Link href="/services?category=events">
              <Ticket className="h-4 w-4 mr-2" />
              Browse Events
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <CardSkeleton />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No event bookings yet"
          description="Discover exciting events and book your tickets."
          actionLabel="Browse Events"
          actionHref="/services?category=events"
        />
      ) : (
        <>
          <div className={`space-y-4 ${isFetching ? "opacity-60" : ""}`}>
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white dark:bg-gray-900 border border-purple-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-40 h-32 sm:h-auto bg-pink-50 dark:bg-gray-800 flex-shrink-0 overflow-hidden relative">
                    {booking.listing?.media_urls?.[0] ? (
                      <img
                        src={booking.listing.media_urls[0]}
                        alt={booking.listing?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Ticket className="h-8 w-8 text-pink-300" />
                      </div>
                    )}
                    {booking.listing?.category && (
                      <span className="absolute top-2 left-2 text-xs font-medium bg-white/90 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        {booking.listing.category}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 p-5">
                    <div className="flex justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {booking.listing?.title || "Event"}
                        </h3>
                        {booking.listing?.vendor_name && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            by {booking.listing.vendor_name}
                          </p>
                        )}
                        {booking.listing?.location && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {booking.listing.location}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mt-3">
                      <div>
                        <p className="text-xs text-gray-400">Date</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-purple-400" />
                          {format(
                            new Date(booking.booking_date),
                            "MMM d, yyyy",
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Time</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-purple-400" />
                          {booking.booking_time}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Guests</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-purple-400" />
                          {booking.guests}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                      <Amount value={booking.total_amount} size="lg" />
                      <div className="flex gap-2">
                        {booking.payment_status === "pending" && (
                          <Button
                            size="sm"
                            asChild
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Link
                              href={`/payments?event_booking=${booking.id}&reference=${booking.payment_reference}`}
                            >
                              Pay Now
                            </Link>
                          </Button>
                        )}
                        {booking.status === "confirmed" &&
                          booking.payment_status === "completed" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-200 text-purple-700 hover:bg-purple-50"
                              >
                                <Download className="h-3.5 w-3.5 mr-1" />
                                Ticket
                              </Button>
                              {booking.listing?.event_date &&
                                new Date(booking.listing.event_date) > new Date() && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                      onClick={() => setTransferBooking(booking)}
                                    >
                                      <Send className="h-3.5 w-3.5 mr-1" />
                                      Transfer
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-red-200 text-red-600 hover:bg-red-50"
                                      onClick={() => setRefundBooking(booking)}
                                    >
                                      <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                                      Refund
                                    </Button>
                                  </>
                                )}
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
