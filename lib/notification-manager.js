// lib/notification-manager.js
// Handles notifications for payment splits, transfers, and payouts

import { supabase } from "./supabase";

class NotificationManager {
  constructor() {
    this.emailService = process.env.EMAIL_SERVICE || "resend"; // sendgrid, resend, etc.
  }

  // Notify vendor of successful payment
  async notifyVendorPayment(splitRecord, transferResult) {
    try {
      // Get vendor details
      const { data: vendor } = await supabase
        .from("vendors")
        .select(
          `
          *,
          users(email, user_metadata)
        `
        )
        .eq("id", splitRecord.recipient_id)
        .single();

      if (!vendor) {
        throw new Error("Vendor not found");
      }

      const notificationData = {
        vendor_name: vendor.business_name || vendor.users?.user_metadata?.name,
        amount: splitRecord.amount,
        currency: splitRecord.currency,
        transfer_reference: transferResult.reference,
        transfer_date: new Date().toLocaleDateString(),
        transfer_time: new Date().toLocaleTimeString(),
      };

      // Send email notification
      if (vendor.users?.email) {
        await this.sendVendorPaymentEmail(vendor.users.email, notificationData);
      }

      // Log notification
      await this.logNotification({
        recipient_type: "vendor",
        recipient_id: splitRecord.recipient_id,
        notification_type: "payment_received",
        channels: ["email"],
        data: notificationData,
      });

      return { success: true };
    } catch (error) {
      console.error("Vendor payment notification error:", error);
      return { success: false, error: error.message };
    }
  }

  // Notify admin of payment received
  async notifyAdminPayment(splitRecord, transferResult) {
    try {
      const notificationData = {
        amount: splitRecord.amount,
        currency: splitRecord.currency,
        transfer_reference: transferResult.reference,
        transfer_date: new Date().toLocaleDateString(),
        transfer_time: new Date().toLocaleTimeString(),
        provider: transferResult.provider,
      };

      // Send email to admin
      await this.sendAdminPaymentEmail(notificationData);

      // Send Slack notification if configured
      if (this.slackWebhook) {
        await this.sendSlackNotification(
          "admin_payment_received",
          notificationData
        );
      }

      // Log notification
      await this.logNotification({
        recipient_type: "admin",
        recipient_id: null,
        notification_type: "payment_received",
        channels: ["email", "slack"],
        data: notificationData,
      });

      return { success: true };
    } catch (error) {
      console.error("Admin payment notification error:", error);
      return { success: false, error: error.message };
    }
  }

  // Notify admin of split failure
  async notifyAdminSplitFailure(paymentId, errorMessage) {
    try {
      const notificationData = {
        payment_id: paymentId,
        error_message: errorMessage,
        failure_time: new Date().toLocaleString(),
        requires_attention: true,
      };

      // Send urgent email to admin
      await this.sendAdminSplitFailureEmail(notificationData);

      // Send Slack alert if configured
      if (this.slackWebhook) {
        await this.sendSlackNotification(
          "split_failure_alert",
          notificationData
        );
      }

      // Log notification
      await this.logNotification({
        recipient_type: "admin",
        recipient_id: null,
        notification_type: "split_failure",
        channels: ["email", "slack"],
        data: notificationData,
        priority: "high",
      });

      return { success: true };
    } catch (error) {
      console.error("Admin split failure notification error:", error);
      return { success: false, error: error.message };
    }
  }

  // Notify admin of permanent split failure (max retries reached)
  async notifyAdminSplitPermanentFailure(paymentId, errorMessage) {
    try {
      const notificationData = {
        payment_id: paymentId,
        error_message: errorMessage,
        failure_time: new Date().toLocaleString(),
        requires_immediate_attention: true,
        action_required: "Manual intervention needed",
      };

      // Send critical alert email
      await this.sendAdminCriticalAlertEmail(notificationData);

      // Send urgent Slack alert
      if (this.slackWebhook) {
        await this.sendSlackNotification(
          "critical_split_failure",
          notificationData
        );
      }

      // Log critical notification
      await this.logNotification({
        recipient_type: "admin",
        recipient_id: null,
        notification_type: "split_permanent_failure",
        channels: ["email", "slack"],
        data: notificationData,
        priority: "critical",
      });

      return { success: true };
    } catch (error) {
      console.error("Admin permanent failure notification error:", error);
      return { success: false, error: error.message };
    }
  }

  // Send vendor payment email
  async sendVendorPaymentEmail(email, data) {
    try {
      const emailTemplate = {
        to: email,
        subject: `Payment Received - ₦${data.amount.toLocaleString()}`,
        template: "vendor_payment_received",
        data: {
          vendor_name: data.vendor_name,
          amount: data.amount.toLocaleString(),
          currency: data.currency,
          transfer_reference: data.transfer_reference,
          transfer_date: data.transfer_date,
          transfer_time: data.transfer_time,
          dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard/payments`,
        },
      };

      await this.sendEmail(emailTemplate);
    } catch (error) {
      console.error("Vendor payment email error:", error);
      throw error;
    }
  }

  // Send admin payment email
  async sendAdminPaymentEmail(data) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@yourdomain.com";

      const emailTemplate = {
        to: adminEmail,
        subject: `Admin Commission Received - ${data.amount} ${data.currency}`,
        template: "admin_payment_received",
        data: {
          amount:
            data.currency === "NGN"
              ? data.amount.toLocaleString()
              : data.amount.toFixed(8),
          currency: data.currency,
          transfer_reference: data.transfer_reference,
          transfer_date: data.transfer_date,
          transfer_time: data.transfer_time,
          provider: data.provider,
          dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard/payments`,
        },
      };

      await this.sendEmail(emailTemplate);
    } catch (error) {
      console.error("Admin payment email error:", error);
      throw error;
    }
  }

  // Send admin split failure email
  async sendAdminSplitFailureEmail(data) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@yourdomain.com";

      const emailTemplate = {
        to: adminEmail,
        subject: `🚨 Payment Split Failure - Payment ID: ${data.payment_id}`,
        template: "admin_split_failure",
        data: {
          payment_id: data.payment_id,
          error_message: data.error_message,
          failure_time: data.failure_time,
          dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard/payments?payment_id=${data.payment_id}`,
        },
      };

      await this.sendEmail(emailTemplate);
    } catch (error) {
      console.error("Admin split failure email error:", error);
      throw error;
    }
  }

  // Send admin critical alert email
  async sendAdminCriticalAlertEmail(data) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@yourdomain.com";

      const emailTemplate = {
        to: adminEmail,
        subject: `🔥 CRITICAL: Payment Split Permanent Failure - Payment ID: ${data.payment_id}`,
        template: "admin_critical_alert",
        data: {
          payment_id: data.payment_id,
          error_message: data.error_message,
          failure_time: data.failure_time,
          action_required: data.action_required,
          dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard/payments?payment_id=${data.payment_id}`,
        },
      };

      await this.sendEmail(emailTemplate);
    } catch (error) {
      console.error("Admin critical alert email error:", error);
      throw error;
    }
  }

  // Generic email sending function
  async sendEmail(emailData) {
    // Validate input
    if (!emailData?.to || !emailData?.templateName || !emailData?.data) {
      throw new Error("Missing required fields: to, templateName, or data");
    }

    // Validate email format for 'to' (basic regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const toArray = Array.isArray(emailData.to) ? emailData.to : [emailData.to];
    if (!toArray.every((email) => emailRegex.test(email))) {
      throw new Error("Invalid email address in 'to' field");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Email sending failed: ${response.status}`
        );
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error("Unexpected response format: success field missing");
      }

      return { success: true };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out");
      }
      console.error("Email sending error:", error.message, { emailData });
      throw error;
    }
  }

  // Log notification for tracking
  async logNotification(notificationData) {
    try {
      await supabase.from("notifications").insert({
        recipient_type: notificationData.recipient_type,
        recipient_id: notificationData.recipient_id,
        notification_type: notificationData.notification_type,
        channels: notificationData.channels,
        data: notificationData.data,
        priority: notificationData.priority || "normal",
        status: "sent",
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Notification logging error:", error);
    }
  }

  // Send daily payment summary to admin
  async sendDailyPaymentSummary() {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      // Get payment splits for today
      const { data: splits } = await supabase
        .from("payment_splits")
        .select(
          `
          *,
          payments(amount, currency, provider)
        `
        )
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString());

      if (!splits || splits.length === 0) return;

      // Calculate summary statistics
      const summary = {
        total_splits: splits.length,
        vendor_transfers: splits.filter((s) => s.recipient_type === "vendor"),
        admin_transfers: splits.filter((s) => s.recipient_type === "admin"),
        successful_transfers: splits.filter(
          (s) => s.transfer_status === "completed"
        ),
        failed_transfers: splits.filter((s) => s.transfer_status === "failed"),
        pending_transfers: splits.filter(
          (s) => s.transfer_status === "pending"
        ),
        total_vendor_amount: splits
          .filter(
            (s) =>
              s.recipient_type === "vendor" && s.transfer_status === "completed"
          )
          .reduce((sum, s) => sum + s.amount, 0),
        total_admin_amount: splits
          .filter(
            (s) =>
              s.recipient_type === "admin" && s.transfer_status === "completed"
          )
          .reduce((sum, s) => sum + s.amount, 0),
      };

      // Send summary email
      const adminEmail = process.env.ADMIN_EMAIL || "admin@yourdomain.com";

      const emailTemplate = {
        to: adminEmail,
        subject: `Daily Payment Summary - ${today.toDateString()}`,
        template: "daily_payment_summary",
        data: {
          date: today.toDateString(),
          summary: summary,
          dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard/payments`,
        },
      };

      await this.sendEmail(emailTemplate);

      // Send Slack summary if configured
      if (this.slackWebhook) {
        const slackMessage =
          `📊 Daily Payment Summary - ${today.toDateString()}\n` +
          `Total Splits: ${summary.total_splits}\n` +
          `Successful: ${summary.successful_transfers.length}\n` +
          `Failed: ${summary.failed_transfers.length}\n` +
          `Vendor Transfers: ₦${summary.total_vendor_amount.toLocaleString()}\n` +
          `Admin Commissions: ${summary.total_admin_amount}`;

        await this.sendSlackNotification("daily_summary", {
          message: slackMessage,
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Daily payment summary error:", error);
      return { success: false, error: error.message };
    }
  }

  // Send weekly payment report
  async sendWeeklyPaymentReport() {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get comprehensive data for the week
      const { data: splits } = await supabase
        .from("payment_splits")
        .select(
          `
          *,
          payments(amount, currency, provider, created_at)
        `
        )
        .gte("created_at", weekAgo.toISOString())
        .lte("created_at", today.toISOString());

      if (!splits || splits.length === 0) return;

      // Generate detailed report
      const report = {
        period: `${weekAgo.toDateString()} - ${today.toDateString()}`,
        total_payments_processed: splits.length,
        vendor_statistics: this.calculateVendorStatistics(splits),
        admin_statistics: this.calculateAdminStatistics(splits),
        currency_breakdown: this.calculateCurrencyBreakdown(splits),
        provider_breakdown: this.calculateProviderBreakdown(splits),
        success_rate: this.calculateSuccessRate(splits),
        average_processing_time: this.calculateAverageProcessingTime(splits),
      };

      // Send detailed report email
      const adminEmail = process.env.ADMIN_EMAIL || "admin@yourdomain.com";

      const emailTemplate = {
        to: adminEmail,
        subject: `Weekly Payment Report - ${report.period}`,
        template: "weekly_payment_report",
        data: {
          report: report,
          dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard/reports`,
        },
      };

      await this.sendEmail(emailTemplate);

      return { success: true };
    } catch (error) {
      console.error("Weekly payment report error:", error);
      return { success: false, error: error.message };
    }
  }

  // Helper functions for report calculations
  calculateVendorStatistics(splits) {
    const vendorSplits = splits.filter((s) => s.recipient_type === "vendor");
    return {
      total_transfers: vendorSplits.length,
      successful_transfers: vendorSplits.filter(
        (s) => s.transfer_status === "completed"
      ).length,
      failed_transfers: vendorSplits.filter(
        (s) => s.transfer_status === "failed"
      ).length,
      total_amount: vendorSplits
        .filter((s) => s.transfer_status === "completed")
        .reduce((sum, s) => sum + s.amount, 0),
    };
  }

  calculateAdminStatistics(splits) {
    const adminSplits = splits.filter((s) => s.recipient_type === "admin");
    return {
      total_transfers: adminSplits.length,
      successful_transfers: adminSplits.filter(
        (s) => s.transfer_status === "completed"
      ).length,
      failed_transfers: adminSplits.filter(
        (s) => s.transfer_status === "failed"
      ).length,
      total_amount_ngn: adminSplits
        .filter(
          (s) => s.transfer_status === "completed" && s.currency === "NGN"
        )
        .reduce((sum, s) => sum + s.amount, 0),
      total_amount_crypto: adminSplits
        .filter(
          (s) => s.transfer_status === "completed" && s.currency !== "NGN"
        )
        .reduce((sum, s) => sum + s.amount, 0),
    };
  }

  calculateCurrencyBreakdown(splits) {
    const currencies = [...new Set(splits.map((s) => s.currency))];
    return currencies.map((currency) => {
      const currencySplits = splits.filter((s) => s.currency === currency);
      return {
        currency: currency,
        count: currencySplits.length,
        total_amount: currencySplits
          .filter((s) => s.transfer_status === "completed")
          .reduce((sum, s) => sum + s.amount, 0),
      };
    });
  }

  calculateProviderBreakdown(splits) {
    const providers = [...new Set(splits.map((s) => s.transfer_provider))];
    return providers.map((provider) => {
      const providerSplits = splits.filter(
        (s) => s.transfer_provider === provider
      );
      return {
        provider: provider,
        count: providerSplits.length,
        success_rate: (
          (providerSplits.filter((s) => s.transfer_status === "completed")
            .length /
            providerSplits.length) *
          100
        ).toFixed(2),
      };
    });
  }

  calculateSuccessRate(splits) {
    const successful = splits.filter(
      (s) => s.transfer_status === "completed"
    ).length;
    return ((successful / splits.length) * 100).toFixed(2);
  }

  calculateAverageProcessingTime(splits) {
    const processedSplits = splits.filter((s) => s.processed_at);
    if (processedSplits.length === 0) return 0;

    const totalTime = processedSplits.reduce((sum, split) => {
      const created = new Date(split.created_at);
      const processed = new Date(split.processed_at);
      return sum + (processed - created);
    }, 0);

    return Math.round(totalTime / processedSplits.length / 1000 / 60); // Average in minutes
  }
}

// Create notifications table if it doesn't exist
// const createNotificationsTable = async () => {
//   try {
//     const { error } = await supabase.rpc("execute_sql", {
//       query: `
//         CREATE TABLE IF NOT EXISTS notifications (
//           id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//           recipient_type VARCHAR(20) NOT NULL,
//           recipient_id UUID,
//           notification_type VARCHAR(50) NOT NULL,
//           channels TEXT[] DEFAULT ARRAY[]::TEXT[],
//           data JSONB,
//           priority VARCHAR(20) DEFAULT 'normal',
//           status VARCHAR(20) DEFAULT 'pending',
//           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//           sent_at TIMESTAMP,
//           error_message TEXT
//         );

//         CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_type, recipient_id);
//         CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
//         CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
//         CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
//       `,
//     });

//     if (error) {
//       console.error("Error creating notifications table:", error);
//     }
//   } catch (error) {
//     console.log(
//       "Notifications table creation error (may already exist):",
//       error.message
//     );
//   }
// };

// Export singleton instance
export const notificationManager = new NotificationManager();

// Initialize table on import

export default NotificationManager;
