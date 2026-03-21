"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  Camera,
  Share2,
  Heart,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useViewTracker } from "@/hooks/use-view-tracker";

export default function EventsTicketPurchase({ service, onSubmit }) {
  useViewTracker(service?.id, "event", service?.vendor_id);
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [selectedTickets, setSelectedTickets] = useState({});
  const [contactDetails, setContactDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [questionAnswers, setQuestionAnswers] = useState({});

  // Normalize custom questions from the service listing
  const customQuestions = useMemo(() => {
    if (!service?.custom_questions) return [];
    try {
      return Array.isArray(service.custom_questions)
        ? service.custom_questions
        : JSON.parse(service.custom_questions);
    } catch {
      return [];
    }
  }, [service?.custom_questions]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const images = service?.media_urls || [];

  // Normalize ticket packages with early bird logic
  const ticketPackages = useMemo(() => {
    if (!service) return [];
    const now = Date.now();
    if (Array.isArray(service.ticket_packages) && service.ticket_packages.length > 0) {
      return service.ticket_packages.map((pkg) => {
        const ebEnd = pkg.early_bird_end ? new Date(pkg.early_bird_end) : null;
        const ebActive = ebEnd && ebEnd > now && pkg.early_bird_price;
        const ebExpired = ebEnd && ebEnd <= now && pkg.early_bird_price;
        return {
          name: pkg.name || "Ticket",
          regularPrice: parseFloat(pkg.price) || 0,
          price: ebActive ? parseFloat(pkg.early_bird_price) : parseFloat(pkg.price) || 0,
          earlyBirdPrice: pkg.early_bird_price ? parseFloat(pkg.early_bird_price) : null,
          earlyBirdEnd: ebEnd,
          earlyBirdActive: !!ebActive,
          earlyBirdExpired: !!ebExpired,
          remaining: parseInt(pkg.remaining) || 0,
          total: parseInt(pkg.total) || 0,
          description: pkg.description || "",
        };
      });
    }
    return [
      {
        name: "Standard Ticket",
        regularPrice: parseFloat(service.price) || 0,
        price: parseFloat(service.price) || 0,
        earlyBirdPrice: null,
        earlyBirdEnd: null,
        earlyBirdActive: false,
        earlyBirdExpired: false,
        remaining: parseInt(service.remaining_tickets) || 0,
        total: parseInt(service.total_tickets) || 0,
        description: "Standard admission to the event",
      },
    ];
  }, [service]);

  // Initialize selected tickets
  useEffect(() => {
    const initialTickets = {};
    ticketPackages.forEach((ticket) => {
      initialTickets[ticket.name] = 0;
    });
    setSelectedTickets(initialTickets);
  }, [ticketPackages]);

  // Load contact details from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("contactDetails");
    if (stored) {
      try {
        setContactDetails(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing stored contact details:", e);
      }
    }
  }, []);

  // Format helpers
  const formatEventDate = useCallback((dateString, format = "long") => {
    if (!dateString) return "Date TBD";
    try {
      const date = new Date(dateString);
      return format === "short"
        ? date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
        : date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });
    } catch (error) {
      return "Date TBD";
    }
  }, []);

  const formatEventTime = useCallback((timeString) => {
    if (!timeString) return "Time TBD";
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Time TBD";
    }
  }, []);

  // Calculate total
  const calculateTotal = useCallback(() => {
    return ticketPackages.reduce(
      (total, ticket) =>
        total + (selectedTickets[ticket.name] || 0) * ticket.price,
      0,
    );
  }, [ticketPackages, selectedTickets]);

  // Handle ticket quantity change
  const handleTicketChange = useCallback(
    (ticketName, quantity) => {
      const ticket = ticketPackages.find((t) => t.name === ticketName);
      if (!ticket || quantity < 0 || quantity > ticket.remaining) return;

      setSelectedTickets((prev) => ({
        ...prev,
        [ticketName]: quantity,
      }));
      setError("");
    },
    [ticketPackages],
  );

  // Validate ticket selection
  const validateTickets = useCallback(() => {
    const totalTickets = Object.values(selectedTickets).reduce(
      (sum, qty) => sum + qty,
      0,
    );
    if (totalTickets === 0) {
      setError("Please select at least one ticket");
      return false;
    }
    return true;
  }, [selectedTickets]);

  // Validate contact details
  const validateContactDetails = useCallback(() => {
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
  }, [contactDetails]);

  // Validate custom attendee question answers
  const validateQuestions = useCallback(() => {
    for (const q of customQuestions) {
      if (q.required && !questionAnswers[q.id]?.toString().trim()) {
        setError(`"${q.label}" is required`);
        return false;
      }
    }
    return true;
  }, [customQuestions, questionAnswers]);

  // Handle contact submission
  const handleContactSubmit = useCallback(() => {
    if (!validateContactDetails()) return;
    if (!validateQuestions()) return;
    localStorage.setItem("contactDetails", JSON.stringify(contactDetails));
    setStep(3);
    setError("");
  }, [validateContactDetails, validateQuestions, contactDetails]);

  // Handle payment - redirect to unified payment page
  const handlePayment = async () => {
    if (!service) {
      setError("Service data not available");
      return;
    }

    try {
      // Create booking first
      const totalGuests = Object.values(selectedTickets).reduce(
        (sum, qty) => sum + qty,
        0,
      );

      const bookingData = {
        listing_id: service.id,
        customer_id: null, // Will be set if user is logged in
        temp_user_id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        booking_date: service.event_date
          ? new Date(service.event_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        booking_time: service.event_time
          ? formatEventTime(service.event_time)
          : "Time TBD",
        guests: totalGuests,
        contact_phone: contactDetails.phone,
        contact_email: contactDetails.email,
        total_amount: calculateTotal(),
        status: "pending",
        payment_status: "pending",
        ticket_details: JSON.stringify(selectedTickets),
        attendee_answers: Object.keys(questionAnswers).length > 0 ? questionAnswers : null,
      };

      const { data: booking, error: bookingError } =
        await onSubmit(bookingData);

      if (bookingError || !booking) {
        throw new Error(bookingError?.message || "Failed to create booking");
      }

      // Redirect to unified payment page
      router.push(`/payment/event/${booking.id}`);
    } catch (err) {
      console.error("Payment initialization error:", err);
      setError(`Booking failed: ${err.message}`);
      toast.error("Booking failed to initialize");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              onClick={() => setIsFullscreen(true)}
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-gray-900 flex items-center gap-2 rounded-full"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">View Photos</span>
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
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  {formatEventTime(service?.event_time)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  {service?.location || "Location TBD"}
                </div>
              </div>
              <p className="text-sm sm:text-base text-white/80 max-w-2xl">
                {service?.description
                  ? service.description.replace(/<[^>]*>/g, "")
                  : "Join us for an unforgettable event experience"}
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
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {["Select Tickets", "Contact Details", "Payment"].map(
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
                    ></div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-7 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            )}

            {/* Step 1: Ticket Selection */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Select Tickets
                </h2>
                <div className="space-y-4">
                  {ticketPackages.map((ticket, index) => (
                    <div
                      key={index}
                      className={`border rounded-xl p-6 hover:shadow-lg transition-all ${
                        ticket.earlyBirdActive
                          ? "border-amber-300 bg-amber-50/40 hover:border-amber-400"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex flex-col flex-wrap justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-900">
                              {ticket.name}
                            </h3>
                            {ticket.earlyBirdActive && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                Early Bird
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline gap-2 mb-1">
                            <p className="text-purple-600 font-bold text-xl">
                              ₦{ticket.price.toLocaleString()}
                            </p>
                            {ticket.earlyBirdActive && (
                              <p className="text-gray-400 line-through text-sm">
                                ₦{ticket.regularPrice.toLocaleString()}
                              </p>
                            )}
                            <p className="text-gray-500 text-sm">per ticket</p>
                          </div>

                          {ticket.earlyBirdActive && ticket.earlyBirdEnd && (
                            <p className="text-xs text-amber-600 font-medium mb-1">
                              Early bird ends {ticket.earlyBirdEnd.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          )}
                          {ticket.earlyBirdExpired && (
                            <p className="text-xs text-gray-400 mb-1">
                              Early bird was ₦{ticket.earlyBirdPrice?.toLocaleString()} — offer has ended
                            </p>
                          )}

                          {ticket.description && (
                            <p className="text-gray-600 text-sm mt-1">
                              {ticket.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Badge
                            className={`${
                              ticket.remaining > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {ticket.remaining > 0 ? "Available" : "Sold Out"}
                          </Badge>

                          {ticket.remaining > 0 && (
                            <div className="flex items-center gap-1 w-[140px] justify-between">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={selectedTickets[ticket.name] === 0}
                                onClick={() =>
                                  handleTicketChange(
                                    ticket.name,
                                    (selectedTickets[ticket.name] || 0) - 1,
                                  )
                                }
                              >
                                -
                              </Button>

                              <Input
                                type="text" inputMode="decimal"
                                min="0"
                                max={ticket.remaining}
                                value={selectedTickets[ticket.name] || 0}
                                onChange={(e) =>
                                  handleTicketChange(
                                    ticket.name,
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="w-12 text-center px-1"
                              />

                              <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                  selectedTickets[ticket.name] >=
                                  ticket.remaining
                                }
                                onClick={() =>
                                  handleTicketChange(
                                    ticket.name,
                                    (selectedTickets[ticket.name] || 0) + 1,
                                  )
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
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3"
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
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Contact Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
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
                  {/* Custom attendee questions */}
                  {customQuestions.length > 0 && (
                    <div className="space-y-4 pt-2 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-700">
                        Additional Information
                      </p>
                      {customQuestions.map((q) => (
                        <div key={q.id}>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            {q.label}
                            {q.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {q.type === "select" ? (
                            <select
                              value={questionAnswers[q.id] || ""}
                              onChange={(e) =>
                                setQuestionAnswers((p) => ({ ...p, [q.id]: e.target.value }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                            >
                              <option value="">Select an option</option>
                              {(q.options || []).map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : q.type === "textarea" ? (
                            <textarea
                              value={questionAnswers[q.id] || ""}
                              onChange={(e) =>
                                setQuestionAnswers((p) => ({ ...p, [q.id]: e.target.value }))
                              }
                              rows={3}
                              placeholder={`Your answer${q.required ? "" : " (optional)"}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            />
                          ) : (
                            <Input
                              type="text"
                              value={questionAnswers[q.id] || ""}
                              onChange={(e) =>
                                setQuestionAnswers((p) => ({ ...p, [q.id]: e.target.value }))
                              }
                              placeholder={`Your answer${q.required ? "" : " (optional)"}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
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
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Complete Payment
                </h2>
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-700 mb-2">
                      You'll be redirected to our secure payment page to
                      complete your purchase.
                    </p>
                    <p className="text-xs text-purple-600">
                      Multiple payment options available: Card, Bank Transfer,
                      USSD, and Cryptocurrency
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 text-sm">
                      Secure & Verified Ticketing
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                      onClick={handlePayment}
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:sticky lg:top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Event Summary
              </h3>
              <div className="space-y-6 mb-6">
                <div>
                  <h4 className="font-semibold text-lg">
                    {service?.title || "Event"}
                  </h4>
                  <p className="text-gray-600">
                    {service?.location || "Location TBD"}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
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
                    <h4 className="font-semibold mb-2">Selected Tickets</h4>
                    {Object.entries(selectedTickets).map(([name, quantity]) =>
                      quantity > 0 ? (
                        <div
                          key={name}
                          className="flex justify-between text-sm mb-1"
                        >
                          <span>
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
                      ) : null,
                    )}
                    <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span>₦{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-6">
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
