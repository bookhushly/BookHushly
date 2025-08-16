// pages/api/admin/payments/split.js
// Admin API for manually triggering payment splits

import {
  manuallyTriggerPaymentSplit,
  getPaymentSplitStatistics,
} from "@/lib/payments";
import { useAuthStore } from "@/lib/store";

export default async function handler(req, res) {
  try {
    // Check admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Add your admin authentication logic here
    // const token = authHeader.substring(7);
    // const isValidAdmin = await verifyAdminToken(token);
    // if (!isValidAdmin) {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }

    if (req.method === "POST") {
      // Manually trigger payment split
      const { paymentId } = req.body;

      if (!paymentId) {
        return res.status(400).json({ error: "Payment ID is required" });
      }

      const result = await manuallyTriggerPaymentSplit(paymentId);

      if (result.success) {
        res.status(200).json({
          message: "Payment split triggered successfully",
          data: result.data,
        });
      } else {
        res.status(400).json({
          error: result.error,
          message: "Failed to trigger payment split",
        });
      }
    } else if (req.method === "GET") {
      // Get payment split statistics
      const { from, to } = req.query;

      const dateRange = {};
      if (from) dateRange.from = from;
      if (to) dateRange.to = to;

      const result = await getPaymentSplitStatistics(dateRange);

      if (result.success) {
        res.status(200).json({
          data: result.data,
        });
      } else {
        res.status(500).json({
          error: result.error,
          message: "Failed to get split statistics",
        });
      }
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Admin split API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
