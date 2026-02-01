import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paymentVerification, PAYMENT_STATUS } from "@/lib/paystack";
import { nowpaymentsVerification } from "@/lib/nowpayments";

/**
 * Verify Payment
 * POST /api/payment/verify
 *
 * Used for manual verification (callback verification, status checks)
 * Webhook is the primary source of truth, this is supplementary
 * Supports both Paystack and NOWPayments
 */
export async function POST(request) {
  try {
    const { reference, provider = "paystack" } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Route to appropriate verification based on provider
    if (provider === "paystack" || payment.provider === "paystack") {
      return await verifyPaystackPayment(supabase, payment);
    } else if (
      provider === "crypto" ||
      provider === "nowpayments" ||
      payment.provider === "nowpayments"
    ) {
      return await verifyCryptoPayment(supabase, payment);
    } else {
      return NextResponse.json(
        { error: "Unsupported payment provider" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        verified: false,
        error: "Verification failed",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * Verify Paystack payment
 */
async function verifyPaystackPayment(supabase, payment) {
  // If already verified and fulfilled, return cached result
  if (payment.status === PAYMENT_STATUS.SUCCESS && payment.fulfilled) {
    return NextResponse.json({
      verified: true,
      status: PAYMENT_STATUS.SUCCESS,
      payment: {
        reference: payment.reference,
        amount: payment.amount,
        status: payment.status,
        paid_at: payment.paid_at,
        channel: payment.paystack_channel,
        request_type: payment.request_type,
        request_id: payment.request_id,
        hotel_booking_id: payment.hotel_booking_id,
        apartment_booking_id: payment.apartment_booking_id,
        event_booking_id: payment.event_booking_id,
      },
      message: "Payment already verified and fulfilled",
    });
  }

  // Verify with Paystack API
  const verificationResult = await paymentVerification.comprehensiveVerify(
    payment.reference,
    Math.round(payment.amount * 100), // Convert to kobo
  );

  if (!verificationResult.verified) {
    return NextResponse.json({
      verified: false,
      status: payment.status,
      message: verificationResult.message,
      error: verificationResult.error,
    });
  }

  // Update payment record (if not already updated by webhook)
  const { data: updatedPayment } = await supabase
    .from("payments")
    .update({
      status: PAYMENT_STATUS.SUCCESS,
      paystack_transaction_id: verificationResult.transaction.id,
      paid_at: verificationResult.transaction.paid_at,
      paystack_channel: verificationResult.transaction.channel,
      paystack_authorization_code:
        verificationResult.transaction.authorization?.authorization_code,
      paystack_card_type:
        verificationResult.transaction.authorization?.card_type,
      paystack_last4: verificationResult.transaction.authorization?.last4,
      paystack_bank: verificationResult.transaction.authorization?.bank,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("reference", payment.reference)
    .eq("status", PAYMENT_STATUS.PENDING) // Only update if still pending
    .select()
    .single();

  // If webhook already processed, don't duplicate fulfillment
  if (!updatedPayment) {
    console.log("Payment already processed by webhook:", payment.reference);
    return NextResponse.json({
      verified: true,
      status: PAYMENT_STATUS.SUCCESS,
      payment: {
        reference: payment.reference,
        amount: payment.amount,
        status: payment.status,
        paid_at: payment.paid_at,
        channel: payment.paystack_channel,
        request_type: payment.request_type,
        request_id: payment.request_id,
        hotel_booking_id: payment.hotel_booking_id,
        apartment_booking_id: payment.apartment_booking_id,
        event_booking_id: payment.event_booking_id,
      },
      message: "Payment verified (processed by webhook)",
    });
  }

  return NextResponse.json({
    verified: true,
    status: PAYMENT_STATUS.SUCCESS,
    payment: {
      reference: updatedPayment.reference,
      amount: updatedPayment.amount,
      status: updatedPayment.status,
      paid_at: updatedPayment.paid_at,
      channel: updatedPayment.paystack_channel,
      transaction_id: updatedPayment.paystack_transaction_id,
      request_type: updatedPayment.request_type,
      request_id: updatedPayment.request_id,
      hotel_booking_id: updatedPayment.hotel_booking_id,
      apartment_booking_id: updatedPayment.apartment_booking_id,
      event_booking_id: updatedPayment.event_booking_id,
    },
    message: "Payment verified successfully",
  });
}

/**
 * Verify NOWPayments crypto payment
 */
async function verifyCryptoPayment(supabase, payment) {
  // If already completed and fulfilled, return cached result
  if (payment.status === "completed" && payment.fulfilled) {
    return NextResponse.json({
      verified: true,
      status: "completed",
      payment: {
        reference: payment.reference,
        crypto_order_id: payment.crypto_order_id,
        amount: payment.amount,
        status: payment.status,
        paid_at: payment.paid_at,
        crypto_pay_currency: payment.crypto_pay_currency,
        request_type: payment.request_type,
        request_id: payment.request_id,
        hotel_booking_id: payment.hotel_booking_id,
        apartment_booking_id: payment.apartment_booking_id,
        event_booking_id: payment.event_booking_id,
      },
      message: "Crypto payment already verified and fulfilled",
    });
  }

  // Verify with NOWPayments API using payment_id
  if (!payment.crypto_payment_id) {
    // Payment not yet created on NOWPayments side
    return NextResponse.json({
      verified: false,
      status: payment.status || "pending",
      payment: {
        reference: payment.reference,
        crypto_order_id: payment.crypto_order_id,
        status: payment.status || "waiting",
      },
      message: "Crypto payment awaiting confirmation",
    });
  }

  try {
    const verificationResult =
      await nowpaymentsVerification.comprehensiveVerify(
        payment.crypto_payment_id,
        payment.amount,
        payment.currency.toLowerCase(),
      );

    if (!verificationResult.verified) {
      return NextResponse.json({
        verified: false,
        status: verificationResult.status || payment.status,
        payment: {
          reference: payment.reference,
          crypto_order_id: payment.crypto_order_id,
          status: verificationResult.status || payment.status,
        },
        message: verificationResult.message,
      });
    }

    // Check if payment is in pending state (waiting, confirming, sending)
    const pendingStatuses = ["waiting", "confirming", "sending"];
    if (pendingStatuses.includes(verificationResult.status)) {
      return NextResponse.json({
        verified: false,
        status: verificationResult.status,
        payment: {
          reference: payment.reference,
          crypto_order_id: payment.crypto_order_id,
          crypto_payment_id: payment.crypto_payment_id,
          amount: payment.amount,
          status: verificationResult.status,
          crypto_pay_currency: payment.crypto_pay_currency,
          request_type: payment.request_type,
          request_id: payment.request_id,
        },
        message: "Crypto payment is being confirmed on blockchain",
      });
    }

    // Update payment record (if not already updated by webhook)
    const updateData = {
      status: "completed",
      paid_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: updatedPayment } = await supabase
      .from("payments")
      .update(updateData)
      .eq("reference", payment.reference)
      .in("status", ["pending", "waiting", "confirming", "sending"]) // Only update if not completed
      .select()
      .single();

    if (!updatedPayment) {
      console.log(
        "Crypto payment already processed by webhook:",
        payment.crypto_order_id,
      );
      return NextResponse.json({
        verified: true,
        status: "completed",
        payment: {
          reference: payment.reference,
          crypto_order_id: payment.crypto_order_id,
          amount: payment.amount,
          status: payment.status,
          paid_at: payment.paid_at,
          crypto_pay_currency: payment.crypto_pay_currency,
          request_type: payment.request_type,
          request_id: payment.request_id,
          hotel_booking_id: payment.hotel_booking_id,
          apartment_booking_id: payment.apartment_booking_id,
          event_booking_id: payment.event_booking_id,
        },
        message: "Crypto payment verified (processed by webhook)",
      });
    }

    return NextResponse.json({
      verified: true,
      status: "completed",
      payment: {
        reference: updatedPayment.reference,
        crypto_order_id: updatedPayment.crypto_order_id,
        crypto_payment_id: updatedPayment.crypto_payment_id,
        amount: updatedPayment.amount,
        status: updatedPayment.status,
        paid_at: updatedPayment.paid_at,
        crypto_pay_currency: updatedPayment.crypto_pay_currency,
        request_type: updatedPayment.request_type,
        request_id: updatedPayment.request_id,
        hotel_booking_id: updatedPayment.hotel_booking_id,
        apartment_booking_id: updatedPayment.apartment_booking_id,
        event_booking_id: updatedPayment.event_booking_id,
      },
      message: "Crypto payment verified successfully",
    });
  } catch (error) {
    console.error("NOWPayments verification error:", error);

    // Return current status if verification fails
    return NextResponse.json({
      verified: false,
      status: payment.status || "pending",
      payment: {
        reference: payment.reference,
        crypto_order_id: payment.crypto_order_id,
        status: payment.status || "pending",
      },
      error: "Verification service temporarily unavailable",
      message: "Please check back in a few moments",
    });
  }
}
