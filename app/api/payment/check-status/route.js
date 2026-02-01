import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Check Payment Status
 * POST /api/payment/check-status
 *
 * Checks if a request/booking has already been paid for
 * Returns payment details if found
 */
export async function POST(request) {
  try {
    const { requestId, requestType } = await request.json();

    if (!requestId || !requestType) {
      return NextResponse.json(
        { error: "Request ID and type are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Build query based on request type
    let query = supabase
      .from("payments")
      .select("*")
      .eq("request_id", requestId)
      .eq("request_type", requestType)
      .in("status", ["completed", "success"]) // Check for successful payments
      .order("created_at", { ascending: false });

    // For bookings, also check by booking ID
    if (requestType === "hotel") {
      query = supabase
        .from("payments")
        .select("*")
        .eq("hotel_booking_id", requestId)
        .in("status", ["completed", "success"])
        .order("created_at", { ascending: false });
    } else if (requestType === "apartment") {
      query = supabase
        .from("payments")
        .select("*")
        .eq("apartment_booking_id", requestId)
        .in("status", ["completed", "success"])
        .order("created_at", { ascending: false });
    } else if (requestType === "event") {
      query = supabase
        .from("payments")
        .select("*")
        .eq("event_booking_id", requestId)
        .in("status", ["completed", "success"])
        .order("created_at", { ascending: false });
    }

    const { data: payments, error } = await query;

    if (error) {
      console.error("Error checking payment status:", error);
      return NextResponse.json(
        { error: "Failed to check payment status" },
        { status: 500 },
      );
    }

    // If successful payment exists
    if (payments && payments.length > 0) {
      const latestPayment = payments[0];

      return NextResponse.json({
        hasPaid: true,
        payment: {
          id: latestPayment.id,
          reference: latestPayment.reference,
          amount: latestPayment.amount,
          currency: latestPayment.currency,
          status: latestPayment.status,
          provider: latestPayment.provider,
          paid_at: latestPayment.paid_at,
          created_at: latestPayment.created_at,
        },
        message: "Payment already completed for this request",
      });
    }

    // Check for pending payments (edge case)
    const { data: pendingPayments } = await supabase
      .from("payments")
      .select("*")
      .eq("request_id", requestId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);

    if (pendingPayments && pendingPayments.length > 0) {
      return NextResponse.json({
        hasPaid: false,
        hasPending: true,
        payment: {
          id: pendingPayments[0].id,
          reference: pendingPayments[0].reference,
          amount: pendingPayments[0].amount,
          status: pendingPayments[0].status,
          created_at: pendingPayments[0].created_at,
        },
        message:
          "Pending payment exists. Please complete or cancel it before creating a new one.",
      });
    }

    // No payments found
    return NextResponse.json({
      hasPaid: false,
      hasPending: false,
      message: "No payment found for this request",
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check payment status",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
