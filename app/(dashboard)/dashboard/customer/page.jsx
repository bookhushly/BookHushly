"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/shared/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore, useBookingStore } from "@/lib/store";
import {
  Calendar,
  Heart,
  User,
  Star,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Settings,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { getBookings } from "@/lib/database";
import { BookingDetailsModal } from "@/components/BookingDetailsModal";

// Stats Card Component
const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
}) => {
  const variants = {
    default: "bg-white border-purple-100",
    primary: "bg-purple-600 text-white border-purple-600",
    secondary: "bg-purple-50 border-purple-200",
  };

  const iconVariants = {
    default: "bg-purple-50 text-purple-600",
    primary: "bg-white/20 text-white",
    secondary: "bg-purple-100 text-purple-700",
  };

  const textColor =
    variant === "primary"
      ? "text-white"
      : variant === "secondary"
        ? "text-purple-900"
        : "text-gray-900";
  const descColor =
    variant === "primary"
      ? "text-purple-100"
      : variant === "secondary"
        ? "text-purple-700"
        : "text-gray-500";

  return (
    <div
      className={`border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${variants[variant]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className={`text-sm font-medium mb-1 ${descColor}`}>{title}</p>
          <h3 className={`text-3xl font-bold ${textColor}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconVariants[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className={`text-sm ${descColor}`}>{description}</p>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, onClick, href }) => {
  const content = (
    <>
      <div className="p-3 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
        <Icon className="h-5 w-5 text-purple-600" />
      </div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 group"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 group"
    >
      {content}
    </button>
  );
};

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const { bookings, setBookings } = useBookingStore();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasShownWelcomeToast, setHasShownWelcomeToast] = useState(false);

  useEffect(() => {
    const loadCustomerData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const toastShown = localStorage.getItem(
          `customer-welcome-toast-${user.id}`
        );
        setHasShownWelcomeToast(!!toastShown);

        const { data, error } = await getBookings(user.id, "customer");
        if (error) {
          toast.error("Failed to fetch bookings");
          console.error("Fetch bookings error:", error);
          return;
        }

        setBookings(data || []);

        const total = data?.length || 0;
        const pending = data?.filter((b) => b.status === "pending").length || 0;
        const confirmed =
          data?.filter((b) => b.status === "confirmed").length || 0;
        const completed =
          data?.filter((b) => b.status === "completed").length || 0;

        setStats({
          totalBookings: total,
          pendingBookings: pending,
          confirmedBookings: confirmed,
          completedBookings: completed,
        });

        if (!toastShown) {
          toast.success(
            `Welcome back, ${user?.user_metadata?.name || "Customer"}!`
          );
          localStorage.setItem(`customer-welcome-toast-${user.id}`, "true");
          setHasShownWelcomeToast(true);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error("Something went wrong loading dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, [user, setBookings]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-50 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
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

  const handleViewDetails = (bookingId) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBookingId(null);
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="customer">
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <LoadingSpinner className="h-8 w-8 text-purple-600" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="customer">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.user_metadata?.name || "Customer"}!
            </h2>
            <p className="text-gray-600">
              Here's what's happening with your account today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Bookings"
              value={stats.totalBookings}
              description="All time bookings"
              icon={Calendar}
              variant="primary"
            />
            <StatsCard
              title="Pending"
              value={stats.pendingBookings}
              description="Awaiting confirmation"
              icon={Clock}
              variant="default"
            />
            <StatsCard
              title="Confirmed"
              value={stats.confirmedBookings}
              description="Ready to go"
              icon={CheckCircle}
              variant="secondary"
            />
            <StatsCard
              title="Completed"
              value={stats.completedBookings}
              description="Finished services"
              icon={Star}
              variant="default"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-gray-200">
            {["Overview", "Bookings", "Favorites", "Profile"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-6 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.toLowerCase()
                    ? "bg-purple-600 text-white"
                    : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Based on Active Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                <div className="bg-white border border-purple-100 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <QuickActionButton
                      icon={Calendar}
                      label="Book Service"
                      href="/services"
                    />
                    <QuickActionButton
                      icon={Heart}
                      label="Favorites"
                      onClick={() => setActiveTab("favorites")}
                    />
                    <QuickActionButton
                      icon={Star}
                      label="My Bookings"
                      onClick={() => setActiveTab("bookings")}
                    />
                    <QuickActionButton
                      icon={User}
                      label="Profile"
                      onClick={() => setActiveTab("profile")}
                    />
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white border border-purple-100 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Bookings
                    </h3>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      View All
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  {bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500 mb-4">
                        No bookings yet
                      </p>
                      <Button
                        asChild
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Link href="/services">Browse Services</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 3).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 border border-purple-100 rounded-xl hover:bg-purple-50 transition-all cursor-pointer"
                          onClick={() => handleViewDetails(booking.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {booking.listings?.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {format(new Date(booking.booking_date), "PPP")}
                            </p>
                          </div>
                          <Badge
                            className={`${getStatusColor(booking.status)} ml-4`}
                          >
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">
                              {booking.status}
                            </span>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Account Summary */}
                <div className="bg-white border border-purple-100 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Account Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                      <span className="text-sm text-gray-700">
                        Active Bookings
                      </span>
                      <span className="font-semibold text-gray-900">
                        {stats.confirmedBookings + stats.pendingBookings}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                      <span className="text-sm text-gray-700">Completed</span>
                      <span className="font-semibold text-gray-900">
                        {stats.completedBookings}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Booking Preview */}
                {bookings.length > 0 && bookings[0] && (
                  <div className="bg-purple-600 text-white rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5" />
                      <span className="text-sm font-medium">Next Booking</span>
                    </div>
                    <h4 className="font-semibold mb-2">
                      {bookings[0].listings?.title}
                    </h4>
                    <p className="text-sm text-purple-100 mb-4">
                      {format(new Date(bookings[0].booking_date), "PPP")}
                    </p>
                    <button
                      onClick={() => handleViewDetails(bookings[0].id)}
                      className="w-full bg-white text-purple-600 py-2 px-4 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  My Bookings
                </h2>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/services">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book New Service
                  </Link>
                </Button>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-white border border-purple-100 rounded-2xl p-12 text-center">
                  <Calendar className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start exploring our services and make your first booking
                  </p>
                  <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <Link href="/services">Browse Services</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white border border-purple-100 rounded-2xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {booking.listings?.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                by {booking.listings?.vendor_name}
                              </p>
                            </div>
                            <Badge
                              className={`${getStatusColor(booking.status)}`}
                            >
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">
                                {booking.status}
                              </span>
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mt-4">
                            <div>
                              <span className="font-medium">Date:</span>{" "}
                              {format(new Date(booking.booking_date), "PPP")}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span>{" "}
                              {booking.booking_time}
                            </div>
                            <div>
                              <span className="font-medium">Guests:</span>{" "}
                              {booking.guests}
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-lg font-semibold text-gray-900">
                              ₦{booking.total_amount?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(booking.id)}
                            className="border-purple-200 hover:bg-purple-50 text-purple-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {booking.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-200 hover:bg-purple-50 text-purple-700"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          )}
                          {booking.status === "confirmed" && (
                            <Button
                              size="sm"
                              asChild
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Link
                                href={`/payments?booking=${booking.id}&reference=${booking.payment_reference}`}
                              >
                                Pay Now
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="bg-white border border-purple-100 rounded-2xl p-12 text-center">
              <Heart className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 mb-6">
                Save services you love to easily find them later
              </p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/services">Browse Services</Link>
              </Button>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-purple-100 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <p className="text-gray-900 mt-1">
                      {user?.user_metadata?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="text-gray-900 mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <p className="text-gray-900 mt-1">Customer</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-purple-200 hover:bg-purple-50 text-purple-700"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <BookingDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          bookingId={selectedBookingId}
        />
      </div>
    </AuthGuard>
  );
}
