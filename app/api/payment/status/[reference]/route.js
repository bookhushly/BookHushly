/**
 * UPDATES NEEDED FOR /app/api/payment/status/[reference]/route.js
 *
 * Your existing file needs to handle hotel bookings in the query.
 * Currently it only fetches logistics_requests.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get payment record
    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Get related data based on request_type
    let requestData = null;

    if (
      payment.request_type === "logistics" ||
      payment.request_type === "security"
    ) {
      const tableName = `${payment.request_type}_requests`;
      const { data } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", payment.request_id)
        .single();
      requestData = data;
    }

    // ADD THIS SECTION FOR HOTEL BOOKINGS
    else if (payment.hotel_booking_id) {
      const { data } = await supabase
        .from("hotel_bookings")
        .select(
          `
          *,
          hotels:hotel_id(id, name, city, state),
          room_types:room_type_id(id, name)
        `,
        )
        .eq("id", payment.hotel_booking_id)
        .single();
      requestData = data;
    }

    // ADD THIS SECTION FOR APARTMENT BOOKINGS
    else if (payment.apartment_booking_id) {
      const { data } = await supabase
        .from("apartment_bookings")
        .select(
          `
          *,
          apartments:apartment_id(id, name, city, state)
        `,
        )
        .eq("id", payment.apartment_booking_id)
        .single();
      requestData = data;
    }

    // ADD THIS SECTION FOR EVENT BOOKINGS
    else if (payment.event_booking_id) {
      const { data } = await supabase
        .from("event_bookings")
        .select(
          `
          *,
          listings:listing_id(id, title, city, state)
        `,
        )
        .eq("id", payment.event_booking_id)
        .single();
      requestData = data;
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paid_at: payment.paid_at,
        channel: payment.paystack_channel || payment.crypto_pay_currency,
        fulfilled: payment.fulfilled,
        created_at: payment.created_at,
        metadata: payment.metadata,
        request_type: payment.request_type,
      },
      request: requestData
        ? {
            id: requestData.id,
            type: payment.request_type,
            status: requestData.status || requestData.booking_status,
            payment_status: requestData.payment_status,
            // Hotel-specific
            ...(payment.hotel_booking_id && {
              hotel_name: requestData.hotels?.name,
              room_type: requestData.room_types?.name,
              check_in_date: requestData.check_in_date,
              check_out_date: requestData.check_out_date,
              guest_name: requestData.guest_name,
            }),
            // Apartment-specific
            ...(payment.apartment_booking_id && {
              apartment_name: requestData.apartments?.name,
              check_in_date: requestData.check_in_date,
              check_out_date: requestData.check_out_date,
              guest_name: requestData.guest_name,
            }),
            // Event-specific
            ...(payment.event_booking_id && {
              event_title: requestData.listings?.title,
              booking_date: requestData.booking_date,
              guests: requestData.guests,
            }),
            // Logistics/Security-specific
            ...((payment.request_type === "logistics" ||
              payment.request_type === "security") && {
              service_type: requestData.service_type,
              customer_name: requestData.full_name,
            }),
          }
        : null,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 },
    );
  }
}
