"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AdminAnalytics } from "@/components/shared/analytics/admin-analytics";
import {
  Users,
  Building,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Activity,
  LayoutDashboard,
  BarChart3,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { useCurrentUser } from "@/hooks/use-auth";
import { useState } from "react";

const TABS = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "vendors", label: "Vendors", icon: Building },
  { value: "users", label: "Users", icon: Users },
  { value: "bookings", label: "Bookings", icon: Calendar },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
  { value: "reports", label: "Reports", icon: FileText },
];

export default function AdminDashboard() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("overview");

  const {
    loading,
    stats,
    pendingVendors,
    recentUsers,
    recentBookings,
    actionLoading,
    handleApproveVendor,
  } = useAdminDashboardData(user);

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-800">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform overview and management tools
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs md:text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold">
              {stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              +{stats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs md:text-sm font-medium">
              Active Vendors
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold">
              {stats.totalVendors}
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {stats.pendingApprovals} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs md:text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold">
              {stats.totalBookings}
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {stats.conversionRate}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs md:text-sm font-medium">
              Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-bold">
              ₦{stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs — mobile: select dropdown, desktop: tab strip */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        {/* Mobile select */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full border-purple-200 focus:ring-purple-500">
              <SelectValue>
                {(() => {
                  const tab = TABS.find((t) => t.value === activeTab);
                  const Icon = tab?.icon;
                  return (
                    <span className="flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4 text-purple-600" />}
                      {tab?.label}
                    </span>
                  );
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TABS.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-purple-600" />
                    {label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop tabs */}
        <TabsList className="hidden md:grid w-full grid-cols-6">
          {TABS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
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
                  <div className="space-y-3">
                    {pendingVendors.slice(0, 3).map((vendor) => (
                      <div
                        key={vendor.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="min-w-0 mr-3">
                          <h4 className="font-medium text-sm truncate">
                            {vendor.business_name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {vendor.users?.name}
                          </p>
                        </div>
                        <div className="flex space-x-2 shrink-0">
                          <Button
                            size="sm"
                            className="bg-purple-600 h-8 w-8 p-0"
                            onClick={() => handleApproveVendor(vendor.id, true)}
                            disabled={actionLoading === vendor.id}
                          >
                            {actionLoading === vendor.id ? (
                              <LoadingSpinner className="h-3 w-3" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Activity className="mr-2 h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest platform activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm truncate">
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

        {/* ── Vendors ── */}
        <TabsContent value="vendors" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold">Vendor Management</h2>
            <Button className="bg-purple-700 w-full sm:w-auto">
              <Bell className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          </div>

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
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                          <div className="space-y-1.5 min-w-0">
                            <h3 className="font-semibold">
                              {vendor.business_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Owner: {vendor.users?.name} ({vendor.users?.email}
                              )
                            </p>
                            <p className="text-sm">
                              {vendor.business_description}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span>📍 {vendor.business_address}</span>
                              <span>📞 {vendor.phone_number}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2 shrink-0">
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

        {/* ── Users ── */}
        <TabsContent value="users" className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold">User Management</h2>
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="min-w-0 mr-3">
                      <h4 className="font-medium text-sm truncate">{u.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}
                      </p>
                    </div>
                    <Badge
                      className="bg-purple-700 shrink-0"
                      variant={u.role === "vendor" ? "default" : "secondary"}
                    >
                      {u.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Bookings ── */}
        <TabsContent value="bookings" className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold">Booking Management</h2>
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest booking activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="min-w-0 mr-3">
                      <h4 className="font-medium text-sm truncate">
                        {booking.listings?.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(booking.booking_date), "PPP")} · ₦
                        {booking.total_amount?.toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      className="shrink-0"
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

        {/* ── Analytics ── */}
        <TabsContent value="analytics" className="space-y-6">
          <AdminAnalytics />
        </TabsContent>

        {/* ── Reports ── */}
        <TabsContent value="reports" className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold">Reports & Exports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  Revenue and transaction reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  Monthly Revenue Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  Vendor Payout Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  Transaction History
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Reports</CardTitle>
                <CardDescription>User activity and engagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  User Activity Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  Vendor Performance
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  Customer Satisfaction
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Reports</CardTitle>
                <CardDescription>Overall platform metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  Platform Overview
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  Growth Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  Custom Report Builder
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
