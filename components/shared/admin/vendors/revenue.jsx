// components/admin/vendors/VendorRevenue.jsx
import { memo } from "react";
import { formatCurrency, formatDate } from "@/lib/util";
import { TrendingUp, DollarSign } from "lucide-react";
import { useVendorAnalytics } from "@/hooks/use-vendors";

export const VendorRevenue = memo(({ vendorId }) => {
  const { data: analytics, isLoading } = useVendorAnalytics(vendorId, true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  const revenue = analytics || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-100 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-medium text-gray-900 dark:text-white">
                {formatCurrency(revenue.totalRevenue || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-100 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
              <p className="text-2xl font-medium text-gray-900 dark:text-white">
                {revenue.totalBookings || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {revenue.hotelRevenue ||
      revenue.apartmentRevenue ||
      revenue.eventRevenue ? (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Revenue by Category
          </h3>
          <div className="space-y-3">
            {revenue.hotelRevenue > 0 && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Hotels</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {revenue.hotelBookings || 0} bookings
                  </p>
                </div>
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(revenue.hotelRevenue)}
                </span>
              </div>
            )}

            {revenue.apartmentRevenue > 0 && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Apartments</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {revenue.apartmentBookings || 0} bookings
                  </p>
                </div>
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(revenue.apartmentRevenue)}
                </span>
              </div>
            )}

            {revenue.eventRevenue > 0 && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Events</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {revenue.eventBookings || 0} bookings
                  </p>
                </div>
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(revenue.eventRevenue)}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No revenue data available
        </div>
      )}

      {revenue.listingsCount > 0 && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hotels</p>
              <p className="text-2xl font-medium text-gray-900 dark:text-white mt-1">
                {revenue.hotelsCount || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Apartments</p>
              <p className="text-2xl font-medium text-gray-900 dark:text-white mt-1">
                {revenue.apartmentsCount || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Events</p>
              <p className="text-2xl font-medium text-gray-900 dark:text-white mt-1">
                {revenue.eventsCount || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {revenue.lastBookingDate && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600">
            Last Booking: {formatDate(revenue.lastBookingDate, "time")}
          </p>
        </div>
      )}
    </div>
  );
});

VendorRevenue.displayName = "VendorRevenue";
