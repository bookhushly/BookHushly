import { notFound } from "next/navigation";
import ApartmentClient from "./content";
import { createClient, createStaticClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const supabase = createStaticClient();

    const { data: apartment, error } = await supabase
      .from("serviced_apartments")
      .select(
        "name, description, city, state, apartment_type, price_per_night, image_urls",
      )
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (!apartment) {
      return { title: "Apartment Not Found" };
    }

    const desc = apartment.description ? String(apartment.description) : "";
    const cleanDescription = desc.replace(/<[^>]*>/g, "").substring(0, 160);

    return {
      title: `${apartment.name} - ${apartment.city}, ${apartment.state}`,
      description:
        cleanDescription ||
        `${apartment.apartment_type.replace(/_/g, " ")} apartment in ${apartment.city} from ₦${apartment.price_per_night.toLocaleString()}/night`,
      openGraph: {
        title: apartment.name,
        description: cleanDescription,
        images: apartment.image_urls?.[0] ? [apartment.image_urls[0]] : [],
        type: "website",
      },
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return { title: "Apartment Not Found" };
  }
}

async function getApartment(id) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("serviced_apartments")
      .select(`*, vendors:vendor_id (id, business_name)`)
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (error) {
      console.error("Apartment fetch error:", error);
      return null;
    }

    // Increment view count (fire-and-forget)
    supabase
      .rpc("increment_apartment_views", { apartment_id: id })
      .catch((err) => console.error("View increment failed:", err));

    return data;
  } catch (error) {
    console.error("Unexpected error in getApartment:", error);
    return null;
  }
}

export default async function ApartmentPage({ params }) {
  const { id } = await params;
  const apartment = await getApartment(id);

  if (!apartment) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: apartment.name,
    description: apartment.description?.replace(/<[^>]*>/g, "") || "",
    address: apartment.address
      ? {
          "@type": "PostalAddress",
          streetAddress: apartment.address,
          addressLocality: apartment.city,
          addressRegion: apartment.state,
          addressCountry: "NG",
        }
      : undefined,
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ApartmentClient apartment={apartment} />
    </>
  );
}

export async function generateStaticParams() {
  try {
    const supabase = createStaticClient();

    const { data: apartments, error } = await supabase
      .from("serviced_apartments")
      .select("id")
      .eq("status", "active")
      .limit(50);

    if (error) {
      console.error("Error in generateStaticParams:", error);
      return [];
    }

    return (apartments || []).map((apt) => ({ id: apt.id }));
  } catch (error) {
    console.error("Unexpected error in generateStaticParams:", error);
    return [];
  }
}

export const revalidate = 3600;
