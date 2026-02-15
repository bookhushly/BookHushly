import { notFound } from "next/navigation";
import ApartmentClient from "./content";
import { createClient } from "@/lib/supabase/server";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  console.log("=== METADATA GENERATION START ===");
  const { id } = await params;
  console.log("Params ID:", id);

  try {
    const supabase = await createClient();
    console.log("Supabase client created for metadata");

    const { data: apartment, error } = await supabase
      .from("serviced_apartments")
      .select(
        "name, description, city, state, apartment_type, price_per_night, image_urls",
      )
      .eq("id", id)
      .eq("status", "active")
      .single();

    console.log("Metadata fetch result:", {
      hasData: !!apartment,
      error: error?.message,
      apartmentName: apartment?.name,
    });

    if (error) {
      console.error("Metadata fetch error:", error);
    }

    if (!apartment) {
      console.log("No apartment found for metadata, returning 404 title");
      return {
        title: "Apartment Not Found",
      };
    }

    const cleanDescription = apartment.description
      ?.replace(/<[^>]*>/g, "")
      .substring(0, 160);

    const metadata = {
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

    console.log("Generated metadata:", metadata.title);
    console.log("=== METADATA GENERATION END ===");
    return metadata;
  } catch (error) {
    console.error("Metadata generation error:", error);
    console.log("=== METADATA GENERATION FAILED ===");
    return {
      title: "Apartment Not Found",
    };
  }
}

// Fetch apartment data server-side
async function getApartment(id) {
  console.log("=== GET APARTMENT START ===");
  console.log("Fetching apartment ID:", id);

  try {
    const supabase = await createClient();
    console.log("Supabase client created for apartment fetch");

    const query = supabase
      .from("serviced_apartments")
      .select(
        `
          *,
          vendors:vendor_id (
            id,
            business_name,
            email
          )
        `,
      )
      .eq("id", id)
      .eq("status", "active");

    console.log("Executing query...");

    const { data, error } = await query.single();

    console.log("Query result:", {
      hasData: !!data,
      error: error?.message,
      errorDetails: error?.details,
      errorHint: error?.hint,
      errorCode: error?.code,
    });

    if (error) {
      console.error("Apartment fetch error:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      return null;
    }

    if (!data) {
      console.log("No apartment data returned");
      return null;
    }

    console.log("Apartment fetched successfully:", {
      id: data.id,
      name: data.name,
      vendor_id: data.vendor_id,
      hasVendorData: !!data.vendors,
      vendorBusinessName: data.vendors?.business_name,
    });

    // Increment view count (fire-and-forget)
    console.log("Incrementing view count...");
    supabase
      .rpc("increment_apartment_views", { apartment_id: id })
      .then(() => {
        console.log("View count incremented successfully");
      })
      .catch((err) => {
        console.error("View increment failed:", err);
        console.error(
          "View increment error details:",
          JSON.stringify(err, null, 2),
        );
      });

    console.log("=== GET APARTMENT END ===");
    return data;
  } catch (error) {
    console.error("Unexpected error in getApartment:", error);
    console.error("Error stack:", error.stack);
    console.log("=== GET APARTMENT FAILED ===");
    return null;
  }
}

export default async function ApartmentPage({ params }) {
  console.log("=== APARTMENT PAGE RENDER START ===");
  const { id } = await params;
  console.log("Page params ID:", id);

  const apartment = await getApartment(id);

  if (!apartment) {
    console.log("Apartment not found, calling notFound()");
    console.log("=== APARTMENT PAGE RENDER FAILED ===");
    notFound();
  }

  console.log("Building JSON-LD schema...");

  // Structure data for rich snippets (JSON-LD)
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

  console.log("JSON-LD schema created");
  console.log("Rendering ApartmentClient component...");
  console.log("=== APARTMENT PAGE RENDER END ===");

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

// Generate static params for common apartments
export async function generateStaticParams() {
  console.log("=== GENERATE STATIC PARAMS START ===");

  try {
    const supabase = await createClient();
    console.log("Supabase client created for static params");

    const { data: apartments, error } = await supabase
      .from("serviced_apartments")
      .select("id")
      .eq("status", "active")
      .limit(50);

    console.log("Static params query result:", {
      count: apartments?.length || 0,
      error: error?.message,
    });

    if (error) {
      console.error("Error in generateStaticParams:", error);
      console.log("=== GENERATE STATIC PARAMS FAILED ===");
      return [];
    }

    const params = (apartments || []).map((apt) => ({ id: apt.id }));
    console.log(`Generated ${params.length} static params`);
    console.log("=== GENERATE STATIC PARAMS END ===");

    return params;
  } catch (error) {
    console.error("Unexpected error in generateStaticParams:", error);
    console.error("Error stack:", error.stack);
    console.log("=== GENERATE STATIC PARAMS EXCEPTION ===");
    return [];
  }
}

// Revalidate every hour
export const revalidate = 3600;

console.log("Apartment page module loaded, revalidate:", 3600);
