// components/EventTicketPurchase.jsx
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  Ticket,
  X,
  Camera,
  Share2,
  Heart,
  CreditCard,
  Bitcoin,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { initializePayment, createNOWPaymentsInvoice } from "@/lib/payments";

const EventTicketPurchase = () => {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Ticket Selection, 2: Contact Details, 3: Payment
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTickets, setSelectedTickets] = useState({});
  const [contactDetails, setContactDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const images = service?.media_urls || [];

  // Fetch event data
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        if (!params.id) {
          setError("Invalid event ID");
          return;
        }

        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("id", params.id)
          .eq("category", "events")
          .eq("event_type", "event_organizer")
          .eq("active", true)
          .single();

        if (error) {
          console.error("Supabase error:", error);
          setError(`Event not found: ${error.message}`);
          return;
        }

        if (!data) {
          setError("Event not found or invalid");
          return;
        }

        // Normalize ticket_packages
        const ticketPackages =
          Array.isArray(data.ticket_packages) && data.ticket_packages.length > 0
            ? data.ticket_packages
            : [
                {
                  name: "Standard Ticket",
                  price: data.price || 0,
                  remaining: data.remaining_tickets || 0,
                  description: "Standard admission to the event",
                },
              ];

        setService({ ...data, ticket_packages: ticketPackages });

        // Initialize selectedTickets with zero quantities
        const initialTickets = {};
        ticketPackages.forEach((ticket) => {
          initialTickets[ticket.name] = 0;
        });
        setSelectedTickets(initialTickets);

        // Load contact details from localStorage
        const storedDetails = localStorage.getItem("contactDetails");
        if (storedDetails) {
          setContactDetails(JSON.parse(storedDetails));
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(`Failed to load event details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [params.id]);

  // Calculate total price
  const calculateTotal = () => {
    if (!service) return 0;
    let total = 0;
    service.ticket_packages.forEach((ticket) => {
      total += (selectedTickets[ticket.name] || 0) * ticket.price;
    });
    return total;
  };

  // Handle ticket quantity change
  const handleTicketChange = (ticketName, quantity) => {
    const ticket = service.ticket_packages.find((t) => t.name === ticketName);
    if (quantity < 0 || quantity > ticket.remaining) return;
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketName]: quantity,
    }));
  };

  // Validate ticket selection
  const validateTickets = () => {
    const totalTickets = Object.values(selectedTickets).reduce(
      (sum, qty) => sum + qty,
      0
    );
    if (totalTickets === 0) {
      setError("Please select at least one ticket");
      return false;
    }
    return true;
  };

  // Validate contact details
  const validateContactDetails = () => {
    if (!contactDetails.name) {
      setError("Name is required");
      return false;
    }
    if (!contactDetails.email || !/^\S+@\S+\.\S+$/.test(contactDetails.email)) {
      setError("Valid email is required");
      return false;
    }
    if (!contactDetails.phone) {
      setError("Phone number is required");
      return false;
    }
    return true;
  };

  // Handle contact details submission
  const handleContactSubmit = () => {
    if (!validateContactDetails()) return;
    localStorage.setItem("contactDetails", JSON.stringify(contactDetails));
    setStep(3);
    setError("");
  };

  // Handle payment initiation
  const handlePayment = async (method) => {
    if (!service) {
      setError("Service data not available");
      return;
    }
    setPaymentLoading(true);
    setError("");

    try {
      // Generate temporary user ID if not exists
      let tempUserId = localStorage.getItem("tempUserId");
      if (!tempUserId) {
        tempUserId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("tempUserId", tempUserId);
      }

      // Create booking
      const bookingData = {
        listing_id: service.id,
        temp_user_id: tempUserId,
        booking_date: service.event_date || new Date().toISOString(),
        booking_time: service.created_at
          ? new Date(service.created_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Time TBD",
        guests: Object.values(selectedTickets).reduce(
          (sum, qty) => sum + qty,
          0
        ),
        contact_phone: contactDetails.phone,
        contact_email: contactDetails.email,
        total_amount: calculateTotal(),
        status: "pending",
        payment_status: "pending",
        ticket_details: JSON.stringify(selectedTickets),
      };

      const { data: booking, error: bookingError } = await supabase
        .from("event_bookings")
        .insert(bookingData)
        .select()
        .single();

      if (bookingError || !booking?.id) {
        console.error("Booking creation failed:", bookingError);
        setError(
          `Failed to create booking: ${bookingError?.message || "Unknown error"}`
        );
        toast.error("Booking creation failed");
        return;
      }

      // Log booking for debugging
      console.log("Booking created:", booking);

      // Construct paymentData with validated metadata
      const paymentData = {
        email: contactDetails.email,
        amount: booking.total_amount, // Already in kobo (handled in calculateTotal)
        currency: "NGN",
        reference: `TIX_${booking.id}_${Date.now()}`,
        callback_url: `${window.location.origin}/order-successful/${booking.id}`,
        metadata: {
          event_booking_id: booking.id.toString(), // Ensure string for consistency
          customer_id: tempUserId, // Use tempUserId as customer_id
          service_title: service.title,
          customer_name: contactDetails.name,
        },
      };

      // Log paymentData for debugging
      console.log("Payment data:", paymentData);

      let paymentUrl;
      if (method === "paystack") {
        const { data, error } = await initializePayment(
          "paystack",
          paymentData
        );
        if (error) {
          console.error("Paystack payment error:", error);
          setError(`Payment initialization failed: ${error.message}`);
          toast.error("Payment initialization failed");
          await supabase.from("bookings").delete().eq("id", booking.id);
          return;
        }
        paymentUrl = data.authorization_url;
      } else if (method === "crypto") {
        const { data, error } = await createNOWPaymentsInvoice(
          paymentData,
          "usdt"
        );
        if (error) {
          console.error("Crypto payment error:", error);
          setError(`Crypto payment initialization failed: ${error.message}`);
          toast.error("Crypto payment initialization failed");
          await supabase.from("bookings").delete().eq("id", booking.id);
          return;
        }
        paymentUrl = data.invoice_url;
      }

      // Redirect to payment provider
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error("No payment URL returned");
      }
    } catch (err) {
      console.error("Payment initialization error:", err);
      setError(`Payment initialization failed: ${err.message}`);
      toast.error("Payment failed to initialize");
    } finally {
      setPaymentLoading(false);
    }
  };

  const openFullscreen = (index) => {
    setCurrentImageIndex(index);
    setIsFullscreen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container max-w-4xl py-8">
        <Link
          href="/services?category=events"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
          <p className="text-red-600">{error || "Event not found"}</p>
        </div>
      </div>
    );
  }

  // Rest of the component remains unchanged
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800">
        {images && images.length > 0 ? (
          <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] overflow-hidden">
            <Image
              src={images[0]}
              alt={service.title}
              fill
              className="object-cover opacity-80"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent" />
            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={() => openFullscreen(0)}
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-gray-900 flex items-center gap-2 rounded-full"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">View Photo</span>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-gray-900 rounded-full"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-gray-900 rounded-full"
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>
            {/* Event Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 py-6 sm:py-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
                  {service.title}
                </h1>
                <div className="flex flex-wrap gap-4 sm:gap-6 text-sm sm:text-base text-white/90 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    {service.event_date
                      ? new Date(service.event_date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "Date TBD"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    {service.created_at
                      ? new Date(service.created_at).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "Time TBD"}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    {service.location}
                  </div>
                </div>
                <p className="text-sm sm:text-base text-white/80 max-w-2xl">
                  {service.description ||
                    "Join us for an unforgettable event experience"}
                </p>
              </div>
            </div>
            {/* Badges */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Badge className="bg-purple-600 text-white border-purple-600 rounded-full text-xs sm:text-sm">
                Live Event
              </Badge>
              {service.active && (
                <Badge className="bg-green-600 text-white border-green-600 rounded-full text-xs sm:text-sm">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-purple-600 text-white py-20 sm:py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
              <div className="flex justify-center gap-3 mb-6">
                <Badge className="bg-white/20 text-white border-white/30 rounded-full text-xs sm:text-sm">
                  Live Event
                </Badge>
                {service.active && (
                  <Badge className="bg-green-600 text-white border-green-600 rounded-full text-xs sm:text-sm">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                {service.title}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-3xl mx-auto">
                {service.description ||
                  "Join us for an unforgettable event experience"}
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Progress Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:gap-4 items-center sm:items-stretch max-w-full overflow-hidden">
            {["Select Tickets", "Contact Details", "Payment"].map(
              (stepName, index) => (
                <div
                  key={index}
                  className="flex items-center w-full sm:w-auto sm:flex-1 py-2 sm:py-0"
                >
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs sm:text-sm ${
                      step >= index + 1
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`ml-2 text-xs sm:text-sm font-medium truncate ${
                      step >= index + 1 ? "text-purple-600" : "text-gray-600"
                    }`}
                  >
                    {stepName}
                  </span>
                  {index < 2 && (
                    <div
                      className={`hidden sm:block flex-1 h-1 mx-2 ${
                        step > index + 1 ? "bg-purple-600" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
          <div className="col-span-1 sm:col-span-2 lg:col-span-8 space-y-6 sm:space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                <span className="text-red-600 text-sm sm:text-base">
                  {error}
                </span>
              </div>
            )}
            {/* Step 1: Ticket Selection */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  Select Tickets
                </h2>
                <div className="space-y-4">
                  {service.ticket_packages.map((ticket, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 truncate">
                            {ticket.name}
                          </h3>
                          <p className="text-gray-600 text-sm sm:text-base mb-2">
                            ₦{ticket.price.toLocaleString()} per ticket
                          </p>
                          {ticket.description && (
                            <p className="text-gray-600 text-sm sm:text-base truncate">
                              {ticket.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                          <Badge
                            variant={
                              ticket.remaining > 0 ? "default" : "secondary"
                            }
                            className={`text-xs sm:text-sm px-2 py-1 rounded-full ${
                              ticket.remaining > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {ticket.remaining > 0 ? `Available ` : "Sold Out"}
                          </Badge>
                          {ticket.remaining > 0 && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleTicketChange(
                                    ticket.name,
                                    (selectedTickets[ticket.name] || 0) - 1
                                  )
                                }
                                disabled={selectedTickets[ticket.name] === 0}
                                className="px-3 py-1 sm:px-4 sm:py-2"
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={selectedTickets[ticket.name] || 0}
                                onChange={(e) =>
                                  handleTicketChange(
                                    ticket.name,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-14 sm:w-16 text-center text-sm sm:text-base"
                                min="0"
                                max={ticket.remaining}
                                aria-label={`Quantity for ${ticket.name}`}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleTicketChange(
                                    ticket.name,
                                    (selectedTickets[ticket.name] || 0) + 1
                                  )
                                }
                                disabled={
                                  selectedTickets[ticket.name] >=
                                  ticket.remaining
                                }
                                className="px-3 py-1 sm:px-4 sm:py-2"
                              >
                                +
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full mt-4 sm:mt-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm sm:text-base py-2 sm:py-3"
                  onClick={() => {
                    if (validateTickets()) {
                      setStep(2);
                      setError("");
                    }
                  }}
                >
                  Continue to Contact Details
                </Button>
              </div>
            )}
            {/* Step 2: Contact Details */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  Contact Details
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm sm:text-base font-medium text-gray-900">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      value={contactDetails.name}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter your full name"
                      required
                      className="w-full text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm sm:text-base font-medium text-gray-900">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={contactDetails.email}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter your email"
                      required
                      className="w-full text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm sm:text-base font-medium text-gray-900">
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      value={contactDetails.phone}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Enter your phone number"
                      required
                      className="w-full text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button
                      variant="outline"
                      className="w-full rounded-full text-sm sm:text-base py-2 sm:py-3"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm sm:text-base py-2 sm:py-3"
                      onClick={handleContactSubmit}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  Payment
                </h2>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base">
                            Paystack
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm">
                            Card, Bank Transfer, USSD
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handlePayment("paystack")}
                        disabled={paymentLoading}
                        className="w-full sm:w-auto rounded-full text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2"
                      >
                        {paymentLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (
                          "Pay with Paystack"
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Bitcoin className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base">
                            Pay with Crypto
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm">
                            Bitcoin, Ethereum, USDT & more
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handlePayment("crypto")}
                        disabled={paymentLoading}
                        className="w-full sm:w-auto rounded-full text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2"
                      >
                        {paymentLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (
                          "Pay with Crypto"
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-600 text-xs sm:text-sm">
                      Secure & Verified Ticketing
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-full text-sm sm:text-base py-2 sm:py-3"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* Sidebar: Event Summary */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8 lg:sticky lg:top-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Event Summary
              </h3>
              <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
                <div>
                  <h4 className="font-semibold text-base sm:text-lg">
                    {service.title}
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600">
                    {service.location}
                  </p>
                </div>
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span>
                      {service.event_date
                        ? new Date(service.event_date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Date TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time</span>
                    <span>
                      {service.created_at
                        ? new Date(service.created_at).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )
                        : "Time TBD"}
                    </span>
                  </div>
                </div>
                {step >= 1 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2 text-base sm:text-lg">
                      Selected Tickets
                    </h4>
                    {Object.entries(selectedTickets).map(([name, quantity]) =>
                      quantity > 0 ? (
                        <div
                          key={name}
                          className="flex justify-between text-sm sm:text-base"
                        >
                          <span className="truncate">
                            {name} x {quantity}
                          </span>
                          <span>
                            ₦
                            {(
                              quantity *
                              service.ticket_packages.find(
                                (t) => t.name === name
                              ).price
                            ).toLocaleString()}
                          </span>
                        </div>
                      ) : null
                    )}
                    <div className="flex justify-between font-semibold text-base sm:text-lg mt-2">
                      <span>Total</span>
                      <span>₦{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
              {step === 1 && (
                <Button
                  className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                  onClick={() => {
                    if (validateTickets()) {
                      setStep(2);
                      setError("");
                    }
                  }}
                >
                  Continue to Contact Details
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Fullscreen Modal */}
      {isFullscreen && images && images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all duration-200"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white text-sm sm:text-base font-medium truncate max-w-[80%]">
            {service.title}
          </div>
          <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-4 sm:mx-6">
            <Image
              src={images[currentImageIndex]}
              alt={service.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTicketPurchase;
