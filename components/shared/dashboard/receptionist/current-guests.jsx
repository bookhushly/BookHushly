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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Calendar, Users, Phone, Mail, Clock, Bed } from "lucide-react";
import { toast } from "sonner";

export function CurrentGuestsTab({ hotelId }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCurrentGuests();

    // Set up real-time subscription
    const subscription = supabase
      .channel("current_guests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hotel_bookings",
          filter: `hotel_id=eq.${hotelId}`,
        },
        () => {
          loadCurrentGuests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [hotelId]);

  const loadCurrentGuests = async () => {
    try {
      setLoading(true);

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
        .eq("booking_status", "checked_in")
        .order("check_out_date", { ascending: true });

      if (error) throw error;

      setGuests(data || []);
    } catch (error) {
      console.error("Error loading guests:", error);
      toast.error("Failed to load current guests");
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (checkOutDate) => {
    const now = new Date();
    const checkout = new Date(checkOutDate);
    const hours = Math.ceil((checkout - now) / (1000 * 60 * 60));

    if (hours < 0) {
      return {
        text: "Overdue",
        color: "text-red-600",
        bgColor: "bg-red-50",
        urgent: true,
      };
    }
    if (hours < 6) {
      return {
        text: `${hours}h left`,
        color: "text-red-600",
        bgColor: "bg-red-50",
        urgent: true,
      };
    }
    if (hours < 24) {
      return {
        text: `${hours}h left`,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        urgent: false,
      };
    }

    const days = Math.ceil(hours / 24);
    return {
      text: `${days}d left`,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      urgent: false,
    };
  };

  const getStayDuration = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return `${nights} ${nights === 1 ? "night" : "nights"}`;
  };

  const filteredGuests = guests.filter(
    (guest) =>
      guest.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.hotel_rooms?.room_number.toString().includes(searchTerm)
  );

  // Sort by urgency (overdue and soon-to-checkout first)
  const sortedGuests = [...filteredGuests].sort((a, b) => {
    const timeA = getTimeRemaining(a.check_out_date);
    const timeB = getTimeRemaining(b.check_out_date);

    if (timeA.urgent && !timeB.urgent) return -1;
    if (!timeA.urgent && timeB.urgent) return 1;

    return new Date(a.check_out_date) - new Date(b.check_out_date);
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Guests</CardTitle>
          <CardDescription>
            All guests currently checked in ({guests.length} active)
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

          {sortedGuests.length === 0 ? (
            <div className="text-center py-12">
              <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm
                  ? "No guests match your search"
                  : "No guests currently checked in"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedGuests.map((guest) => {
                const timeInfo = getTimeRemaining(guest.check_out_date);

                return (
                  <div
                    key={guest.id}
                    className={`border-2 rounded-lg p-4 ${
                      timeInfo.urgent
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200"
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {guest.guest_name}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-xs font-medium"
                          >
                            Room {guest.hotel_rooms?.room_number}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{guest.guest_email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{guest.guest_phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(
                                guest.check_in_date
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                guest.check_out_date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {guest.adults} adult
                              {guest.adults !== 1 ? "s" : ""}
                              {guest.children > 0 &&
                                `, ${guest.children} child${guest.children !== 1 ? "ren" : ""}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-right ${timeInfo.bgColor} rounded-lg p-3`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className={`h-4 w-4 ${timeInfo.color}`} />
                          <span className={`font-semibold ${timeInfo.color}`}>
                            {timeInfo.text}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">until checkout</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                      <Badge variant="outline">
                        {guest.hotel_rooms?.hotel_room_types?.name}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {getStayDuration(
                          guest.check_in_date,
                          guest.check_out_date
                        )}
                      </span>
                      {guest.special_requests && (
                        <span className="text-sm text-gray-500 italic">
                          Special: {guest.special_requests}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {guests.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Guests</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {
                  guests.filter((g) => {
                    const hours = Math.ceil(
                      (new Date(g.check_out_date) - new Date()) /
                        (1000 * 60 * 60)
                    );
                    return hours > 0 && hours < 24;
                  }).length
                }
              </p>
              <p className="text-sm text-gray-600 mt-1">Checking Out Today</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {
                  guests.filter((g) => {
                    const hours = Math.ceil(
                      (new Date(g.check_out_date) - new Date()) /
                        (1000 * 60 * 60)
                    );
                    return hours < 6;
                  }).length
                }
              </p>
              <p className="text-sm text-gray-600 mt-1">Urgent Checkouts</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
