// pages/api/admin/payments/retry-split.js
// Admin API for retrying failed payment splits

import { retryFailedPaymentSplit } from "@/lib/payments";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check admin authentication (implement your auth logic)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    const result = await retryFailedPaymentSplit(paymentId);

    if (result.success) {
      res.status(200).json({
        message: "Payment split retry initiated successfully",
        data: result.data,
      });
    } else {
      res.status(400).json({
        error: result.error,
        message: "Failed to retry payment split",
      });
    }
  } catch (error) {
    console.error("Retry split API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
