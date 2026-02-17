"use server";

import { createClient } from "@/lib/supabase/server";

export async function createApartmentBooking(formData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in to book an apartment",
      };
    }

    const bookingData = {
      apartment_id: formData.get("apartment_id"),
      guest_id: user.id,
      check_in_date: formData.get("check_in_date"),
      check_out_date: formData.get("check_out_date"),
      number_of_guests: parseInt(formData.get("number_of_guests")),
      guest_name: formData.get("guest_name"),
      guest_email: formData.get("guest_email"),
      guest_phone: formData.get("guest_phone"),
      special_requests: formData.get("special_requests") || null,
      total_price: parseFloat(formData.get("total_price")),
      booking_status: "pending_payment",
      payment_status: "pending",
    };

    // Validate dates
    const checkIn = new Date(bookingData.check_in_date);
    const checkOut = new Date(bookingData.check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return { success: false, error: "Check-in date cannot be in the past" };
    }

    if (checkOut <= checkIn) {
      return {
        success: false,
        error: "Check-out date must be after check-in date",
      };
    }

    // Check availability
    const { data: existingBookings } = await supabase
      .from("apartment_bookings")
      .select("id")
      .eq("apartment_id", bookingData.apartment_id)
      .in("booking_status", ["confirmed", "checked_in"])
      .or(
        `and(check_in_date.lte.${bookingData.check_out_date},check_out_date.gte.${bookingData.check_in_date})`,
      );

    if (existingBookings && existingBookings.length > 0) {
      return {
        success: false,
        error: "Apartment is not available for the selected dates",
      };
    }

    // Create booking
    const { data: booking, error: insertError } = await supabase
      .from("apartment_bookings")
      .insert([bookingData])
      .select()
      .single();

    if (insertError) {
      console.error("Database error:", insertError);
      return {
        success: false,
        error: "Failed to create booking. Please try again.",
        details: insertError.message,
      };
    }

    return {
      success: true,
      data: booking,
      message: "Booking created successfully!",
    };
  } catch (error) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
