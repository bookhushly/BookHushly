"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Validation helper
function validateApartmentData(data) {
  const errors = {};

  // Basic Information
  if (!data.name?.trim()) {
    errors.name = "Apartment name is required";
  }
  if (!data.apartment_type) {
    errors.apartment_type = "Apartment type is required";
  }
  if (!data.bedrooms || data.bedrooms < 1) {
    errors.bedrooms = "At least 1 bedroom is required";
  }
  if (!data.bathrooms || data.bathrooms < 1) {
    errors.bathrooms = "At least 1 bathroom is required";
  }
  if (!data.max_guests || data.max_guests < 1) {
    errors.max_guests = "Maximum guests must be at least 1";
  }

  // Location
  if (!data.city?.trim()) {
    errors.city = "City is required";
  }
  if (!data.state?.trim()) {
    errors.state = "State is required";
  }

  // Pricing
  if (!data.price_per_night || data.price_per_night <= 0) {
    errors.price_per_night = "Valid nightly price is required";
  }

  // Images
  if (!data.image_urls || data.image_urls.length === 0) {
    errors.image_urls = "At least one image is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export async function createServicedApartment(formData) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in to create an apartment",
      };
    }

    // No KYC check needed - user can create apartments without approval

    // Parse form data
    const apartmentData = {
      // Basic Information
      name: formData.get("name"),
      description: formData.get("description") || null,
      apartment_type: formData.get("apartment_type"),

      // Location
      address: formData.get("address") || null,
      city: formData.get("city"),
      state: formData.get("state"),
      area: formData.get("area") || null,
      landmark: formData.get("landmark") || null,

      // Capacity & Size
      bedrooms: parseInt(formData.get("bedrooms")),
      bathrooms: parseFloat(formData.get("bathrooms")),
      max_guests: parseInt(formData.get("max_guests")),
      square_meters: formData.get("square_meters")
        ? parseFloat(formData.get("square_meters"))
        : null,

      // Pricing
      price_per_night: parseFloat(formData.get("price_per_night")),
      price_per_week: formData.get("price_per_week")
        ? parseFloat(formData.get("price_per_week"))
        : null,
      price_per_month: formData.get("price_per_month")
        ? parseFloat(formData.get("price_per_month"))
        : null,
      minimum_stay: parseInt(formData.get("minimum_stay") || "1"),

      // Utilities & Power
      utilities_included: formData.get("utilities_included") === "true",
      electricity_included: formData.get("electricity_included") === "true",
      generator_available: formData.get("generator_available") === "true",
      generator_hours: formData.get("generator_hours") || null,
      inverter_available: formData.get("inverter_available") === "true",
      solar_power: formData.get("solar_power") === "true",
      water_supply: formData.get("water_supply") || null,
      internet_included: formData.get("internet_included") === "true",
      internet_speed: formData.get("internet_speed") || null,

      // Features
      furnished: formData.get("furnished") === "true",
      kitchen_equipped: formData.get("kitchen_equipped") === "true",
      parking_spaces: parseInt(formData.get("parking_spaces") || "0"),
      has_balcony: formData.get("has_balcony") === "true",
      has_terrace: formData.get("has_terrace") === "true",
      floor_number: formData.get("floor_number")
        ? parseInt(formData.get("floor_number"))
        : null,

      // Security Features
      security_features: JSON.parse(formData.get("security_features") || "{}"),

      // Amenities
      amenities: JSON.parse(formData.get("amenities") || "{}"),

      // Media
      image_urls: JSON.parse(formData.get("image_urls") || "[]"),
      video_url: formData.get("video_url") || null,
      virtual_tour_url: formData.get("virtual_tour_url") || null,

      // Policies
      check_in_time: formData.get("check_in_time") || "14:00",
      check_out_time: formData.get("check_out_time") || "12:00",
      cancellation_policy: formData.get("cancellation_policy") || null,
      house_rules: formData.get("house_rules") || null,
      caution_deposit: formData.get("caution_deposit")
        ? parseFloat(formData.get("caution_deposit"))
        : null,

      // Availability
      status: "active",
      available_from: formData.get("available_from") || null,
      available_until: formData.get("available_until") || null,
      instant_booking: formData.get("instant_booking") === "true",

      // Vendor ID
      vendor_id: user.id,
    };

    // Validate data
    const validation = validateApartmentData(apartmentData);
    if (!validation.isValid) {
      return {
        success: false,
        error: "Validation failed",
        errors: validation.errors,
      };
    }

    // Insert into database
    const { data: apartment, error: insertError } = await supabase
      .from("serviced_apartments")
      .insert([apartmentData])
      .select()
      .single();

    if (insertError) {
      console.error("Database error:", insertError);
      return {
        success: false,
        error: "Failed to create apartment. Please try again.",
        details: insertError.message,
      };
    }

    // Revalidate paths
    revalidatePath("/vendor/dashboard");
    revalidatePath("/vendor/dashboard/serviced-apartments");

    return {
      success: true,
      data: apartment,
      message: "Apartment created successfully!",
    };
  } catch (error) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function updateServicedApartment(apartmentId, formData) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in to update an apartment",
      };
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from("serviced_apartments")
      .select("vendor_id")
      .eq("id", apartmentId)
      .single();

    if (fetchError || !existing) {
      return {
        success: false,
        error: "Apartment not found",
      };
    }

    if (existing.vendor_id !== user.id) {
      return {
        success: false,
        error: "You don't have permission to update this apartment",
      };
    }

    // Parse and prepare update data (same structure as create)
    const apartmentData = {
      name: formData.get("name"),
      description: formData.get("description") || null,
      apartment_type: formData.get("apartment_type"),
      address: formData.get("address") || null,
      city: formData.get("city"),
      state: formData.get("state"),
      area: formData.get("area") || null,
      landmark: formData.get("landmark") || null,
      bedrooms: parseInt(formData.get("bedrooms")),
      bathrooms: parseFloat(formData.get("bathrooms")),
      max_guests: parseInt(formData.get("max_guests")),
      square_meters: formData.get("square_meters")
        ? parseFloat(formData.get("square_meters"))
        : null,
      price_per_night: parseFloat(formData.get("price_per_night")),
      price_per_week: formData.get("price_per_week")
        ? parseFloat(formData.get("price_per_week"))
        : null,
      price_per_month: formData.get("price_per_month")
        ? parseFloat(formData.get("price_per_month"))
        : null,
      minimum_stay: parseInt(formData.get("minimum_stay") || "1"),
      utilities_included: formData.get("utilities_included") === "true",
      electricity_included: formData.get("electricity_included") === "true",
      generator_available: formData.get("generator_available") === "true",
      generator_hours: formData.get("generator_hours") || null,
      inverter_available: formData.get("inverter_available") === "true",
      solar_power: formData.get("solar_power") === "true",
      water_supply: formData.get("water_supply") || null,
      internet_included: formData.get("internet_included") === "true",
      internet_speed: formData.get("internet_speed") || null,
      furnished: formData.get("furnished") === "true",
      kitchen_equipped: formData.get("kitchen_equipped") === "true",
      parking_spaces: parseInt(formData.get("parking_spaces") || "0"),
      has_balcony: formData.get("has_balcony") === "true",
      has_terrace: formData.get("has_terrace") === "true",
      floor_number: formData.get("floor_number")
        ? parseInt(formData.get("floor_number"))
        : null,
      security_features: JSON.parse(formData.get("security_features") || "{}"),
      amenities: JSON.parse(formData.get("amenities") || "{}"),
      image_urls: JSON.parse(formData.get("image_urls") || "[]"),
      video_url: formData.get("video_url") || null,
      virtual_tour_url: formData.get("virtual_tour_url") || null,
      check_in_time: formData.get("check_in_time") || "14:00",
      check_out_time: formData.get("check_out_time") || "12:00",
      cancellation_policy: formData.get("cancellation_policy") || null,
      house_rules: formData.get("house_rules") || null,
      caution_deposit: formData.get("caution_deposit")
        ? parseFloat(formData.get("caution_deposit"))
        : null,
      status: formData.get("status") || "active",
      available_from: formData.get("available_from") || null,
      available_until: formData.get("available_until") || null,
      instant_booking: formData.get("instant_booking") === "true",
      updated_at: new Date().toISOString(),
    };

    // Validate data
    const validation = validateApartmentData(apartmentData);
    if (!validation.isValid) {
      return {
        success: false,
        error: "Validation failed",
        errors: validation.errors,
      };
    }

    // Update in database
    const { data: apartment, error: updateError } = await supabase
      .from("serviced_apartments")
      .update(apartmentData)
      .eq("id", apartmentId)
      .select()
      .single();

    if (updateError) {
      console.error("Database error:", updateError);
      return {
        success: false,
        error: "Failed to update apartment. Please try again.",
        details: updateError.message,
      };
    }

    // Revalidate paths
    revalidatePath("/vendor/dashboard");
    revalidatePath("/vendor/dashboard/serviced-apartments");
    revalidatePath(`/vendor/dashboard/serviced-apartments/${apartmentId}`);

    return {
      success: true,
      data: apartment,
      message: "Apartment updated successfully!",
    };
  } catch (error) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function deleteServicedApartment(apartmentId) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in to delete an apartment",
      };
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from("serviced_apartments")
      .select("vendor_id")
      .eq("id", apartmentId)
      .single();

    if (fetchError || !existing) {
      return {
        success: false,
        error: "Apartment not found",
      };
    }

    if (existing.vendor_id !== user.id) {
      return {
        success: false,
        error: "You don't have permission to delete this apartment",
      };
    }

    // Check for active bookings
    const { data: activeBookings } = await supabase
      .from("apartment_bookings")
      .select("id")
      .eq("apartment_id", apartmentId)
      .in("booking_status", ["confirmed", "checked_in"]);

    if (activeBookings && activeBookings.length > 0) {
      return {
        success: false,
        error:
          "Cannot delete apartment with active bookings. Please wait for bookings to complete.",
      };
    }

    // Delete apartment
    const { error: deleteError } = await supabase
      .from("serviced_apartments")
      .delete()
      .eq("id", apartmentId);

    if (deleteError) {
      console.error("Database error:", deleteError);
      return {
        success: false,
        error: "Failed to delete apartment. Please try again.",
        details: deleteError.message,
      };
    }

    // Revalidate paths
    revalidatePath("/vendor/dashboard");
    revalidatePath("/vendor/dashboard/serviced-apartments");

    return {
      success: true,
      message: "Apartment deleted successfully!",
    };
  } catch (error) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
