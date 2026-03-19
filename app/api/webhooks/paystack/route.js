// app/api/webhooks/paystack/route.js
// Paystack webhook handler

import crypto from "crypto";
import { NextResponse } from "next/server";
import { walletService } from "@/lib/wallet-service";
import { notifyWalletDeposit } from "@/lib/notifications";

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // Verify signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log("Paystack webhook event:", event.event);

    if (event.event === "charge.success") {
      const { reference, amount, customer } = event.data;

      // Check if this is a wallet deposit (starts with WD-)
      if (reference.startsWith("WD-")) {
        console.log("Processing wallet deposit:", reference);
        const result = await walletService.verifyDeposit(reference);

        if (result.error) {
          console.error("Deposit verification error:", result.error);
        } else {
          console.log("Deposit verified successfully:", result.data);
          // Notify the user their wallet was topped up
          const userId = result.data?.user_id;
          if (userId) {
            await notifyWalletDeposit(userId, {
              amount:    amount / 100, // Paystack amounts are in kobo
              reference,
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
