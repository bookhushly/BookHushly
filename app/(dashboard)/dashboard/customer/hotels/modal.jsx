"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Hotel,
  MapPin,
  Calendar,
  Users,
  Phone,
  Mail,
  X,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getBookingDetails } from "@/app/actions/customers";
import { StatusBadge, Amount } from "@/components/shared/customer/shared-ui";

export function HotelBookingDetailModal({ bookingId, userId, onClose }) {
  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking-detail", "hotel", bookingId],
    queryFn: () => getBookingDetails("hotel", bookingId, userId),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Dialog open={!!bookingId} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hotel className="h-5 w-5 text-purple-600" />
            Hotel Booking Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        ) : booking ? (
          <div className="space-y-5">
            {/* Hotel Info */}
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900">
                {booking.hotel?.name}
              </h3>
              {booking.hotel?.city && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-purple-400" />
                  {booking.hotel.city}, {booking.hotel.state}
                </p>
              )}
              {booking.room_type?.name && (
                <span className="text-xs text-purple-700 font-medium bg-purple-100 px-2 py-0.5 rounded-full mt-2 inline-block">
                  {booking.room_type.name}
                </span>
              )}
            </div>

            {/* Status + Amount */}
            <div className="flex items-center justify-between">
              <StatusBadge status={booking.booking_status} />
              <Amount value={booking.total_price} size="lg" />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Check-in</p>
                <p className="text-sm font-semibold text-gray-900">
                  {format(new Date(booking.check_in_date), "EEE, MMM d yyyy")}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Check-out</p>
                <p className="text-sm font-semibold text-gray-900">
                  {format(new Date(booking.check_out_date), "EEE, MMM d yyyy")}
                </p>
              </div>
            </div>

            {/* Guest details */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                Guest Details
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span>
                    {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
                    {booking.children > 0 && ` · ${booking.children} children`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 text-purple-400" />
                  <span>{booking.guest_email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4 text-purple-400" />
                  <span>{booking.guest_phone}</span>
                </div>
              </div>
            </div>

            {/* Special requests */}
            {booking.special_requests && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">
                  Special Requests
                </p>
                <p className="text-sm text-amber-800">
                  {booking.special_requests}
                </p>
              </div>
            )}

            {/* Payment status */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <span className="text-sm text-gray-600">Payment Status</span>
              <span
                className={`text-sm font-semibold ${
                  booking.payment_status === "completed"
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              >
                {booking.payment_status === "completed" ? "Paid" : "Pending"}
              </span>
            </div>

            {/* Actions */}
            {booking.payment_status === "pending" && (
              <Button
                asChild
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Link href={`/payments?hotel_booking=${booking.id}`}>
                  Complete Payment
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            Unable to load booking details.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
