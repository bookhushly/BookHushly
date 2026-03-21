import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Require authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
          policies,
          security_deposit,
          security_deposit_notes
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

    // Ownership check — only the booking owner or admins may view
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (booking.user_id && booking.user_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Flatten structure for payment form compatibility
    const securityDeposit = booking.hotels?.security_deposit || 0;
    const roomTotal = booking.total_price || 0;
    const grandTotal = roomTotal + securityDeposit;

    const formattedBooking = {
      ...booking,
      email: booking.guest_email,
      phone_number: booking.guest_phone,
      full_name: booking.guest_name,
      amount: grandTotal,
      total_price: grandTotal,
      total_amount: grandTotal,
      room_total: roomTotal,
      security_deposit: securityDeposit,
      security_deposit_notes: booking.hotels?.security_deposit_notes || null,
      number_of_guests: booking.adults + booking.children,
      hotel: booking.hotels,
      room_type: booking.room_types,
    };

    return NextResponse.json({ booking: formattedBooking });
  } catch (error) {
    console.error("Error fetching hotel booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 },
    );
  }
}
