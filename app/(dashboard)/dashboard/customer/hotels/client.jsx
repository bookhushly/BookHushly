"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Hotel,
  MapPin,
  Calendar,
  Users,
  Star,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getHotelBookings } from "@/app/actions/customers";
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  CardSkeleton,
  Pagination,
  SectionCard,
  Amount,
} from "@/components/shared/customer/shared-ui";
import { HotelBookingDetailModal } from "./modal";

export function HotelBookingsClient({ userId, initialData }) {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const PAGE_SIZE = 10;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["hotel-bookings", userId, page],
    queryFn: () => getHotelBookings(userId, page, PAGE_SIZE),
    initialData: page === 1 ? initialData : undefined,
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  });

  const bookings = data?.data || [];
  const totalPages = Math.ceil((data?.count || 0) / PAGE_SIZE);

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Hotel Bookings"
        description={`${data?.count || 0} total booking${data?.count !== 1 ? "s" : ""}`}
        action={
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Link href="/hotels">
              <Hotel className="h-4 w-4 mr-2" />
              Book Hotel
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Hotel}
          title="No hotel bookings yet"
          description="Browse our curated selection of hotels and make your first booking."
          actionLabel="Explore Hotels"
          actionHref="/hotels"
        />
      ) : (
        <>
          <div
            className={`space-y-4 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}
          >
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-purple-100 rounded-2xl overflow-hidden hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-40 h-32 sm:h-auto bg-purple-50 flex-shrink-0 overflow-hidden">
                    {booking.hotel?.images?.[0] ? (
                      <img
                        src={booking.hotel.images[0]}
                        alt={booking.hotel?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Hotel className="h-8 w-8 text-purple-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {booking.hotel?.name || "Hotel Booking"}
                          </h3>
                          {renderStars(booking.hotel?.star_rating)}
                        </div>
                        {booking.hotel?.city && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {booking.hotel.city}, {booking.hotel.state}
                          </p>
                        )}
                        {booking.room_type?.name && (
                          <p className="text-xs text-purple-600 font-medium mt-1 bg-purple-50 px-2 py-0.5 rounded-full inline-block">
                            {booking.room_type.name}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={booking.booking_status} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                      <div className="text-sm">
                        <p className="text-xs text-gray-400 mb-0.5">Check-in</p>
                        <p className="font-medium text-gray-700 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-purple-400" />
                          {format(
                            new Date(booking.check_in_date),
                            "MMM d, yyyy",
                          )}
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="text-xs text-gray-400 mb-0.5">
                          Check-out
                        </p>
                        <p className="font-medium text-gray-700 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-purple-400" />
                          {format(
                            new Date(booking.check_out_date),
                            "MMM d, yyyy",
                          )}
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="text-xs text-gray-400 mb-0.5">Guests</p>
                        <p className="font-medium text-gray-700 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-purple-400" />
                          {booking.adults} adult
                          {booking.adults !== 1 ? "s" : ""}
                          {booking.children > 0 &&
                            `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                      <Amount value={booking.total_price} size="lg" />
                      <div className="flex gap-2">
                        {booking.payment_status === "pending" && (
                          <Button
                            size="sm"
                            asChild
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Link
                              href={`/payments?hotel_booking=${booking.id}`}
                            >
                              Pay Now
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedId(booking.id)}
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          View Details
                        </Button>
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

      {selectedId && (
        <HotelBookingDetailModal
          bookingId={selectedId}
          userId={userId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
