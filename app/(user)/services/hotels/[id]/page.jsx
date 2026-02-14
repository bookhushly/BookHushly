import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import HotelDetails from "./content";
import { Loader2 } from "lucide-react";

export async function generateMetadata({ params }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: hotel } = await supabase
    .from("hotels")
    .select("id, name, city, state, description, image_urls")
    .eq("id", id)
    .single();

  if (!hotel) {
    return {
      title: "Hotel Not Found",
    };
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
    openGraph: {
      title: `${hotel.name} - ${location}`,
      description,
      type: "website",
      locale: "en_NG",
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

async function getHotelData(id) {
  const supabase = await createClient();

  try {
    // Fetch hotel data
    const { data: hotel, error: hotelError } = await supabase
      .from("hotels")
      .select("*")
      .eq("id", id)
      .single();

    if (hotelError || !hotel) {
      return null;
    }

    // Fetch room types with availability in a single optimized query
    const { data: roomTypes } = await supabase
      .from("hotel_room_types")
      .select("*")
      .eq("hotel_id", id)
      .order("base_price", { ascending: true });

    if (!roomTypes || roomTypes.length === 0) {
      return {
        hotel,
        roomTypes: [],
      };
    }

    // Get room type IDs for batch query
    const roomTypeIds = roomTypes.map((rt) => rt.id);

    // Batch fetch all available rooms for all room types
    const { data: allRooms } = await supabase
      .from("hotel_rooms")
      .select("id, room_type_id, status, price_per_night")
      .in("room_type_id", roomTypeIds)
      .eq("status", "available");

    // Group rooms by room type ID
    const roomsByType = (allRooms || []).reduce((acc, room) => {
      if (!acc[room.room_type_id]) {
        acc[room.room_type_id] = [];
      }
      acc[room.room_type_id].push(room);
      return acc;
    }, {});

    // Enrich room types with availability data
    const enrichedRoomTypes = roomTypes
      .map((roomType) => {
        const rooms = roomsByType[roomType.id] || [];
        const availableCount = rooms.length;
        const prices = rooms.map((r) => parseFloat(r.price_per_night));
        const minPrice =
          prices.length > 0 ? Math.min(...prices) : roomType.base_price;

        return {
          ...roomType,
          available_rooms: availableCount,
          min_price: minPrice,
          has_availability: availableCount > 0,
        };
      })
      .filter((rt) => rt.has_availability); // Only return room types with available rooms

    return {
      hotel,
      roomTypes: enrichedRoomTypes,
    };
  } catch (error) {
    console.error("Error fetching hotel data:", error);
    return null;
  }
}

export default async function HotelPage({ params }) {
  const { id } = await params;
  const data = await getHotelData(id);

  if (!data) {
    notFound();
  }

  return (
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
      <HotelDetails hotel={data.hotel} roomTypes={data.roomTypes} />
    </Suspense>
  );
}

// Generate static params for popular hotels at build time
export async function generateStaticParams() {
  try {
    // Use public client that doesn't require cookies
    const supabase = createAdminClient();

    const { data: hotels, error } = await supabase
      .from("hotels")
      .select("id")
      .limit(20);

    if (error) {
      console.error("Error fetching hotels for static params:", error);
      return [];
    }

    return (hotels || []).map((hotel) => ({
      id: hotel.id,
    }));
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

// Revalidate every hour (ISR)
export const revalidate = 3600;
