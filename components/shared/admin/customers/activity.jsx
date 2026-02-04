// components/shared/admin/customers/activity.jsx
import { formatCurrency, formatDate } from "@/lib/util";
import { TrendingUp, Calendar } from "lucide-react";

export function CustomerActivity({ customerId, analytics }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Activity Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Total Activity</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {analytics?.totalBookings || 0} bookings
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Worth {formatCurrency(analytics?.totalSpent || 0)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Last Active</span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {analytics?.lastBookingDate
                ? formatDate(analytics.lastBookingDate, "time")
                : "No activity yet"}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center py-12 text-gray-500">
        <p>Detailed activity timeline coming soon</p>
      </div>
    </div>
  );
}
