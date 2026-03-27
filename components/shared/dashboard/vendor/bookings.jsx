import { Badge, Calendar, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/customer/shared-ui";

const BookingsTab = ({filteredBookings}) => {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-medium text-slate-900 mb-1">
          Booking Requests
        </h2>
        <p className="text-slate-600 text-sm">
          Manage customer bookings and reservations
        </p>
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings yet"
          description="Booking requests will appear here once customers start reserving your services"
        />
      ) : (
        <Card className="bg-white/60 backdrop-blur-md border-slate-200/50 shadow-xl overflow-hidden">
          <ScrollArea className="h-[600px]">
            <table className="w-full">
              <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-sm border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Listing
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking, idx) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/50 transition-colors"
                    style={{
                      animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both`,
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {booking.listings?.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">
                        {booking.booking_date}
                      </div>
                      <div className="text-xs text-slate-500">
                        at {booking.booking_time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                          {booking.guests}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        ₦{booking.total_amount?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className="capitalize font-medium"
                      >
                        {booking.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

export default BookingsTab;
