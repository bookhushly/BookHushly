import { supabase } from "@/lib/supabase";
import { Suspense } from "react";
import ServiceDetailClient from "./service-detail-content";

export async function generateStaticParams() {
  try {
    // Test basic connection first
    const { data: testData, error: testError } = await supabase
      .from("listings")
      .select("count", { count: "exact" });

    // Try without the active filter first
    const { data: allServices, error: allError } = await supabase
      .from("listings")
      .select("id, active, title");

    // Now try with active filter
    const { data: services, error } = await supabase
      .from("listings")
      .select("id, active, title")
      .eq("active", true);

    if (error) {
      console.error("Error fetching services for static generation:", error);
      return [];
    }

    if (!services || services.length === 0) {
      console.log("No services found, but query succeeded");
      return [];
    }

    const params = services.map((service) => ({
      id: service.id.toString(),
    }));

    return params;
  } catch (err) {
    console.error("Exception in generateStaticParams:", err);
    return [];
  }
}

export default async function ServiceDetailPage({ params }) {
  try {
    // Await the params to resolve the Promise
    const { id } = await params;

    const { data: service, error } = await supabase
      .from("listings")
      .select(
        `
        id,
        vendor_id,
        title,
        description,
        category,
        price,
        location,
        capacity,
        duration,
        availability,
        features,
        requirements,
        cancellation_policy,
        media_urls,
        active,
        vendor_name,
        vendor_phone,
        created_at,
        updated_at,
        amenities,
        category_data,
        price_unit,
        operating_hours,
        service_areas,
        bedrooms,
        bathrooms,
        minimum_stay,
        security_deposit,
        remaining_tickets,
        event_type,
        ticket_packages
      `
      )
      .eq("id", id) // Use the resolved id
      .maybeSingle();

    if (error) {
      console.error("Error fetching service:", error);
      return (
        <div className="container py-8">Error loading service details</div>
      );
    }

    if (!service) {
      console.log("No service found for ID:", id);
      return <div className="container py-8">Service not found</div>;
    }

    const parsedService = {
      ...service,
      requirements: service.requirements
        ? service.requirements.split("\n").filter(Boolean)
        : [],
      media_urls: service.media_urls || [],
      amenities: service.amenities || [],
      ticket_packages: service.ticket_packages || [],
      category_data: service.category_data || {},
    };

    return (
      <Suspense>
        <ServiceDetailClient service={parsedService} />
      </Suspense>
    );
  } catch (err) {
    console.error("Exception in ServiceDetailPage:", err);
    return <div className="container py-8">Error loading service details</div>;
  }
}
