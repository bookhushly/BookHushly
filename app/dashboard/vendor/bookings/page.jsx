"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuthStore, useBookingStore } from "@/lib/store";
import { getBooking, getBookings, updateBookingStatus } from "@/lib/database";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

export default function VendorBookingsPage() {
  const { user } = useAuthStore();
  const { bookings, setBookings } = useBookingStore();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await getBookings(user.id, "vendor");

        if (error) {
          console.error("Bookings error:", error);
          toast.error("Failed to load bookings");
        } else {
          setBookings(data || []);
        }
      } catch (error) {
        console.error("Load bookings error:", error);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user, setBookings]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setActionLoading(bookingId);

    try {
      const { data, error } = await updateBookingStatus(bookingId, newStatus);

      if (error) {
        toast.error("Failed to update booking status");
        return;
      }

      // Update local state
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );

      toast.success(`Booking ${newStatus}!`, {
        description: `The customer has been notified of the status change`,
      });
    } catch (error) {
      toast.error("Failed to update booking status");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActionButtons = (booking) => {
    switch (booking.status) {
      case "pending":
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(booking.id, "confirmed")}
              disabled={actionLoading === booking.id}
            >
              {actionLoading === booking.id ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate(booking.id, "cancelled")}
              disabled={actionLoading === booking.id}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </div>
        );
      case "confirmed":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate(booking.id, "completed")}
            disabled={actionLoading === booking.id}
          >
            {actionLoading === booking.id ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Complete
              </>
            )}
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <AuthGuard requiredRole="vendor">
      <div className="container py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/vendor"
            replace
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Booking Requests</h1>
          <p className="text-muted-foreground">
            Manage your incoming booking requests and confirmed bookings
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter((b) => b.status === "pending").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter((b) => b.status === "confirmed").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter((b) => b.status === "completed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No booking requests yet
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Booking requests will appear here once customers start booking
                your services
              </p>
              <Button asChild>
                <Link href="/dashboard/vendor/listings/create">
                  Create More Listings
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pending Bookings */}
            {bookings.filter((b) => b.status === "pending").length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                  Pending Requests (
                  {bookings.filter((b) => b.status === "pending").length})
                </h2>
                <div className="space-y-4">
                  {bookings
                    .filter((b) => b.status === "pending")
                    .map((booking) => (
                      <Card
                        key={booking.id}
                        className="border-yellow-200 bg-yellow-50/50"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {booking.listings?.title}
                              </CardTitle>
                              <CardDescription>
                                Booking request from customer
                              </CardDescription>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">
                                {booking.status}
                              </span>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                {format(new Date(booking.booking_date), "PPP")}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{booking.booking_time}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <User className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                {booking.guests} guest
                                {booking.guests > 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                ₦{booking.total_amount?.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{booking.contact_phone}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{booking.contact_email}</span>
                            </div>
                          </div>

                          {booking.special_requests && (
                            <div className="mb-4">
                              <h5 className="font-medium text-sm mb-1">
                                Special Requests:
                              </h5>
                              <p className="text-sm text-muted-foreground bg-white p-3 rounded border">
                                {booking.special_requests}
                              </p>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <div className="text-xs text-muted-foreground">
                              Requested{" "}
                              {format(new Date(booking.created_at), "PPp")}
                            </div>
                            {getActionButtons(booking)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Confirmed Bookings */}
            {bookings.filter((b) => b.status === "confirmed").length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Confirmed Bookings (
                  {bookings.filter((b) => b.status === "confirmed").length})
                </h2>
                <div className="space-y-4">
                  {bookings
                    .filter((b) => b.status === "confirmed")
                    .map((booking) => (
                      <Card
                        key={booking.id}
                        className="border-purple-200 bg-purple-50/50"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {booking.listings?.title}
                              </CardTitle>
                              <CardDescription>
                                Confirmed booking - ready to serve
                              </CardDescription>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">
                                {booking.status}
                              </span>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                {format(new Date(booking.booking_date), "PPP")}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{booking.booking_time}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <User className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                {booking.guests} guest
                                {booking.guests > 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                ₦{booking.total_amount?.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                <span>{booking.contact_phone}</span>
                              </div>
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                <span>{booking.contact_email}</span>
                              </div>
                            </div>
                            {getActionButtons(booking)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Completed Bookings */}
            {bookings.filter((b) => b.status === "completed").length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Completed Bookings (
                  {bookings.filter((b) => b.status === "completed").length})
                </h2>
                <div className="space-y-4">
                  {bookings
                    .filter((b) => b.status === "completed")
                    .map((booking) => (
                      <Card
                        key={booking.id}
                        className="border-green-200 bg-green-50/50"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {booking.listings?.title}
                              </CardTitle>
                              <CardDescription>
                                Service completed successfully
                              </CardDescription>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">
                                {booking.status}
                              </span>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                {format(new Date(booking.booking_date), "PPP")}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{booking.booking_time}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <User className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                {booking.guests} guest
                                {booking.guests > 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                ₦{booking.total_amount?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
