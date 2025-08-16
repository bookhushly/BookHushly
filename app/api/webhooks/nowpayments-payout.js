// pages/api/webhooks/nowpayments-payout.js
// NOWPayments payout webhook handler for admin crypto transfers

import { cryptoPayoutManager } from "@/lib/crypto-payout-manager";
import { notificationManager } from "@/lib/notification-manager";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("NOWPayments payout webhook received:", req.body);

    const payoutData = req.body;
    const payoutId = payoutData.id;
    const status = payoutData.status;

    if (!payoutId) {
      return res.status(400).json({ error: "Invalid payout data" });
    }

    // Update payout status
    await cryptoPayoutManager.updatePayoutStatus(payoutId, status, payoutData);

    // Send notifications based on status
    if (status === "completed" || status === "finished") {
      await notificationManager.sendSlackNotification(
        "admin_payout_completed",
        {
          payout_id: payoutId,
          amount: payoutData.amount,
          currency: payoutData.currency,
          address: payoutData.address,
          hash: payoutData.hash,
        }
      );
    } else if (status === "failed") {
      await notificationManager.notifyAdminSplitFailure(
        payoutId,
        "Crypto payout failed"
      );
    }

    res.status(200).json({ message: "Payout webhook processed successfully" });
  } catch (error) {
    console.error("NOWPayments payout webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
