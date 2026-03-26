"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  XCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { getBookingDetails } from "@/app/actions/customers";
import { StatusBadge, Amount } from "@/components/shared/customer/shared-ui";

export function HotelBookingDetailModal({ bookingId, userId, onClose }) {
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking-detail", "hotel", bookingId],
    queryFn: () => getBookingDetails("hotel", bookingId, userId),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
  });

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/hotel/${bookingId}/cancel`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to cancel booking");
        return;
      }
      toast.success(
        json.refund_initiated
          ? "Booking cancelled. A refund has been initiated to your original payment method."
          : "Booking cancelled successfully."
      );
      // Invalidate lists so dashboard reflects new status
      queryClient.invalidateQueries({ queryKey: ["hotel-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-detail", "hotel", bookingId] });
      setConfirmCancel(false);
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

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

            {/* Digital check-in QR code — show once payment is confirmed */}
            {booking.payment_status === "paid" &&
              booking.booking_status !== "cancelled" &&
              booking.check_in_code && (
                <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 text-center">
                  <p className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider mb-3">
                    Check-in Code
                  </p>
                  <div className="flex justify-center mb-3">
                    <div className="bg-white p-3 rounded-xl shadow-sm inline-block">
                      <QRCode
                        value={booking.check_in_code}
                        size={120}
                        fgColor="#4c1d95"
                      />
                    </div>
                  </div>
                  <p className="text-2xl font-bold tracking-[0.25em] text-gray-900 mb-1">
                    {booking.check_in_code}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Show this code at the front desk on arrival
                  </p>
                  {booking.checked_in && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Checked in
                    </div>
                  )}
                </div>
              )}

            {/* Airport transfer info */}
            {booking.airport_transfer && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                <span className="text-lg leading-none">🚗</span>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Airport Transfer Requested</p>
                  <p className="text-xs text-blue-700 mt-0.5 capitalize">
                    {booking.airport_transfer_type === "pickup"
                      ? "Airport → Hotel"
                      : booking.airport_transfer_type === "dropoff"
                      ? "Hotel → Airport"
                      : "Both ways"}
                  </p>
                  {booking.airport_transfer_notes && (
                    <p className="text-xs text-blue-600 mt-1">{booking.airport_transfer_notes}</p>
                  )}
                  <p className="text-xs text-blue-500 mt-1">The hotel will contact you to confirm arrangements.</p>
                </div>
              </div>
            )}

            {/* VAT Invoice download — confirmed/paid bookings */}
            {["confirmed", "checked_in", "completed", "pay_at_hotel"].includes(
              booking.booking_status
            ) && (
              <a
                href={`/api/bookings/hotel/invoice?booking_id=${booking.id}`}
                download
                className="flex items-center justify-center gap-2 w-full h-9 rounded-lg border border-purple-200 text-purple-700 text-sm font-medium hover:bg-purple-50 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Download VAT Invoice
              </a>
            )}

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

            {/* Cancel booking — only for cancellable statuses before check-in */}
            {!["cancelled", "checked_in", "checked_out", "no_show"].includes(
              booking.booking_status,
            ) && new Date(booking.check_in_date) >= new Date() && (
              <>
                {confirmCancel ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">
                        Are you sure? This action cannot be undone.
                        {booking.payment_status === "paid" &&
                          " A refund will be initiated to your original payment method."}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setConfirmCancel(false)}
                        disabled={cancelling}
                      >
                        Keep Booking
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleCancel}
                        disabled={cancelling}
                      >
                        {cancelling ? (
                          <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Cancelling…</>
                        ) : (
                          "Yes, Cancel"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={() => setConfirmCancel(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </Button>
                )}
              </>
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
