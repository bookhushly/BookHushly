import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createStaticClient } from "@/lib/supabase/server";
import HotelDetails from "./content";
import { Loader2 } from "lucide-react";

// Use admin client throughout — this page is public and runs in ISR context
// where cookie-based createClient() has no request context and will fail on revalidation
async function getHotelData(id) {
  const supabase = createStaticClient();

  try {
    const { data: hotel, error: hotelError } = await supabase
      .from("hotels")
      .select("*")
      .eq("id", id)
      .single();

    if (hotelError || !hotel) {
      return null;
    }

    const { data: roomTypes } = await supabase
      .from("hotel_room_types")
      .select("*")
      .eq("hotel_id", id)
      .order("base_price", { ascending: true });

    if (!roomTypes || roomTypes.length === 0) {
      return { hotel, roomTypes: [] };
    }

    const roomTypeIds = roomTypes.map((rt) => rt.id);

    const { data: allRooms } = await supabase
      .from("hotel_rooms")
      .select("id, room_type_id, status, price_per_night")
      .in("room_type_id", roomTypeIds)
      .eq("status", "available");

    const roomsByType = (allRooms || []).reduce((acc, room) => {
      if (!acc[room.room_type_id]) acc[room.room_type_id] = [];
      acc[room.room_type_id].push(room);
      return acc;
    }, {});

    const enrichedRoomTypes = roomTypes
      .map((roomType) => {
        const rooms = roomsByType[roomType.id] || [];
        const prices = rooms.map((r) => parseFloat(r.price_per_night));
        const minPrice =
          prices.length > 0 ? Math.min(...prices) : roomType.base_price;
        return {
          ...roomType,
          available_rooms: rooms.length,
          min_price: minPrice,
          has_availability: rooms.length > 0,
        };
      })
      .filter((rt) => rt.has_availability);

    return { hotel, roomTypes: enrichedRoomTypes };
  } catch (error) {
    console.error("Error fetching hotel data:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  // Also use admin client here — generateMetadata runs at build/revalidation time
  const supabase = createStaticClient();

  const { data: hotel } = await supabase
    .from("hotels")
    .select("id, name, city, state, description, image_urls")
    .eq("id", id)
    .single();

  if (!hotel) {
    return { title: "Hotel Not Found" };
  }

  const location = `${hotel.city}, ${hotel.state}`;
  const description =
    hotel.description?.slice(0, 160) ||
    `Book your stay at ${hotel.name} in ${location}. Premium accommodation with modern amenities and exceptional service.`;

  return {
    title: `${hotel.name} - ${location} | BookHushly`,
    description,
    keywords: [
      hotel.name,
      hotel.city,
      hotel.state,
      "hotel booking Nigeria",
      "accommodation",
      "hotel rooms",
      "lodging",
      "BookHushly",
    ],
    alternates: { canonical: `https://bookhushly.com/services/hotels/${id}` },
    openGraph: {
      title: `${hotel.name} - ${location}`,
      description,
      type: "website",
      locale: "en_NG",
      url: `https://bookhushly.com/services/hotels/${id}`,
      images: hotel.image_urls?.[0]
        ? [{ url: hotel.image_urls[0], alt: hotel.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${hotel.name}`,
      description,
      images: hotel.image_urls?.[0] ? [hotel.image_urls[0]] : [],
    },
  };
}

export default async function HotelPage({ params }) {
  const { id } = await params;
  const data = await getHotelData(id);

  if (!data) {
    notFound();
  }

  const { hotel, roomTypes } = data;
  const minPrice = roomTypes.length > 0
    ? Math.min(...roomTypes.map((r) => r.min_price || r.base_price))
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.description?.replace(/<[^>]*>/g, "").slice(0, 300) || "",
    url: `https://bookhushly.com/services/hotels/${id}`,
    image: hotel.image_urls?.[0] || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: hotel.city,
      addressRegion: hotel.state,
      addressCountry: "NG",
    },
    ...(minPrice && {
      priceRange: `From ₦${minPrice.toLocaleString("en-NG")} per night`,
      offers: {
        "@type": "Offer",
        price: minPrice,
        priceCurrency: "NGN",
        availability: "https://schema.org/InStock",
      },
    }),
    amenityFeature: (hotel.amenities?.items || []).map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
      value: true,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading hotel details...</p>
            </div>
          </div>
        }
      >
        <HotelDetails hotel={hotel} roomTypes={roomTypes} />
      </Suspense>
    </>
  );
}

export async function generateStaticParams() {
  try {
    const supabase = createStaticClient();
    const { data: hotels, error } = await supabase
      .from("hotels")
      .select("id")
      .limit(20);

    if (error) {
      console.error("Error fetching hotels for static params:", error);
      return [];
    }

    return (hotels || []).map((hotel) => ({ id: hotel.id }));
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

export const revalidate = 3600;
