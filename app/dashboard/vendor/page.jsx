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
  const { user, vendor } = useAuthStore();
  const { listings, setListings } = useListingStore();
  const [loading, setLoading] = useState(true);
  const [hasShownApprovedToast, setHasShownApprovedToast] = useState(false);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    pendingRequests: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copied, setCopied] = useState(false);

  // QR Code Functions
  const generateQRCode = async () => {
    if (!vendor?.id) {
      toast.error("Vendor profile ID is missing");
      return;
    }

    try {
      setIsGeneratingQR(true);
      const profileUrl = `${window.location.origin}/vendor-profile/${vendor.id}`;
      const dataUrl = await QRCode.toDataURL(profileUrl, {
        width: 300,
        margin: 2,
        color: { dark: "#7c3aed", light: "#FFFFFF" },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      toast.error("Failed to generate QR code");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const copyProfileLink = async () => {
    if (!vendor?.id) {
      toast.error("Vendor profile is missing");
      return;
    }

    try {
      const profileUrl = `${window.location.origin}/vendor-profile/${vendor.id}`;
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const downloadQRPDF = async () => {
    if (!qrCodeDataUrl || !vendor) {
      toast.error("Cannot generate PDF: Missing QR code or vendor profile");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

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
      toast.error("Failed to load logo for PDF");
      return;
    }

    pdf.setFillColor(245, 243, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.addImage(logoBase64, "PNG", pageWidth / 2 - 30, 15, 60, 60);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(124, 58, 237);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(20, 70, pageWidth - 40, 70, 5, 5, "F");
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(vendor.business_name || "Your Business Name", pageWidth / 2, 85, {
      align: "center",
    });
    pdf.setFontSize(11);
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Contact: ${vendor.phone_number || "N/A"}`, pageWidth / 2, 100, {
      align: "center",
    });
    pdf.text(`Email: ${user?.email || "N/A"}`, pageWidth / 2, 110, {
      align: "center",
    });
    const description =
      vendor.business_description || "Discover our services on Bookhushly";
    const descriptionLines = pdf.splitTextToSize(description, pageWidth - 60);
    pdf.text(descriptionLines, pageWidth / 2, 120, { align: "center" });
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
    pdf.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 3, 3, "FD");
    pdf.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Generated on ${new Date().toLocaleDateString()} | © Bookhushly`,
      pageWidth / 2,
      pageHeight - 15,
      { align: "center" }
    );
    pdf.save(`${vendor.business_name || "vendor"}-profile-qr.pdf`);
    toast.success("QR code PDF downloaded successfully");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !vendor) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Check if approval toast has been shown
        const toastShown = localStorage.getItem(
          `vendor-approved-toast-${user.id}`
        );
        setHasShownApprovedToast(!!toastShown);

        // Use vendor from store instead of fetching
        if (vendor?.approved) {
          const { data: vendorListings, error: listingError } = await supabase
            .from("listings")
            .select("*")
            .eq("vendor_id", vendor.id);

          if (listingError) {
            throw listingError;
          }

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

        // Show toast only for non-approved states or first-time approval
        if (vendor) {
          if (!vendor.approved && vendor.status === "reviewing") {
            toast.info("Your KYC is under review.");
          } else if (!vendor.approved && vendor.status === "denied") {
            toast.error("KYC denied. Please contact support.");
          } else if (vendor.approved && !hasShownApprovedToast) {
            toast.success("Vendor approved! You can now create listings.");
            localStorage.setItem(`vendor-approved-toast-${user.id}`, "true");
            setHasShownApprovedToast(true);
          }
        }
      } catch (error) {
        toast.error("Failed to load dashboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, vendor, hasShownApprovedToast, setListings]);

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) return;
      setLoading(true);

      const { data, error } = await getBookings(user.id, "vendor");
      if (error) {
        toast.error("Failed to load bookings");
      } else {
        setBookings(data || []);
      }

      setLoading(false);
    };

    loadBookings();
  }, [user]);
  console.log(listings);

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
    if (!vendor)
      return {
        message: "Complete your vendor profile",
        icon: Clock,
        variant: "yellow",
      };
    if (!vendor.approved) {
      if (vendor.status === "reviewing")
        return { message: "KYC under review", icon: Clock, variant: "yellow" };
      if (vendor.status === "denied")
        return { message: "KYC denied", icon: Clock, variant: "red" };
    }
    return { message: "Vendor approved", icon: CheckCircle, variant: "green" };
  };

  const { message, icon: Icon, variant } = approvalStatus();
  return (
    <AuthGuard requiredRole="vendor">
      <div className="container py-4 sm:py-8 max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-brand-900">
            Vendor Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back, {user?.user_metadata?.name || "Vendor"}
          </p>
        </div>

        {/* Approval Status Alert - Skip if approved and toast shown */}
        {(!vendor || !vendor.approved) && (
          <Alert
            className={`mb-4 sm:mb-6 border-${variant}-200 bg-${variant}-50 animate-slide-in p-3 sm:p-4`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <AlertDescription className="text-sm sm:text-base">
              {message}
              {!vendor && (
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
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-medium rounded-3xl hover:shadow-hard hover:scale-105 transition-all duration-300 transform p-4 sm:p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Total Listings
              </CardTitle>
              <Building className="h-4 w-4 sm:h-5 sm:w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {stats.totalListings}
              </div>
              <p className="text-xs opacity-80">Active services</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-soft border border-brand-100 rounded-3xl hover:shadow-medium hover:scale-105 transition-all duration-300 transform glass p-4 sm:p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-brand-700">
                Active Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-brand-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-brand-700">
                {stats.activeBookings}
              </div>
              <p className="text-xs text-gray-500">Current bookings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-medium rounded-3xl hover:shadow-hard hover:scale-105 transition-all duration-300 transform p-4 sm:p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                ₦{stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs opacity-80">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-soft border border-brand-100 rounded-3xl hover:shadow-medium hover:scale-105 transition-all duration-300 transform glass p-4 sm:p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-brand-700">
                Pending Requests
              </CardTitle>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-brand-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-brand-700">
                {stats.pendingRequests}
              </div>
              <p className="text-xs text-gray-500">Awaiting response</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="flex overflow-x-auto space-x-1 bg-brand-50 rounded-2xl p-1">
            <TabsTrigger
              value="overview"
              className="flex-1 min-w-[80px] rounded-xl text-xs sm:text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="listings"
              className="flex-1 min-w-[80px] rounded-xl text-xs sm:text-sm"
            >
              Listings
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="flex-1 min-w-[80px] rounded-xl text-xs sm:text-sm"
            >
              Bookings
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
                    Manage your business efficiently
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <Button
                    asChild
                    className="w-full justify-start btn-hospitality min-h-[44px] text-sm sm:text-base"
                    disabled={!vendor?.approved}
                  >
                    <Link href="/dashboard/vendor/listings/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Listing
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full justify-start border-brand-200 hover:border-brand-300 min-h-[44px] text-sm sm:text-base"
                  >
                    <Link href="/dashboard/vendor/bookings">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Bookings
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full justify-start border-brand-200 hover:border-brand-300 min-h-[44px] text-sm sm:text-base"
                  >
                    <Link href="/dashboard/vendor/kyc">
                      <FileText className="mr-2 h-4 w-4" />
                      {vendor?.approved ? "Update" : "Complete"} KYC
                    </Link>
                  </Button>

                  {vendor?.approved && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-brand-200 hover:border-brand-300 min-h-[44px] text-sm sm:text-base"
                          onClick={generateQRCode}
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          Generate Profile QR Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle className="text-lg sm:text-xl">
                            Your Profile QR Code
                          </DialogTitle>
                          <DialogDescription className="text-sm">
                            Share your profile with customers by letting them
                            scan this QR code or share the direct link.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 sm:space-y-4">
                          <Card className="border-0 shadow-none">
                            <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 bg-brand-50 rounded-2xl">
                              {isGeneratingQR ? (
                                <div className="flex items-center justify-center h-24 w-24 sm:h-32 sm:w-32">
                                  <LoadingSpinner className="h-6 w-6 sm:h-8 sm:w-8 text-brand-600" />
                                </div>
                              ) : qrCodeDataUrl ? (
                                <img
                                  src={qrCodeDataUrl}
                                  alt="Profile QR Code"
                                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg shadow-soft"
                                />
                              ) : (
                                <div className="h-24 w-24 sm:h-32 sm:w-32 bg-white rounded-lg flex items-center justify-center shadow-soft">
                                  <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-brand-400" />
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          <Card className="border-0 shadow-none">
                            <CardHeader className="pb-1 sm:pb-2">
                              <CardTitle className="text-sm sm:text-base">
                                Profile Link
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-4">
                              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                <input
                                  type="text"
                                  value={
                                    vendor?.id
                                      ? `${window.location.origin}/vendor-profile/${vendor.id}`
                                      : ""
                                  }
                                  readOnly
                                  className="w-full px-3 py-2 text-sm border border-brand-200 rounded-lg bg-brand-50 focus:ring-brand-300"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={copyProfileLink}
                                  className="w-full sm:w-auto flex items-center space-x-1 border-brand-200 hover:bg-brand-100 min-h-[44px]"
                                >
                                  {copied ? (
                                    <Check className="h-4 w-4 text-success-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                  <span className="sr-only sm:not-sr-only">
                                    Copy
                                  </span>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
                          <Button
                            variant="outline"
                            onClick={generateQRCode}
                            disabled={isGeneratingQR}
                            className="w-full sm:w-auto border-brand-200 hover:bg-brand-100 min-h-[44px] text-sm sm:text-base"
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Regenerate QR Code
                          </Button>
                          <Button
                            onClick={downloadQRPDF}
                            disabled={!qrCodeDataUrl}
                            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 min-h-[44px] text-sm sm:text-base"
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

              <Card className="shadow-soft rounded-3xl hover:shadow-medium transition-all duration-300 p-4 sm:p-6">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Latest updates on your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 animate-pulse-slow">
                    <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Account created</p>
                      <p className="text-xs text-muted-foreground">
                        Welcome to Bookhushly
                      </p>
                    </div>
                  </div>
                  {vendor && (
                    <div className="flex items-center space-x-3 sm:space-x-4 animate-pulse-slow">
                      <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">KYC submitted</p>
                        <p className="text-xs text-muted-foreground">
                          Under review
                        </p>
                      </div>
                    </div>
                  )}
                  {vendor?.approved && (
                    <div className="flex items-center space-x-3 sm:space-x-4 animate-pulse-slow">
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent
            value="listings"
            className="space-y-4 sm:space-y-6 animate-fade-in"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-900">
                My Listings
              </h2>
              <Button
                asChild
                disabled={!vendor?.approved}
                className="btn-hospitality bg-brand-600 hover:bg-brand-700 min-h-[44px] text-sm sm:text-base"
              >
                <Link href="/dashboard/vendor/listings/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Listing
                </Link>
              </Button>
            </div>

            {listings.length === 0 ? (
              <Card className="shadow-soft rounded-3xl p-4 sm:p-6">
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                  <Building className="h-10 w-10 sm:h-12 sm:w-12 text-brand-400 mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-brand-900">
                    No listings yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {vendor?.approved
                      ? "Create your first listing to start accepting bookings"
                      : "Complete KYC verification to create listings"}
                  </p>
                  {vendor?.approved && (
                    <Button
                      asChild
                      className="bg-brand-600 hover:bg-brand-700 min-h-[44px] text-sm sm:text-base"
                    >
                      <Link href="/dashboard/vendor/listings/create">
                        Create Your First Listing
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-4">
                  {listings.map((listing) => (
                    <Card
                      key={listing.id}
                      className="shadow-soft rounded-2xl p-4"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-base font-medium">
                            {listing.title}
                          </h3>
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/vendor/listings/${listing.id}`}
                            >
                              Edit
                            </Link>
                          </Button>
                          {listing.event_type === "event_organizer" && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/dashboard/vendor/event-management/${listing.id}`}
                              >
                                Manage Event
                              </Link>
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Category: {listing.category}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Price: ₦{listing.price?.toLocaleString()}
                        </p>
                        <UIBadge
                          variant={listing.active ? "default" : "secondary"}
                        >
                          {listing.active ? "Active" : "Inactive"}
                        </UIBadge>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table className="bg-white rounded-3xl shadow-soft min-w-full">
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
                          <TableCell>
                            ₦{listing.price?.toLocaleString()}
                          </TableCell>
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
                            {listing.event_type === "event_organizer" && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link
                                  href={`/dashboard/vendor/event-management/${listing.id}`}
                                >
                                  Manage Event
                                </Link>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent
            value="bookings"
            className="space-y-4 sm:space-y-6 animate-fade-in"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-brand-900">
              Booking Requests
            </h2>

            {loading ? (
              <Card className="shadow-soft rounded-3xl p-4 sm:p-6">
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                  <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-brand-400 mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-brand-900">
                    Loading bookings...
                  </h3>
                </CardContent>
              </Card>
            ) : bookings.length === 0 ? (
              <Card className="shadow-soft rounded-3xl p-4 sm:p-6">
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                  <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-brand-400 mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-brand-900">
                    No bookings yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Booking requests will appear here once customers start
                    booking your services
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-4">
                  {bookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="shadow-soft rounded-2xl p-4"
                    >
                      <div className="space-y-2">
                        <h3 className="text-base font-medium">
                          {booking.listings?.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Date & Time: {booking.booking_date} at{" "}
                          {booking.booking_time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Guests: {booking.guests}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: ₦{booking.total_amount}
                        </p>
                        <UIBadge variant="outline" className="capitalize">
                          {booking.status}
                        </UIBadge>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table className="bg-white rounded-3xl shadow-soft min-w-full">
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
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent
            value="profile"
            className="space-y-4 sm:space-y-6 animate-fade-in"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-brand-900">
              Vendor Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="shadow-soft rounded-3xl hover:shadow-medium transition-all duration-300 p-4 sm:p-6">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">
                    Business Information
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {vendor
                      ? "Update your business details"
                      : "Complete your vendor profile"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {vendor ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-sm font-medium text-brand-800">
                          Business Name
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {vendor.business_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-brand-800">
                          Status
                        </label>
                        <div className="flex items-center space-x-2 mt-1">
                          <UIBadge
                            variant={vendor.approved ? "default" : "secondary"}
                          >
                            {vendor.approved ? "Approved" : "Pending Review"}
                          </UIBadge>
                        </div>
                      </div>
                      {vendor.approved && (
                        <div>
                          <label className="text-sm font-medium text-brand-800">
                            Share Profile
                          </label>
                          <p className="text-sm text-muted-foreground mb-2 sm:mb-3">
                            Generate a QR code to share your services
                          </p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start border-brand-200 hover:border-brand-300 hover:bg-brand-50 min-h-[44px] text-sm sm:text-base"
                                onClick={generateQRCode}
                              >
                                <QrCode className="mr-2 h-4 w-4" />
                                Generate Profile QR Code
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl p-4 sm:p-6">
                              <DialogHeader>
                                <DialogTitle className="text-lg sm:text-xl">
                                  Your Profile QR Code
                                </DialogTitle>
                                <DialogDescription className="text-sm">
                                  Share your profile with customers by letting
                                  them scan this QR code or share the direct
                                  link.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-3 sm:space-y-4">
                                <Card className="border-0 shadow-none">
                                  <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 bg-brand-50 rounded-2xl">
                                    {isGeneratingQR ? (
                                      <div className="flex items-center justify-center h-24 w-24 sm:h-32 sm:w-32">
                                        <LoadingSpinner className="h-6 w-6 sm:h-8 sm:w-8 text-brand-600" />
                                      </div>
                                    ) : qrCodeDataUrl ? (
                                      <img
                                        src={qrCodeDataUrl}
                                        alt="Profile QR Code"
                                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg shadow-soft"
                                      />
                                    ) : (
                                      <div className="h-24 w-24 sm:h-32 sm:w-32 bg-white rounded-lg flex items-center justify-center shadow-soft">
                                        <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-brand-400" />
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                <Card className="border-0 shadow-none">
                                  <CardHeader className="pb-1 sm:pb-2">
                                    <CardTitle className="text-sm sm:text-base">
                                      Profile Link
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-0 sm:p-4">
                                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                      <input
                                        type="text"
                                        value={
                                          vendor?.id
                                            ? `${window.location.origin}/vendor-profile/${vendor.id}`
                                            : ""
                                        }
                                        readOnly
                                        className="w-full px-3 py-2 text-sm border border-brand-200 rounded-lg bg-brand-50 focus:ring-brand-300"
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={copyProfileLink}
                                        className="w-full sm:w-auto flex items-center space-x-1 border-brand-200 hover:bg-brand-100 min-h-[44px]"
                                      >
                                        {copied ? (
                                          <Check className="h-4 w-4 text-success-600" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                        <span className="sr-only sm:not-sr-only">
                                          Copy
                                        </span>
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
                                <Button
                                  variant="outline"
                                  onClick={generateQRCode}
                                  disabled={isGeneratingQR}
                                  className="w-full sm:w-auto border-brand-200 hover:bg-brand-100 min-h-[44px] text-sm sm:text-base"
                                >
                                  <Share2 className="mr-2 h-4 w-4" />
                                  Regenerate QR Code
                                </Button>
                                <Button
                                  onClick={downloadQRPDF}
                                  disabled={!qrCodeDataUrl}
                                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 min-h-[44px] text-sm sm:text-base"
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
                        className="border-brand-200 hover:bg-brand-50 min-h-[44px] text-sm sm:text-base"
                      >
                        <Link href="/dashboard/vendor/kyc">Update Profile</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-brand-400 mx-auto mb-4" />
                      <p className="text-sm mb-4 text-muted-foreground">
                        Complete your KYC verification to start accepting
                        bookings
                      </p>
                      <Button
                        asChild
                        className="bg-brand-600 hover:bg-brand-700 min-h-[44px] text-sm sm:text-base"
                      >
                        <Link href="/dashboard/vendor/kyc">Complete KYC</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-soft rounded-3xl hover:shadow-medium transition-all duration-300 p-4 sm:p-6">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">
                    Account Settings
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
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
