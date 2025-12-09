"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  QrCode,
  Download,
  Copy,
  Check,
  Share2,
  Trash2,
  Eye,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useListingStore, useBookingStore } from "@/lib/store";

function getApprovalStatus(vendor) {
  if (!vendor) {
    return {
      message: "Complete your vendor profile",
      icon: AlertCircle,
      variant: "warning",
      action: "/vendor/dashboard/kyc",
    };
  }
  if (!vendor.approved) {
    if (vendor.status === "reviewing") {
      return {
        message: "KYC verification in progress",
        icon: Clock,
        variant: "info",
      };
    }
    if (vendor.status === "denied") {
      return {
        message: "KYC verification denied. Contact support.",
        icon: AlertCircle,
        variant: "error",
      };
    }
  }
  return {
    message: "Account verified",
    icon: CheckCircle2,
    variant: "success",
  };
}

export default function VendorDashboardClient({
  user,
  vendor,
  stats: initialStats,
}) {
  const supabase = createClient();

  // Get data from Zustand stores
  const { listings, setListings } = useListingStore();
  const { bookings, setBookings } = useBookingStore();

  const [stats, setStats] = useState(initialStats);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const approvalStatus = getApprovalStatus(vendor);
  const StatusIcon = approvalStatus.icon;

  // Fetch and populate stores if empty
  useEffect(() => {
    async function loadData() {
      if (!vendor?.approved) return;

      const isEventVendor = vendor.business_category === "events";

      // Fetch listings if store is empty - CORRECTED FIELDS
      if (listings.length === 0) {
        const { data: listingsData } = await supabase
          .from("listings")
          .select(
            "id, title, price, created_at, active, media_urls, category, description, location"
          )
          .eq("vendor_id", vendor.id)
          .order("created_at", { ascending: false });

        if (listingsData) {
          setListings(listingsData);
        }
      }

      // Fetch bookings if store is empty - CORRECTED FIELDS
      if (bookings.length === 0 && (listings.length > 0 || vendor)) {
        const listingIds = listings.length > 0 ? listings.map((l) => l.id) : [];

        if (listingIds.length > 0) {
          if (isEventVendor) {
            const { data: eventBookingsData } = await supabase
              .from("event_bookings")
              .select(
                `
                id, 
                total_amount, 
                booking_date, 
                status, 
                created_at, 
                listing_id,
                listings(title, media_urls)
              `
              )
              .in("listing_id", listingIds)
              .order("created_at", { ascending: false });

            if (eventBookingsData) {
              setBookings(eventBookingsData);
            }
          } else {
            const { data: regularBookingsData } = await supabase
              .from("bookings")
              .select(
                `
                id, 
                total_amount, 
                booking_date, 
                status, 
                created_at, 
                listing_id,
                listings(title, media_urls)
              `
              )
              .in("listing_id", listingIds)
              .order("created_at", { ascending: false });

            if (regularBookingsData) {
              setBookings(regularBookingsData);
            }
          }
        }
      }
    }

    loadData();
  }, [
    vendor,
    listings.length,
    bookings.length,
    setListings,
    setBookings,
    supabase,
  ]);

  // Recalculate stats when listings or bookings change
  useEffect(() => {
    if (vendor?.approved) {
      const totalListings = listings.length;
      const activeBookings = bookings.filter(
        (b) => b.status === "confirmed"
      ).length;
      const pendingRequests = bookings.filter(
        (b) => b.status === "pending"
      ).length;

      setStats((prev) => ({
        ...prev,
        totalListings,
        activeBookings,
        pendingRequests,
      }));
    }
  }, [listings, bookings, vendor]);

  // QR Code generation
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

  // Copy profile link
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

  // Download QR PDF
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

  // Delete listing
  const handleDeleteListing = async () => {
    if (!listingToDelete) return;

    setIsDeleting(true);
    try {
      if (
        listingToDelete.vendor_id &&
        vendor?.id &&
        listingToDelete.vendor_id !== vendor.id
      ) {
        throw new Error("You don't have permission to delete this listing");
      }

      const res = await fetch(`/api/listings/${listingToDelete.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to delete listing");
      }

      const deletedData = payload?.data;
      if (!deletedData || deletedData.length === 0) {
        throw new Error(
          "Failed to delete listing. The database policy may be blocking this action."
        );
      }

      // Update Zustand store instead of local state
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingToDelete.id
      );
      setListings(updatedListings);

      toast.success("Listing deleted successfully");
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    } catch (error) {
      toast.error(
        error.message || "Failed to delete listing. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (listing) => {
    setListingToDelete(listing);
    setDeleteDialogOpen(true);
  };

  // Get recent items for display - now from store
  const recentListings = listings.slice(0, 5);
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-8 bg-purple-50">
      {/* KYC Status Alert */}
      {(!vendor || !vendor.approved) && (
        <div
          className={`relative overflow-hidden rounded-xl border ${
            approvalStatus.variant === "warning"
              ? "border-amber-200 bg-amber-50"
              : approvalStatus.variant === "info"
                ? "border-blue-200 bg-blue-50"
                : "border-red-200 bg-red-50"
          }`}
        >
          <div className="px-5 py-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`mt-0.5 rounded-lg p-1.5 ${
                  approvalStatus.variant === "warning"
                    ? "bg-amber-100"
                    : approvalStatus.variant === "info"
                      ? "bg-blue-100"
                      : "bg-red-100"
                }`}
              >
                <StatusIcon
                  className={`h-4 w-4 ${
                    approvalStatus.variant === "warning"
                      ? "text-amber-700"
                      : approvalStatus.variant === "info"
                        ? "text-blue-700"
                        : "text-red-700"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-gray-900">
                  {approvalStatus.message}
                </p>
                {approvalStatus.action && (
                  <Link
                    href={approvalStatus.action}
                    className="inline-flex items-center gap-1 text-[14px] font-medium text-purple-600 hover:text-purple-700 mt-1.5 transition-colors"
                  >
                    Complete verification
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-gray-200/60 hover:border-gray-300  transition-all duration-200 group hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Building2
                    className="h-5 w-5 text-purple-700"
                    strokeWidth={2}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-full px-2.5 py-1">
                <ArrowUpRight className="h-3 w-3" />
                8%
              </div>
            </div>
            <div>
              <p className="text-[13px] font-medium text-gray-500 uppercase tracking-wide mb-2">
                Total Listings
              </p>
              <p className="text-[32px] font-semibold text-gray-900 leading-none tracking-tight">
                {stats.totalListings}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200/60 hover:border-gray-300 transition-all duration-200 group hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Calendar className="h-5 w-5 text-blue-700" strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-full px-2.5 py-1">
                <ArrowUpRight className="h-3 w-3" />
                4%
              </div>
            </div>
            <div>
              <p className="text-[13px] font-medium text-gray-500 uppercase tracking-wide mb-2">
                Active Bookings
              </p>
              <p className="text-[32px] font-semibold text-gray-900 leading-none tracking-tight">
                {stats.activeBookings}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200/60 hover:border-gray-300 transition-all duration-200 group hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <DollarSign
                    className="h-5 w-5 text-emerald-700"
                    strokeWidth={2}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-full px-2.5 py-1">
                <ArrowUpRight className="h-3 w-3" />
                12%
              </div>
            </div>
            <div>
              <p className="text-[13px] font-medium text-gray-500 uppercase tracking-wide mb-2">
                Total Revenue
              </p>
              <p className="text-[32px] font-semibold text-gray-900 leading-none tracking-tight">
                ₦{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200/60 hover:border-gray-300 transition-all duration-200 group hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <TrendingUp
                    className="h-5 w-5 text-orange-700"
                    strokeWidth={2}
                  />
                </div>
              </div>
              {stats.pendingRequests > 0 && (
                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-[13px] font-medium text-gray-500 uppercase tracking-wide mb-2">
                Pending Requests
              </p>
              <p className="text-[32px] font-semibold text-gray-900 leading-none tracking-tight">
                {stats.pendingRequests}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {vendor?.approved && (
        <Card className="border-gray-200/60 bg-purple-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-semibold text-gray-50">
                  Quick Actions
                </h3>
                <p className="text-[13px] text-gray-100 mt-0.5">
                  Manage your business operations
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-white  h-10 text-[14px] hover:bg-pruple-200 text-purple-700 font-medium shadow-sm"
              >
                <Link href="/vendor/dashboard/listings/create">
                  <Plus className="h-4 w-4" strokeWidth={3} />
                  New Listing
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 text-[14px] font-medium border-gray-200/60 hover:bg-gray-50"
              >
                <Link href="/vendor/dashboard/bookings">View Bookings</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 text-[14px] font-medium border-gray-200/60 hover:bg-gray-50"
              >
                <Link href="/vendor/dashboard//wallet">Wallet</Link>
              </Button>

              {/* QR Code Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 text-[14px] font-medium border-gray-200/60 hover:bg-gray-50"
                    onClick={generateQRCode}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Get QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <QrCode className="h-5 w-5 text-purple-600" />
                      </div>
                      Your Profile QR Code
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      Share your profile with customers by letting them scan
                      this QR code or copy the direct link below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-5">
                    <div className="flex items-center justify-center p-8 bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-2xl border-2 border-purple-100/50">
                      {isGeneratingQR ? (
                        <div className="text-center">
                          <div className="h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-sm text-gray-600">
                            Generating QR code...
                          </p>
                        </div>
                      ) : qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="Profile QR Code"
                          className="w-52 h-52 rounded-xl"
                        />
                      ) : (
                        <div className="text-center">
                          <QrCode className="h-20 w-20 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">
                            Click generate to create QR code
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Your Profile Link
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          readOnly
                          value={`${typeof window !== "undefined" ? window.location.origin : ""}/vendor-profile/${vendor?.id}`}
                          className="text-sm bg-gray-50 border-gray-200 font-mono"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={copyProfileLink}
                          className="shrink-0 h-10 w-10"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={generateQRCode}
                      disabled={isGeneratingQR}
                      className="h-11"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Regenerate QR
                    </Button>
                    <Button
                      onClick={downloadQRPDF}
                      disabled={!qrCodeDataUrl}
                      className="bg-purple-600 hover:bg-purple-700 h-11"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <Card className="border-gray-200/60">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">
                Recent Listings
              </h3>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Your latest services
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-8">
              <Link
                href="/vendor/dashboard/listings"
                className="text-[13px] font-medium text-purple-600 hover:text-purple-700"
              >
                View all
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <CardContent className="px-6 pb-6">
            {recentListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Building2
                    className="h-7 w-7 text-gray-400"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-[14px] font-medium text-gray-900 mb-1">
                  No listings yet
                </p>
                <p className="text-[13px] text-gray-500 mb-5">
                  Create your first listing to get started
                </p>
                {vendor?.approved && (
                  <Button asChild size="sm" variant="outline">
                    <Link href="/vendor/dashboard/listings/create">
                      <Plus className="mr-2 h-3.5 w-3.5" />
                      Create Listing
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="group flex items-center gap-3 p-3.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all"
                  >
                    {/* CORRECTED: media_urls is an array, get first item */}
                    {listing.media_urls?.[0] && (
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={listing.media_urls[0]}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                        {listing.title}
                      </p>
                      <p className="text-[13px] text-gray-500 mt-0.5">
                        ₦{listing.price?.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* CORRECTED: active is boolean, not status string */}
                      <Badge
                        variant={listing.active ? "default" : "secondary"}
                        className={`text-xs ${
                          listing.active
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : ""
                        }`}
                      >
                        {listing.active ? "active" : "inactive"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <Link href={`/vendor/dashboard/listings/${listing.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openDeleteDialog(listing)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="border-gray-200/60">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">
                Recent Bookings
              </h3>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Latest reservations
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-8">
              <Link
                href="/vendor/dashboard/bookings"
                className="text-[13px] font-medium text-purple-600 hover:text-purple-700"
              >
                View all
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <CardContent className="px-6 pb-6">
            {recentBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar
                    className="h-7 w-7 text-gray-400"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-[14px] font-medium text-gray-900 mb-1">
                  No bookings yet
                </p>
                <p className="text-[13px] text-gray-500">
                  Bookings will appear here once customers reserve
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="group flex items-center gap-3 p-3.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all cursor-pointer"
                  >
                    {/* CORRECTED: Access nested listing data from join */}
                    {booking.listings?.media_urls?.[0] && (
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={booking.listings.media_urls[0]}
                          alt={booking.listings?.title || "Listing"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                        {booking.listings?.title || "Listing"}
                      </p>
                      {/* CORRECTED: total_amount not total_price */}
                      <p className="text-[13px] text-gray-500 mt-0.5">
                        ₦{booking.total_amount?.toLocaleString()} ·{" "}
                        {new Date(booking.booking_date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </p>
                    </div>
                    <Badge
                      variant={
                        booking.status === "confirmed"
                          ? "default"
                          : booking.status === "pending"
                            ? "secondary"
                            : "secondary"
                      }
                      className={`text-xs ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : booking.status === "pending"
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                            : ""
                      }`}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              Delete Listing
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to delete &quot;
              <span className="font-semibold text-gray-900">
                {listingToDelete?.title}
              </span>
              &quot;? This action cannot be undone and all related data will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setListingToDelete(null);
              }}
              disabled={isDeleting}
              className="h-11 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteListing}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white h-11 font-semibold"
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Listing
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
