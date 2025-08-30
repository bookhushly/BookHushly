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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge as UIBadge } from "@/components/ui/badge";

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
    if (!vendorProfile?.id) {
      toast.error("Vendor profile ID is missing");
      return;
    }

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
    if (!vendorProfile?.id) {
      toast.error("Vendor profile is missing");
      return;
    }

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

  const downloadQRPDF = async () => {
    if (!qrCodeDataUrl || !vendorProfile) {
      toast.error("Cannot generate PDF: Missing QR code or vendor profile");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Load logo from public folder
    let logoBase64;
    try {
      const logoResponse = await fetch(`${window.location.origin}/logo.png`);
      if (!logoResponse.ok) throw new Error("Logo not found");
      const logoBlob = await logoResponse.blob();
      logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(logoBlob);
        reader.onloadend = () => resolve(reader.result);
      });
    } catch (error) {
      console.error("Error loading logo:", error);
      toast.error("Failed to load logo for PDF");
      return;
    }

    // Add subtle background gradient
    pdf.setFillColor(245, 243, 255); // Light purple background
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Header
    pdf.addImage(logoBase64, "PNG", pageWidth / 2 - 30, 15, 60, 60); // Centered logo with square dimensions
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(124, 58, 237); // Purple brand color

    // Vendor Information Section
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(20, 70, pageWidth - 40, 70, 5, 5, "F"); // White card background
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      vendorProfile.business_name || "Your Business Name",
      pageWidth / 2,
      85,
      { align: "center" }
    );

    pdf.setFontSize(11);
    pdf.setTextColor(80, 80, 80);
    pdf.text(
      `Contact: ${vendorProfile.phone_number || "N/A"}`,
      pageWidth / 2,
      100,
      { align: "center" }
    );
    pdf.text(
      `Email: ${vendorProfile.users?.email || "N/A"}`,
      pageWidth / 2,
      110,
      { align: "center" }
    );

    const description =
      vendorProfile.business_description ||
      "Discover our services on Bookhushly";
    const descriptionLines = pdf.splitTextToSize(description, pageWidth - 60);
    pdf.text(descriptionLines, pageWidth / 2, 120, { align: "center" });

    // QR Code Section
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Scan to Visit Vendor Profile", pageWidth / 2, 160, {
      align: "center",
    });

    const qrSize = 80;
    const qrX = pageWidth / 2 - qrSize / 2;
    const qrY = 170;
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 3, 3, "FD"); // QR code background
    pdf.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // Footer
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25); // Divider
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Generated on ${new Date().toLocaleDateString()} | © Bookhushly`,
      pageWidth / 2,
      pageHeight - 15,
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
          .maybeSingle(); // Changed from .single() to .maybeSingle()

        setVendorProfile(vendor);
        console.log("Vendor Profile:", vendor);

        // Only proceed with listings and stats if a vendor profile exists and is approved
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

        // Toast feedback only for existing vendor profiles
        if (vendor) {
          if (!vendor.approved && vendor.status === "reviewing") {
            toast.info("KYC under review.");
          } else if (vendor.approved) {
            toast.success("Vendor approved! You can now create listings.");
          } else if (!vendor.approved && vendor.status === "denied") {
            toast.error("KYC denied. Contact support.");
          }
        }
        // No toast for !vendor case (vendor not found), as per requirement
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

    const { data, error } = await getBookings(user.id, "vendor");
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
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 text-brand-900">
            Vendor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.user_metadata?.name || "Vendor"}
          </p>
        </div>

        {/* Approval Status Alert */}
        <Alert
          className={`mb-6 border-${variant}-200 bg-${variant}-50 animate-slide-in`}
        >
          <Icon className="w-5 h-5 mr-2" />
          <AlertDescription>
            {message}
            {!vendorProfile && (
              <span>
                {" "}
                —{" "}
                <Link
                  href="/dashboard/vendor/kyc"
                  className="underline hover:text-brand-600"
                >
                  Start Verification
                </Link>
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-medium rounded-3xl hover:shadow-hard hover:scale-105 transition-all duration-300 transform">
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

          <Card className="bg-white shadow-soft border border-brand-100 rounded-3xl hover:shadow-medium hover:scale-105 transition-all duration-300 transform glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-brand-700">
                Active Bookings
              </CardTitle>
              <Calendar className="h-5 w-5 text-brand-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-700">
                {stats.activeBookings}
              </div>
              <p className="text-xs text-gray-500">Current bookings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-medium rounded-3xl hover:shadow-hard hover:scale-105 transition-all duration-300 transform">
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

          <Card className="bg-white shadow-soft border border-brand-100 rounded-3xl hover:shadow-medium hover:scale-105 transition-all duration-300 transform glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-brand-700">
                Pending Requests
              </CardTitle>
              <Users className="h-5 w-5 text-brand-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-700">
                {stats.pendingRequests}
              </div>
              <p className="text-xs text-gray-500">Awaiting response</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-brand-50 rounded-2xl p-1">
            <TabsTrigger value="overview" className="rounded-xl">
              Overview
            </TabsTrigger>
            <TabsTrigger value="listings" className="rounded-xl">
              Listings
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-xl">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-xl">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-soft rounded-3xl hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your business efficiently
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    asChild
                    className="w-full justify-start btn-hospitality"
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
                    className="w-full justify-start border-brand-200 hover:border-brand-300"
                  >
                    <Link href="/dashboard/vendor/bookings">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Bookings
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full justify-start border-brand-200 hover:border-brand-300"
                  >
                    <Link href="/dashboard/vendor/kyc">
                      <FileText className="mr-2 h-4 w-4" />
                      {vendorProfile?.approved ? "Update" : "Complete"} KYC
                    </Link>
                  </Button>

                  {vendorProfile?.approved && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-brand-200 hover:border-brand-300"
                          onClick={generateQRCode}
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          Generate Profile QR Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md rounded-2xl">
                        <DialogHeader>
                          <DialogTitle>Your Profile QR Code</DialogTitle>
                          <DialogDescription>
                            Share your profile with customers by letting them
                            scan this QR code or share the direct link.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <Card className="border-0 shadow-none">
                            <CardContent className="flex flex-col items-center justify-center p-6 bg-brand-50 rounded-2xl">
                              {isGeneratingQR ? (
                                <div className="flex items-center justify-center h-32 w-32">
                                  <LoadingSpinner className="h-8 w-8 text-brand-600" />
                                </div>
                              ) : qrCodeDataUrl ? (
                                <img
                                  src={qrCodeDataUrl}
                                  alt="Profile QR Code"
                                  className="w-32 h-32 rounded-lg shadow-soft"
                                />
                              ) : (
                                <div className="h-32 w-32 bg-white rounded-lg flex items-center justify-center shadow-soft">
                                  <QrCode className="h-8 w-8 text-brand-400" />
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          <Card className="border-0 shadow-none">
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
                                  className="flex-1 px-3 py-2 text-sm border border-brand-200 rounded-lg bg-brand-50 focus:ring-brand-300"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={copyProfileLink}
                                  className="flex items-center space-x-1 border-brand-200 hover:bg-brand-100"
                                >
                                  {copied ? (
                                    <Check className="h-4 w-4 text-success-600" />
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
                            className="w-full sm:w-auto border-brand-200 hover:bg-brand-100"
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Regenerate QR Code
                          </Button>
                          <Button
                            onClick={downloadQRPDF}
                            disabled={!qrCodeDataUrl}
                            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700"
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

              <Card className="shadow-soft rounded-3xl hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates on your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 animate-pulse-slow">
                      <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Account created</p>
                        <p className="text-xs text-muted-foreground">
                          Welcome to Bookhushly
                        </p>
                      </div>
                    </div>
                    {vendorProfile && (
                      <div className="flex items-center space-x-4 animate-pulse-slow">
                        <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm">KYC submitted</p>
                          <p className="text-xs text-muted-foreground">
                            Under review
                          </p>
                        </div>
                      </div>
                    )}
                    {vendorProfile?.approved && (
                      <div className="flex items-center space-x-4 animate-pulse-slow">
                        <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            Vendor Approved! Profile QR code available
                          </p>
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

          <TabsContent value="listings" className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-brand-900">My Listings</h2>
              <Button
                asChild
                disabled={!vendorProfile?.approved}
                className="btn-hospitality bg-brand-600 hover:bg-brand-700"
              >
                <Link href="/dashboard/vendor/listings/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Listing
                </Link>
              </Button>
            </div>

            {listings.length === 0 ? (
              <Card className="shadow-soft rounded-3xl">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building className="h-12 w-12 text-brand-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-brand-900">
                    No listings yet
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {vendorProfile?.approved
                      ? "Create your first listing to start accepting bookings"
                      : "Complete KYC verification to create listings"}
                  </p>
                  {vendorProfile?.approved && (
                    <Button asChild className="bg-brand-600 hover:bg-brand-700">
                      <Link href="/dashboard/vendor/listings/create">
                        Create Your First Listing
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Table className="bg-white rounded-3xl shadow-soft overflow-hidden">
                <TableHeader>
                  <TableRow className="bg-brand-50">
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow
                      key={listing.id}
                      className="hover:bg-brand-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {listing.title}
                      </TableCell>
                      <TableCell>{listing.category}</TableCell>
                      <TableCell>₦{listing.price?.toLocaleString()}</TableCell>
                      <TableCell>
                        <UIBadge
                          variant={listing.active ? "default" : "secondary"}
                        >
                          {listing.active ? "Active" : "Inactive"}
                        </UIBadge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/dashboard/vendor/listings/${listing.id}`}
                          >
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-brand-900">
              Booking Requests
            </h2>

            {loading ? (
              <Card className="shadow-soft rounded-3xl">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-brand-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-brand-900">
                    Loading bookings...
                  </h3>
                </CardContent>
              </Card>
            ) : bookings.length === 0 ? (
              <Card className="shadow-soft rounded-3xl">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-brand-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-brand-900">
                    No bookings yet
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Booking requests will appear here once customers start
                    booking your services
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Table className="bg-white rounded-3xl shadow-soft overflow-hidden">
                <TableHeader>
                  <TableRow className="bg-brand-50">
                    <TableHead>Listing</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      className="hover:bg-brand-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {booking.listings?.title}
                      </TableCell>
                      <TableCell>
                        {booking.booking_date} at {booking.booking_time}
                      </TableCell>
                      <TableCell>{booking.guests}</TableCell>
                      <TableCell>₦{booking.total_amount}</TableCell>
                      <TableCell>
                        <UIBadge variant="outline" className="capitalize">
                          {booking.status}
                        </UIBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-brand-900">
              Vendor Profile
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-soft rounded-3xl hover:shadow-medium transition-all duration-300">
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
                        <label className="text-sm font-medium text-brand-800">
                          Business Name
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {vendorProfile.business_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-brand-800">
                          Status
                        </label>
                        <div className="flex items-center space-x-2 mt-1">
                          <UIBadge
                            variant={
                              vendorProfile.approved ? "default" : "secondary"
                            }
                          >
                            {vendorProfile.approved
                              ? "Approved"
                              : "Pending Review"}
                          </UIBadge>
                        </div>
                      </div>
                      {vendorProfile.approved && (
                        <div>
                          <label className="text-sm font-medium text-brand-800">
                            Share Profile
                          </label>
                          <p className="text-sm text-muted-foreground mb-3">
                            Generate a QR code to share your services
                          </p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start border-brand-200 hover:border-brand-300 hover:bg-brand-50"
                                onClick={generateQRCode}
                              >
                                <QrCode className="mr-2 h-4 w-4" />
                                Generate Profile QR Code
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-2xl">
                              <DialogHeader>
                                <DialogTitle>Your Profile QR Code</DialogTitle>
                                <DialogDescription>
                                  Share your profile with customers by letting
                                  them scan this QR code or share the direct
                                  link.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <Card className="border-0 shadow-none">
                                  <CardContent className="flex flex-col items-center justify-center p-6 bg-brand-50 rounded-2xl">
                                    {isGeneratingQR ? (
                                      <div className="flex items-center justify-center h-32 w-32">
                                        <LoadingSpinner className="h-8 w-8 text-brand-600" />
                                      </div>
                                    ) : qrCodeDataUrl ? (
                                      <img
                                        src={qrCodeDataUrl}
                                        alt="Profile QR Code"
                                        className="w-32 h-32 rounded-lg shadow-soft"
                                      />
                                    ) : (
                                      <div className="h-32 w-32 bg-white rounded-lg flex items-center justify-center shadow-soft">
                                        <QrCode className="h-8 w-8 text-brand-400" />
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                <Card className="border-0 shadow-none">
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
                                        className="flex-1 px-3 py-2 text-sm border border-brand-200 rounded-lg bg-brand-50 focus:ring-brand-300"
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={copyProfileLink}
                                        className="flex items-center space-x-1 border-brand-200 hover:bg-brand-100"
                                      >
                                        {copied ? (
                                          <Check className="h-4 w-4 text-success-600" />
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
                                  className="w-full sm:w-auto border-brand-200 hover:bg-brand-100"
                                >
                                  <Share2 className="mr-2 h-4 w-4" />
                                  Regenerate QR Code
                                </Button>
                                <Button
                                  onClick={downloadQRPDF}
                                  disabled={!qrCodeDataUrl}
                                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download PDF
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        asChild
                        className="border-brand-200 hover:bg-brand-50"
                      >
                        <Link href="/dashboard/vendor/kyc">Update Profile</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Upload className="h-12 w-12 text-brand-400 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Complete your KYC verification to start accepting
                        bookings
                      </p>
                      <Button
                        asChild
                        className="bg-brand-600 hover:bg-brand-700"
                      >
                        <Link href="/dashboard/vendor/kyc">Complete KYC</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-soft rounded-3xl hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      Name
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {user?.user_metadata?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-brand-800">
                      Role
                    </label>
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
