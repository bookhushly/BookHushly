import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import ApartmentClient from "./content";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;

  const { data: apartment } = await supabase
    .from("serviced_apartments")
    .select(
      "name, description, city, state, apartment_type, price_per_night, image_urls"
    )
    .eq("id", id)
    .single();

  if (!apartment) {
    return {
      title: "Apartment Not Found",
    };
  }

  const cleanDescription = apartment.description
    ?.replace(/<[^>]*>/g, "")
    .substring(0, 160);

  return {
    title: `${apartment.name} - ${apartment.city}, ${apartment.state}`,
    description:
      cleanDescription ||
      `${apartment.apartment_type.replace("_", " ")} apartment in ${apartment.city} from ₦${apartment.price_per_night.toLocaleString()}/night`,
    openGraph: {
      title: apartment.name,
      description: cleanDescription,
      images: apartment.image_urls?.[0] ? [apartment.image_urls[0]] : [],
      type: "website",
    },
  };
}

// Fetch apartment data server-side
async function getApartment(id) {
  const { data, error } = await supabase
    .from("serviced_apartments")
    .select(
      `
        *,
        vendors:vendor_id (
          id,
          email
        )
      `
    )
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !data) {
    console.error("Error fetching apartment:", error);
    return null;
  }

  // Atomic increment (fire-and-forget)
  supabase
    .from("serviced_apartments")
    .increment({ views_count: 1 })
    .eq("id", id);

  return data;
}

export default async function ApartmentPage({ params }) {
  const { id } = await params;
  const apartment = await getApartment(id);

  console.log(apartment);

  // Structure data for rich snippets (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: apartment.name,
    description: apartment.description?.replace(/<[^>]*>/g, ""),
    address: {
      "@type": "PostalAddress",
      streetAddress: apartment.address,
      addressLocality: apartment.city,
      addressRegion: apartment.state,
      addressCountry: "NG",
    },
    offers: {
      "@type": "Offer",
      price: apartment.price_per_night,
      priceCurrency: "NGN",
    },
    numberOfRooms: apartment.bedrooms,
    numberOfBathroomsTotal: apartment.bathrooms,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ApartmentClient apartment={apartment} />
    </>
  );
}

// Generate static params for common apartments (optional - for static generation)
export async function generateStaticParams() {
  const { data: apartments } = await supabase
    .from("serviced_apartments")
    .select("id")
    .eq("status", "active")
    .limit(50);

  return (
    apartments?.map((apt) => ({
      id: apt.id,
    })) || []
  );
}

// Revalidate every hour
export const revalidate = 3600;
