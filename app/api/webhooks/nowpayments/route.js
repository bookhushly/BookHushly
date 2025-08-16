// app/api/webhooks/nowpayments/route.js
import { NextResponse } from "next/server";
import { handleNOWPaymentsWebhook } from "@/lib/payments";
import { updatePaymentStatus } from "@/lib/database";

export async function POST(request) {
  try {
    // Get the signature from headers
    const signature = request.headers.get("x-nowpayments-sig");

    // Parse the webhook payload
    const payload = await request.json();

    console.log("NOWPayments webhook received:", payload);

    // Handle the webhook
    const result = await handleNOWPaymentsWebhook(payload, signature);

    if (!result.success) {
      console.error("Webhook handling failed:", result.error);
      return NextResponse.json(
        { error: "Webhook handling failed" },
        { status: 400 }
      );
    }

    // Process the payment status update
    if (payload.payment_status === "finished") {
      // Payment successful
      const bookingId = payload.order_id.split("_")[1]; // Extract booking ID from reference

      await updatePaymentStatus(bookingId, "completed", payload.order_id);

      // Send notifications
      await sendPaymentNotifications(payload);

      console.log("Payment completed successfully:", payload.order_id);
    } else if (payload.payment_status === "failed") {
      // Payment failed
      const bookingId = payload.order_id.split("_")[1];

      await updatePaymentStatus(bookingId, "failed", payload.order_id);

      console.log("Payment failed:", payload.order_id);
    } else if (payload.payment_status === "partially_paid") {
      // Partially paid - might want to handle this case
      console.log("Payment partially paid:", payload.order_id);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("NOWPayments webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendPaymentNotifications(payload) {
  try {
    // You can implement notification logic here

    console.log("Sending payment notifications for:", payload.order_id);

    await fetch("/api/send-payment-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // notification data
      }),
    });
  } catch (error) {
    console.error("Notification sending failed:", error);
  }
}
