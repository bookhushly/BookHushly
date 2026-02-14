import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: booking, error } = await supabase
      .from("hotel_bookings")
      .select(
        `
        *,
        hotels:hotel_id (
          id,
          name,
          city,
          state,
          image_urls,
          checkout_policy,
          policies
        ),
        room_types:room_type_id (
          id,
          name,
          base_price,
          max_occupancy,
          size_sqm
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Flatten structure for payment form compatibility
    const formattedBooking = {
      ...booking,
      email: booking.guest_email,
      phone_number: booking.guest_phone,
      full_name: booking.guest_name,
      amount: booking.total_price,
      total_price: booking.total_price,
      total_amount: booking.total_price,
      number_of_guests: booking.adults + booking.children,
      hotel: booking.hotels,
      room_type: booking.room_types,
    };

    return NextResponse.json({ booking: formattedBooking });
  } catch (error) {
    console.error("Error fetching hotel booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch booking" },
      { status: 500 },
    );
  }
}
