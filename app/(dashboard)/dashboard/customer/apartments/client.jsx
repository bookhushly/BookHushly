"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { Building2, MapPin, Calendar, Users, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getApartmentBookings } from "@/app/actions/customers";
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  CardSkeleton,
  Pagination,
  Amount,
} from "@/components/shared/customer/shared-ui";

export function ApartmentBookingsClient({ userId, initialData }) {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const PAGE_SIZE = 10;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["apartment-bookings", userId, page],
    queryFn: () => getApartmentBookings(userId, page, PAGE_SIZE),
    initialData: page === 1 ? initialData : undefined,
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  });

  const bookings = data?.data || [];
  const totalPages = Math.ceil((data?.count || 0) / PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Apartment Bookings"
        description={`${data?.count || 0} total`}
        action={
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Link href="/apartments">
              <Building2 className="h-4 w-4 mr-2" />
              Browse Apartments
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <CardSkeleton />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No apartment bookings yet"
          description="Find the perfect serviced apartment for your stay."
          actionLabel="Browse Apartments"
          actionHref="/apartments"
        />
      ) : (
        <>
          <div className={`space-y-4 ${isFetching ? "opacity-60" : ""}`}>
            {bookings.map((booking) => {
              const nights = differenceInDays(
                new Date(booking.check_out_date),
                new Date(booking.check_in_date),
              );
              return (
                <div
                  key={booking.id}
                  className="bg-white border border-purple-100 rounded-2xl overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-40 h-32 sm:h-auto bg-purple-50 flex-shrink-0 overflow-hidden">
                      {booking.apartment?.images?.[0] ? (
                        <img
                          src={booking.apartment.images[0]}
                          alt={booking.apartment?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-purple-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {booking.apartment?.name || "Apartment"}
                          </h3>
                          {booking.apartment?.city && (
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {booking.apartment.city},{" "}
                              {booking.apartment.state}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={booking.booking_status} />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Check-in</p>
                          <p className="font-medium text-gray-700">
                            {format(new Date(booking.check_in_date), "MMM d")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Check-out</p>
                          <p className="font-medium text-gray-700">
                            {format(new Date(booking.check_out_date), "MMM d")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Duration</p>
                          <p className="font-medium text-gray-700 flex items-center gap-1">
                            <Moon className="h-3.5 w-3.5 text-purple-400" />
                            {nights} night{nights !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Guests</p>
                          <p className="font-medium text-gray-700 flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-purple-400" />
                            {booking.number_of_guests}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                        <div>
                          <Amount value={booking.total_amount} size="lg" />
                          <p className="text-xs text-gray-400">
                            ₦
                            {parseFloat(
                              booking.price_per_night || 0,
                            ).toLocaleString()}
                            /night
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {booking.payment_status === "pending" && (
                            <Button
                              size="sm"
                              asChild
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Link
                                href={`/payments?apartment_booking=${booking.id}`}
                              >
                                Pay Now
                              </Link>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-200 text-purple-700 hover:bg-purple-50"
                            onClick={() => setSelectedId(booking.id)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
