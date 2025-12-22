/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Users,
  CreditCard,
  Bitcoin,
  Shield,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Bed,
} from "lucide-react";
import { toast } from "sonner";

import { initializePayment, createNOWPaymentsInvoice } from "@/lib/payments";

export default function HotelBookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const supabase = createClient();

  const roomTypeId = params.roomTypeId;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  const [hotel, setHotel] = useState(null);
  const [roomType, setRoomType] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);

  const [bookingDetails, setBookingDetails] = useState({
    checkInDate: searchParams.get("checkIn") || "",
    checkOutDate: searchParams.get("checkOut") || "",
    adults: parseInt(searchParams.get("adults")) || 1,
    children: parseInt(searchParams.get("children")) || 0,
  });

  const [guestDetails, setGuestDetails] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "",
    specialRequests: "",
  });

  useEffect(() => {
    loadBookingData();
  }, []);

  const loadBookingData = async () => {
    try {
      setLoading(true);

      const { data: roomTypeData, error: roomTypeError } = await supabase
        .from("hotel_room_types")
        .select(
          `
          *,
          hotels (
            id,
            name,
            city,
            state,
            image_urls,
            checkout_policy,
            policies
          )
        `
        )
        .eq("id", roomTypeId)
        .single();

      if (roomTypeError) throw roomTypeError;

      setRoomType(roomTypeData);
      setHotel(roomTypeData.hotels);

      if (bookingDetails.checkInDate && bookingDetails.checkOutDate) {
        await checkAvailability(roomTypeId);
      }
    } catch (err) {
      console.error("Error loading booking data:", err);
      setError("Failed to load booking information");
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (roomTypeId) => {
    try {
      const { data: availableRoomsData, error: roomsError } = await supabase
        .from("hotel_rooms")
        .select("*")
        .eq("room_type_id", roomTypeId)
        .eq("status", "available");

      if (roomsError) throw roomsError;

      if (availableRoomsData.length === 0) {
        setError("No rooms available for selected dates");
        return;
      }

      const { data: bookingsData, error: bookingsError } = await supabase
        .from("hotel_bookings")
        .select("room_id")
        .gte("check_out_date", bookingDetails.checkInDate)
        .lte("check_in_date", bookingDetails.checkOutDate)
        .in("booking_status", ["confirmed", "checked_in"]);

      if (bookingsError) throw bookingsError;

      const bookedRoomIds = bookingsData.map((b) => b.room_id);
      const available = availableRoomsData.filter(
        (room) => !bookedRoomIds.includes(room.id)
      );

      setAvailableRooms(available);

      if (available.length === 0) {
        setError("No rooms available for selected dates");
      } else {
        setError("");
      }
    } catch (err) {
      console.error("Error checking availability:", err);
      toast.error("Failed to check availability");
    }
  };

  const calculateNights = () => {
    if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) return 0;
    const checkIn = new Date(bookingDetails.checkInDate);
    const checkOut = new Date(bookingDetails.checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * (roomType?.base_price || 0);
  };

  const validateBookingDetails = () => {
    if (!bookingDetails.checkInDate) {
      setError("Please select check-in date");
      return false;
    }
    if (!bookingDetails.checkOutDate) {
      setError("Please select check-out date");
      return false;
    }
    if (
      new Date(bookingDetails.checkInDate) >=
      new Date(bookingDetails.checkOutDate)
    ) {
      setError("Check-out date must be after check-in date");
      return false;
    }
    if (new Date(bookingDetails.checkInDate) < new Date()) {
      setError("Check-in date cannot be in the past");
      return false;
    }
    if (availableRooms.length === 0) {
      setError("No rooms available for selected dates");
      return false;
    }
    return true;
  };

  const validateGuestDetails = () => {
    if (!guestDetails.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (
      !guestDetails.email.trim() ||
      !/^\S+@\S+\.\S+$/.test(guestDetails.email)
    ) {
      setError("Valid email is required");
      return false;
    }
    if (!guestDetails.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    return true;
  };

  const handleContinueToGuest = async () => {
    if (!validateBookingDetails()) return;
    await checkAvailability(roomType.id);
    if (availableRooms.length > 0) {
      setStep(2);
      setError("");
    }
  };

  const handleContinueToPayment = () => {
    if (!validateGuestDetails()) return;
    setStep(3);
    setError("");
  };

  const handlePayment = async (method) => {
    setPaymentLoading(true);
    setError("");

    try {
      if (availableRooms.length === 0) {
        throw new Error("No rooms available");
      }

      const selectedRoom = availableRooms[0];
      const totalAmount = calculateTotal();

      const bookingData = {
        hotel_id: hotel.id,
        room_id: selectedRoom.id,
        room_type_id: roomType.id,
        customer_id: user?.id || null,
        guest_name: guestDetails.name,
        guest_email: guestDetails.email,
        guest_phone: guestDetails.phone,
        check_in_date: bookingDetails.checkInDate,
        check_out_date: bookingDetails.checkOutDate,
        adults: bookingDetails.adults,
        children: bookingDetails.children,
        total_price: totalAmount,
        payment_status: "pending",
        booking_status: "confirmed",
        special_requests: guestDetails.specialRequests || null,
      };

      const { data: booking, error: bookingError } = await supabase
        .from("hotel_bookings")
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) throw bookingError;

      await supabase
        .from("hotel_rooms")
        .update({ status: "reserved" })
        .eq("id", selectedRoom.id);

      const paymentData = {
        email: guestDetails.email,
        amount: totalAmount,
        currency: "NGN",
        reference: `HOTEL_${booking.id}_${Date.now()}`,
        callback_url: `${window.location.origin}/order-successful/${booking.id}?type=hotel`,
        metadata: {
          hotel_booking_id: booking.id.toString(),
          customer_id: user?.id || "guest",
          hotel_name: hotel.name,
          room_type: roomType.name,
          customer_name: guestDetails.name,
          check_in: bookingDetails.checkInDate,
          check_out: bookingDetails.checkOutDate,
        },
      };

      let paymentUrl;
      if (method === "paystack") {
        const { data, error } = await initializePayment(
          "paystack",
          paymentData
        );
        if (error) throw error;
        paymentUrl = data.authorization_url;
      } else if (method === "crypto") {
        const { data, error } = await createNOWPaymentsInvoice(
          paymentData,
          "usdt"
        );
        if (error) throw error;
        paymentUrl = data.invoice_url;
      }

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error("No payment URL returned");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment initialization failed");
      toast.error("Payment failed to initialize");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!hotel || !roomType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Booking Not Found</h3>
            <p className="text-gray-600 mb-4">We couldn't find this booking</p>
            <Button onClick={() => router.push("/services?category=hotels")}>
              Back to Hotels
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nights = calculateNights();
  const total = calculateTotal();
  const roomImage =
    roomType.image_urls?.[0] ||
    hotel.image_urls?.[0] ||
    "/placeholder-room.jpg";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Secure Booking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4 max-w-2xl mx-auto">
            {["Booking Details", "Guest Information", "Payment"].map(
              (stepName, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= index + 1
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium hidden sm:block ${
                      step >= index + 1 ? "text-purple-600" : "text-gray-600"
                    }`}
                  >
                    {stepName}
                  </span>
                  {index < 2 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > index + 1 ? "bg-purple-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-7 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            )}

            {/* Step 1: Booking Details */}
            {step === 1 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Select Your Dates
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="checkIn">Check-in Date</Label>
                        <Input
                          id="checkIn"
                          type="date"
                          value={bookingDetails.checkInDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) =>
                            setBookingDetails({
                              ...bookingDetails,
                              checkInDate: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="checkOut">Check-out Date</Label>
                        <Input
                          id="checkOut"
                          type="date"
                          value={bookingDetails.checkOutDate}
                          min={
                            bookingDetails.checkInDate ||
                            new Date().toISOString().split("T")[0]
                          }
                          onChange={(e) =>
                            setBookingDetails({
                              ...bookingDetails,
                              checkOutDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adults">Adults</Label>
                        <Input
                          id="adults"
                          type="number"
                          min="1"
                          max={roomType.max_occupancy}
                          value={bookingDetails.adults}
                          onChange={(e) =>
                            setBookingDetails({
                              ...bookingDetails,
                              adults: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="children">Children</Label>
                        <Input
                          id="children"
                          type="number"
                          min="0"
                          value={bookingDetails.children}
                          onChange={(e) =>
                            setBookingDetails({
                              ...bookingDetails,
                              children: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>

                    {nights > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Total nights:</span>
                          <span className="font-semibold text-purple-600">
                            {nights} {nights === 1 ? "night" : "nights"}
                          </span>
                        </div>
                      </div>
                    )}

                    {availableRooms.length > 0 &&
                      bookingDetails.checkInDate &&
                      bookingDetails.checkOutDate && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-green-600 text-sm">
                            {availableRooms.length} room
                            {availableRooms.length !== 1 ? "s" : ""} available
                          </span>
                        </div>
                      )}
                  </div>

                  <Button
                    className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                    onClick={handleContinueToGuest}
                  >
                    Continue to Guest Information
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Guest Details */}
            {step === 2 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Guest Information
                  </h2>

                  {!user && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>
                          Create an account to track your bookings
                        </strong>
                      </p>
                      <p className="text-sm text-blue-700 mb-3">
                        Sign up now to easily manage your reservations and get
                        exclusive benefits
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/auth/signup")}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        Create Account
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={guestDetails.name}
                        onChange={(e) =>
                          setGuestDetails({
                            ...guestDetails,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestDetails.email}
                        onChange={(e) =>
                          setGuestDetails({
                            ...guestDetails,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={guestDetails.phone}
                        onChange={(e) =>
                          setGuestDetails({
                            ...guestDetails,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requests">
                        Special Requests (Optional)
                      </Label>
                      <Textarea
                        id="requests"
                        value={guestDetails.specialRequests}
                        onChange={(e) =>
                          setGuestDetails({
                            ...guestDetails,
                            specialRequests: e.target.value,
                          })
                        }
                        placeholder="Any special requests or requirements..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={handleContinueToPayment}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Payment Method
                  </h2>

                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Paystack</h3>
                            <p className="text-sm text-gray-600">
                              Card, Bank Transfer, USSD
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handlePayment("paystack")}
                          disabled={paymentLoading}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {paymentLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                          ) : (
                            "Pay Now"
                          )}
                        </Button>
                      </div>
                    </div>

                    {total > 50000 && (
                      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Bitcoin className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Cryptocurrency</h3>
                              <p className="text-sm text-gray-600">
                                Bitcoin, Ethereum, USDT
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handlePayment("crypto")}
                            disabled={paymentLoading}
                          >
                            {paymentLoading ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                            ) : (
                              "Pay with Crypto"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 text-sm">
                        Your payment is secure and encrypted
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-6"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-5">
            <Card className="border-0 shadow-sm lg:sticky lg:top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Booking Summary
                </h3>

                <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={roomImage}
                    alt={roomType.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">{hotel.name}</h4>
                    <p className="text-sm text-gray-600">
                      {hotel.city}, {hotel.state}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-semibold mb-2">{roomType.name}</h5>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Up to {roomType.max_occupancy} guests</span>
                      </div>
                      {roomType.size_sqm && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{roomType.size_sqm}m²</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {step >= 1 &&
                    bookingDetails.checkInDate &&
                    bookingDetails.checkOutDate && (
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Check-in</span>
                          <span className="font-medium">
                            {new Date(
                              bookingDetails.checkInDate
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Check-out</span>
                          <span className="font-medium">
                            {new Date(
                              bookingDetails.checkOutDate
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Guests</span>
                          <span className="font-medium">
                            {bookingDetails.adults} Adult
                            {bookingDetails.adults !== 1 ? "s" : ""}
                            {bookingDetails.children > 0 &&
                              `, ${bookingDetails.children} Child${bookingDetails.children !== 1 ? "ren" : ""}`}
                          </span>
                        </div>
                      </div>
                    )}

                  {nights > 0 && (
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          ₦{roomType.base_price.toLocaleString()} × {nights}{" "}
                          night{nights !== 1 ? "s" : ""}
                        </span>
                        <span className="font-medium">
                          ₦{total.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span className="text-purple-600">
                          ₦{total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
