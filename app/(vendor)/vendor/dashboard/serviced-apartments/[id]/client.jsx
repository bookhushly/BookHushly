"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Home,
  MapPin,
  DollarSign,
  Zap,
  Image as ImageIcon,
  FileText,
  Calendar,
  Settings,
  Edit,
  Save,
  X,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  updateServicedApartment,
  deleteServicedApartment,
} from "@/app/actions/apartments";
import OverviewTab from "../../../../../../components/shared/dashboard/vendor/apartments/details/overview";
import CalendarTab from "../../../../../../components/shared/dashboard/vendor/apartments/details/calendar";
import SettingsTab from "../../../../../../components/shared/dashboard/vendor/apartments/details/settings";
import BookingsTab from "../../../../../../components/shared/dashboard/vendor/apartments/details/booking";

export default function ApartmentDetailsPage({
  apartment: initialApartment,
  apartmentId,
}) {
  const router = useRouter();
  const supabase = createClient();

  const [apartment, setApartment] = useState(initialApartment);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle apartment status
  const handleToggleStatus = async () => {
    const newStatus = apartment.status === "active" ? "inactive" : "active";

    setLoading(true);
    try {
      const formData = new FormData();

      // Add all current apartment data
      Object.entries(apartment).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        if (typeof value === "object" && !Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === "boolean") {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value.toString());
        }
      });

      // Update status
      formData.set("status", newStatus);

      const result = await updateServicedApartment(apartmentId, formData);

      if (result.success) {
        setApartment(result.data);
        toast.success(
          `Apartment ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
        );
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Delete apartment
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteServicedApartment(apartmentId);

      if (result.success) {
        toast.success("Apartment deleted successfully");
        router.push("/vendor/dashboard");
      } else {
        toast.error(result.error || "Failed to delete apartment");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Update apartment data after edit
  const handleApartmentUpdate = (updatedData) => {
    setApartment(updatedData);
  };

  const isActive = apartment.status === "active";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-gray-600 text-lg hover:text-gray-900"
              >
                <Link href="/vendor/dashboard">
                  <ArrowLeft className="h-4 w-4 " />
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={`${
                  isActive
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {isActive ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isActive ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>

              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/services/serviced-apartments/${apartmentId}`}
                  target="_blank"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {apartment.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {apartment.area && `${apartment.area}, `}
              {apartment.city}, {apartment.state}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewTab
              apartment={apartment}
              apartmentId={apartmentId}
              onUpdate={handleApartmentUpdate}
            />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <BookingsTab apartmentId={apartmentId} />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <CalendarTab apartmentId={apartmentId} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SettingsTab
              apartment={apartment}
              apartmentId={apartmentId}
              onDelete={() => setShowDeleteDialog(true)}
              onToggleStatus={handleToggleStatus}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              Delete Apartment
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Are you sure you want to delete &quot;
              <span className="font-semibold text-gray-900">
                {apartment.name}
              </span>
              &quot;? This action cannot be undone and all related data will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Apartment
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
