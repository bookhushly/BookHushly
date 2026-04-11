"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import { bookHotelRoomAction, getEffectivePriceAction } from "@/app/actions/hotels";
import HotelDateRangePicker from "@/components/shared/hotels/HotelDateRangePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Shield,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Bed,
  CreditCard,
  Hotel,
} from "lucide-react";
import { toast } from "sonner";
import { NIGERIAN_AIRPORTS, getAirportByCode } from "@/lib/constants/airports";

export default function HotelBookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const supabase = createClient();

  const roomTypeId = params.roomTypeId;

  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
    });
  }, []);

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
  const [payAtHotel, setPayAtHotel] = useState(false);
  const [airportTransfer, setAirportTransfer] = useState(false);
  const [airportTransferType, setAirportTransferType] = useState("pickup");
  const [airportTransferNotes, setAirportTransferNotes] = useState("");
  const [selectedAirport, setSelectedAirport] = useState("");
  const [pricingResult, setPricingResult] = useState(null);

  useEffect(() => {
    loadBookingData();
  }, []);

  // Re-calculate effective price whenever dates change
  useEffect(() => {
    if (roomTypeId && bookingDetails.checkInDate && bookingDetails.checkOutDate) {
      getEffectivePriceAction(
        roomTypeId,
        bookingDetails.checkInDate,
        bookingDetails.checkOutDate,
      ).then((res) => {
        if (res.success) setPricingResult(res);
      });
    } else {
      setPricingResult(null);
    }
  }, [roomTypeId, bookingDetails.checkInDate, bookingDetails.checkOutDate]);

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
            policies,
            pay_at_hotel_enabled,
            airport_transfer_enabled,
            airport_transfer_fee,
            airport_prices
          )
        `,
        )
        .eq("id", roomTypeId)
        .single();

      if (roomTypeError) throw roomTypeError;

      setRoomType(roomTypeData);
      setHotel(roomTypeData.hotels);

      if (bookingDetails.checkInDate && bookingDetails.checkOutDate) {
        await checkAvailability(roomTypeId, bookingDetails.checkInDate, bookingDetails.checkOutDate);
      }
    } catch (err) {
      console.error("Error loading booking data:", err);
      setError("Failed to load booking information");
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (rtId, checkIn, checkOut) => {
    const ci = checkIn ?? bookingDetails.checkInDate;
    const co = checkOut ?? bookingDetails.checkOutDate;
    if (!ci || !co) return;

    try {
      // Count bookings that overlap with the requested date range
      const { data, error } = await supabase
        .from("hotel_bookings")
        .select("id")
        .eq("room_type_id", rtId)
        .in("booking_status", ["confirmed", "checked_in"])
        .neq("payment_status", "failed")
        .lt("check_in_date", co)
        .gt("check_out_date", ci);

      if (error) throw error;

      const bookedCount = data?.length ?? 0;
      // Use available_rooms from the room type; fall back to 1
      const totalRooms = roomType?.available_rooms ?? 1;
      const freeRooms = Math.max(0, totalRooms - bookedCount);

      // setAvailableRooms is used only for the "X rooms available" badge
      setAvailableRooms(freeRooms > 0 ? Array(freeRooms).fill({ id: "available" }) : []);

      if (freeRooms === 0) {
        setError("No rooms available for selected dates");
      } else {
        setError("");
      }
    } catch (err) {
      console.error("Error checking availability:", err);
      // Don't block the user on a network error — the server action is authoritative
    }
  };

  const calculateNights = () => {
    if (pricingResult) return pricingResult.nights;
    if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) return 0;
    const checkIn = new Date(bookingDetails.checkInDate);
    const checkOut = new Date(bookingDetails.checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const basePrice = pricingResult
      ? pricingResult.totalPrice
      : calculateNights() * (roomType?.base_price || 0);

    let airportFee = 0;
    if (airportTransfer && selectedAirport && hotel?.airport_prices?.[selectedAirport]) {
      airportFee = hotel.airport_prices[selectedAirport];
      if (airportTransferType === "both") airportFee *= 2;
    } else if (airportTransfer && !hotel?.airport_prices && hotel?.airport_transfer_fee) {
      // Fallback to flat fee if no per-airport prices configured
      airportFee = hotel.airport_transfer_fee;
      if (airportTransferType === "both") airportFee *= 2;
    }

    return basePrice + airportFee;
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
    // Run availability preview so the UI badge stays fresh, but don't gate on
    // its result — the atomic RPC is the authoritative availability check.
    checkAvailability(roomType.id, bookingDetails.checkInDate, bookingDetails.checkOutDate);
    setStep(2);
    setError("");
  };

  const handleProceedToPayment = async () => {
    if (!validateGuestDetails()) return;

    setSubmitting(true);
    setError("");

    try {
      const totalAmount = calculateTotal();

      // Single atomic server action — locks a room and inserts the booking in
      // one PostgreSQL transaction, preventing race conditions.
      const result = await bookHotelRoomAction({
        roomTypeId:           roomType.id,
        hotelId:              hotel.id,
        guestName:            guestDetails.name,
        guestEmail:           guestDetails.email,
        guestPhone:           guestDetails.phone,
        checkInDate:          bookingDetails.checkInDate,
        checkOutDate:         bookingDetails.checkOutDate,
        adults:               bookingDetails.adults,
        children:             bookingDetails.children,
        totalPrice:           totalAmount,
        specialRequests:      guestDetails.specialRequests || null,
        payAtHotel,
        airportTransfer,
        airportTransferType:  airportTransfer ? airportTransferType : null,
        airportTransferNotes: airportTransfer ? airportTransferNotes : null,
        airportCode:          airportTransfer && selectedAirport ? selectedAirport : null,
      });

      if (!result.success) {
        setError(result.error || "Failed to create booking");
        toast.error(result.error || "Failed to create booking");
        return;
      }

      // Fire "Booking Received" in-app notification (non-blocking)
      fetch("/api/bookings/hotel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: result.bookingId, hotelName: hotel?.name }),
      }).catch(() => {});

      // Pay at Hotel → skip payment gateway, go to confirmation
      if (result.payAtHotel) {
        router.push(`/order-successful/${result.bookingId}?type=hotel&pay_at_hotel=true`);
      } else {
        router.push(`/payment/hotel/${result.bookingId}`);
      }
    } catch (err) {
      console.error("Booking creation error:", err);
      setError(err.message || "Failed to create booking");
      toast.error("Failed to create booking");
    } finally {
      setSubmitting(false);
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
            <h3 className="text-lg font-medium mb-2">Booking Not Found</h3>
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
    <div className="min-h-screen bg-gray-50 pt-20">
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
              ),
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            )}

            {step === 1 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-medium text-gray-900 mb-6">
                    Select Your Dates
                  </h2>

                  <div className="space-y-4">
                    {/* Visual date-range picker with blocked dates */}
                    <HotelDateRangePicker
                      roomTypeId={roomType?.id}
                      checkIn={bookingDetails.checkInDate}
                      checkOut={bookingDetails.checkOutDate}
                      onChange={({ checkIn, checkOut }) =>
                        setBookingDetails((prev) => ({
                          ...prev,
                          checkInDate: checkIn,
                          checkOutDate: checkOut,
                        }))
                      }
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adults">Adults</Label>
                        <Input
                          id="adults"
                          type="text" inputMode="decimal"
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
                          type="text" inputMode="decimal"
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
                          <span className="font-medium text-purple-600">
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

            {step === 2 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-medium text-gray-900 mb-6">
                    Guest Information
                  </h2>

                  {mounted && !isAuthenticated && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>
                          Create an account to track your bookings
                        </strong>
                      </p>
                      <p className="text-sm text-blue-700 mb-3">
                        Sign up now to easily manage your reservations
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
                        placeholder="Any special requests..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Airport transfer add-on */}
                  {hotel?.airport_transfer_enabled && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-purple-300 transition-colors"
                        onClick={() => setAirportTransfer((v) => !v)}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 accent-purple-600 cursor-pointer"
                          checked={airportTransfer}
                          onChange={(e) => setAirportTransfer(e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Add Airport Transfer
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {hotel.airport_prices && Object.keys(hotel.airport_prices).length > 0
                              ? `Prices from ₦${Math.min(...Object.values(hotel.airport_prices)).toLocaleString("en-NG")} per trip`
                              : hotel.airport_transfer_fee
                              ? `₦${Number(hotel.airport_transfer_fee).toLocaleString("en-NG")} per trip`
                              : "Fee varies by airport"}
                            {" · "}Select your airport below
                          </p>
                        </div>
                      </div>

                      {airportTransfer && (
                        <div className="space-y-3 pl-2">
                          {/* Airport selector */}
                          {hotel.airport_prices && Object.keys(hotel.airport_prices).length > 0 && (
                            <div className="space-y-1.5">
                              <Label className="text-xs text-gray-600">Select airport *</Label>
                              <select
                                value={selectedAirport}
                                onChange={(e) => setSelectedAirport(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                              >
                                <option value="">— Choose your airport —</option>
                                {NIGERIAN_AIRPORTS
                                  .filter((a) => hotel.airport_prices[a.code] > 0)
                                  .map((airport) => (
                                    <option key={airport.code} value={airport.code}>
                                      {airport.city} ({airport.code}) — ₦{Number(hotel.airport_prices[airport.code]).toLocaleString("en-NG")} per trip
                                    </option>
                                  ))}
                              </select>
                              {selectedAirport && (
                                <p className="text-xs text-purple-600 font-medium">
                                  {getAirportByCode(selectedAirport)?.name}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Transfer type</Label>
                            <div className="flex gap-2">
                              {["pickup", "dropoff", "both"].map((t) => {
                                const airportFee = selectedAirport && hotel.airport_prices?.[selectedAirport]
                                  ? hotel.airport_prices[selectedAirport]
                                  : hotel.airport_transfer_fee || 0;
                                const feeLabel = airportFee > 0
                                  ? ` · ₦${(t === "both" ? airportFee * 2 : airportFee).toLocaleString("en-NG")}`
                                  : "";
                                return (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => setAirportTransferType(t)}
                                    className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                                      airportTransferType === t
                                        ? "border-purple-500 bg-purple-50 text-purple-700"
                                        : "border-gray-200 text-gray-600 hover:border-purple-300"
                                    }`}
                                  >
                                    {t === "pickup" ? "Airport → Hotel" : t === "dropoff" ? "Hotel → Airport" : "Both ways"}
                                    <span className="block text-[10px] opacity-70">{feeLabel}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Flight details (optional)</Label>
                            <input
                              type="text"
                              placeholder="e.g. Arik Air W3 200, Terminal 1, arrives 14:30"
                              value={airportTransferNotes}
                              onChange={(e) => setAirportTransferNotes(e.target.value)}
                              className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment method — Pay at Hotel if vendor has it enabled */}
                  {hotel?.pay_at_hotel_enabled && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            value: false,
                            title: "Pay Online",
                            desc: "Paystack or crypto — secure instant payment",
                            icon: CreditCard,
                          },
                          {
                            value: true,
                            title: "Pay at Hotel",
                            desc: "Pay cash or transfer when you arrive",
                            icon: Hotel,
                          },
                        ].map((opt) => (
                          <button
                            key={String(opt.value)}
                            type="button"
                            onClick={() => setPayAtHotel(opt.value)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${
                              payAtHotel === opt.value
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-purple-300"
                            }`}
                          >
                            <opt.icon className="h-5 w-5 mb-1 text-gray-600" />
                            <p className="text-sm font-medium text-gray-900">{opt.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                      {payAtHotel && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          Your room will be held for 24 hours before check-in. Please arrive on time to avoid cancellation.
                        </p>
                      )}
                    </div>
                  )}

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
                      onClick={handleProceedToPayment}
                      disabled={submitting}
                    >
                      {submitting ? "Creating..." : payAtHotel ? "Confirm Reservation" : "Continue to Payment"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-5">
            <Card className="border-0 shadow-sm lg:sticky lg:top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-medium text-gray-900 mb-6">
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
                    <h4 className="font-medium text-lg">{hotel.name}</h4>
                    <p className="text-sm text-gray-600">
                      {hotel.city}, {hotel.state}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-2">{roomType.name}</h5>
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
                              bookingDetails.checkInDate,
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
                              bookingDetails.checkOutDate,
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
                      {pricingResult?.hasPriceVariation ? (
                        <>
                          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                            Seasonal pricing applies to some nights
                          </p>
                          {/* Show unique rule names */}
                          {[...new Set(pricingResult.breakdown.filter(d => d.rule).map(d => d.rule))].map((ruleName) => {
                            const ruleNights = pricingResult.breakdown.filter(d => d.rule === ruleName);
                            const ruleTotal = ruleNights.reduce((s, d) => s + d.price, 0);
                            return (
                              <div key={ruleName} className="flex justify-between text-sm">
                                <span className="text-gray-600">{ruleName} ({ruleNights.length}n)</span>
                                <span className="font-medium">₦{ruleTotal.toLocaleString()}</span>
                              </div>
                            );
                          })}
                          {(() => {
                            const stdNights = pricingResult.breakdown.filter(d => !d.rule);
                            if (!stdNights.length) return null;
                            const stdTotal = stdNights.reduce((s, d) => s + d.price, 0);
                            return (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Standard ({stdNights.length}n)</span>
                                <span className="font-medium">₦{stdTotal.toLocaleString()}</span>
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            ₦{roomType.base_price.toLocaleString()} × {nights}{" "}
                            night{nights !== 1 ? "s" : ""}
                          </span>
                          <span className="font-medium">
                            ₦{total.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {airportTransfer && (() => {
                        const airportFee = selectedAirport && hotel?.airport_prices?.[selectedAirport]
                          ? hotel.airport_prices[selectedAirport]
                          : hotel?.airport_transfer_fee || 0;
                        if (!airportFee) return null;
                        const totalFee = airportFee * (airportTransferType === "both" ? 2 : 1);
                        const airportLabel = selectedAirport
                          ? ` (${selectedAirport}${airportTransferType === "both" ? " ×2" : ""})`
                          : airportTransferType === "both" ? " (×2)" : "";
                        return (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Airport transfer{airportLabel}</span>
                            <span className="font-medium">₦{totalFee.toLocaleString()}</span>
                          </div>
                        );
                      })()}
                      <div className="flex justify-between font-medium text-lg pt-2 border-t">
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
