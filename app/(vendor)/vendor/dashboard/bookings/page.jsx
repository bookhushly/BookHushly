"use client";

import { useMemo } from "react";
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
import { useAuth } from "@/hooks/use-auth";
import {
  useVendorBookings,
  useUpdateBookingStatus,
} from "@/hooks/use-bookings";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

export default function VendorBookingsPage() {
  const { data: authData } = useAuth();
  const user = authData?.user;

  // Fetch bookings with React Query
  const { data: bookings = [], isLoading, error } = useVendorBookings(user?.id);

  // Update status mutation
  const updateStatusMutation = useUpdateBookingStatus();

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
    };
  }, [bookings]);

  // Group bookings by status
  const groupedBookings = useMemo(() => {
    return {
      pending: bookings.filter((b) => b.status === "pending"),
      confirmed: bookings.filter((b) => b.status === "confirmed"),
      completed: bookings.filter((b) => b.status === "completed"),
    };
  }, [bookings]);

  const handleStatusUpdate = (bookingId, newStatus) => {
    updateStatusMutation.mutate(
      { bookingId, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Booking ${newStatus}!`, {
            description: "The customer has been notified of the status change",
          });
        },
        onError: (error) => {
          toast.error("Failed to update booking status", {
            description: error.message,
          });
        },
      },
    );
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
    const isUpdating =
      updateStatusMutation.isPending &&
      updateStatusMutation.variables?.bookingId === booking.id;

    switch (booking.status) {
      case "pending":
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(booking.id, "confirmed")}
              disabled={isUpdating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isUpdating ? (
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
              disabled={isUpdating}
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
            disabled={isUpdating}
          >
            {isUpdating ? (
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

  const renderBookingCard = (booking) => (
    <Card
      key={booking.id}
      className={
        booking.status === "pending"
          ? "border-yellow-200 bg-yellow-50/50"
          : booking.status === "confirmed"
            ? "border-purple-200 bg-purple-50/50"
            : "border-green-200 bg-green-50/50"
      }
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{booking.listings?.title}</CardTitle>
            <CardDescription>
              {booking.status === "pending"
                ? "Booking request from customer"
                : booking.status === "confirmed"
                  ? "Confirmed booking - ready to serve"
                  : "Service completed successfully"}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {getStatusIcon(booking.status)}
            <span className="ml-1 capitalize">{booking.status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{format(new Date(booking.booking_date), "PPP")}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{booking.booking_time}</span>
          </div>
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              {booking.guests} guest{booking.guests > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>₦{booking.total_amount?.toLocaleString()}</span>
          </div>
        </div>

        {booking.status === "pending" && (
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
        )}

        {booking.status === "confirmed" && (
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              <span>{booking.contact_phone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              <span>{booking.contact_email}</span>
            </div>
          </div>
        )}

        {booking.special_requests && booking.status === "pending" && (
          <div className="mb-4">
            <h5 className="font-medium text-sm mb-1">Special Requests:</h5>
            <p className="text-sm text-muted-foreground bg-white p-3 rounded border">
              {booking.special_requests}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center">
          {booking.status !== "completed" && (
            <div className="text-xs text-muted-foreground">
              Requested {format(new Date(booking.created_at), "PPp")}
            </div>
          )}
          {getActionButtons(booking)}
        </div>
      </CardContent>
    </Card>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load bookings. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link
          href="/vendor/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
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
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
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
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/vendor/dashboard/listings/create">
                Create More Listings
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending Bookings */}
          {groupedBookings.pending.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                Pending Requests ({groupedBookings.pending.length})
              </h2>
              <div className="space-y-4">
                {groupedBookings.pending.map(renderBookingCard)}
              </div>
            </div>
          )}

          {/* Confirmed Bookings */}
          {groupedBookings.confirmed.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                Confirmed Bookings ({groupedBookings.confirmed.length})
              </h2>
              <div className="space-y-4">
                {groupedBookings.confirmed.map(renderBookingCard)}
              </div>
            </div>
          )}

          {/* Completed Bookings */}
          {groupedBookings.completed.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Completed Bookings ({groupedBookings.completed.length})
              </h2>
              <div className="space-y-4">
                {groupedBookings.completed.map(renderBookingCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
