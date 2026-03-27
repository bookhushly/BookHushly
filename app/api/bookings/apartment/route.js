import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyBookingPending } from "@/lib/notifications";

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
    const apartmentId = formData.get("apartment_id");

    // Fetch apartment base price and any active pricing rules (server-authoritative)
    const { data: apt } = await supabase
      .from("serviced_apartments")
      .select("price_per_night, price_per_week, price_per_month")
      .eq("id", apartmentId)
      .single();

    const { data: pricingRules } = await supabase
      .from("apartment_pricing_rules")
      .select("start_date, end_date, price_per_night")
      .eq("apartment_id", apartmentId);

    // Compute subtotal night-by-night, applying any matching pricing rule
    let subtotal = 0;
    const checkInDate = new Date(formData.get("check_in_date"));
    for (let i = 0; i < numberOfNights; i++) {
      const night = new Date(checkInDate);
      night.setDate(night.getDate() + i);
      const nightStr = night.toISOString().slice(0, 10);

      const rule = (pricingRules || []).find(
        (r) => r.start_date <= nightStr && r.end_date >= nightStr
      );
      subtotal += rule ? parseFloat(rule.price_per_night) : parseFloat(apt?.price_per_night || 0);
    }

    const pricePerNight = parseFloat(apt?.price_per_night || 0);
    const serviceFee = parseFloat(formData.get("service_fee") || "0");
    const cautionDeposit = parseFloat(formData.get("caution_deposit") || "0");
    const totalAmount = subtotal + serviceFee + cautionDeposit;

    const bookingData = {
      apartment_id: apartmentId,
      // user_id is nullable for guest bookings; guest identity tracked via guest_name/email/phone fields
      user_id: user?.id || null,
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

    // Check for active booking lock by another user
    const now = new Date().toISOString();
    const { data: activeLock } = await supabase
      .from("booking_locks")
      .select("user_id, expires_at")
      .eq("listing_id", bookingData.apartment_id)
      .eq("listing_type", "apartment")
      .gt("expires_at", now)
      .maybeSingle();

    if (activeLock && activeLock.user_id !== (user?.id || null)) {
      const minutesLeft = Math.ceil(
        (new Date(activeLock.expires_at) - new Date()) / 60000,
      );
      return NextResponse.json(
        {
          error: `This apartment is currently being booked by another guest. Please try again in about ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
          locked_until: activeLock.expires_at,
        },
        { status: 409 },
      );
    }

    const { data: booking, error: insertError } = await supabase
      .from("apartment_bookings")
      .insert([bookingData])
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create booking. Please try again." },
        { status: 500 },
      );
    }

    // Notify the customer their booking was received (if logged in)
    if (user?.id) {
      const apartmentName = bookingData.guest_name
        ? `your apartment stay`
        : "your apartment stay";
      // Fetch apartment name for a better message
      const { data: apt } = await supabase
        .from("serviced_apartments")
        .select("name")
        .eq("id", bookingData.apartment_id)
        .single();
      notifyBookingPending(user.id, {
        bookingId:   booking.id,
        serviceName: apt?.name || "your apartment",
        bookingType: "apartment",
      }).catch(() => {}); // non-blocking
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
