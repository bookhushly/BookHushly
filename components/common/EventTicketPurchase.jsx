"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { toast } from "sonner";
import { initializePayment, createNOWPaymentsInvoice } from "@/lib/payments";
import { createClient } from "@/lib/supabase/client";

export default function EventsTicketPurchase({
  service,
  user,
  addBooking,
  onSubmit,
}) {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [selectedTickets, setSelectedTickets] = useState({});
  const [ticketPackages, setTicketPackages] = useState([]);
  const [contactDetails, setContactDetails] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const images = service?.media_urls || [];

  // Helper function to format event date (timestamp without timezone)
  const formatEventDate = (dateString, format = "long") => {
    if (!dateString) return "Date TBD";

    try {
      const date = new Date(dateString);

      if (format === "short") {
        return date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      }

      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date TBD";
    }
  };

  // Helper function to format event time (timestamp with timezone)
  const formatEventTime = (timeString) => {
    if (!timeString) return "Time TBD";

    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Time TBD";
    }
  };

  // Initialize ticket packages and contact details
  useEffect(() => {
    if (!service) {
      setError("Service data is not available");
      setTicketPackages([]);
      return;
    }

    console.log("Service data:", service); // Debug log
    console.log("Ticket packages from service:", service.ticket_packages); // Debug log

    // Normalize ticket_packages
    const normalizedTicketPackages =
      Array.isArray(service.ticket_packages) &&
      service.ticket_packages.length > 0
        ? service.ticket_packages.map((pkg) => ({
            name: pkg.name || "Ticket",
            price: parseFloat(pkg.price) || 0,
            remaining: parseInt(pkg.remaining) || 0,
            total: parseInt(pkg.total) || 0,
            description: pkg.description || "",
          }))
        : [
            {
              name: "Standard Ticket",
              price: parseFloat(service.price) || 0,
              remaining: parseInt(service.remaining_tickets) || 0,
              total: parseInt(service.total_tickets) || 0,
              description: "Standard admission to the event",
            },
          ];

    console.log("Normalized ticket packages:", normalizedTicketPackages); // Debug log
    setTicketPackages(normalizedTicketPackages);

    // Initialize selectedTickets with zero quantities
    const initialTickets = {};
    normalizedTicketPackages.forEach((ticket) => {
      initialTickets[ticket.name] = 0;
    });
    setSelectedTickets(initialTickets);

    // Load contact details
    const storedDetails = localStorage.getItem("contactDetails");
    if (storedDetails) {
      setContactDetails(JSON.parse(storedDetails));
    } else if (user?.email) {
      setContactDetails((prev) => ({ ...prev, email: user.email }));
    }
  }, [service, user]);

  // Calculate total price
  const calculateTotal = () => {
    if (!ticketPackages.length) return 0;
    let total = 0;
    ticketPackages.forEach((ticket) => {
      total += (selectedTickets[ticket.name] || 0) * ticket.price;
    });
    return total;
  };

  // Handle ticket quantity change
  const handleTicketChange = (ticketName, quantity) => {
    console.log("Changing ticket:", ticketName, "to quantity:", quantity); // Debug log

    const ticket = ticketPackages.find((t) => t.name === ticketName);
    if (!ticket) {
      console.error("Ticket not found:", ticketName);
      return;
    }

    if (quantity < 0 || quantity > ticket.remaining) {
      console.log("Invalid quantity:", quantity, "Max:", ticket.remaining);
      return;
    }

    setSelectedTickets((prev) => ({
      ...prev,
      [ticketName]: quantity,
    }));

    setError(""); // Clear any previous errors
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
      let customerId = user?.id;
      let tempUserId = null;
      if (!customerId) {
        tempUserId =
          localStorage.getItem("tempUserId") ||
          `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("tempUserId", tempUserId);
      }

      const bookingData = {
        listing_id: service.id,
        customer_id: customerId || null,
        temp_user_id: tempUserId,
        booking_date: service.event_date
          ? new Date(service.event_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        booking_time: service.event_time
          ? formatEventTime(service.event_time)
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

      const { data: booking, error: bookingError } =
        await onSubmit(bookingData);

      if (bookingError) {
        console.error("Booking creation failed:", bookingError);
        setError(
          `Failed to create booking: ${bookingError?.message || "Unknown error"}`
        );
        toast.error("Booking creation failed");
        return;
      }

      const paymentData = {
        email: contactDetails.email,
        amount: booking.total_amount,
        currency: "NGN",
        reference: `TIX_${booking.id}_${Date.now()}`,
        callback_url: `${window.location.origin}/order-successful/${booking.id}`,
        metadata: {
          event_booking_id: booking.id.toString(),
          customer_id: customerId || tempUserId,
          service_title: service.title,
          customer_name: contactDetails.name,
        },
      };

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
          await supabase.from("event_bookings").delete().eq("id", booking.id);
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
          await supabase.from("event_bookings").delete().eq("id", booking.id);
          return;
        }
        paymentUrl = data.invoice_url;
      }

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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] overflow-hidden">
          <Image
            src={images[0] || "/service-images/events/1.jpg"}
            alt={service?.title || "Event"}
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
                {service?.title || "Event"}
              </h1>
              <div className="flex flex-wrap gap-4 sm:gap-6 text-sm sm:text-base text-white/90 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  {formatEventDate(service?.event_date, "short")}
                </div>
                <div className="flex items-center gap-2">
                  <Clock
                    className="w-4 h-4 sm
                  :w-5 sm:h-5"
                  />
                  {formatEventTime(service?.event_time)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  {service?.location || "Location TBD"}
                </div>
              </div>
              <p className="text-sm sm:text-base text-white/80 max-w-2xl">
                {service?.description ||
                  "Join us for an unforgettable event experience"}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Badge className="bg-purple-600 text-white border-purple-600 rounded-full text-xs sm:text-sm">
              Live Event
            </Badge>
            {service?.active && (
              <Badge className="bg-green-600 text-white border-green-600 rounded-full text-xs sm:text-sm">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
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
          <div className="col-span-1 sm:col-span-2 lg:col-span-7 space-y-6 sm:space-y-8">
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
                {ticketPackages.length > 0 ? (
                  <div className="space-y-4">
                    {ticketPackages.map((ticket, index) => (
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
                              <p className="text-gray-600 text-sm sm:text-base">
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
                              {ticket.remaining > 0 ? `Available` : "Sold Out"}
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
                ) : (
                  <div className="text-center text-gray-600">
                    No ticket packages available.
                  </div>
                )}
                <Button
                  className="w-full mt-4 sm:mt-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm sm:text-base py-2 sm:py-3"
                  onClick={() => {
                    if (validateTickets()) {
                      setStep(2);
                      setError("");
                    }
                  }}
                  disabled={ticketPackages.length === 0}
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
                        className="w-full sm:w-auto rounded-full bg-purple-600 text-white text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2"
                      >
                        {paymentLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (
                          "Pay with Paystack"
                        )}
                      </Button>
                    </div>
                  </div>
                  {service?.price > 50000 && (
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
                  )}

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
          <div className="col-span-1 sm:col-span-2 lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8 lg:sticky lg:top-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Event Summary
              </h3>
              <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
                <div>
                  <h4 className="font-semibold text-base sm:text-lg">
                    {service?.title || "Event"}
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600">
                    {service?.location || "Location TBD"}
                  </p>
                </div>
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span>{formatEventDate(service?.event_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time</span>
                    <span>{formatEventTime(service?.event_time)}</span>
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
                          className="flex justify-between text-sm sm:text-base mb-1"
                        >
                          <span className="truncate">
                            {name} x {quantity}
                          </span>
                          <span>
                            ₦
                            {(
                              quantity *
                              (ticketPackages.find((t) => t.name === name)
                                ?.price || 0)
                            ).toLocaleString()}
                          </span>
                        </div>
                      ) : null
                    )}
                    <div className="flex justify-between font-semibold text-base sm:text-lg mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span>₦{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
              {step === 1 && (
                <Button
                  className="w-full h-10 xs:h-11 sm:h-12 px-4 py-2 text-sm xs:text-base sm:text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  onClick={() => {
                    if (validateTickets()) {
                      setStep(2);
                      setError("");
                    }
                  }}
                  disabled={ticketPackages.length === 0}
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
            {service?.title || "Event"}
          </div>
          <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-4 sm:mx-6">
            <Image
              src={images[currentImageIndex]}
              alt={service?.title || "Event"}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
