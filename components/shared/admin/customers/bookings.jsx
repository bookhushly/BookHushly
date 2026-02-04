// components/shared/admin/customers/bookings.jsx
import { useCustomerBookings } from "@/hooks/use-customers";
import { Badge } from "@/components/ui/badge";
import { Building2, Home, Calendar as CalendarIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/util";

export function CustomerBookings({ customerId }) {
  const { data: bookings, isLoading } = useCustomerBookings(customerId, true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!bookings || bookings.total === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No bookings found for this customer
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
      confirmed: { bg: "bg-blue-100", text: "text-blue-800" },
      completed: { bg: "bg-green-100", text: "text-green-800" },
      cancelled: { bg: "bg-red-100", text: "text-red-800" },
      checked_in: { bg: "bg-purple-100", text: "text-purple-800" },
      checked_out: { bg: "bg-gray-100", text: "text-gray-800" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant="outline" className={`${config.bg} ${config.text}`}>
        {status?.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {bookings.hotels.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hotel Bookings ({bookings.hotels.length})
          </h3>
          <div className="space-y-3">
            {bookings.hotels.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <Building2 className="w-5 h-5 text-gray-600 mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">
                        {booking.hotels?.name || "Hotel"}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.hotels?.city}, {booking.hotels?.state}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(booking.check_in_date)} -{" "}
                        {formatDate(booking.check_out_date)}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        {formatCurrency(booking.total_price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 sm:items-end">
                    {getStatusBadge(booking.booking_status)}
                    <Badge
                      variant="outline"
                      className={
                        booking.payment_status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {booking.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bookings.apartments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Apartment Bookings ({bookings.apartments.length})
          </h3>
          <div className="space-y-3">
            {bookings.apartments.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <Home className="w-5 h-5 text-gray-600 mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">
                        {booking.serviced_apartments?.name || "Apartment"}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.serviced_apartments?.city},{" "}
                        {booking.serviced_apartments?.state}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(booking.check_in_date)} -{" "}
                        {formatDate(booking.check_out_date)}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        {formatCurrency(booking.total_amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 sm:items-end">
                    {getStatusBadge(booking.booking_status)}
                    <Badge
                      variant="outline"
                      className={
                        booking.payment_status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {booking.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bookings.events.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Event Bookings ({bookings.events.length})
          </h3>
          <div className="space-y-3">
            {bookings.events.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <CalendarIcon className="w-5 h-5 text-gray-600 mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">
                        {booking.listings?.title || "Event"}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.listings?.location}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(booking.booking_date)}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        {formatCurrency(booking.total_amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 sm:items-end">
                    {getStatusBadge(booking.status)}
                    <Badge
                      variant="outline"
                      className={
                        booking.payment_status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {booking.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
