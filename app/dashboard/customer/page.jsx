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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ReviewForm } from "@/components/reviews/review-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { getBookings } from "@/lib/database";

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

  useEffect(() => {
    const loadCustomerData = async () => {
      if (!user) return;

      try {
        setLoading(true);

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

  if (loading) {
    return (
      <AuthGuard requiredRole="customer">
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="customer">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Customer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.user_metadata?.name || "Customer"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">All time bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.confirmedBookings}
              </div>
              <p className="text-xs text-muted-foreground">Ready to go</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completedBookings}
              </div>
              <p className="text-xs text-muted-foreground">Finished services</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Explore and book services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full justify-start">
                    <Link href="/services">
                      <Calendar className="mr-2 h-4 w-4" />
                      Browse Services
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full justify-start"
                  >
                    <Link href="/search">
                      <MapPin className="mr-2 h-4 w-4" />
                      Search by Location
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full justify-start"
                  >
                    <Link href="/dashboard/customer?tab=favorites">
                      <Heart className="mr-2 h-4 w-4" />
                      View Favorites
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>
                    Your latest booking activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No bookings yet
                      </p>
                      <Button asChild>
                        <Link href="/services">Browse Services</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.slice(0, 3).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center space-x-4 p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {booking.listings?.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(booking.booking_date), "PPP")}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">
                              {booking.status}
                            </span>
                          </Badge>
                        </div>
                      ))}
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/dashboard/customer?tab=bookings">
                          View All Bookings
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <Button asChild>
                <Link href="/services">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book New Service
                </Link>
              </Button>
            </div>

            {bookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start exploring our services and make your first booking
                  </p>
                  <Button asChild>
                    <Link href="/services">Browse Services</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {booking.listings?.title}
                          </CardTitle>
                          <CardDescription>
                            by {booking.listings?.vendors?.business_name}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">
                            {booking.status}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {format(new Date(booking.booking_date), "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{booking.booking_time}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {booking.guests} guest
                            {booking.guests > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>₦{booking.total_amount?.toLocaleString()}</span>
                        </div>
                      </div>

                      {booking.special_requests && (
                        <div className="mb-4">
                          <h5 className="font-medium text-sm mb-1">
                            Special Requests:
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            {booking.special_requests}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            <span>{booking.contact_phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            <span>{booking.contact_email}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {booking.status === "completed" && (
                            <Button variant="outline" size="sm">
                              <Star className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          )}
                          {booking.status === "pending" && (
                            <Button variant="outline" size="sm">
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="lg"
                            asChild
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Link
                              href={`/payments?booking=${booking.id}&reference=${booking.payment_reference}`}
                            >
                              Pay now
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <h2 className="text-2xl font-bold">Favorite Services</h2>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Save services you love to easily find them later
                </p>
                <Button asChild>
                  <Link href="/services">Browse Services</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold">Profile Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-muted-foreground">
                      {user?.user_metadata?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <p className="text-sm text-muted-foreground">Customer</p>
                  </div>
                  <Button variant="outline">Edit Profile</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email notifications</span>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS notifications</span>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Marketing emails</span>
                    <Button variant="outline" size="sm">
                      Disable
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
