import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paystackWebhook } from "@/lib/paystack";
import { nowpaymentsIPN } from "@/lib/nowpayments";
import { validateSignature as paystackValidateSignature } from "@/lib/paystack/utils/signature-validator";

/**
 * Unified Webhook Handler
 * Routes webhooks to appropriate handler based on signature/headers
 * POST /api/payment/webhook
 */
export async function POST(request) {
  try {
    const body = await request.text();
    const paystackSignature = request.headers.get("x-paystack-signature");
    const nowpaymentsSignature = request.headers.get("x-nowpayments-sig");

    // Route to appropriate webhook handler
    if (paystackSignature) {
      return await handlePaystackWebhook(body, paystackSignature);
    } else if (nowpaymentsSignature) {
      return await handleNOWPaymentsIPN(body, nowpaymentsSignature);
    } else {
      console.error("No valid webhook signature found");
      return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}

/**
 * Handle Paystack webhook
 */
async function handlePaystackWebhook(body, signature) {
  try {
    // Verify signature
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const isValid = paystackValidateSignature(signature, body, secretKey);

    if (!isValid) {
      console.error("Invalid Paystack signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const event = payload.event;
    const data = payload.data;

    console.log("Paystack webhook received:", event, data.reference);

    const supabase = await createClient();

    // Find payment by reference
    const { data: payment, error: findError } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", data.reference)
      .eq("provider", "paystack")
      .single();

    if (findError || !payment) {
      console.error("Payment not found:", data.reference);
      return NextResponse.json({ status: "accepted" }, { status: 200 });
    }

    // Handle event
    if (event === "charge.success") {
      await handlePaystackSuccess(supabase, payment, data);
    } else if (event === "charge.failed") {
      await handlePaystackFailed(supabase, payment, data);
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}

/**
 * Handle NOWPayments IPN
 */
async function handleNOWPaymentsIPN(body, signature) {
  try {
    const payload = JSON.parse(body);

    // Verify signature
    const isValid = nowpaymentsIPN.verifySignature(signature, payload);

    if (!isValid) {
      console.error("Invalid NOWPayments signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const parsedEvent = nowpaymentsIPN.parseEvent(payload);

    console.log(
      "NOWPayments IPN received:",
      parsedEvent.status,
      parsedEvent.orderId,
    );

    const supabase = await createClient();

    // Find payment by crypto_order_id or reference
    const { data: payment, error: findError } = await supabase
      .from("payments")
      .select("*")
      .or(
        `crypto_order_id.eq.${parsedEvent.orderId},reference.eq.${parsedEvent.orderId}`,
      )
      .eq("provider", "nowpayments")
      .single();

    if (findError || !payment) {
      console.error("Payment not found:", parsedEvent.orderId);
      return NextResponse.json({ status: "accepted" }, { status: 200 });
    }

    // Update payment with IPN data
    const updateData = {
      crypto_payment_id: parsedEvent.paymentId,
      status: parsedEvent.status,
      crypto_pay_amount: parsedEvent.payAmount,
      crypto_actually_paid: parsedEvent.actuallyPaid,
      crypto_outcome_amount: parsedEvent.outcomeAmount,
      crypto_outcome_currency: parsedEvent.outcomeCurrency,
      crypto_pay_address: parsedEvent.payAddress,
      crypto_fee: parsedEvent.fee,
      updated_at: new Date().toISOString(),
    };

    // Handle finished status
    if (parsedEvent.status === "finished") {
      await handleCryptoFinished(supabase, payment, parsedEvent, updateData);
    } else if (
      parsedEvent.status === "failed" ||
      parsedEvent.status === "expired"
    ) {
      await handleCryptoFailed(supabase, payment, parsedEvent, updateData);
    } else {
      // In-progress status
      await supabase.from("payments").update(updateData).eq("id", payment.id);
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("NOWPayments IPN error:", error);
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}

/**
 * Handle successful Paystack payment
 */
async function handlePaystackSuccess(supabase, payment, data) {
  try {
    // Prevent double fulfillment
    if (payment.status === "completed" && payment.fulfilled) {
      console.log("Payment already fulfilled:", payment.reference);
      return;
    }

    // Update payment record
    await supabase
      .from("payments")
      .update({
        status: "completed",
        paystack_transaction_id: data.id,
        paid_at: data.paid_at,
        paystack_channel: data.channel,
        paystack_authorization_code: data.authorization?.authorization_code,
        paystack_card_type: data.authorization?.card_type,
        paystack_last4: data.authorization?.last4,
        paystack_bank: data.authorization?.bank,
        verified_at: new Date().toISOString(),
        verification_data: data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    // Update related request/booking
    await updateRelatedEntity(supabase, payment, "completed");

    // Mark as fulfilled
    await supabase
      .from("payments")
      .update({ fulfilled: true })
      .eq("id", payment.id);

    console.log("Paystack payment fulfilled:", payment.reference);
  } catch (error) {
    console.error("Error handling Paystack success:", error);
  }
}

/**
 * Handle failed Paystack payment
 */
async function handlePaystackFailed(supabase, payment, data) {
  try {
    await supabase
      .from("payments")
      .update({
        status: "failed",
        failed_at: new Date().toISOString(),
        failure_reason: data.gateway_response,
        payment_data: data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    await updateRelatedEntity(supabase, payment, "failed");

    console.log("Paystack payment failed:", payment.reference);
  } catch (error) {
    console.error("Error handling Paystack failure:", error);
  }
}

/**
 * Handle finished crypto payment
 */
async function handleCryptoFinished(
  supabase,
  payment,
  parsedEvent,
  updateData,
) {
  try {
    // Prevent double fulfillment
    if (payment.status === "finished" && payment.fulfilled) {
      console.log("Crypto payment already fulfilled:", payment.crypto_order_id);
      return;
    }

    await supabase
      .from("payments")
      .update({
        ...updateData,
        status: "completed", // Map 'finished' to 'completed'
        paid_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    await updateRelatedEntity(supabase, payment, "completed");

    await supabase
      .from("payments")
      .update({ fulfilled: true })
      .eq("id", payment.id);

    console.log("Crypto payment fulfilled:", payment.crypto_order_id);
  } catch (error) {
    console.error("Error handling crypto finished:", error);
  }
}

/**
 * Handle failed crypto payment
 */
async function handleCryptoFailed(supabase, payment, parsedEvent, updateData) {
  try {
    await supabase
      .from("payments")
      .update({
        ...updateData,
        status: "failed",
        failed_at: new Date().toISOString(),
        failure_reason: `Payment ${parsedEvent.status}`,
      })
      .eq("id", payment.id);

    await updateRelatedEntity(supabase, payment, "failed");

    console.log("Crypto payment failed:", payment.crypto_order_id);
  } catch (error) {
    console.error("Error handling crypto failure:", error);
  }
}

/**
 * Update related entity based on payment
 * FIXED: Hotel bookings now use correct schema constraints
 */
async function updateRelatedEntity(supabase, payment, status) {
  try {
    // Logistics & Security Requests
    if (
      payment.request_type === "logistics" ||
      payment.request_type === "security"
    ) {
      const tableName = `${payment.request_type}_requests`;
      await supabase
        .from(tableName)
        .update({
          payment_status: status,
          status: status === "completed" ? "confirmed" : payment.request_type,
          confirmed_at:
            status === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", payment.request_id);
    }

    // Hotel Bookings - FIXED for schema constraints
    else if (payment.hotel_booking_id) {
      const updates = {
        payment_status: status, // 'completed' or 'failed'
      };

      // Only update booking_status if payment failed
      // Success: booking_status stays 'confirmed' (set on creation)
      // Failed: booking_status becomes 'cancelled'
      if (status === "failed") {
        updates.booking_status = "cancelled";

        // Release the room back to available
        const { data: booking } = await supabase
          .from("hotel_bookings")
          .select("room_id")
          .eq("id", payment.hotel_booking_id)
          .single();

        if (booking?.room_id) {
          await supabase
            .from("hotel_rooms")
            .update({ status: "available" })
            .eq("id", booking.room_id);
        }
      }
      // On success, room stays 'reserved', booking_status stays 'confirmed'

      await supabase
        .from("hotel_bookings")
        .update(updates)
        .eq("id", payment.hotel_booking_id);
    }

    // Apartment Bookings
    else if (payment.apartment_booking_id) {
      await supabase
        .from("apartment_bookings")
        .update({
          payment_status: status,
          status: status === "completed" ? "confirmed" : "pending",
        })
        .eq("id", payment.apartment_booking_id);
    }

    // Event Bookings
    else if (payment.event_booking_id) {
      await supabase
        .from("event_bookings")
        .update({
          payment_status: status,
          status: status === "completed" ? "confirmed" : "pending",
        })
        .eq("id", payment.event_booking_id);
    }
  } catch (error) {
    console.error("Error updating related entity:", error);
  }
}
