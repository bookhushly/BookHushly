// pages/api/payment-callback.js
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email"; // From your first query
import {
  verifyPaystackPayment,
  verifyNOWPaymentsPayment,
} from "@/lib/payments";

export async function POST(request) {
  try {
    const supabase = createClient();
    const { reference, provider, event_booking_id } = await request.json();

    if (!reference || !provider || !event_booking_id) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: reference, provider, or event_booking_id",
        },
        { status: 400 }
      );
    }

    // Verify payment
    let verificationResult;
    if (provider === "paystack") {
      verificationResult = await verifyPaystackPayment(
        reference,
        process.env.PAYSTACK_SECRET_KEY
      );
    } else if (provider === "crypto") {
      verificationResult = await verifyNOWPaymentsPayment(
        reference,
        process.env.NOWPAYMENTS_API_KEY
      );
    } else {
      return NextResponse.json(
        { error: "Invalid payment provider" },
        { status: 400 }
      );
    }

    if (verificationResult.error || !verificationResult.data) {
      console.error("Payment verification failed:", verificationResult.error);
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const paymentStatus = verificationResult.data.status;

    // Fetch booking
    const { data: booking, error: bookingError } = await supabase
      .from("event_bookings")
      .select("*")
      .eq("id", event_booking_id)
      .single();

    if (bookingError || !booking) {
      console.error("Booking fetch error:", bookingError);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check for idempotency (already confirmed)
    if (
      booking.payment_status === "completed" &&
      booking.status === "confirmed"
    ) {
      return NextResponse.json({ success: true, booking_id: event_booking_id });
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from("event_bookings")
      .update({
        payment_status: paymentStatus === "success" ? "completed" : "failed",
        status: paymentStatus === "success" ? "confirmed" : "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", event_booking_id);

    if (updateError) {
      console.error("Booking update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 }
      );
    }

    if (paymentStatus === "success") {
      // Fetch service details for email
      const { data: service, error: serviceError } = await supabase
        .from("listings")
        .select("title, event_date, location, ticket_packages")
        .eq("id", booking.listing_id)
        .single();

      if (serviceError) {
        console.error("Service fetch error:", serviceError);
        return NextResponse.json(
          { error: "Failed to fetch event details" },
          { status: 500 }
        );
      }

      // Prepare ticket prices for email
      const ticketDetails = JSON.parse(booking.ticket_details || "{}");
      const ticketPrices = {};
      (service.ticket_packages || []).forEach((pkg) => {
        ticketPrices[pkg.name] = pkg.price;
      });

      // Send email
      await sendEmail({
        to: booking.contact_email,
        templateName: "ticket_confirmation",
        data: {
          customer_name: booking.contact_name || "Customer",
          event_title: service.title || "Event",
          event_date: service.event_date
            ? new Date(service.event_date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
            : "TBD",
          event_time: booking.booking_time || "TBD",
          event_location: service.location || "TBD",
          ticket_details: ticketDetails,
          ticket_prices: ticketPrices,
          total_amount: booking.total_amount,
        },
      });

      return NextResponse.json({ success: true, booking_id: event_booking_id });
    } else {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Payment callback error:", {
      message: err.message,
      body: await request.json().catch(() => "Invalid JSON"),
    });
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin":
        process.env.ALLOWED_ORIGINS || "http://localhost:3000",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
