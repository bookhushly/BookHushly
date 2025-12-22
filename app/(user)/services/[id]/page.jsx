import { Suspense } from "react";
import ServiceDetailClient from "./service-detail-content";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: service } = await supabase
      .from("listings")
      .select(
        "title, description, category, location, media_urls, price, price_unit"
      )
      .eq("id", id)
      .maybeSingle();

    if (!service) {
      return {
        title: "Service Not Found | BookHushly",
        description: "The requested service could not be found.",
      };
    }

    const categoryMap = {
      hotels: "Hotel",
      "serviced-apartments": "Serviced Apartment",
      "food-restaurants": "Restaurant",
      events: "Event",
      "car-rentals": "Car Rental",
      logistics: "Logistics Service",
      security: "Security Service",
    };

    const categoryName = categoryMap[service.category] || service.category;
    const priceText = service.price
      ? `₦${service.price.toLocaleString()}${service.price_unit ? `/${service.price_unit}` : ""}`
      : "";

    const description = service.description
      ? `${service.description.slice(0, 155)}...`
      : `Book ${service.title} on BookHushly. ${categoryName} in ${service.location}. ${priceText}`;

    return {
      title: `${service.title} | BookHushly`,
      description,
      openGraph: {
        title: service.title,
        description,
        type: "website",
        images: service.media_urls?.[0] ? [service.media_urls[0]] : [],
        locale: "en_NG",
        siteName: "BookHushly",
      },
      twitter: {
        card: "summary_large_image",
        title: service.title,
        description,
        images: service.media_urls?.[0] ? [service.media_urls[0]] : [],
      },
      keywords: [
        service.title,
        categoryName,
        service.location,
        "Nigeria",
        "BookHushly",
        "booking",
        service.category,
      ],
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "BookHushly",
      description: "Book quality hospitality and services in Nigeria",
    };
  }
}

export async function generateStaticParams() {
  try {
    const supabase = await createClient();

    const { data: testData, error: testError } = await supabase
      .from("listings")
      .select("count", { count: "exact" });

    const { data: allServices, error: allError } = await supabase
      .from("listings")
      .select("id, active, title");

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
    const { id } = await params;
    const supabase = await createClient();

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
        event_date,
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
      .eq("id", id)
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
