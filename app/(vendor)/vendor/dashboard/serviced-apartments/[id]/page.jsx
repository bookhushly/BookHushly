import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ApartmentDetailsPage from "./client";

async function getApartmentDetails(apartmentId) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch apartment details - selecting only actual columns from schema
  const { data: apartment, error: apartmentError } = await supabase
    .from("serviced_apartments")
    .select(
      `
      id,
      vendor_id,
      name,
      description,
      apartment_type,
      address,
      city,
      state,
      area,
      landmark,
      bedrooms,
      bathrooms,
      max_guests,
      square_meters,
      price_per_night,
      price_per_week,
      price_per_month,
      minimum_stay,
      utilities_included,
      electricity_included,
      generator_available,
      generator_hours,
      inverter_available,
      solar_power,
      water_supply,
      internet_included,
      internet_speed,
      furnished,
      kitchen_equipped,
      parking_spaces,
      has_balcony,
      has_terrace,
      floor_number,
      security_features,
      amenities,
      image_urls,
      video_url,
      virtual_tour_url,
      check_in_time,
      check_out_time,
      cancellation_policy,
      house_rules,
      caution_deposit,
      status,
      available_from,
      available_until,
      instant_booking,
      created_at,
      updated_at,
      is_verified,
      verification_date,
      views_count
    `
    )
    .eq("id", apartmentId)
    .eq("vendor_id", user.id) // Ensure ownership
    .single();

  if (apartmentError || !apartment) {
    redirect("/vendor/dashboard");
  }

  return {
    apartment,
    user,
  };
}

export async function generateMetadata({ params }) {
  // Await params as per Next.js 15 best practices
  const { id: apartmentId } = await params;
  const supabase = await createClient();

  const { data: apartment } = await supabase
    .from("serviced_apartments")
    .select("name, city, state")
    .eq("id", apartmentId)
    .single();

  if (!apartment) {
    return {
      title: "Apartment Not Found | BookHushly",
      description: "This serviced apartment could not be found.",
    };
  }

  return {
    title: `${apartment.name} - Manage | BookHushly`,
    description: `Manage your serviced apartment in ${apartment.city}, ${apartment.state}`,
  };
}

export default async function ApartmentDetailsServerPage({ params }) {
  // Await params as per Next.js 15 best practices
  const { id: apartmentId } = await params;
  const { apartment } = await getApartmentDetails(apartmentId);

  return (
    <ApartmentDetailsPage apartment={apartment} apartmentId={apartmentId} />
  );
}
