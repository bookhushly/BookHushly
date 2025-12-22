"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  UserCheck,
  UserX,
  Calendar,
  Users,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export function CheckInTab({ hotelId, onUpdate }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [hotelId]);

  const loadBookings = async () => {
    try {
      setLoading(true);

      const today = new Date().toISOString().split("T")[0];

      // Load bookings that are confirmed or checked_in
      const { data, error } = await supabase
        .from("hotel_bookings")
        .select(
          `
          *,
          hotel_rooms (
            room_number,
            floor,
            hotel_room_types (
              name
            )
          )
        `
        )
        .eq("hotel_id", hotelId)
        .in("booking_status", ["confirmed", "checked_in"])
        .gte("check_out_date", today)
        .order("check_in_date", { ascending: true });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (booking) => {
    setProcessing(true);

    try {
      // Update booking status
      const { error: bookingError } = await supabase
        .from("hotel_bookings")
        .update({
          booking_status: "checked_in",
        })
        .eq("id", booking.id);

      if (bookingError) throw bookingError;

      // Update room status to occupied
      const { error: roomError } = await supabase
        .from("hotel_rooms")
        .update({
          status: "occupied",
        })
        .eq("id", booking.room_id);

      if (roomError) throw roomError;

      toast.success("Guest checked in successfully");
      setDialogOpen(false);
      loadBookings();
      onUpdate();
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error("Failed to check in guest");
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async (booking) => {
    setProcessing(true);

    try {
      // Calculate hours stayed
      const checkInTime = new Date(booking.created_at);
      const checkOutTime = new Date();
      const hoursStayed = Math.ceil(
        (checkOutTime - checkInTime) / (1000 * 60 * 60)
      );

      // Update booking status
      const { error: bookingError } = await supabase
        .from("hotel_bookings")
        .update({
          booking_status: "checked_out",
        })
        .eq("id", booking.id);

      if (bookingError) throw bookingError;

      // Update room status to dirty (needs cleaning)
      const { error: roomError } = await supabase
        .from("hotel_rooms")
        .update({
          status: "dirty",
        })
        .eq("id", booking.room_id);

      if (roomError) throw roomError;

      toast.success(
        `Guest checked out successfully. Stayed for ${hoursStayed} hours`
      );
      setDialogOpen(false);
      loadBookings();
      onUpdate();
    } catch (error) {
      console.error("Error checking out:", error);
      toast.error("Failed to check out guest");
    } finally {
      setProcessing(false);
    }
  };

  const openDialog = (booking, action) => {
    setSelectedBooking({ ...booking, action });
    setDialogOpen(true);
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.hotel_rooms?.room_number.toString().includes(searchTerm)
  );

  const getTimeRemaining = (checkOutDate) => {
    const now = new Date();
    const checkout = new Date(checkOutDate);
    const hours = Math.ceil((checkout - now) / (1000 * 60 * 60));

    if (hours < 0) return { text: "Overdue", color: "text-red-600" };
    if (hours < 6) return { text: `${hours}h left`, color: "text-red-600" };
    if (hours < 24) return { text: `${hours}h left`, color: "text-yellow-600" };
    return { text: `${Math.ceil(hours / 24)}d left`, color: "text-gray-600" };
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Check In / Check Out</CardTitle>
            <CardDescription>
              Manage guest arrivals and departures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by guest name, email, or room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No bookings found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const timeInfo = getTimeRemaining(booking.check_out_date);
                  const isCheckedIn = booking.booking_status === "checked_in";

                  return (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">
                              {booking.guest_name}
                            </h3>
                            <Badge
                              variant={isCheckedIn ? "default" : "secondary"}
                            >
                              {isCheckedIn ? "Checked In" : "Confirmed"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{booking.guest_email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{booking.guest_phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(
                                  booking.check_in_date
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(
                                  booking.check_out_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>
                                {booking.adults + (booking.children || 0)}{" "}
                                guests
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 pt-2">
                            <Badge variant="outline">
                              Room {booking.hotel_rooms?.room_number}
                            </Badge>
                            <Badge variant="outline">
                              {booking.hotel_rooms?.hotel_room_types?.name}
                            </Badge>
                            {isCheckedIn && (
                              <span
                                className={`flex items-center gap-1 text-sm ${timeInfo.color}`}
                              >
                                <Clock className="h-3.5 w-3.5" />
                                {timeInfo.text}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {!isCheckedIn ? (
                            <Button
                              onClick={() => openDialog(booking, "checkin")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Check In
                            </Button>
                          ) : (
                            <Button
                              onClick={() => openDialog(booking, "checkout")}
                              variant="destructive"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Check Out
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBooking?.action === "checkin"
                ? "Check In Guest"
                : "Check Out Guest"}
            </DialogTitle>
            <DialogDescription>
              {selectedBooking?.action === "checkin"
                ? "Confirm guest arrival and mark room as occupied"
                : "Confirm guest departure and mark room as needing cleaning"}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-2 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Guest:</span>
                <span className="font-medium">
                  {selectedBooking.guest_name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Room:</span>
                <span className="font-medium">
                  #{selectedBooking.hotel_rooms?.room_number}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Room Type:</span>
                <span className="font-medium">
                  {selectedBooking.hotel_rooms?.hotel_room_types?.name}
                </span>
              </div>
              {selectedBooking.action === "checkin" && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-in Date:</span>
                  <span className="font-medium">
                    {new Date(
                      selectedBooking.check_in_date
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedBooking?.action === "checkin"
                  ? handleCheckIn(selectedBooking)
                  : handleCheckOut(selectedBooking)
              }
              disabled={processing}
              className={
                selectedBooking?.action === "checkin"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {processing ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : selectedBooking?.action === "checkin" ? (
                "Confirm Check In"
              ) : (
                "Confirm Check Out"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
