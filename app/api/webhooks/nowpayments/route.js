// app/api/webhooks/nowpayments/route.js
import { NextResponse } from "next/server";
import { nowpaymentsIPN } from "@/lib/nowpayments/services/nowpayments-ipn";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  notifyPaymentSuccessful,
  notifyPaymentFailed,
  notifyAdminPaymentIssue,
} from "@/lib/notifications";

/**
 * POST /api/webhooks/nowpayments
 * Handles NOWPayments IPN (Instant Payment Notification) callbacks.
 * Verifies HMAC-SHA512 signature before processing any state changes.
 */
export async function POST(request) {
  let payload;

  try {
    const body = await request.text();
    const signature = request.headers.get("x-nowpayments-sig");

    // Parse body first so we can verify signature against it
    try {
      payload = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Verify IPN signature — reject unsigned/tampered requests immediately
    let signatureValid = false;
    try {
      signatureValid = nowpaymentsIPN.verifySignature(signature, payload);
    } catch (sigErr) {
      console.error("[nowpayments] Signature verification error:", sigErr.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (!signatureValid) {
      console.error("[nowpayments] Invalid IPN signature — rejecting webhook");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const orderId = payload.order_id;
    const paymentStatus = payload.payment_status;

    console.log("[nowpayments] Verified webhook:", { orderId, paymentStatus });

    // Validate order_id format before splitting (prevents undefined access)
    const orderParts = typeof orderId === "string" ? orderId.split("_") : [];
    const bookingId = orderParts.length >= 2 ? orderParts[orderParts.length - 1] : null;

    if (!bookingId) {
      console.error("[nowpayments] Cannot parse bookingId from order_id:", orderId);
      // Still return 200 so NOWPayments doesn't retry — we log for manual review
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();

    if (paymentStatus === "finished") {
      // Atomic update: only fulfil if not already fulfilled to prevent double-processing
      const { data: payment, error: fetchErr } = await supabase
        .from("payments")
        .select("id, user_id, amount, fulfilled, metadata")
        .eq("reference", orderId)
        .maybeSingle();

      if (fetchErr) {
        console.error("[nowpayments] Failed to fetch payment:", fetchErr.message);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
      }

      if (!payment) {
        console.warn("[nowpayments] No payment record found for order_id:", orderId);
        return NextResponse.json({ received: true });
      }

      if (payment.fulfilled) {
        console.log("[nowpayments] Payment already fulfilled:", orderId);
        return NextResponse.json({ received: true });
      }

      // Mark fulfilled atomically — WHERE fulfilled = false prevents race conditions
      const { error: updateErr } = await supabase
        .from("payments")
        .update({ status: "successful", fulfilled: true })
        .eq("reference", orderId)
        .eq("fulfilled", false);

      if (updateErr) {
        console.error("[nowpayments] Failed to mark payment fulfilled:", updateErr.message);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
      }

      console.log("[nowpayments] Payment completed:", orderId);

      // Notify customer (non-blocking)
      if (payment.user_id) {
        notifyPaymentSuccessful(payment.user_id, {
          reference: orderId,
          amount: payment.amount,
          serviceName: payment.metadata?.request_type || "your service",
        }).catch((err) =>
          console.error("[nowpayments] Notify error:", err.message),
        );
      }
    } else if (paymentStatus === "failed" || paymentStatus === "expired") {
      const { error: updateErr } = await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("reference", orderId)
        .neq("status", "successful"); // Don't overwrite a successful payment

      if (updateErr) {
        console.error("[nowpayments] Failed to mark payment failed:", updateErr.message);
      }

      // Alert admins for failed payments
      const { data: admins } = await supabase
        .from("users")
        .select("id")
        .eq("role", "admin");

      if (admins?.length) {
        const adminIds = admins.map((a) => a.id);
        notifyAdminPaymentIssue(adminIds, {
          reference: orderId,
          amount: payload.price_amount,
          error: `Crypto payment ${paymentStatus}`,
        }).catch((err) =>
          console.error("[nowpayments] Admin notify error:", err.message),
        );
      }

      console.log("[nowpayments] Payment", paymentStatus, ":", orderId);
    } else if (paymentStatus === "partially_paid") {
      console.warn("[nowpayments] Partial payment received for:", orderId, {
        expected: payload.pay_amount,
        received: payload.actually_paid,
        currency: payload.pay_currency,
      });
      // Do not fulfil — log for manual review
    } else {
      // Transitional statuses (waiting, confirming, sending) — no action needed
      console.log("[nowpayments] Transitional status:", paymentStatus, "for:", orderId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[nowpayments] Webhook error:", error.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
