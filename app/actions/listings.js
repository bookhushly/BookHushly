// app/actions/listings.js - Add logs to server action
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function generateOperatingHoursText(hoursData) {
  console.log("[Server] Generating operating hours text:", hoursData);
  if (!hoursData) return null;

  const daysOrder = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const openDays = daysOrder
    .map((day) => ({ day, ...hoursData[day] }))
    .filter((d) => d && !d.closed);

  if (openDays.length === 0) return null;
  if (openDays.length === 7) {
    const firstDay = openDays[0];
    if (
      openDays.every(
        (d) => d.open === firstDay.open && d.close === firstDay.close,
      )
    ) {
      return `Daily ${firstDay.open} - ${firstDay.close}`;
    }
  }

  const ranges = [];
  let start = null;
  let current = null;

  for (let i = 0; i < daysOrder.length; i++) {
    const dayData = hoursData[daysOrder[i]];
    if (!dayData || dayData.closed) {
      if (current) {
        ranges.push({ start, end: current, ...hoursData[current] });
        start = null;
        current = null;
      }
      continue;
    }

    if (!start) {
      start = daysOrder[i];
      current = daysOrder[i];
    } else if (
      hoursData[current].open === dayData.open &&
      hoursData[current].close === dayData.close
    ) {
      current = daysOrder[i];
    } else {
      ranges.push({ start, end: current, ...hoursData[current] });
      start = daysOrder[i];
      current = daysOrder[i];
    }
  }

  if (current) {
    ranges.push({ start, end: current, ...hoursData[current] });
  }

  return ranges
    .map((r) => {
      const days =
        r.start === r.end
          ? r.start.charAt(0).toUpperCase() + r.start.slice(1, 3)
          : `${r.start.charAt(0).toUpperCase() + r.start.slice(1, 3)}-${r.end.charAt(0).toUpperCase() + r.end.slice(1, 3)}`;
      return `${days} ${r.open}-${r.close}`;
    })
    .join(", ");
}

function processOperatingHours(hoursData) {
  console.log("[Server] Processing operating hours:", hoursData);

  if (!hoursData || typeof hoursData !== "object") {
    return {
      data: {},
      text: null,
      is24_7: false,
      general_open: null,
      general_close: null,
    };
  }

  const is24_7 = Object.values(hoursData).every(
    (day) =>
      day && !day.closed && day.open === "00:00" && day.close === "23:59",
  );

  const openDays = Object.entries(hoursData).filter(
    ([_, day]) => day && !day.closed,
  );
  let operatingHoursText = null;

  if (is24_7) {
    operatingHoursText = "24/7";
  } else if (openDays.length > 0) {
    operatingHoursText = generateOperatingHoursText(hoursData);
  }

  let general_open = null;
  let general_close = null;

  if (!is24_7 && openDays.length > 0) {
    const firstOpenDay = openDays[0][1];
    general_open = firstOpenDay.open;
    general_close = firstOpenDay.close;
  }

  const result = {
    data: hoursData,
    text: operatingHoursText,
    is24_7: is24_7,
    general_open: general_open,
    general_close: general_close,
  };

  console.log("[Server] Operating hours result:", result);
  return result;
}

export async function createListing(listingData) {
  console.log("[Server] ===== CREATE LISTING START =====");
  console.log(
    "[Server] Received listing data:",
    JSON.stringify(listingData, null, 2),
  );

  try {
    const supabase = await createClient();
    console.log("[Server] Supabase client created");

    // Get vendor_id from user_id
    console.log("[Server] Fetching vendor for user_id:", listingData.vendor_id);
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("id", listingData.vendor_id)
      .single();
    console.log(vendor);

    if (vendorError) {
      console.error("[Server] Vendor fetch error:", vendorError);
      return {
        success: false,
        error: "Vendor not found. Please complete KYC verification.",
      };
    }

    console.log("[Server] Vendor found:", vendor);

    // Process operating hours
    const operatingHours = processOperatingHours(listingData.operating_hours);

    // Process amenities
    const processedAmenities = Array.isArray(listingData.amenities)
      ? listingData.amenities
      : [];
    console.log("[Server] Processed amenities:", processedAmenities);

    // Combine event_date and event_time into proper timestamptz
    let eventTimestamp = null;
    if (listingData.event_date && listingData.event_time) {
      eventTimestamp = new Date(
        `${listingData.event_date}T${listingData.event_time}:00`,
      ).toISOString();
      console.log("[Server] Event timestamp:", eventTimestamp);
    }

    const insertData = {
      // Core required fields
      vendor_id: vendor.id,
      vendor_name: listingData.vendor_name,
      vendor_phone: listingData.vendor_phone,
      title: listingData.title,
      description: listingData.description,
      category: listingData.category,
      price: parseFloat(listingData.price) || 0,
      location: listingData.location,
      capacity: parseInt(listingData.capacity) || null,
      availability: listingData.availability || "available",

      // Operating hours
      operating_hours: operatingHours.text,
      operating_hours_data: operatingHours.data,
      is_24_7: operatingHours.is24_7,
      general_open_time: operatingHours.general_open,
      general_close_time: operatingHours.general_close,

      // Amenities
      amenities: processedAmenities,

      // Basic additional fields
      requirements: listingData.requirements,
      cancellation_policy: listingData.cancellation_policy || [],
      media_urls: listingData.media_urls || [],

      // Conditional fields
      ...(listingData.price_unit && { price_unit: listingData.price_unit }),
      ...(listingData.bedrooms && {
        bedrooms: parseInt(listingData.bedrooms),
      }),
      ...(listingData.bathrooms && {
        bathrooms: parseInt(listingData.bathrooms),
      }),
      ...(listingData.minimum_stay && {
        minimum_stay: listingData.minimum_stay,
      }),
      ...(listingData.security_deposit && {
        security_deposit: parseFloat(listingData.security_deposit),
      }),
      ...(listingData.service_areas && {
        service_areas: listingData.service_areas,
      }),

      // Category-specific data
      category_data: {
        room_type: listingData.room_type || null,
        apartment_types: listingData.apartment_types || null,
        services_included: listingData.services_included || null,
        target_guests: listingData.target_guests || null,
        furnishing: listingData.furnishing || null,
        kitchen_facilities: listingData.kitchen_facilities || null,
        payment_terms: listingData.payment_terms || null,
        cuisine_type: listingData.cuisine_type || null,
        service_type: listingData.service_type || null,
        special_diets: listingData.special_diets || null,
        delivery_areas: listingData.delivery_areas || null,
        meals: listingData.meals || null,
        event_types: listingData.event_types || null,
        vehicle_categories: listingData.vehicle_categories || null,
        transmission_types: listingData.transmission_types || null,
        fuel_types: listingData.fuel_types || null,
        rental_duration: listingData.rental_duration || null,
        driver_service: listingData.driver_service || null,
        delivery_pickup: listingData.delivery_pickup || null,
        age_requirement: parseInt(listingData.age_requirement) || null,
        license_requirement: listingData.license_requirement || null,
        insurance_coverage: listingData.insurance_coverage || null,
        fleet_size: parseInt(listingData.fleet_size) || null,
        service_types: listingData.service_types || null,
        vehicle_types: listingData.vehicle_types || null,
        weight_limit: listingData.weight_limit || null,
        delivery_time: listingData.delivery_time || null,
        tracking_available: listingData.tracking_available || null,
        insurance_covered: listingData.insurance_covered || null,
        security_types: listingData.security_types || null,
        team_size: listingData.team_size || null,
        duration: listingData.duration || null,
        certifications: listingData.certifications || null,
        equipment: listingData.equipment || null,
        experience_years: parseInt(listingData.experience_years) || null,
        background_check: listingData.background_check || null,
        response_time: listingData.response_time || null,
      },

      // Events specific fields with proper timestamp
      ...(listingData.event_type && { event_type: listingData.event_type }),
      ...(listingData.event_date && { event_date: listingData.event_date }),
      ...(eventTimestamp && { event_time: eventTimestamp }),
      ...(listingData.total_tickets && {
        remaining_tickets: parseInt(listingData.total_tickets) || 0,
        total_tickets: parseInt(listingData.total_tickets) || 0,
      }),
      ...(listingData.ticket_packages && {
        ticket_packages: listingData.ticket_packages,
      }),

      // Status fields
      active: listingData.active !== false,

      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log(
      "[Server] Prepared insert data:",
      JSON.stringify(insertData, null, 2),
    );
    console.log("[Server] Attempting database insert...");

    const { data, error } = await supabase
      .from("listings")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("[Server] Insert listing error:", error);
      console.error("[Server] Error details:", JSON.stringify(error, null, 2));
      return {
        success: false,
        error: error.message || "Failed to create listing",
      };
    }

    console.log("[Server] Listing created successfully:", data);
    console.log("[Server] Revalidating paths...");

    // Revalidate relevant paths
    revalidatePath("/vendor/dashboard");
    revalidatePath("/vendor/dashboard/listings");

    console.log("[Server] ===== CREATE LISTING SUCCESS =====");
    return { success: true, data };
  } catch (error) {
    console.error("[Server] Create listing error:", error);
    console.error("[Server] Error stack:", error.stack);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}
