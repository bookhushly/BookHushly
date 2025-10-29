"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Ticket,
  TrendingUp,
  Calendar,
  Search,
  Filter,
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
} from "lucide-react";

const EventManagementDashboard = () => {
  const params = useParams();
  const listingId = params.id;
  const supabase = createClient();

  const [listing, setListing] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditingTickets, setIsEditingTickets] = useState(false);
  const [tempTicketCount, setTempTicketCount] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [listingId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch listing details
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (listingError) throw listingError;
      setListing(listingData);
      setTempTicketCount(listingData.remaining_tickets);

      // Fetch bookings with customer details
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("event_bookings")
        .select(
          `
          *,
          users:customer_id (
            id,
            name,
            email
          )
        `
        )
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketCount = async (increment) => {
    const newCount = tempTicketCount + increment;
    if (newCount < 0) return;
    setTempTicketCount(newCount);
  };

  const saveTicketCount = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("listings")
        .update({ remaining_tickets: tempTicketCount })
        .eq("id", listingId);

      if (error) throw error;

      setListing({ ...listing, remaining_tickets: tempTicketCount });
      setIsEditingTickets(false);
    } catch (error) {
      console.error("Error updating tickets:", error);
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setTempTicketCount(listing.remaining_tickets);
    setIsEditingTickets(false);
  };

  // Calculate statistics
  const totalTicketsSold = bookings.reduce((sum, booking) => {
    const quantity = booking.ticket_details?.quantity || booking.guests || 0;
    return sum + quantity;
  }, 0);

  const ticketPackages = listing?.ticket_packages || [];
  const totalTicketsCreated =
    ticketPackages.reduce((sum, pkg) => sum + (pkg.initial_quantity || 0), 0) ||
    totalTicketsSold + (listing?.remaining_tickets || 0);

  const totalRevenue = bookings
    .filter((b) => b.payment_status === "completed")
    .reduce((sum, booking) => sum + parseFloat(booking.total_amount || 0), 0);

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      (booking.users?.name || booking.contact_email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contact_phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {listing.title}
              </h1>
              <p className="text-gray-600 mt-1">{listing.location}</p>
            </div>
            {listing.event_date && (
              <div className="flex items-center gap-2 text-gray-600">
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
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tickets Created */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-200 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Total Tickets
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalTicketsCreated.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Tickets Sold */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-200 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Tickets Sold
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalTicketsSold.toLocaleString()}
                </p>
                <p className="text-sm text-purple-600 mt-1 font-medium">
                  {((totalTicketsSold / totalTicketsCreated) * 100).toFixed(1)}%
                  sold
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Remaining Tickets */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-200 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Remaining Tickets
                </p>
                {isEditingTickets ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateTicketCount(-10)}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => updateTicketCount(-1)}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3 text-gray-700" />
                    </button>
                    <input
                      type="number"
                      value={tempTicketCount}
                      onChange={(e) =>
                        setTempTicketCount(parseInt(e.target.value) || 0)
                      }
                      className="w-20 text-center text-2xl font-bold border-2 border-purple-200 rounded-lg py-1"
                    />
                    <button
                      onClick={() => updateTicketCount(1)}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3 text-gray-700" />
                    </button>
                    <button
                      onClick={() => updateTicketCount(10)}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {listing.remaining_tickets.toLocaleString()}
                  </p>
                )}
                {isEditingTickets && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={saveTicketCount}
                      disabled={updating}
                      className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              {!isEditingTickets && (
                <button
                  onClick={() => setIsEditingTickets(true)}
                  className="w-12 h-12 bg-purple-50 hover:bg-purple-100 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Edit2 className="w-5 h-5 text-purple-600" />
                </button>
              )}
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-200 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  ₦{totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {
                    bookings.filter((b) => b.payment_status === "completed")
                      .length
                  }{" "}
                  paid bookings
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-200 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Total Scanned Tickets
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  ₦{totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {
                    bookings.filter((b) => b.payment_status === "completed")
                      .length
                  }{" "}
                  paid bookings
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
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
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Booking Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tickets
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment
                    </th>
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
                          }
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
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                            booking.payment_status === "completed"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : booking.payment_status === "failed"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : booking.payment_status === "refunded"
                                  ? "bg-gray-50 text-gray-700 border-gray-200"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {booking.payment_status.charAt(0).toUpperCase() +
                            booking.payment_status.slice(1)}
                        </span>
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
