"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";

// Lazy-load service-specific components
const EventsTicketPurchase = dynamic(
  () => import("../../common/EventTicketPurchase"),
  { ssr: false, loading: () => <ComponentLoader /> },
);

const EventCentersBookingForm = dynamic(
  () => import("./EventCenterBookingForm"),
  { ssr: false, loading: () => <ComponentLoader /> },
);

// Component loader
function ComponentLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
        <p className="text-gray-600">Loading form...</p>
      </div>
    </div>
  );
}

const serviceComponents = {
  events: {
    event_organizer: EventsTicketPurchase,
    event_center: EventCentersBookingForm,
  },
  hotels: null,
  serviced_apartments: null,
  car_rentals: null,
  food: null,
  logistics: null,
  security: null,
};

export default function BookServiceClient() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [error, setError] = useState("");

  // Fetch service data with optimization
  const fetchService = useCallback(async () => {
    if (!params.id) {
      setError("Invalid service ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("listings")
        .select(
          `
          *,
          vendors:vendor_id (
            id,
            business_name,
            phone_number
          )
        `,
        )
        .eq("id", params.id)
        .eq("active", true)
        .single();

      if (fetchError) {
        console.error("Error fetching listing:", fetchError);
        setError("Service not found or unavailable");
        return;
      }

      if (!data) {
        setError("Service not found");
        return;
      }

      setService(data);
    } catch (err) {
      console.error("Exception fetching service:", err);
      setError("An error occurred while loading service details");
    } finally {
      setLoading(false);
    }
  }, [params.id, supabase]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  // Handle booking submission
  const handleSubmit = async (bookingData) => {
    try {
      const isEventOrganizer =
        service?.category === "events" &&
        service?.event_type === "event_organizer";

      const table = isEventOrganizer ? "event_bookings" : "bookings";

      const { data, error: bookingError } = await supabase
        .from(table)
        .insert([bookingData])
        .select()
        .single();

      if (bookingError) {
        throw new Error(bookingError.message);
      }

      return { data, error: null };
    } catch (err) {
      console.error("Booking error:", err);
      return { data: null, error: err };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Loading service details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Link
            href="/services"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Service not found"}</AlertDescription>
        </Alert>
      </div>
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
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Link
            href="/services"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
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
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <Link
          href={`/services/${params.id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Service Details
        </Link>
      </div>
      <Component service={service} onSubmit={handleSubmit} />
    </div>
  );
}
