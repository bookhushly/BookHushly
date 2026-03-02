import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paymentVerification, PAYMENT_STATUS } from "@/lib/paystack";
import { nowpaymentsVerification } from "@/lib/nowpayments";

/**
 * Verify Payment
 * POST /api/payment/verify
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

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

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
      { verified: false, error: "Verification failed", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * Update related booking/request after payment status change
 */
async function updateRelatedEntity(supabase, payment, status) {
  try {
    if (
      payment.request_type === "logistics" ||
      payment.request_type === "security"
    ) {
      await supabase
        .from(`${payment.request_type}_requests`)
        .update({
          payment_status: status,
          status: status === "completed" ? "confirmed" : payment.request_type,
          confirmed_at:
            status === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", payment.request_id);
    } else if (payment.hotel_booking_id) {
      const updates = { payment_status: status };
      if (status === "failed") {
        updates.booking_status = "cancelled";
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
      await supabase
        .from("hotel_bookings")
        .update(updates)
        .eq("id", payment.hotel_booking_id);
    } else if (payment.apartment_booking_id) {
      await supabase
        .from("apartment_bookings")
        .update({
          payment_status: status,
          status: status === "completed" ? "confirmed" : "pending",
        })
        .eq("id", payment.apartment_booking_id);
    } else if (payment.event_booking_id) {
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

/**
 * Verify Paystack payment
 */
async function verifyPaystackPayment(supabase, payment) {
  // Already verified and fulfilled — return cached
  if (payment.status === PAYMENT_STATUS.SUCCESS && payment.fulfilled) {
    return NextResponse.json({
      verified: true,
      status: PAYMENT_STATUS.SUCCESS,
      payment: buildPaymentResponse(payment),
      message: "Payment already verified and fulfilled",
    });
  }

  const verificationResult = await paymentVerification.comprehensiveVerify(
    payment.reference,
    Math.round(payment.amount * 100),
  );

  if (!verificationResult.verified) {
    return NextResponse.json({
      verified: false,
      status: payment.status,
      message: verificationResult.message,
      error: verificationResult.error,
    });
  }

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
    .eq("status", PAYMENT_STATUS.PENDING)
    .select()
    .single();

  // Webhook already processed — still update related entity in case it was missed
  if (!updatedPayment) {
    console.log("Payment already processed by webhook:", payment.reference);

    // Ensure related entity is updated even if webhook handled payments table
    if (!payment.fulfilled) {
      await updateRelatedEntity(supabase, payment, "completed");
      await supabase
        .from("payments")
        .update({ fulfilled: true })
        .eq("id", payment.id);
    }

    return NextResponse.json({
      verified: true,
      status: PAYMENT_STATUS.SUCCESS,
      payment: buildPaymentResponse(payment),
      message: "Payment verified (processed by webhook)",
    });
  }

  // Update related booking/request
  await updateRelatedEntity(supabase, updatedPayment, "completed");

  // Mark fulfilled
  await supabase
    .from("payments")
    .update({ fulfilled: true })
    .eq("id", updatedPayment.id);

  return NextResponse.json({
    verified: true,
    status: PAYMENT_STATUS.SUCCESS,
    payment: buildPaymentResponse(updatedPayment),
    message: "Payment verified successfully",
  });
}

/**
 * Verify NOWPayments crypto payment
 */
async function verifyCryptoPayment(supabase, payment) {
  // Already completed and fulfilled — return cached
  if (payment.status === "completed" && payment.fulfilled) {
    return NextResponse.json({
      verified: true,
      status: "completed",
      payment: buildPaymentResponse(payment),
      message: "Crypto payment already verified and fulfilled",
    });
  }

  if (!payment.crypto_payment_id) {
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

    const { data: updatedPayment } = await supabase
      .from("payments")
      .update({
        status: "completed",
        paid_at: new Date().toISOString(),
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("reference", payment.reference)
      .in("status", ["pending", "waiting", "confirming", "sending"])
      .select()
      .single();

    if (!updatedPayment) {
      console.log(
        "Crypto payment already processed by webhook:",
        payment.crypto_order_id,
      );

      // Ensure related entity is updated even if webhook handled payments table
      if (!payment.fulfilled) {
        await updateRelatedEntity(supabase, payment, "completed");
        await supabase
          .from("payments")
          .update({ fulfilled: true })
          .eq("id", payment.id);
      }

      return NextResponse.json({
        verified: true,
        status: "completed",
        payment: buildPaymentResponse(payment),
        message: "Crypto payment verified (processed by webhook)",
      });
    }

    // Update related booking/request
    await updateRelatedEntity(supabase, updatedPayment, "completed");

    // Mark fulfilled
    await supabase
      .from("payments")
      .update({ fulfilled: true })
      .eq("id", updatedPayment.id);

    return NextResponse.json({
      verified: true,
      status: "completed",
      payment: buildPaymentResponse(updatedPayment),
      message: "Crypto payment verified successfully",
    });
  } catch (error) {
    console.error("NOWPayments verification error:", error);
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

/**
 * Build consistent payment response object
 */
function buildPaymentResponse(payment) {
  return {
    reference: payment.reference,
    amount: payment.amount,
    status: payment.status,
    paid_at: payment.paid_at,
    channel: payment.paystack_channel,
    transaction_id: payment.paystack_transaction_id,
    crypto_order_id: payment.crypto_order_id,
    crypto_payment_id: payment.crypto_payment_id,
    crypto_pay_currency: payment.crypto_pay_currency,
    request_type: payment.request_type,
    request_id: payment.request_id,
    hotel_booking_id: payment.hotel_booking_id,
    apartment_booking_id: payment.apartment_booking_id,
    event_booking_id: payment.event_booking_id,
  };
}
