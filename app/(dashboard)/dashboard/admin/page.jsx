"use client";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AdminAnalytics } from "@/components/analytics/admin-analytics";
import { useAuthStore } from "@/lib/store";
import {
  Users,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";

export default function AdminDashboard() {
  const { user } = useAuthStore();

  const {
    loading,
    stats,
    pendingVendors,
    recentUsers,
    recentBookings,
    actionLoading,
    handleApproveVendor,
  } = useAdminDashboardData(user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-purple-800">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Platform overview and management tools
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.monthlyGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Vendors
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVendors}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingApprovals} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {stats.conversionRate}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Platform Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5 text-yellow-600" />
                    Pending Vendor Approvals
                  </CardTitle>
                  <CardDescription>
                    KYC submissions awaiting review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingVendors.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No pending approvals
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {pendingVendors.slice(0, 3).map((vendor) => (
                        <div
                          key={vendor.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">
                              {vendor.business_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {vendor.users?.name}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-purple-600"
                              onClick={() =>
                                handleApproveVendor(vendor.id, true)
                              }
                              disabled={actionLoading === vendor.id}
                            >
                              {actionLoading === vendor.id ? (
                                <LoadingSpinner className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleApproveVendor(vendor.id, false)
                              }
                              disabled={actionLoading === vendor.id}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            New booking for {booking.listings?.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(booking.created_at), "PPp")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Vendor Management</h2>
              <Button className="bg-purple-700">
                <Bell className="mr-2 h-4 w-4" />
                Send Notification
              </Button>
            </div>

            {/* Pending Vendors */}
            <Card>
              <CardHeader>
                <CardTitle>Pending KYC Approvals</CardTitle>
                <CardDescription>
                  Review and approve vendor applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingVendors.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      All vendors are approved!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingVendors.map((vendor) => (
                      <Card
                        key={vendor.id}
                        className="border-yellow-200 bg-yellow-50/50"
                      >
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="font-semibold">
                                {vendor.business_name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Owner: {vendor.users?.name} (
                                {vendor.users?.email})
                              </p>
                              <p className="text-sm">
                                {vendor.business_description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>📍 {vendor.business_address}</span>
                                <span>📞 {vendor.phone_number}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() =>
                                  handleApproveVendor(vendor.id, true)
                                }
                                className="bg-purple-700"
                                disabled={actionLoading === vendor.id}
                              >
                                {actionLoading === vendor.id ? (
                                  <LoadingSpinner className="h-4 w-4" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  handleApproveVendor(vendor.id, false)
                                }
                                disabled={actionLoading === vendor.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold">User Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Badge
                        className="bg-purple-700"
                        variant={
                          user.role === "vendor" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold">Booking Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest booking activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">
                          {booking.listings?.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.booking_date), "PPP")} - ₦
                          {booking.total_amount?.toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          booking.status === "completed"
                            ? "default"
                            : booking.status === "confirmed"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-bold">Reports & Exports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                  <CardDescription>
                    Revenue and transaction reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Monthly Revenue Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Vendor Payout Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Transaction History
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Reports</CardTitle>
                  <CardDescription>
                    User activity and engagement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    User Activity Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Vendor Performance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Customer Satisfaction
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Reports</CardTitle>
                  <CardDescription>Overall platform metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Platform Overview
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Growth Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Custom Report Builder
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
