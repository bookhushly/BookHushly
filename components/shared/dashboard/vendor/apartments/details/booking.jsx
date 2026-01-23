"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700",
    icon: CheckCircle2,
  },
  checked_in: {
    label: "Checked In",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  checked_out: {
    label: "Checked Out",
    color: "bg-gray-100 text-gray-700",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  no_show: {
    label: "No Show",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  paid: { label: "Paid", color: "bg-green-100 text-green-700" },
  failed: { label: "Failed", color: "bg-red-100 text-red-700" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-700" },
  partially_refunded: {
    label: "Partially Refunded",
    color: "bg-orange-100 text-orange-700",
  },
};

export default function BookingsTab({ apartmentId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, active, past
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchBookings();
  }, [apartmentId]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("apartment_bookings")
        .select(
          `
          id,
          apartment_id,
          user_id,
          check_in_date,
          check_out_date,
          number_of_nights,
          number_of_guests,
          price_per_night,
          subtotal,
          service_fee,
          caution_deposit,
          total_amount,
          guest_name,
          guest_email,
          guest_phone,
          special_requests,
          payment_status,
          payment_method,
          payment_reference,
          payment_date,
          booking_status,
          checked_in_at,
          checked_out_at,
          cancelled_at,
          cancellation_reason,
          refund_amount,
          refund_status,
          created_at,
          updated_at
        `
        )
        .eq("apartment_id", apartmentId)
        .order("check_in_date", { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from("apartment_bookings")
        .update({ booking_status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      toast.success(`Booking ${newStatus}`);
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    }
  };

  // Filter bookings based on selected filter
  const getFilteredBookings = () => {
    const now = new Date();
    let filtered = bookings;

    // Apply status filter
    if (filter === "upcoming") {
      filtered = bookings.filter(
        (b) =>
          new Date(b.check_in_date) > now &&
          ["confirmed", "pending"].includes(b.booking_status)
      );
    } else if (filter === "active") {
      filtered = bookings.filter(
        (b) =>
          b.booking_status === "checked_in" ||
          (new Date(b.check_in_date) <= now &&
            new Date(b.check_out_date) >= now &&
            b.booking_status === "confirmed")
      );
    } else if (filter === "past") {
      filtered = bookings.filter(
        (b) =>
          new Date(b.check_out_date) < now ||
          b.booking_status === "checked_out" ||
          b.booking_status === "cancelled"
      );
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.guest_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredBookings = getFilteredBookings();

  // Calculate statistics
  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(
      (b) =>
        new Date(b.check_in_date) > new Date() &&
        ["confirmed", "pending"].includes(b.booking_status)
    ).length,
    active: bookings.filter((b) => b.booking_status === "checked_in").length,
    revenue: bookings
      .filter((b) => b.payment_status === "paid")
      .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.upcoming}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₦{stats.revenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Bookings Management
            </CardTitle>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              {/* Filter */}
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active Now</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Try adjusting your search"
                  : filter === "all"
                    ? "You don't have any bookings yet"
                    : `No ${filter} bookings`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const statusConfig = STATUS_CONFIG[booking.booking_status];
                const paymentConfig =
                  PAYMENT_STATUS_CONFIG[booking.payment_status];
                const StatusIcon = statusConfig?.icon || Clock;

                return (
                  <Card key={booking.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Booking Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-lg text-gray-900">
                                  {booking.guest_name}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className={statusConfig?.color}
                                >
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig?.label}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className={paymentConfig?.color}
                                >
                                  {paymentConfig?.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 font-mono">
                                ID: {booking.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="h-4 w-4" />
                              {booking.guest_email}
                            </div>
                            {booking.guest_phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-4 w-4" />
                                {booking.guest_phone}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4" />
                              {booking.number_of_guests} guest(s)
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {booking.number_of_nights} night(s)
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Check-in:</span>
                              <span className="font-semibold ml-2">
                                {new Date(
                                  booking.check_in_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Check-out:</span>
                              <span className="font-semibold ml-2">
                                {new Date(
                                  booking.check_out_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Total:</span>
                              <span className="font-bold text-purple-600 ml-2">
                                ₦
                                {parseFloat(
                                  booking.total_amount
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {booking.special_requests && (
                            <div className="text-sm">
                              <span className="text-gray-600">
                                Special requests:
                              </span>
                              <p className="text-gray-800 mt-1">
                                {booking.special_requests}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 lg:w-40">
                          {booking.booking_status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateBookingStatus(booking.id, "confirmed")
                                }
                                className="w-full"
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateBookingStatus(booking.id, "cancelled")
                                }
                                className="w-full"
                              >
                                Decline
                              </Button>
                            </>
                          )}

                          {booking.booking_status === "confirmed" &&
                            new Date(booking.check_in_date) <= new Date() && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateBookingStatus(booking.id, "checked_in")
                                }
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                Check In
                              </Button>
                            )}

                          {booking.booking_status === "checked_in" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateBookingStatus(booking.id, "checked_out")
                              }
                              className="w-full bg-gray-600 hover:bg-gray-700"
                            >
                              Check Out
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
