// components/event-management-dashboard.jsx
"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  useEventListing,
  useEventBookings,
  useUpdateTicketCount,
} from "@/hooks/use-event-dashboard";
import {
  Users,
  Ticket,
  TrendingUp,
  Calendar,
  Search,
  Download,
  Edit2,
  Plus,
  Minus,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  ScanLine,
} from "lucide-react";

// ─── Status Helpers ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  confirmed: {
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  pending: {
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  completed: {
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle,
  },
  cancelled: {
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

const PAYMENT_STATUS_COLOR = {
  completed: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-gray-50 text-gray-700 border-gray-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    color: "bg-gray-50 text-gray-700 border-gray-200",
    icon: AlertCircle,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      <Icon className="w-4 h-4" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PaymentBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${PAYMENT_STATUS_COLOR[status] || PAYMENT_STATUS_COLOR.pending}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, iconBg, Icon, iconColor }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-200 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-sm mt-1">{sub}</p>}
        </div>
        <div
          className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

// ─── Ticket Editor ──────────────────────────────────────────────────────────
function TicketEditor({ current, onSave, onCancel, isSaving, error }) {
  const [count, setCount] = useState(current);

  const adjust = (delta) =>
    setCount((prev) => {
      const next = prev + delta;
      return next < 0 ? 0 : next;
    });

  return (
    <div className="flex-1">
      <p className="text-gray-600 text-sm font-medium mb-2">
        Remaining Tickets
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => adjust(-10)}
          disabled={isSaving}
          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
        >
          <Minus className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={() => adjust(-1)}
          disabled={isSaving}
          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
        >
          <Minus className="w-3 h-3 text-gray-700" />
        </button>
        <input
          type="number"
          value={count}
          disabled={isSaving}
          onChange={(e) => setCount(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-20 text-center text-2xl font-bold border-2 border-purple-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-40"
        />
        <button
          onClick={() => adjust(1)}
          disabled={isSaving}
          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
        >
          <Plus className="w-3 h-3 text-gray-700" />
        </button>
        <button
          onClick={() => adjust(10)}
          disabled={isSaving}
          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Error — only shown when the mutation actually fails */}
      {error && (
        <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onSave(count)}
          disabled={isSaving}
          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Remaining Tickets Card ─────────────────────────────────────────────────
function RemainingTicketsCard({
  listing,
  isEditing,
  setIsEditing,
  updateTickets,
}) {
  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-200 transition-colors">
        <TicketEditor
          current={listing.remaining_tickets}
          isSaving={updateTickets.isPending}
          error={updateTickets.error?.message}
          onSave={(newCount) => {
            updateTickets.mutate(newCount, {
              onSuccess: () => setIsEditing(false),
            });
          }}
          onCancel={() => {
            updateTickets.reset(); // clear any stuck error/pending state
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-200 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">
            Remaining Tickets
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {listing.remaining_tickets.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-purple-600 text-xs font-medium whitespace-nowrap"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Adjust
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
const EventManagementDashboard = () => {
  const { id: listingId } = useParams();

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: listing, isLoading: listingLoading } =
    useEventListing(listingId);
  const { data: bookings = [], isLoading: bookingsLoading } =
    useEventBookings(listingId);
  const updateTickets = useUpdateTicketCount(listingId);

  // ── UI State ────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditingTickets, setIsEditingTickets] = useState(false);

  // ── Derived / Memoised Stats ────────────────────────────────────────────
  const stats = useMemo(() => {
    const ticketsSold = bookings.reduce(
      (sum, b) => sum + (b.ticket_details?.quantity || b.guests || 0),
      0,
    );

    const paidBookings = bookings.filter(
      (b) => b.payment_status === "completed",
    );

    const revenue = paidBookings.reduce(
      (sum, b) => sum + parseFloat(b.total_amount || 0),
      0,
    );

    const scanned = bookings.reduce(
      (sum, b) => sum + (b.scanned_count || 0),
      0,
    );

    const ticketPackages = listing?.ticket_packages || [];
    const totalCreated =
      ticketPackages.reduce(
        (sum, pkg) => sum + (pkg.initial_quantity || 0),
        0,
      ) || ticketsSold + (listing?.remaining_tickets || 0);

    const soldPercent =
      totalCreated > 0 ? ((ticketsSold / totalCreated) * 100).toFixed(1) : 0;

    return {
      ticketsSold,
      paidBookings,
      revenue,
      scanned,
      totalCreated,
      soldPercent,
    };
  }, [bookings, listing]);

  // ── Filtered Bookings ──────────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!lower) return true;

      return (
        (b.users?.name || "").toLowerCase().includes(lower) ||
        (b.contact_email || "").toLowerCase().includes(lower) ||
        (b.contact_phone || "").includes(searchTerm)
      );
    });
  }, [bookings, searchTerm, statusFilter]);

  // ── Loading / Error ─────────────────────────────────────────────────────
  const isLoading = listingLoading || bookingsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Event not found</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
          <p className="text-gray-600 mt-1">{listing.location}</p>
          {listing.event_date && (
            <div className="flex items-center gap-2 text-gray-600 mt-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>
                {new Date(listing.event_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats + Bookings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            label="Total Tickets"
            value={stats.totalCreated.toLocaleString()}
            iconBg="bg-purple-50"
            Icon={Ticket}
            iconColor="text-purple-600"
          />

          <StatCard
            label="Tickets Sold"
            value={stats.ticketsSold.toLocaleString()}
            sub={
              <span className="text-purple-600 font-medium">
                {stats.soldPercent}% sold
              </span>
            }
            iconBg="bg-green-50"
            Icon={TrendingUp}
            iconColor="text-green-600"
          />

          <RemainingTicketsCard
            listing={listing}
            isEditing={isEditingTickets}
            setIsEditing={setIsEditingTickets}
            updateTickets={updateTickets}
          />

          <StatCard
            label="Total Revenue"
            value={`₦${stats.revenue.toLocaleString()}`}
            sub={
              <span className="text-gray-500">
                {stats.paidBookings.length} paid bookings
              </span>
            }
            iconBg="bg-blue-50"
            Icon={Users}
            iconColor="text-blue-600"
          />

          <StatCard
            label="Scanned Tickets"
            value={stats.scanned.toLocaleString()}
            sub={
              stats.ticketsSold > 0 && (
                <span className="text-gray-500">
                  {((stats.scanned / stats.ticketsSold) * 100).toFixed(1)}% of
                  sold
                </span>
              )
            }
            iconBg="bg-emerald-50"
            Icon={ScanLine}
            iconColor="text-emerald-600"
          />
        </div>

        {/* Bookings Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Event Bookings
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {bookings.length} total bookings
                </p>
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 self-start sm:self-auto">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No bookings found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Bookings will appear here once customers register"}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      "Customer",
                      "Contact",
                      "Date",
                      "Tickets",
                      "Amount",
                      "Status",
                      "Payment",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-700 font-semibold text-sm">
                              {(
                                booking.users?.name ||
                                booking.contact_email ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.users?.name || "Guest User"}
                            </p>
                            {booking.ticket_details?.package && (
                              <p className="text-xs text-gray-500">
                                {booking.ticket_details.package} Package
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{booking.contact_email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{booking.contact_phone}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(booking.booking_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                          {booking.ticket_details?.quantity || booking.guests}{" "}
                          tickets
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ₦{parseFloat(booking.total_amount).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={booking.status} />
                      </td>

                      <td className="px-6 py-4">
                        <PaymentBadge status={booking.payment_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagementDashboard;
