import { notFound } from "next/navigation";
import ApartmentClient from "./content";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Serviced Apartment | BookHushly",
  description: "Book quality serviced apartments across Nigeria on BookHushly.",
};

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

    // Fire-and-forget view count
    supabase
      .rpc("increment_apartment_views", { apartment_id: id })
      .then()
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

export const revalidate = 3600;
