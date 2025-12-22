"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import { AuthGuard } from "@/components/shared/auth/auth-guard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { HotelDetailsTab } from "@/components/shared/dashboard/vendor/hotels/details/details";
import { HotelRoomsTab } from "@/components/shared/dashboard/vendor/hotels/details/rooms";
import { HotelStaffTab } from "@/components/shared/dashboard/vendor/hotels/details/staff";

export default function HotelManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!authLoading && user?.id) {
      loadHotel();
    }
  }, [params.id, user?.id, authLoading]);

  const loadHotel = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .eq("id", params.id)
        .eq("vendor_id", user.id)
        .single();

      if (error) throw error;

      setHotel(data);
    } catch (error) {
      console.error("Error loading hotel:", error);
      router.push("/vendor/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!hotel) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container max-w-7xl py-6">
            <Link
              href="/vendor/dashboard"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>

            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900">
                    {hotel.name}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {hotel.city}, {hotel.state}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="container max-w-7xl py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="details">Hotel Details</TabsTrigger>
              <TabsTrigger value="rooms">Rooms & Types</TabsTrigger>
              <TabsTrigger value="staff">Staff Management</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <HotelDetailsTab hotel={hotel} onUpdate={loadHotel} />
            </TabsContent>

            <TabsContent value="rooms">
              <HotelRoomsTab hotelId={hotel.id} />
            </TabsContent>

            <TabsContent value="staff">
              <HotelStaffTab hotelId={hotel.id} hotelName={hotel.name} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}
