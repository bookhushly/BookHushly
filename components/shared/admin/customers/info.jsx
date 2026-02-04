// components/shared/admin/customers/info.jsx
import { formatCurrency, formatDate } from "@/lib/util";
import { ShoppingBag, DollarSign, Calendar, TrendingUp } from "lucide-react";

export function CustomerInfo({ customer, analytics }) {
  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-medium">Total Bookings</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {analytics?.totalBookings || 0}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">Total Spent</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(analytics?.totalSpent || 0)}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Avg Booking</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(
              analytics?.totalBookings > 0
                ? analytics.totalSpent / analytics.totalBookings
                : 0,
            )}
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Last Booking</span>
          </div>
          <p className="text-sm font-bold text-gray-900">
            {analytics?.lastBookingDate
              ? formatDate(analytics.lastBookingDate, "short")
              : "None"}
          </p>
        </div>
      </div>

      {/* Booking Breakdown */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Booking Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Hotels</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {analytics?.hotelBookings || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Apartments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {analytics?.apartmentBookings || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Events</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {analytics?.eventBookings || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Account Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-base text-gray-900 mt-1">{customer.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-base text-gray-900 mt-1 break-words">
              {customer.email}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Role</p>
            <p className="text-base text-gray-900 mt-1 capitalize">
              {customer.role}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Joined</p>
            <p className="text-base text-gray-900 mt-1">
              {formatDate(customer.created_at, "long")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
