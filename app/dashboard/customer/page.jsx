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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore, useBookingStore } from "@/lib/store";
import {
  Calendar,
  Heart,
  User,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ReviewForm } from "@/components/reviews/review-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { getBookings } from "@/lib/database";
import { BookingDetailsModal } from "@/components/BookingDetailsModal";

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

        // Check if welcome toast has been shown
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

        // Show welcome toast only once
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
  }, [user]);

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
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner className="h-6 w-6" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="customer">
      <div className="container py-4 sm:py-8 max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-brand-900">
            Customer Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back, {user?.user_metadata?.name || "Customer"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-medium rounded-3xl hover:shadow-hard hover:scale-105 transition-all duration-300 transform p-4 sm:p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {stats.totalBookings}
              </div>
              <p className="text-xs opacity-80">All time bookings</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-soft border border-brand-100 rounded-3xl hover:shadow-medium hover:scale-105 transition-all duration-300 transform glass p-4 sm:p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-brand-700">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-brand-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-brand-700">
                {stats.pendingBookings}
              </div>
              <p className="text-xs text-gray-500">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-medium rounded-3xl hover:shadow-hard hover:scale-105 transition-all duration-300 transform p-4 sm:p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Confirmed
              </CardTitle>
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {stats.confirmedBookings}
              </div>
              <p className="text-xs opacity-80">Ready to go</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-soft border border-brand-100 rounded-3xl hover:shadow-medium hover:scale-105 transition-all duration-300 transform glass p-4 sm:p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-brand-700">
                Completed
              </CardTitle>
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-brand-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-brand-700">
                {stats.completedBookings}
              </div>
              <p className="text-xs text-gray-500">Finished services</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4 sm:space-y-6"
        >
          <TabsList className="flex overflow-x-auto space-x-1 bg-brand-50 rounded-2xl p-1">
            <TabsTrigger
              value="overview"
              className="flex-1 min-w-[80px] rounded-xl text-xs sm:text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="flex-1 min-w-[80px] rounded-xl text-xs sm:text-sm"
            >
              My Bookings
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="flex-1 min-w-[80px] rounded-xl text-xs sm:text-sm"
            >
              Favorites
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex-1 min-w-[80px] rounded-xl text-xs sm:text-sm"
            >
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="space-y-4 sm:space-y-6 animate-fade-in"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="shadow-soft rounded-3xl hover:shadow-medium transition-all duration-300 p-4 sm:p-6">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Explore and book services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <Button
                    asChild
                    className="w-full justify-start btn-hospitality min-h-[44px] text-sm sm:text-base bg-brand-600 hover:bg-brand-700"
                  >
                    <Link href="/services">
                      <Calendar className="mr-2 h-4 w-4" />
                      Browse Services
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-brand-200 hover:border-brand-300 min-h-[44px] text-sm sm:text-base"
                    onClick={() => setActiveTab("favorites")}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    View Favorites
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-soft rounded-3xl hover:shadow-medium transition-all duration-300 p-4 sm:p-6">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">
                    Recent Bookings
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Your latest booking activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-brand-400 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        No bookings yet
                      </p>
                      <Button
                        asChild
                        className="bg-brand-600 hover:bg-brand-700 min-h-[44px] text-sm sm:text-base"
                      >
                        <Link href="/services">Browse Services</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {bookings.slice(0, 3).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between space-x-2 p-3 border border-brand-100 rounded-lg hover:bg-brand-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-medium truncate">
                              {booking.listings?.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {format(new Date(booking.booking_date), "PPP")}
                            </p>
                          </div>
                          <Badge
                            className={`${getStatusColor(booking.status)} text-xs sm:text-sm`}
                          >
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">
                              {booking.status}
                            </span>
                          </Badge>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full border-brand-200 hover:bg-brand-50 min-h-[44px] text-sm sm:text-base"
                        onClick={() => setActiveTab("bookings")}
                      >
                        View All Bookings
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent
            value="bookings"
            className="space-y-4 sm:space-y-6 animate-fade-in"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-900">
                My Bookings
              </h2>
              <Button
                asChild
                className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 min-h-[44px] text-sm sm:text-base"
              >
                <Link href="/services">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Book New Service</span>
                  <span className="xs:hidden">Book Service</span>
                </Link>
              </Button>
            </div>

            {bookings.length === 0 ? (
              <Card className="shadow-soft rounded-3xl p-4 sm:p-6">
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                  <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-brand-400 mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-brand-900">
                    No bookings yet
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md">
                    Start exploring our services and make your first booking
                  </p>
                  <Button
                    asChild
                    className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 min-h-[44px] text-sm sm:text-base"
                  >
                    <Link href="/services">Browse Services</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-4">
                  {bookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="shadow-soft rounded-2xl p-4 hover:shadow-medium transition-all duration-300"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-base font-medium truncate">
                            {booking.listings?.title}
                          </h3>
                          <Badge
                            className={`${getStatusColor(booking.status)} text-xs`}
                          >
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">
                              {booking.status}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          by {booking.listings?.vendor_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.booking_date), "PPP")} at{" "}
                          {booking.booking_time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.guests} guest{booking.guests > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm font-medium">
                          ₦{booking.total_amount?.toLocaleString()}
                        </p>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(booking.id)}
                            className="w-full border-brand-200 hover:bg-brand-50 min-h-[44px]"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {booking.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-brand-200 hover:bg-brand-50 min-h-[44px]"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          )}
                          {booking.status === "confirmed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="w-full bg-brand-600 hover:bg-brand-700 text-white border-brand-600 hover:border-brand-700 min-h-[44px]"
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
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="bg-white rounded-3xl shadow-soft min-w-full">
                    <thead>
                      <tr className="bg-brand-50">
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-brand-900">
                          Listing
                        </th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-brand-900">
                          Date & Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-brand-900">
                          Guests
                        </th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-brand-900">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-brand-900">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-brand-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="hover:bg-brand-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium">
                            {booking.listings?.title}
                            <p className="text-xs text-muted-foreground">
                              by {booking.listings?.vendor_name}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {format(new Date(booking.booking_date), "PPP")} at{" "}
                            {booking.booking_time}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {booking.guests}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            ₦{booking.total_amount?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={`${getStatusColor(booking.status)} text-xs sm:text-sm`}
                            >
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">
                                {booking.status}
                              </span>
                            </Badge>
                          </td>
                          <td className="px-4 py-3 flex flex-col xs:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(booking.id)}
                              className="border-brand-200 hover:bg-brand-50 min-h-[44px] text-xs sm:text-sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            {booking.status === "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-brand-200 hover:bg-brand-50 min-h-[44px] text-xs sm:text-sm"
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            )}
                            {booking.status === "confirmed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="bg-brand-600 hover:bg-brand-700 text-white border-brand-600 hover:border-brand-700 min-h-[44px] text-xs sm:text-sm"
                              >
                                <Link
                                  href={`/payments?booking=${booking.id}&reference=${booking.payment_reference}`}
                                >
                                  Pay Now
                                </Link>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <BookingDetailsModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              bookingId={selectedBookingId}
            />
          </TabsContent>

          <TabsContent
            value="favorites"
            className="space-y-4 sm:space-y-6 animate-fade-in"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-brand-900">
              Favorite Services
            </h2>
            <Card className="shadow-soft rounded-3xl hover:shadow-medium transition-all duration-300 p-4 sm:p-6">
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-brand-400 mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-brand-900">
                  No favorites yet
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Save services you love to easily find them later
                </p>
                <Button
                  asChild
                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 min-h-[44px] text-sm sm:text-base"
                >
                  <Link href="/services">Browse Services</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="profile"
            className="space-y-4 sm:space-y-6 animate-fade-in"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-brand-900">
              Profile Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="shadow-soft rounded-3xl hover:shadow-medium transition-all duration-300 p-4 sm:p-6">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Update your account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-sm font-medium text-brand-800">
                      Name
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {user?.user_metadata?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-brand-800">
                      Email
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-brand-800">
                      Role
                    </label>
                    <p className="text-sm text-muted-foreground">Customer</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-brand-200 hover:bg-brand-50 min-h-[44px] text-sm sm:text-base"
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
