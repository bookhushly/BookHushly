// app/services/[id]/page.jsx
import { Suspense } from "react";
import ServiceDetailClient from "./service-detail-content";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Try fetching from all possible tables
    const [listingsResult, hotelsResult, apartmentsResult] = await Promise.all([
      supabase
        .from("listings")
        .select(
          "title, description, category, location, media_urls, price, price_unit",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("hotels")
        .select("name, description, city, state, image_urls")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("serviced_apartments")
        .select("name, description, city, state, image_urls, price_per_night")
        .eq("id", id)
        .maybeSingle(),
    ]);

    const service =
      listingsResult.data || hotelsResult.data || apartmentsResult.data;

    if (!service) {
      return {
        title: "Service Not Found | BookHushly",
        description: "The requested service could not be found.",
      };
    }

    const title = service.title || service.name;
    const description =
      service.description?.slice(0, 155) ||
      `Book ${title} on BookHushly. Quality services across Nigeria.`;
    const images = service.media_urls || service.image_urls || [];

    return {
      title: `${title} | BookHushly`,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: images[0] ? [images[0]] : [],
        locale: "en_NG",
        siteName: "BookHushly",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: images[0] ? [images[0]] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "BookHushly",
      description: "Book quality hospitality and services in Nigeria",
    };
  }
}

export default async function ServiceDetailPage({ params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Try fetching from listings first
    let { data: service, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    let serviceType = "listings";

    // If not found in listings, try hotels
    if (!service) {
      const hotelsResult = await supabase
        .from("hotels")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      service = hotelsResult.data;
      serviceType = "hotels";
    }

    // If still not found, try serviced apartments
    if (!service) {
      const apartmentsResult = await supabase
        .from("serviced_apartments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      service = apartmentsResult.data;
      serviceType = "serviced_apartments";
    }

    if (!service) {
      notFound();
    }

    // Normalize service data based on source
    const normalizedService = normalizeServiceData(service, serviceType);

    return (
      <Suspense fallback={<ServiceDetailSkeleton />}>
        <ServiceDetailClient service={normalizedService} />
      </Suspense>
    );
  } catch (err) {
    console.error("Exception in ServiceDetailPage:", err);
    notFound();
  }
}

// Normalize data from different tables
function normalizeServiceData(service, type) {
  if (type === "hotels") {
    return {
      ...service,
      title: service.name,
      category: "hotels",
      location: `${service.city}, ${service.state}`,
      media_urls: service.image_urls || [],
      // Hotels don't have a single price, will be handled in detail component
    };
  }

  if (type === "serviced_apartments") {
    return {
      ...service,
      title: service.name,
      category: "serviced_apartments",
      location: `${service.area ? service.area + ", " : ""}${service.city}, ${service.state}`,
      price: service.price_per_night,
      price_unit: "per_night",
      media_urls: service.image_urls || [],
      capacity: service.max_guests,
    };
  }

  // Listings table data (already normalized)
  return {
    ...service,
    media_urls: service.media_urls || [],
    amenities: service.amenities || [],
    category_data: service.category_data || {},
  };
}

// Loading skeleton
function ServiceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="h-[70vh] bg-gray-200" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
          <div className="h-96 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
