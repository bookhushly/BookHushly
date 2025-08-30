"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuthStore, useBookingStore } from "@/lib/store";
import { createBooking, getListing } from "@/lib/database";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { LoadingSpinner } from "../ui/loading-spinner";
import { data } from "autoprefixer";

export default function BookServiceClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addBooking } = useBookingStore();

  const [loading, setLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [service, setService] = useState(null);
  const [serviceError, setServiceError] = useState("");
  const [selectedDate, setSelectedDate] = useState();
  const [formData, setFormData] = useState({
    guests: 1,
    time: "",
    duration: "",
    special_requests: "",
    contact_phone: "",
    contact_email: user?.email || "",
  });
  const [error, setError] = useState("");

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      if (!params.id) return;

      try {
        setServiceLoading(true);

        const { data: serviceData, error } = await getListing(params.id);
        console.log(data);
        if (error) {
          console.error("Error fetching listing:", error);
          setServiceError("Failed to load service details");
          return;
        }

        setService(serviceData);
      } catch (err) {
        console.error("Exception fetching service:", err);
        setServiceError("An error occurred while loading service details");
      } finally {
        setServiceLoading(false);
      }
    };

    fetchService();
  }, [params.id]);

  // Update contact email when user changes
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        contact_email: user.email,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!selectedDate) {
      setError("Please select a date");
      return false;
    }
    if (!formData.time) {
      setError("Please select a time");
      return false;
    }
    if (!formData.contact_phone) {
      setError("Phone number is required");
      return false;
    }
    if (!formData.contact_email) {
      setError("Email address is required");
      return false;
    }
    if (service?.capacity && formData.guests > service.capacity) {
      setError(`Maximum capacity is ${service.capacity} guests`);
      return false;
    }
    return true;
  };

  const calculateTotal = () => {
    if (!service) return 0;
    const servicePrice = service.price;
    const platformFee = servicePrice * 0.05;
    return servicePrice + platformFee;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !service || !user) return;

    setLoading(true);
    setError("");

    try {
      const bookingData = {
        listing_id: service.id,
        customer_id: user.id,
        booking_date: selectedDate.toISOString().split("T")[0],
        booking_time: formData.time,
        guests: parseInt(formData.guests),

        duration: formData.duration || null,
        special_requests: formData.special_requests || null,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        total_amount: calculateTotal(),
        status: "pending",
        payment_status: "pending",
      };
      console.log("Booking payload →", bookingData);

      const { data, error } = await createBooking(bookingData);

      if (error) {
        setError(error.message);
        toast.error("Booking failed", { description: error.message });
        return;
      }

      addBooking(data);
      toast.success("Booking request submitted!", {
        description: "The vendor will review and confirm your booking shortly",
      });

      router.push("/dashboard/customer?tab=bookings");
    } catch (err) {
      console.error("Booking error:", err);
      setError("An unexpected error occurred");
      toast.error("Booking failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (serviceLoading) {
    return (
      <AuthGuard requiredRole="customer">
        <div className="container max-w-4xl py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Loading service details...
              </p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Error state
  if (serviceError || !service) {
    return (
      <AuthGuard requiredRole="customer">
        <div className="container max-w-4xl py-8">
          <div className="mb-6">
            <Link
              href="/services"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Link>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {serviceError || "Service not found"}
            </AlertDescription>
          </Alert>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="customer">
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Link
            href={`/services/${params.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Service Details
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book This Service</CardTitle>
                <CardDescription>
                  Fill in the details below to request a booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label>Select Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate
                            ? format(selectedDate, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time">Preferred Time *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="time"
                          name="time"
                          type="time"
                          value={formData.time}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        name="duration"
                        placeholder={service.duration || "e.g., 2 hours, 1 day"}
                        value={formData.duration}
                        onChange={handleChange}
                      />
                      {service.duration && (
                        <p className="text-xs text-muted-foreground">
                          Standard duration: {service.duration}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guests">Number of Guests *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="guests"
                        name="guests"
                        type="number"
                        min="1"
                        max={service.capacity || 100}
                        value={formData.guests}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                    {service.capacity && (
                      <p className="text-xs text-muted-foreground">
                        Maximum capacity: {service.capacity} guests
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">Phone Number *</Label>
                      <Input
                        id="contact_phone"
                        name="contact_phone"
                        type="tel"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Email Address *</Label>
                      <Input
                        id="contact_email"
                        name="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="special_requests">
                      Special Requests (Optional)
                    </Label>
                    <Textarea
                      id="special_requests"
                      name="special_requests"
                      value={formData.special_requests}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Any special requirements or requests..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner className="mr-2 h-4 w-4" />
                        Processing Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Booking Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">{service.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    by {service.vendors?.business_name || "Service Provider"}
                  </p>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {service.location}
                </div>
                {selectedDate && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{format(selectedDate, "PPP")}</span>
                    </div>
                    {formData.time && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{formData.time}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {formData.guests} guest{formData.guests > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Price Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>₦{service.price?.toLocaleString() || "0"}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₦{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Payment will be processed after vendor confirmation
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Booking requests are subject to vendor approval</p>
                <p>• Payment is processed only after confirmation</p>
                {service.cancellation_policy ? (
                  <p>• {service.cancellation_policy}</p>
                ) : (
                  <p>• Free cancellation up to 24 hours before service</p>
                )}
                <p>• Refund policy applies as per vendor terms</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
