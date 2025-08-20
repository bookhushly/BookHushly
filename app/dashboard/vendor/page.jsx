"use client";

import { useEffect, useState } from "react";
import { useAuthStore, useListingStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle,
  Building,
  DollarSign,
  Calendar,
  Users,
  Plus,
  FileText,
  Badge,
  Upload,
  QrCode,
  Download,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { getBookings } from "@/lib/database";
import QRCode from "qrcode";
import jsPDF from "jspdf";

export default function VendorDashboard() {
  const { user } = useAuthStore();
  const { listings, setListings } = useListingStore();
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    pendingRequests: 0,
  });
  const [bookings, setBookings] = useState([]);

  // QR Code states
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copied, setCopied] = useState(false);

  // QR Code Functions
  const generateQRCode = async () => {
    if (!vendorProfile?.id) return;

    try {
      setIsGeneratingQR(true);
      const profileUrl = `${window.location.origin}/vendor-profile/${vendorProfile.id}`;
      const dataUrl = await QRCode.toDataURL(profileUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#7c3aed", // Purple color to match theme
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const copyProfileLink = async () => {
    if (!vendorProfile?.id) return;

    try {
      const profileUrl = `${window.location.origin}/vendor-profile/${vendorProfile.id}`;
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const downloadQRPDF = () => {
    if (!qrCodeDataUrl || !vendorProfile) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add logo area (placeholder for now - you'll need to add your actual logo)
    pdf.setFontSize(24);
    pdf.setTextColor(124, 58, 237); // Purple color
    pdf.text("Bookhushly", pageWidth / 2, 30, { align: "center" });

    // Add title
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Vendor Profile QR Code", pageWidth / 2, 50, { align: "center" });

    // Add business name
    pdf.setFontSize(16);
    pdf.text(
      vendorProfile.business_name || "Vendor Profile",
      pageWidth / 2,
      65,
      {
        align: "center",
      }
    );

    // Add QR code
    const qrSize = 80;
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = 80;
    pdf.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // Add URL below QR code
    const profileUrl = `${window.location.origin}/vendor-profile/${vendorProfile.id}`;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(profileUrl, pageWidth / 2, qrY + qrSize + 20, {
      align: "center",
    });

    // Add instructions
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      "Scan this QR code to view our services and make bookings",
      pageWidth / 2,
      qrY + qrSize + 35,
      { align: "center" }
    );

    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      "Generated on " + new Date().toLocaleDateString(),
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );

    pdf.save(`${vendorProfile.business_name || "vendor"}-profile-qr.pdf`);
    toast.success("QR code PDF downloaded successfully");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const { data: vendor, error: vendorError } = await supabase
          .from("vendors")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (vendorError) throw vendorError;
        setVendorProfile(vendor);

        if (vendor?.approved) {
          const { data: vendorListings, error: listingError } = await supabase
            .from("listings")
            .select("*")
            .eq("vendor_id", vendor.id);

          if (listingError) throw listingError;
          setListings(vendorListings);
          setStats({
            totalListings: vendorListings.length,
            activeBookings: 0,
            totalRevenue: 0,
            pendingRequests: 0,
          });
        } else {
          setListings([]);
        }

        // toast feedback
        if (!vendor) {
          toast.info("Complete your KYC to create listings.");
        } else if (!vendor.approved && vendor.status === "reviewing") {
          toast.info("KYC under review.");
        } else if (vendor.approved) {
          toast.success("Vendor approved! You can now create listings.");
        } else if (!vendor.approved && vendor.status === "denied") {
          toast.error("KYC denied. Contact support.");
        }
      } catch (error) {
        console.error("Error loading vendor dashboard:", error);
        toast.error("Error loading dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await getBookings(user.id, "vendor"); // Fetch by vendorId
    if (error) {
      toast.error("Failed to load bookings");
      console.error(error);
    } else {
      setBookings(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  if (loading) {
    return (
      <AuthGuard requiredRole="vendor">
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner className="h-6 w-6" />
        </div>
      </AuthGuard>
    );
  }

  const approvalStatus = () => {
    if (!vendorProfile)
      return {
        message: "Complete your vendor profile",
        icon: Clock,
        variant: "yellow",
      };
    if (!vendorProfile.approved) {
      if (vendorProfile.status === "reviewing")
        return { message: "KYC under review", icon: Clock, variant: "yellow" };
      if (vendorProfile.status === "denied")
        return { message: "KYC denied", icon: Clock, variant: "red" };
    }
    return { message: "Vendor approved", icon: CheckCircle, variant: "green" };
  };

  const { message, icon: Icon, variant } = approvalStatus();

  return (
    <AuthGuard requiredRole="vendor">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.user_metadata?.name || "Vendor"}
          </p>
        </div>

        {/* Approval Status Alert */}
        <Alert className="mb-6" variant={variant}>
          <Icon className="w-5 h-5 mr-2" />
          <AlertDescription>
            {message}
            {!vendorProfile && (
              <span>
                {" "}
                —{" "}
                <Link href="/dashboard/vendor/kyc" className="underline">
                  Start Verification
                </Link>
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Listings */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg rounded-2xl hover:scale-[1.02] transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Listings
              </CardTitle>
              <Building className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalListings}</div>
              <p className="text-xs opacity-80">Active services</p>
            </CardContent>
          </Card>

          {/* Active Bookings */}
          <Card className="bg-white shadow-md border border-purple-200 rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Active Bookings
              </CardTitle>
              <Calendar className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">
                {stats.activeBookings}
              </div>
              <p className="text-xs text-gray-500">Current bookings</p>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg rounded-2xl hover:scale-[1.02] transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₦{stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs opacity-80">This month</p>
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card className="bg-white shadow-md border border-purple-200 rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Pending Requests
              </CardTitle>
              <Users className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">
                {stats.pendingRequests}
              </div>
              <p className="text-xs text-gray-500">Awaiting response</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your business efficiently
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    asChild
                    className="w-full justify-start"
                    disabled={!vendorProfile?.approved}
                  >
                    <Link href="/dashboard/vendor/listings/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Listing
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full justify-start"
                  >
                    <Link href="/dashboard/vendor/bookings">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Bookings
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full justify-start"
                  >
                    <Link href="/dashboard/vendor/kyc">
                      <FileText className="mr-2 h-4 w-4" />
                      {vendorProfile ? "Update" : "Complete"} KYC
                    </Link>
                  </Button>

                  {/* QR Code Generator - Only show if vendor has listings */}
                  {vendorProfile?.approved && listings.length > 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={generateQRCode}
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          Generate Profile QR Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Your Profile QR Code</DialogTitle>
                          <DialogDescription>
                            Share your profile with customers by letting them
                            scan this QR code or share the direct link.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          {/* QR Code Display */}
                          <Card>
                            <CardContent className="flex flex-col items-center justify-center p-6">
                              {isGeneratingQR ? (
                                <div className="flex items-center justify-center h-32 w-32">
                                  <LoadingSpinner className="h-8 w-8" />
                                </div>
                              ) : qrCodeDataUrl ? (
                                <img
                                  src={qrCodeDataUrl}
                                  alt="Profile QR Code"
                                  className="w-32 h-32"
                                />
                              ) : (
                                <div className="h-32 w-32 bg-gray-200 rounded flex items-center justify-center">
                                  <QrCode className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Profile Link */}
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">
                                Profile Link
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={
                                    vendorProfile?.id
                                      ? `${window.location.origin}/vendor-profile/${vendorProfile.id}`
                                      : ""
                                  }
                                  readOnly
                                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={copyProfileLink}
                                  className="flex items-center space-x-1"
                                >
                                  {copied ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            onClick={generateQRCode}
                            disabled={isGeneratingQR}
                            className="w-full sm:w-auto"
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Regenerate QR Code
                          </Button>
                          <Button
                            onClick={downloadQRPDF}
                            disabled={!qrCodeDataUrl}
                            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates on your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Account created</p>
                        <p className="text-xs text-muted-foreground">
                          Welcome to Bookhushly
                        </p>
                      </div>
                    </div>
                    {vendorProfile && (
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm">KYC submitted</p>
                          <p className="text-xs text-muted-foreground">
                            Under review
                          </p>
                        </div>
                      </div>
                    )}
                    {vendorProfile?.approved && listings.length > 0 && (
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm">Profile QR code available</p>
                          <p className="text-xs text-muted-foreground">
                            Share your services with customers
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Listings</h2>
              <Button asChild disabled={!vendorProfile?.approved}>
                <Link href="/dashboard/vendor/listings/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Listing
                </Link>
              </Button>
            </div>

            {listings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No listings yet
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {vendorProfile?.approved
                      ? "Create your first listing to start accepting bookings"
                      : "Complete KYC verification to create listings"}
                  </p>
                  {vendorProfile?.approved && (
                    <Button asChild>
                      <Link href="/dashboard/vendor/listings/create">
                        Create Your First Listing
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Card
                    key={listing.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {listing.title}
                        </CardTitle>
                        <Badge
                          variant={listing.active ? "default" : "secondary"}
                        >
                          {listing.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription>{listing.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {listing.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">
                          ₦{listing.price?.toLocaleString()}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/dashboard/vendor/listings/${listing.id}`}
                          >
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold">Booking Requests</h2>

            {loading ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Loading bookings...
                  </h3>
                </CardContent>
              </Card>
            ) : bookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Booking requests will appear here once customers start
                    booking your services
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold">
                            {booking.listings?.title}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {booking.booking_date} at {booking.booking_time}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Guests: {booking.guests} • Total: ₦
                            {booking.total_amount}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Contact: {booking.contact_email} /{" "}
                        {booking.contact_phone}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold">Vendor Profile</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    {vendorProfile
                      ? "Update your business details"
                      : "Complete your vendor profile"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vendorProfile ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">
                          Business Name
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {vendorProfile.business_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={
                              vendorProfile.approved ? "default" : "secondary"
                            }
                          >
                            {vendorProfile.approved
                              ? "Approved"
                              : "Pending Review"}
                          </Badge>
                        </div>
                      </div>
                      {vendorProfile.approved && listings.length > 0 && (
                        <div>
                          <label className="text-sm font-medium">
                            Share Profile
                          </label>
                          <p className="text-sm text-muted-foreground mb-3">
                            Generate a QR code to share your services
                          </p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={generateQRCode}
                              >
                                <QrCode className="mr-2 h-4 w-4" />
                                Generate Profile QR Code
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Your Profile QR Code</DialogTitle>
                                <DialogDescription>
                                  Share your profile with customers by letting
                                  them scan this QR code or share the direct
                                  link.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                {/* QR Code Display */}
                                <Card>
                                  <CardContent className="flex flex-col items-center justify-center p-6">
                                    {isGeneratingQR ? (
                                      <div className="flex items-center justify-center h-32 w-32">
                                        <LoadingSpinner className="h-8 w-8" />
                                      </div>
                                    ) : qrCodeDataUrl ? (
                                      <img
                                        src={qrCodeDataUrl}
                                        alt="Profile QR Code"
                                        className="w-32 h-32"
                                      />
                                    ) : (
                                      <div className="h-32 w-32 bg-gray-200 rounded flex items-center justify-center">
                                        <QrCode className="h-8 w-8 text-gray-400" />
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                {/* Profile Link */}
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">
                                      Profile Link
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="text"
                                        value={
                                          vendorProfile?.id
                                            ? `${window.location.origin}/vendor-profile/${vendorProfile.id}`
                                            : ""
                                        }
                                        readOnly
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={copyProfileLink}
                                        className="flex items-center space-x-1"
                                      >
                                        {copied ? (
                                          <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              <DialogFooter className="flex-col sm:flex-row gap-2">
                                <Button
                                  variant="outline"
                                  onClick={generateQRCode}
                                  disabled={isGeneratingQR}
                                  className="w-full sm:w-auto"
                                >
                                  <Share2 className="mr-2 h-4 w-4" />
                                  Regenerate QR Code
                                </Button>
                                <Button
                                  onClick={downloadQRPDF}
                                  disabled={!qrCodeDataUrl}
                                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download PDF
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                      <Button variant="outline" asChild>
                        <Link href="/dashboard/vendor/kyc">Update Profile</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Complete your KYC verification to start accepting
                        bookings
                      </p>
                      <Button asChild>
                        <Link href="/dashboard/vendor/kyc">Complete KYC</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-muted-foreground">
                      {user?.user_metadata?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <p className="text-sm text-muted-foreground">Vendor</p>
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
