import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HotelDetails from "./content";
import { Loader2 } from "lucide-react";

export async function generateMetadata({ params }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: hotel } = await supabase
    .from("hotels")
    .select("id, name, city, state, description")
    .eq("id", id)
    .single();

  if (!hotel) {
    return {
      title: "Hotel Not Found",
    };
  }

  const location = `${hotel.city}, ${hotel.state}`;

  return {
    title: `${hotel.name} | BookHushly`,
    description: `Book your stay at ${hotel.name} in ${location}. ${hotel.description || "Premium accommodation with modern amenities and exceptional service."}`,
    keywords: [
      hotel.name,
      hotel.city,
      hotel.state,
      "hotel booking Nigeria",
      "accommodation",
      "hotel rooms",
      "lodging",
    ],
    openGraph: {
      title: `${hotel.name}`,
      description: `Premium hotel in ${location}`,
      type: "website",
      locale: "en_NG",
    },
    twitter: {
      card: "summary_large_image",
      title: `${hotel.name}`,
      description: `Book your stay in ${location}`,
    },
  };
}

async function getHotelData(id) {
  const supabase = await createClient();

  // Fetch hotel data
  const { data: hotel, error: hotelError } = await supabase
    .from("hotels")
    .select("*")
    .eq("id", id)
    .single();

  if (hotelError || !hotel) {
    return null;
  }

  // Fetch room types for this hotel
  const { data: roomTypes } = await supabase
    .from("hotel_room_types")
    .select("*")
    .eq("hotel_id", id)
    .order("base_price", { ascending: true });

  // Fetch room availability for each room type
  const roomTypesWithAvailability = await Promise.all(
    (roomTypes || []).map(async (roomType) => {
      const { data: rooms } = await supabase
        .from("hotel_rooms")
        .select("id, status, price_per_night")
        .eq("room_type_id", roomType.id)
        .eq("status", "available");

      const availableCount = rooms?.length || 0;
      const prices = rooms?.map((r) => parseFloat(r.price_per_night)) || [];
      const minPrice =
        prices.length > 0 ? Math.min(...prices) : roomType.base_price;

      return {
        ...roomType,
        available_rooms: availableCount,
        min_price: minPrice,
        has_availability: availableCount > 0,
      };
    })
  );

  // Filter out room types with no availability
  const availableRoomTypes = roomTypesWithAvailability.filter(
    (rt) => rt.has_availability
  );

  return {
    hotel,
    roomTypes: availableRoomTypes,
  };
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
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <HotelDetails hotel={data.hotel} roomTypes={data.roomTypes} />
    </Suspense>
  );
}
