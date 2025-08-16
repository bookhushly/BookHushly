// pages/api/payments/status/[reference].js
// API to get payment and split status

import { getPaymentSplitStatus } from "@/lib/payments";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ error: "Payment reference is required" });
    }

    const result = await getPaymentSplitStatus(reference);

    if (result.success) {
      res.status(200).json({
        data: result.data,
      });
    } else {
      res.status(404).json({
        error: result.error,
        message: "Payment not found",
      });
    }
  } catch (error) {
    console.error("Payment status API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
