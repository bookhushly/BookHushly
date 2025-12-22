"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/shared/auth/auth-guard";
import { useAuthStore, useBookingStore } from "@/lib/store";
import { createBooking, getListing } from "@/lib/database";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";

// Lazy-load service-specific components
const EventsTicketPurchase = dynamic(() => import("../EventTicketPurchase"), {
  ssr: false,
});
const EventCentersBookingForm = dynamic(
  () => import("./EventCenterBookingForm"),
  { ssr: false }
);
// Add more components later (e.g., HotelsBookingForm)

const serviceComponents = {
  events: {
    event_organizer: EventsTicketPurchase,
    event_center: EventCentersBookingForm,
  },
  hotels: null, // Placeholder for future components
  serviced_apartments: null,
  car_rentals: null,
  food: null,
  logistics: null,
  security: null,
};

export default function BookServiceClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addBooking } = useBookingStore();

  const [loading, setLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [service, setService] = useState(null);
  const [serviceError, setServiceError] = useState("");

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      if (!params.id) return;

      try {
        setServiceLoading(true);
        const { data: serviceData, error } = await getListing(params.id);
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

  // Updated BookServiceClient.jsx handleSubmit function

  const handleSubmit = async (bookingData) => {
    setLoading(true);
    try {
      let data, error;

      // Check if this is an event organizer (uses event_bookings table)
      const isEventOrganizer =
        service?.category === "events" &&
        service?.event_type === "event_organizer";

      if (isEventOrganizer) {
        // Use event_bookings table for event organizers
        const { data: eventBookingData, error: eventBookingError } =
          await supabase
            .from("event_bookings")
            .insert([bookingData])
            .select()
            .single();

        data = eventBookingData;
        error = eventBookingError;
      } else {
        // Use regular bookings table for other services
        const result = await createBooking(bookingData);
        data = result.data;
        error = result.error;
      }

      if (error) {
        throw new Error(error.message);
      }

      addBooking(data);

      const isGuestUser = bookingData.temp_user_id && !bookingData.customer_id;

      if (isGuestUser) {
        return { data, error: null };
      } else {
        toast.success("Booking request submitted!", {
          description:
            "The vendor will review and confirm your booking shortly",
        });
        router.push("/dashboard/customer?tab=bookings");
        return { data, error: null };
      }
    } catch (err) {
      console.error("Booking error:", err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };
  // Loading state
  if (serviceLoading) {
    return (
      <AuthGuard allowUnauthenticated={true}>
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
      <AuthGuard allowUnauthenticated={true}>
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

  // Select component based on category and event_type
  let Component = null;
  if (service.category === "events") {
    Component = serviceComponents.events[service.event_type] || null;
  } else {
    Component = serviceComponents[service.category] || null;
  }

  if (!Component) {
    return (
      <AuthGuard allowUnauthenticated={true}>
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
            <AlertDescription>Unsupported service type</AlertDescription>
          </Alert>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowUnauthenticated={true}>
      <div className="container max-w-6xl py-8">
        <div className="mb-6">
          <Link
            href={`/services/${params.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Service Details
          </Link>
        </div>
        <Suspense fallback={<div>Loading form...</div>}>
          <Component
            service={service}
            user={user}
            addBooking={addBooking}
            onSubmit={handleSubmit}
          />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
