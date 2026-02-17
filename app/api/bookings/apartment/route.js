import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const formData = await request.formData();

    const checkIn = new Date(formData.get("check_in_date"));
    const checkOut = new Date(formData.get("check_out_date"));
    const numberOfNights = Math.ceil(
      (checkOut - checkIn) / (1000 * 60 * 60 * 24),
    );
    const pricePerNight = parseFloat(formData.get("price_per_night"));
    const subtotal = numberOfNights * pricePerNight;
    const serviceFee = parseFloat(formData.get("service_fee") || "0");
    const cautionDeposit = parseFloat(formData.get("caution_deposit") || "0");
    const totalAmount = subtotal + serviceFee + cautionDeposit;

    const bookingData = {
      apartment_id: formData.get("apartment_id"),
      // user_id is NOT NULL in schema — use a placeholder for guests or the actual user
      user_id: user?.id || "00000000-0000-0000-0000-000000000000",
      guest_id: user?.id || null,
      check_in_date: formData.get("check_in_date"),
      check_out_date: formData.get("check_out_date"),
      number_of_nights: numberOfNights,
      number_of_guests: parseInt(formData.get("number_of_guests")),
      price_per_night: pricePerNight,
      subtotal: subtotal,
      service_fee: serviceFee,
      caution_deposit: cautionDeposit,
      total_amount: totalAmount,
      guest_name: formData.get("guest_name"),
      guest_email: formData.get("guest_email"),
      guest_phone: formData.get("guest_phone"),
      special_requests: formData.get("special_requests") || null,
      booking_status: "pending", // must match constraint: pending/confirmed/checked_in/checked_out/cancelled/no_show
      payment_status: "pending",
    };

    const { data: booking, error: insertError } = await supabase
      .from("apartment_bookings")
      .insert([bookingData])
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create booking", details: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
