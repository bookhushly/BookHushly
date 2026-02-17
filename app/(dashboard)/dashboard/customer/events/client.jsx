"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Ticket, MapPin, Calendar, Users, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getEventBookings } from "@/app/actions/customers";
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  CardSkeleton,
  Pagination,
  Amount,
} from "@/components/shared/customer/shared-ui";

export function EventBookingsClient({ userId, initialData }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["event-bookings", userId, page],
    queryFn: () => getEventBookings(userId, page, PAGE_SIZE),
    initialData: page === 1 ? initialData : undefined,
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  });

  const bookings = data?.data || [];
  const totalPages = Math.ceil((data?.count || 0) / PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Event Bookings"
        description={`${data?.count || 0} total`}
        action={
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Link href="/events">
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
          actionHref="/events"
        />
      ) : (
        <>
          <div className={`space-y-4 ${isFetching ? "opacity-60" : ""}`}>
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-purple-100 rounded-2xl overflow-hidden hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-40 h-32 sm:h-auto bg-pink-50 flex-shrink-0 overflow-hidden relative">
                    {booking.listing?.images?.[0] ? (
                      <img
                        src={booking.listing.images[0]}
                        alt={booking.listing?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Ticket className="h-8 w-8 text-pink-300" />
                      </div>
                    )}
                    {booking.listing?.category && (
                      <span className="absolute top-2 left-2 text-xs font-medium bg-white/90 text-gray-700 px-2 py-0.5 rounded-full">
                        {booking.listing.category}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 p-5">
                    <div className="flex justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {booking.listing?.title || "Event"}
                        </h3>
                        {booking.listing?.vendor_name && (
                          <p className="text-xs text-gray-500">
                            by {booking.listing.vendor_name}
                          </p>
                        )}
                        {booking.listing?.location && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
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
                        <p className="font-medium text-gray-700 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-purple-400" />
                          {format(
                            new Date(booking.booking_date),
                            "MMM d, yyyy",
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Time</p>
                        <p className="font-medium text-gray-700 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-purple-400" />
                          {booking.booking_time}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Guests</p>
                        <p className="font-medium text-gray-700 flex items-center gap-1">
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-200 text-purple-700 hover:bg-purple-50"
                            >
                              <Download className="h-3.5 w-3.5 mr-1" />
                              Ticket
                            </Button>
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
