import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Get Event Booking Details
 * GET /api/bookings/event/[id]
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Fetch event booking with listing details
    const { data: booking, error } = await supabase
      .from("event_bookings")
      .select(
        `
        *,
        listing:listing_id (
          id,
          title,
          description,
          price,
          location,
          event_date,
          event_time,
          event_type,
          ticket_packages,
          total_tickets,
          remaining_tickets,
          media_urls,
          vendors:vendor_id (
            id,
            business_name,
            phone_number,
            business_address
          )
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching event booking:", error);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Format response
    return NextResponse.json({
      booking: {
        ...booking,
        // Flatten listing data for easier access
        listing_title: booking.listing?.title,
        listing_location: booking.listing?.location,
        listing_event_date: booking.listing?.event_date,
        listing_event_time: booking.listing?.event_time,
        vendor_name: booking.listing?.vendors?.business_name,
      },
    });
  } catch (error) {
    console.error("Event booking fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
