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
import {
  initializePayment,
  verifyPayment,
  createNOWPaymentsInvoice,
} from "@/lib/payments";

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
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("id", params.id)
          .eq("category", "events")
          .eq("event_type", "event_organizer")
          .eq("active", true)
          .single();

        if (error || !data) {
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
                  price: data.price,
                  remaining: data.remaining_tickets,
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
        setError("Failed to load event details");
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
    const platformFee = total * 0.05; // 5% platform fee
    return total + platformFee;
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
    if (!service) return;
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
        .from("bookings")
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) {
        setError("Failed to create booking");
        toast.error("Booking creation failed");
        return;
      }

      const paymentData = {
        email: contactDetails.email,
        amount: booking.total_amount * 100, // Convert to kobo for Paystack
        currency: "NGN",
        reference: `TIX_${booking.id}_${Date.now()}`,
        callback_url: `${window.location.origin}/order-successful/${booking.id}`,
        metadata: {
          booking_id: booking.id,
          temp_user_id: tempUserId,
          service_title: service.title,
          customer_name: contactDetails.name,
        },
      };

      if (method === "paystack") {
        const { data, error } = await initializePayment(
          "paystack",
          paymentData
        );
        if (error) {
          setError(error.message);
          toast.error("Payment initialization failed");
          return;
        }
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        }
      } else if (method === "crypto") {
        const { data, error } = await createNOWPaymentsInvoice(
          paymentData,
          "usdt"
        );
        if (error) {
          setError(error.message);
          toast.error("Crypto payment initialization failed");
          return;
        }
        if (data.invoice_url) {
          window.location.href = data.invoice_url;
        }
      }
    } catch (err) {
      setError("Payment initialization failed");
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
          href="/events"
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800">
        {images && images.length > 0 ? (
          <div className="relative h-[60vh] md:h-[80vh] overflow-hidden">
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
                <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-white/90 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
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
                    <Clock className="w-4 h-4" />
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
                    <MapPin className="w-4 h-4" />
                    {service.location}
                  </div>
                </div>
                <p className="text-sm md:text-base text-white/80 max-w-2xl">
                  {service.description ||
                    "Join us for an unforgettable event experience"}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Badge className="bg-purple-600 text-white border-purple-600 rounded-full">
                Live Event
              </Badge>
              {service.active && (
                <Badge className="bg-green-600 text-white border-green-600 rounded-full">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-purple-600 text-white py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
              <div className="flex justify-center gap-3 mb-6">
                <Badge className="bg-white/20 text-white border-white/30 rounded-full">
                  Live Event
                </Badge>
                {service.active && (
                  <Badge className="bg-green-600 text-white border-green-600 rounded-full">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                {service.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
                {service.description ||
                  "Join us for an unforgettable event experience"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {["Select Tickets", "Contact Details", "Payment"].map(
              (stepName, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= index + 1
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      step >= index + 1 ? "text-purple-600" : "text-gray-600"
                    }`}
                  >
                    {stepName}
                  </span>
                  {index < 2 && (
                    <div
                      className={`h-1 w-16 sm:w-24 mx-2 ${
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <AlertTriangle className="h-5 w-5 text-red-600 inline-block mr-2" />
                <span className="text-red-600">{error}</span>
              </div>
            )}

            {/* Step 1: Ticket Selection */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  Select Tickets
                </h2>
                <div className="grid gap-4">
                  {service.ticket_packages.map((ticket, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 md:p-6 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                            {ticket.name}
                          </h3>
                          <p className="text-gray-600 text-sm md:text-base mb-2">
                            ₦{ticket.price.toLocaleString()} per ticket
                          </p>
                          {ticket.description && (
                            <p className="text-gray-600 text-sm">
                              {ticket.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant={
                              ticket.remaining > 0 ? "default" : "secondary"
                            }
                            className={
                              ticket.remaining > 0
                                ? "bg-green-100 text-green-800 rounded-full"
                                : "bg-red-100 text-red-800 rounded-full"
                            }
                          >
                            {ticket.remaining > 0
                              ? `Available (${ticket.remaining})`
                              : "Sold Out"}
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
                                className="w-16 text-center"
                                min="0"
                                max={ticket.remaining}
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
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
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
              <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  Contact Details
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">
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
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">
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
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">
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
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full"
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
              <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  Payment
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
                        className="rounded-full"
                      >
                        {paymentLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        ) : (
                          "Pay with Paystack"
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Bitcoin className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Pay with Crypto</h3>
                          <p className="text-sm text-gray-600">
                            Bitcoin, Ethereum, USDT & more
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handlePayment("crypto")}
                        disabled={paymentLoading}
                        className="rounded-full"
                      >
                        {paymentLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        ) : (
                          "Pay with Crypto"
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">
                        Secure & Verified Ticketing
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Event Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 sticky top-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6">
                Event Summary
              </h3>
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold">{service.title}</h4>
                  <p className="text-sm text-gray-600">{service.location}</p>
                </div>
                <div className="space-y-2 text-sm">
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
                    <h4 className="font-semibold mb-2">Selected Tickets</h4>
                    {Object.entries(selectedTickets).map(([name, quantity]) =>
                      quantity > 0 ? (
                        <div
                          key={name}
                          className="flex justify-between text-sm"
                        >
                          <span>
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
                    <div className="flex justify-between text-sm mt-2">
                      <span>Platform Fee (5%)</span>
                      <span>₦{(calculateTotal() * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg mt-2">
                      <span>Total</span>
                      <span>₦{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
              {step === 1 && (
                <Button
                  className="w-full h-12 text-base md:text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-full"
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
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white text-base sm:text-lg font-medium">
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
