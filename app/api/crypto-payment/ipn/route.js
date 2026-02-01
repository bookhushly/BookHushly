import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  nowpaymentsIPN,
  NOWPAYMENTS_PAYMENT_STATUS,
  COMPLETED_STATUSES,
  FAILED_STATUSES,
} from "@/lib/nowpayments";

/**
 * NOWPayments IPN (Instant Payment Notification) Handler
 * POST /api/crypto-payment/ipn
 *
 * CRITICAL: This is the source of truth for crypto payment verification
 * All value delivery must be triggered from this webhook
 */
export async function POST(request) {
  try {
    // Get raw body and signature
    const body = await request.text();
    const signature = request.headers.get("x-nowpayments-sig");

    // Parse body
    const payload = JSON.parse(body);

    // Verify signature (CRITICAL SECURITY CHECK)
    const isValidSignature = nowpaymentsIPN.verifySignature(signature, payload);

    if (!isValidSignature) {
      console.error("Invalid IPN signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse event
    const parsedEvent = nowpaymentsIPN.parseEvent(payload);

    console.log("IPN received:", {
      paymentId: parsedEvent.paymentId,
      orderId: parsedEvent.orderId,
      status: parsedEvent.status,
      amount: parsedEvent.actuallyPaid,
      currency: parsedEvent.payCurrency,
    });

    const supabase = await createClient();

    // Find payment record by order_id or payment_id
    let { data: payment, error: findError } = await supabase
      .from("crypto_payments")
      .select("*")
      .eq("order_id", parsedEvent.orderId)
      .single();

    // If not found by order_id, try payment_id
    if (findError && parsedEvent.paymentId) {
      const { data: paymentById } = await supabase
        .from("crypto_payments")
        .select("*")
        .eq("payment_id", parsedEvent.paymentId)
        .single();

      payment = paymentById;
    }

    if (!payment) {
      console.error("Payment not found for IPN:", {
        orderId: parsedEvent.orderId,
        paymentId: parsedEvent.paymentId,
      });
      // Still return 200 to prevent retries
      return NextResponse.json({ status: "accepted" }, { status: 200 });
    }

    // Update payment record
    const updateData = {
      payment_id: parsedEvent.paymentId,
      status: parsedEvent.status,
      pay_amount: parsedEvent.payAmount,
      actually_paid: parsedEvent.actuallyPaid,
      actually_paid_at_fiat: parsedEvent.actuallyPaidAtFiat,
      pay_address: parsedEvent.payAddress,
      outcome_amount: parsedEvent.outcomeAmount,
      outcome_currency: parsedEvent.outcomeCurrency,
      fee: parsedEvent.fee,
      updated_at: new Date().toISOString(),
    };

    // Handle different statuses
    if (parsedEvent.status === NOWPAYMENTS_PAYMENT_STATUS.FINISHED) {
      await handleFinishedPayment(supabase, payment, parsedEvent, updateData);
    } else if (
      parsedEvent.status === NOWPAYMENTS_PAYMENT_STATUS.PARTIALLY_PAID
    ) {
      await handlePartiallyPaid(supabase, payment, parsedEvent, updateData);
    } else if (FAILED_STATUSES.includes(parsedEvent.status)) {
      await handleFailedPayment(supabase, payment, parsedEvent, updateData);
    } else {
      // In-progress statuses (waiting, confirming, sending, etc.)
      await supabase
        .from("crypto_payments")
        .update(updateData)
        .eq("id", payment.id);
    }

    // MUST return 200 OK to acknowledge IPN
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("IPN processing error:", error);
    // Still return 200 to prevent retries for parsing errors
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}

/**
 * Handle finished payment
 */
async function handleFinishedPayment(
  supabase,
  payment,
  parsedEvent,
  updateData,
) {
  try {
    // Prevent double fulfillment
    if (
      payment.status === NOWPAYMENTS_PAYMENT_STATUS.FINISHED &&
      payment.fulfilled
    ) {
      console.log("Payment already fulfilled:", payment.order_id);
      return;
    }

    // Update payment record
    await supabase
      .from("crypto_payments")
      .update({
        ...updateData,
        finished_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    // Update request status
    const tableName =
      payment.request_type === "logistics"
        ? "logistics_requests"
        : "security_requests";

    await supabase
      .from(tableName)
      .update({
        crypto_payment_status: NOWPAYMENTS_PAYMENT_STATUS.FINISHED,
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", payment.request_id);

    // Mark payment as fulfilled
    await supabase
      .from("crypto_payments")
      .update({ fulfilled: true })
      .eq("id", payment.id);

    // TODO: Send confirmation email/SMS
    // TODO: Trigger vendor notification
    // TODO: Create booking/assignment record

    console.log("Crypto payment fulfilled successfully:", payment.order_id);
  } catch (error) {
    console.error("Error handling finished payment:", error);
  }
}

/**
 * Handle partially paid
 */
async function handlePartiallyPaid(supabase, payment, parsedEvent, updateData) {
  try {
    await supabase
      .from("crypto_payments")
      .update({
        ...updateData,
        partial_payment_note: `Customer paid ${parsedEvent.actuallyPaid} ${parsedEvent.payCurrency}, expected ${parsedEvent.payAmount}`,
      })
      .eq("id", payment.id);

    // TODO: Notify customer of partial payment
    // TODO: Provide option to pay remainder or request refund

    console.log("Partial payment received:", payment.order_id);
  } catch (error) {
    console.error("Error handling partially paid:", error);
  }
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(supabase, payment, parsedEvent, updateData) {
  try {
    await supabase
      .from("crypto_payments")
      .update({
        ...updateData,
        failed_at: new Date().toISOString(),
        failure_reason: `Payment ${parsedEvent.status}`,
      })
      .eq("id", payment.id);

    // Update request status
    const tableName =
      payment.request_type === "logistics"
        ? "logistics_requests"
        : "security_requests";

    await supabase
      .from(tableName)
      .update({
        crypto_payment_status: parsedEvent.status,
      })
      .eq("id", payment.request_id);

    // TODO: Send failure notification

    console.log("Crypto payment failed:", payment.order_id, parsedEvent.status);
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}
