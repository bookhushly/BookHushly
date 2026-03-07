import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import HotelDetails from "./content";

async function getHotelData(id) {
  const supabase = createAdminClient();

  const { data: hotel, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !hotel) return null;

  const { data: roomTypes } = await supabase
    .from("hotel_room_types")
    .select("*")
    .eq("hotel_id", id)
    .order("base_price", { ascending: true });

  return { hotel, roomTypes: roomTypes || [] };
}

export const dynamic = "force-dynamic";

export default async function HotelPage({ params }) {
  const { id } = await params;
  const data = await getHotelData(id);

  if (!data) notFound();

  return <HotelDetails hotel={data.hotel} roomTypes={data.roomTypes} />;
}
