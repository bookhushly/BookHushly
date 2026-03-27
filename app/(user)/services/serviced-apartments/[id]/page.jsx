import { notFound } from "next/navigation";
import ApartmentClient from "./content";
import { createClient, createStaticClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = createStaticClient();

  const { data: apt } = await supabase
    .from("serviced_apartments")
    .select("id, name, city, state, description, image_urls, price_per_night, bedrooms")
    .eq("id", id)
    .single();

  if (!apt) return { title: "Apartment Not Found" };

  const location = `${apt.city}, ${apt.state}`;
  const description =
    apt.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    `Book ${apt.name} — a ${apt.bedrooms}-bedroom serviced apartment in ${location}. Instant booking on BookHushly.`;

  return {
    title: `${apt.name} — ${location}`,
    description,
    keywords: [
      apt.name,
      apt.city,
      apt.state,
      "serviced apartment Nigeria",
      "short let",
      `short let ${apt.city}`,
      "apartment booking Nigeria",
      "BookHushly",
    ],
    alternates: { canonical: `https://bookhushly.com/services/serviced-apartments/${id}` },
    openGraph: {
      title: `${apt.name} — ${location}`,
      description,
      type: "website",
      locale: "en_NG",
      url: `https://bookhushly.com/services/serviced-apartments/${id}`,
      images: apt.image_urls?.[0]
        ? [{ url: apt.image_urls[0], alt: apt.name, width: 1200, height: 630 }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: apt.name,
      description,
      images: apt.image_urls?.[0] ? [apt.image_urls[0]] : [],
    },
  };
}

async function getApartment(id) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("serviced_apartments")
      .select(`*, vendors:vendor_id (id, business_name, tier)`)
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
