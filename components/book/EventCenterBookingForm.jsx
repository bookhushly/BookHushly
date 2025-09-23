"use client";
import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function EventCentersBookingForm({
  service,
  user,
  addBooking,
  onSubmit,
}) {
  const [selectedDate, setSelectedDate] = useState(
    service.event_date ? new Date(service.event_date) : undefined
  );
  const [formData, setFormData] = useState({
    guests: 1,
    time: service.check_in_time || "",
    duration: service.duration || "",
    special_requests: "",
    contact_phone: "",
    contact_email: user?.email || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!formData.time && !service.is_24_7) {
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
    if (
      service.maximum_capacity &&
      formData.guests > service.maximum_capacity
    ) {
      setError(`Maximum capacity is ${service.maximum_capacity} guests`);
      return false;
    }
    return true;
  };

  const calculateTotal = () => {
    const servicePrice = service.price || 0;
    const platformFee = servicePrice * 0.05;
    return servicePrice + platformFee;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const bookingData = {
        listing_id: service.id,
        customer_id: user?.id || null,
        temp_user_id: user
          ? null
          : `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        booking_date: selectedDate.toISOString().split("T")[0],
        booking_time: formData.time || null,
        guests: parseInt(formData.guests),
        duration: formData.duration || null,
        special_requests: formData.special_requests || null,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        total_amount: calculateTotal(),
        status: "pending",
        payment_status: "pending",
      };

      await onSubmit(bookingData);
      addBooking(bookingData);
      toast.success("Booking request submitted!", {
        description: "The vendor will review and confirm your booking shortly",
      });
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2">
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
              Book Event Center
            </CardTitle>
            <CardDescription className="text-gray-600">
              Fill in the details to book this event center
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
                <Label className="text-sm font-medium text-gray-900">
                  Select Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-sm",
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
                      disabled={(date) =>
                        date < new Date() ||
                        (service.event_date &&
                          date.toISOString().split("T")[0] !==
                            service.event_date.split("T")[0])
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {!service.is_24_7 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      className="text-sm font-medium text-gray-900"
                      htmlFor="time"
                    >
                      Preferred Time *
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="pl-10 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      className="text-sm font-medium text-gray-900"
                      htmlFor="duration"
                    >
                      Duration
                    </Label>
                    <Input
                      id="duration"
                      name="duration"
                      placeholder={service.duration || "e.g., 4 hours"}
                      value={formData.duration}
                      onChange={handleChange}
                      className="text-sm"
                    />
                    {service.duration && (
                      <p className="text-xs text-muted-foreground">
                        Suggested duration: {service.duration}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label
                  className="text-sm font-medium text-gray-900"
                  htmlFor="guests"
                >
                  Number of Guests *
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="guests"
                    name="guests"
                    type="number"
                    min="1"
                    max={service.maximum_capacity || 1000}
                    value={formData.guests}
                    onChange={handleChange}
                    className="pl-10 text-sm"
                    required
                  />
                </div>
                {service.maximum_capacity && (
                  <p className="text-xs text-muted-foreground">
                    Maximum capacity: {service.maximum_capacity} guests
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    className="text-sm font-medium text-gray-900"
                    htmlFor="contact_phone"
                  >
                    Phone Number *
                  </Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className="text-sm font-medium text-gray-900"
                    htmlFor="contact_email"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    required
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  className="text-sm font-medium text-gray-900"
                  htmlFor="special_requests"
                >
                  Special Requests (Optional)
                </Label>
                <Textarea
                  id="special_requests"
                  name="special_requests"
                  value={formData.special_requests}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any special requirements (e.g., AV equipment, catering)..."
                  className="text-sm"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm py-3"
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
        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-base">{service.title}</h4>
              <p className="text-sm text-gray-600">
                by {service.vendors?.business_name || "Event Center Provider"}
              </p>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              {service.location}
            </div>
            {selectedDate && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-600" />
                  <span>{format(selectedDate, "PPP")}</span>
                </div>
                {formData.time && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-600" />
                    <span>{formData.time}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-600" />
                  <span>
                    {formData.guests} guest{formData.guests > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Price Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Service fee</span>
              <span>₦{service.price?.toLocaleString() || "0"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Platform fee (5%)</span>
              <span>₦{(service.price * 0.05).toLocaleString()}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>₦{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              Payment will be processed after vendor confirmation
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">
              Booking Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
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
  );
}
