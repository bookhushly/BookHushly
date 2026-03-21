import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyBookingPending } from "@/lib/notifications";

/**
 * POST /api/bookings/hotel
 * Fire a "Booking Received" in-app notification after hotel booking creation.
 * Called client-side immediately after the booking insert succeeds.
 */
export async function POST(request) {
  try {
    const { bookingId, hotelName } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.id) {
      await notifyBookingPending(user.id, {
        bookingId,
        serviceName: hotelName || "your hotel",
        bookingType: "hotel",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Non-critical — never fail the booking flow
    console.error("[hotel booking notify] error:", error.message);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
