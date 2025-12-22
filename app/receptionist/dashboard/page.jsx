"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import { AuthGuard } from "@/components/shared/auth/auth-guard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Building2,
  DoorOpen,
  Sparkles,
  Clock,
  AlertCircle,
  MapPin,
  LogOut,
  User,
} from "lucide-react";
import { CheckInTab } from "../../../components/shared/dashboard/receptionist/check-in";
import { RoomStatusTab } from "../../../components/shared/dashboard/receptionist/room-status";
import { CurrentGuestsTab } from "../../../components/shared/dashboard/receptionist/current-guests";
import { FaBroom } from "react-icons/fa";
import { signOut } from "@/lib/auth";

export default function ReceptionistDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState(null);
  const [staffInfo, setStaffInfo] = useState(null);
  const [stats, setStats] = useState({
    occupied: 0,
    available: 0,
    dirty: 0,
    checkingInToday: 0,
  });
  const [activeTab, setActiveTab] = useState("checkin");

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data: staffData, error: staffError } = await supabase
        .from("hotel_staff")
        .select(
          `
          hotel_id,
          role,
          hotels (
            id,
            name,
            city,
            state,
            address,
            image_urls
          )
        `
        )
        .eq("user_id", user.id)
        .single();

      if (staffError) throw staffError;

      if (!staffData) {
        router.push("/");
        return;
      }

      setHotel(staffData.hotels);
      setStaffInfo({ role: staffData.role });

      const { data: roomsData, error: roomsError } = await supabase
        .from("hotel_rooms")
        .select("status")
        .eq("hotel_id", staffData.hotel_id);

      if (roomsError) throw roomsError;

      const occupied = roomsData.filter((r) => r.status === "occupied").length;
      const available = roomsData.filter(
        (r) => r.status === "available"
      ).length;
      const dirty = roomsData.filter((r) => r.status === "dirty").length;

      const today = new Date().toISOString().split("T")[0];
      const { count: checkInCount } = await supabase
        .from("hotel_bookings")
        .select("*", { count: "exact", head: true })
        .eq("hotel_id", staffData.hotel_id)
        .eq("check_in_date", today)
        .eq("booking_status", "confirmed");

      setStats({
        occupied,
        available,
        dirty,
        checkingInToday: checkInCount || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner className="h-8 w-8 text-purple-600" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-gray-600">
              You are not authorized to access the receptionist portal
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hotelImage = hotel.image_urls?.[0];
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Receptionist Portal
                  </p>
                  <p className="text-xs text-gray-500">{hotel.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{currentTime}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section with Hotel Image */}
        <div className="relative h-80 bg-gray-900 overflow-hidden">
          {hotelImage ? (
            <>
              <Image
                src={hotelImage}
                alt={hotel.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900" />
          )}

          <div className="relative h-full container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1 w-12 bg-purple-400 rounded-full" />
                <span className="text-purple-200 text-sm font-medium uppercase tracking-wider">
                  Welcome back
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                {hotel.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {hotel.address || `${hotel.city}, ${hotel.state}`}
                  </span>
                </div>
                <span className="text-white/30">•</span>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="capitalize">
                    {staffInfo?.role || "Receptionist"}
                  </span>
                </div>
                <span className="text-white/30">•</span>
                <span>{currentDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <DoorOpen className="h-6 w-6 text-gray-700" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Occupied
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-gray-900">
                    {stats.occupied}
                  </div>
                  <p className="text-sm text-gray-500">Rooms in use</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <DoorOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Available
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-green-600">
                    {stats.available}
                  </div>
                  <p className="text-sm text-gray-500">Ready to book</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-yellow-50 rounded-xl">
                    <FaBroom className="h-6 w-6 text-yellow-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Cleaning
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-yellow-600">
                    {stats.dirty}
                  </div>
                  <p className="text-sm text-gray-500">Needs attention</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-purple-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-200 bg-gradient-to-br from-purple-600 to-purple-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-purple-100 uppercase tracking-wider">
                    Today
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-white">
                    {stats.checkingInToday}
                  </div>
                  <p className="text-sm text-purple-100">Checking in today</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Card className="border border-gray-100 shadow-sm">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b border-gray-100 px-6">
                <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                  <TabsTrigger
                    value="checkin"
                    className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-4 font-medium"
                  >
                    Check In/Out
                  </TabsTrigger>
                  <TabsTrigger
                    value="rooms"
                    className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-4 font-medium"
                  >
                    Room Status
                  </TabsTrigger>
                  <TabsTrigger
                    value="guests"
                    className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-4 font-medium"
                  >
                    Current Guests
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="checkin" className="m-0">
                  <CheckInTab hotelId={hotel.id} onUpdate={loadDashboardData} />
                </TabsContent>

                <TabsContent value="rooms" className="m-0">
                  <RoomStatusTab
                    hotelId={hotel.id}
                    onUpdate={loadDashboardData}
                  />
                </TabsContent>

                <TabsContent value="guests" className="m-0">
                  <CurrentGuestsTab
                    hotelId={hotel.id}
                    onUpdate={loadDashboardData}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
