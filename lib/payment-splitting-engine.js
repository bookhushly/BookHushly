// lib/payment-splitting-engine.js
// Core engine for processing payment splits

import { supabase } from "./supabase";
import {
  SPLIT_CONFIG,
  calculateSplitAmounts,
  getProcessingDelay,
  meetsMinimumTransfer,
} from "./payment-splitting-config";
import { exchangeRateManager } from "./exchange-rate-manager";
import PaystackTransferManager from "./paystack-transfer-manager";
import CryptoPayoutManager from "./crypto-payment-manager";
import NotificationManager from "./notification-manager";

class PaymentSplittingEngine {
  constructor() {
    this.paystackTransfer = new PaystackTransferManager();
    this.cryptoPayout = new CryptoPayoutManager();
    this.notifications = new NotificationManager();
    this.processQueue = new Map(); // For delayed processing
  }

  // Main function to process payment split
  async processPaymentSplit(paymentId, paymentData) {
    try {
      console.log(`Processing payment split for payment ID: ${paymentId}`);

      // Log the start of split processing
      await this.logSplitAction(paymentId, "split_initiated", {
        original_amount: paymentData.amount,
        currency: paymentData.currency,
        provider: paymentData.provider,
      });

      // Step 1: Validate payment data
      const validation = await this.validatePaymentForSplit(
        paymentId,
        paymentData
      );
      if (!validation.valid) {
        throw new Error(`Payment validation failed: ${validation.reason}`);
      }

      // Step 2: Calculate split amounts
      const splitCalculation = await this.calculatePaymentSplit(paymentData);

      // Step 3: Get vendor and booking details
      const { vendor, booking } = await this.getPaymentDetails(paymentData);

      // Step 4: Create split records
      const splitRecords = await this.createSplitRecords(
        paymentId,
        splitCalculation,
        vendor,
        booking
      );

      // Step 5: Determine processing strategy
      const processingDelay = getProcessingDelay(
        paymentData.amount,
        paymentData.currency
      );

      if (processingDelay === 0) {
        // Process immediately
        await this.executeSplitTransfers(
          paymentId,
          splitRecords,
          splitCalculation
        );
      } else {
        // Schedule for later processing
        await this.scheduleSplitProcessing(
          paymentId,
          splitRecords,
          splitCalculation,
          processingDelay
        );
      }

      // Step 6: Update payment status
      await this.updatePaymentSplitStatus(
        paymentId,
        "processing",
        splitCalculation
      );

      return {
        success: true,
        splitId: splitRecords.map((record) => record.id),
        processingDelay: processingDelay,
        vendorAmount: splitCalculation.vendor.amount,
        adminAmount: splitCalculation.admin.amount,
      };
    } catch (error) {
      console.error("Payment split processing error:", error);

      // Log the error
      await this.logSplitAction(paymentId, "split_failed", {
        error: error.message,
        stack: error.stack,
      });

      // Update payment status to failed
      await this.updatePaymentSplitStatus(
        paymentId,
        "failed",
        null,
        error.message
      );

      // Notify admin of failure
      await this.notifications.notifyAdminSplitFailure(
        paymentId,
        error.message
      );

      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Validate if payment is eligible for splitting
  async validatePaymentForSplit(paymentId, paymentData) {
    try {
      // Check if payment is already split
      const { data: existingSplit } = await supabase
        .from("payments")
        .select("split_status")
        .eq("id", paymentId)
        .single();

      if (existingSplit?.split_status === "completed") {
        return { valid: false, reason: "Payment already split" };
      }

      // Verify payment status is completed
      if (paymentData.status !== "completed") {
        return { valid: false, reason: "Payment not completed yet" };
      }

      // Check minimum amount requirements
      const splitAmounts = calculateSplitAmounts(
        paymentData.amount,
        paymentData.currency
      );

      if (
        !meetsMinimumTransfer(
          splitAmounts.vendor.amount,
          splitAmounts.vendor.currency
        )
      ) {
        return {
          valid: false,
          reason: "Vendor amount below minimum transfer limit",
        };
      }

      if (
        !meetsMinimumTransfer(
          splitAmounts.admin.amount,
          splitAmounts.admin.currency
        )
      ) {
        return {
          valid: false,
          reason: "Admin amount below minimum transfer limit",
        };
      }

      return { valid: true };
    } catch (error) {
      console.error("Payment validation error:", error);
      return { valid: false, reason: error.message };
    }
  }

  // Calculate split amounts with currency conversion
  async calculatePaymentSplit(paymentData) {
    const { amount, currency, provider } = paymentData;

    // Get base split amounts
    const baseSplit = calculateSplitAmounts(amount, currency);

    // For vendor, we always convert to NGN
    let vendorAmount = baseSplit.vendor.amount;
    let exchangeRate = 1;

    if (currency !== "NGN") {
      const conversion = await exchangeRateManager.convertAmount(
        baseSplit.vendor.amount,
        currency,
        "NGN"
      );

      if (!conversion.success) {
        throw new Error(
          `Failed to convert ${currency} to NGN: ${conversion.error}`
        );
      }

      vendorAmount = conversion.convertedAmount;
      exchangeRate = conversion.rate;
    }

    // For admin, currency depends on payment method
    let adminCurrency = currency;
    let adminAmount = baseSplit.admin.amount;

    // If it was a crypto payment, admin gets the same crypto
    // If it was Paystack, admin gets NGN
    if (provider === "paystack") {
      adminCurrency = "NGN";
      if (currency !== "NGN") {
        const adminConversion = await exchangeRateManager.convertAmount(
          baseSplit.admin.amount,
          currency,
          "NGN"
        );

        if (adminConversion.success) {
          adminAmount = adminConversion.convertedAmount;
        }
      }
    }

    return {
      vendor: {
        amount: parseFloat(vendorAmount.toFixed(2)),
        currency: "NGN",
        percentage: SPLIT_CONFIG.VENDOR_PERCENTAGE,
        originalAmount: baseSplit.vendor.amount,
        originalCurrency: currency,
      },
      admin: {
        amount: parseFloat(adminAmount.toFixed(8)), // More precision for crypto
        currency: adminCurrency,
        percentage: SPLIT_CONFIG.ADMIN_PERCENTAGE,
        originalAmount: baseSplit.admin.amount,
        originalCurrency: currency,
      },
      exchangeRate: exchangeRate,
      totalAmount: amount,
      originalCurrency: currency,
      provider: provider,
    };
  }

  // Get payment details including vendor and booking info
  async getPaymentDetails(paymentData) {
    try {
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select(
          `
          *,
          listings!inner(
            *,
            vendors!inner(*)
          )
        `
        )
        .eq("id", paymentData.booking_id)
        .single();

      if (bookingError) throw bookingError;

      const vendor = booking.listings.vendors;

      // Get vendor bank account details
      const { data: bankAccount } = await supabase
        .from("vendor_bank_accounts")
        .select("*")
        .eq("vendor_id", vendor.id)
        .eq("is_active", true)
        .eq("is_verified", true)
        .single();

      return {
        vendor: {
          ...vendor,
          bankAccount: bankAccount,
        },
        booking: booking,
      };
    } catch (error) {
      console.error("Error fetching payment details:", error);
      throw new Error("Failed to fetch payment details");
    }
  }

  // Create split records in database
  async createSplitRecords(paymentId, splitCalculation, vendor, booking) {
    try {
      const splitRecords = [];

      // Create vendor split record
      const vendorSplit = {
        payment_id: paymentId,
        recipient_type: "vendor",
        recipient_id: vendor.id,
        amount: splitCalculation.vendor.amount,
        currency: splitCalculation.vendor.currency,
        transfer_status: "pending",
        transfer_provider: "paystack", // Always use Paystack for NGN transfers to vendors
      };

      const { data: vendorRecord, error: vendorError } = await supabase
        .from("payment_splits")
        .insert(vendorSplit)
        .select()
        .single();

      if (vendorError) throw vendorError;
      splitRecords.push(vendorRecord);

      // Create admin split record
      const adminSplit = {
        payment_id: paymentId,
        recipient_type: "admin",
        recipient_id: null, // Admin doesn't have a specific ID
        amount: splitCalculation.admin.amount,
        currency: splitCalculation.admin.currency,
        transfer_status: "pending",
        transfer_provider:
          splitCalculation.admin.currency === "NGN"
            ? "paystack"
            : "nowpayments",
      };

      const { data: adminRecord, error: adminError } = await supabase
        .from("payment_splits")
        .insert(adminSplit)
        .select()
        .single();

      if (adminError) throw adminError;
      splitRecords.push(adminRecord);

      // Log split creation
      await this.logSplitAction(paymentId, "split_records_created", {
        vendor_split_id: vendorRecord.id,
        admin_split_id: adminRecord.id,
        vendor_amount: splitCalculation.vendor.amount,
        admin_amount: splitCalculation.admin.amount,
      });

      return splitRecords;
    } catch (error) {
      console.error("Error creating split records:", error);
      throw new Error("Failed to create split records");
    }
  }

  // Execute the actual transfers
  async executeSplitTransfers(paymentId, splitRecords, splitCalculation) {
    const results = {
      vendor: { success: false, error: null },
      admin: { success: false, error: null },
    };

    try {
      // Process vendor transfer (always NGN via Paystack)
      const vendorSplit = splitRecords.find(
        (r) => r.recipient_type === "vendor"
      );
      if (vendorSplit) {
        await this.updateSplitStatus(vendorSplit.id, "processing");

        const vendorResult = await this.processVendorTransfer(
          vendorSplit,
          splitCalculation
        );
        results.vendor = vendorResult;

        if (vendorResult.success) {
          await this.updateSplitStatus(
            vendorSplit.id,
            "completed",
            vendorResult.reference
          );
          await this.notifications.notifyVendorPayment(
            vendorSplit,
            vendorResult
          );
        } else {
          await this.updateSplitStatus(
            vendorSplit.id,
            "failed",
            null,
            vendorResult.error
          );
        }
      }

      // Process admin transfer
      const adminSplit = splitRecords.find((r) => r.recipient_type === "admin");
      if (adminSplit) {
        await this.updateSplitStatus(adminSplit.id, "processing");

        const adminResult = await this.processAdminTransfer(
          adminSplit,
          splitCalculation
        );
        results.admin = adminResult;

        if (adminResult.success) {
          await this.updateSplitStatus(
            adminSplit.id,
            "completed",
            adminResult.reference
          );
          await this.notifications.notifyAdminPayment(adminSplit, adminResult);
        } else {
          await this.updateSplitStatus(
            adminSplit.id,
            "failed",
            null,
            adminResult.error
          );
        }
      }

      // Update overall payment status
      if (results.vendor.success && results.admin.success) {
        await this.updatePaymentSplitStatus(
          paymentId,
          "completed",
          splitCalculation
        );
        await this.logSplitAction(paymentId, "split_completed", results);
      } else if (!results.vendor.success && !results.admin.success) {
        await this.updatePaymentSplitStatus(
          paymentId,
          "failed",
          splitCalculation,
          "Both transfers failed"
        );
        await this.logSplitAction(
          paymentId,
          "split_completely_failed",
          results
        );
      } else {
        await this.updatePaymentSplitStatus(
          paymentId,
          "partial",
          splitCalculation,
          "Some transfers failed"
        );
        await this.logSplitAction(paymentId, "split_partially_failed", results);
      }

      return results;
    } catch (error) {
      console.error("Error executing split transfers:", error);
      await this.updatePaymentSplitStatus(
        paymentId,
        "failed",
        splitCalculation,
        error.message
      );
      throw error;
    }
  }

  // Process vendor transfer (always NGN via Paystack)
  async processVendorTransfer(vendorSplit, splitCalculation) {
    try {
      // Get vendor details including bank account
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .select(
          `
          *,
          vendor_bank_accounts(*)
        `
        )
        .eq("id", vendorSplit.recipient_id)
        .single();

      if (vendorError || !vendor) {
        throw new Error("Vendor not found");
      }

      const bankAccount = vendor.vendor_bank_accounts?.[0];
      if (!bankAccount) {
        throw new Error("No verified bank account found for vendor");
      }

      // Process transfer via Paystack
      const transferResult = await this.paystackTransfer.createTransfer({
        amount: vendorSplit.amount * 100, // Convert to kobo
        recipient_code: bankAccount.recipient_code, // Assuming recipient is already created
        reason: `Payment for booking - ${vendorSplit.amount} NGN`,
        metadata: {
          payment_split_id: vendorSplit.id,
          vendor_id: vendor.id,
          split_type: "vendor",
        },
      });

      if (!transferResult.success) {
        throw new Error(transferResult.error);
      }

      return {
        success: true,
        reference: transferResult.data.transfer_code,
        provider: "paystack",
        amount: vendorSplit.amount,
        currency: "NGN",
      };
    } catch (error) {
      console.error("Vendor transfer error:", error);
      return {
        success: false,
        error: error.message,
        provider: "paystack",
      };
    }
  }

  // Process admin transfer (NGN via Paystack or Crypto via NOWPayments)
  async processAdminTransfer(adminSplit, splitCalculation) {
    try {
      if (adminSplit.currency === "NGN") {
        // NGN transfer via Paystack
        return await this.processAdminNGNTransfer(adminSplit);
      } else {
        // Crypto transfer via NOWPayments
        return await this.processAdminCryptoTransfer(adminSplit);
      }
    } catch (error) {
      console.error("Admin transfer error:", error);
      return {
        success: false,
        error: error.message,
        provider: adminSplit.currency === "NGN" ? "paystack" : "nowpayments",
      };
    }
  }

  // Process admin NGN transfer
  async processAdminNGNTransfer(adminSplit) {
    try {
      // Get admin bank account details
      const adminBankAccount = await this.getAdminBankAccount();

      if (!adminBankAccount) {
        throw new Error("Admin bank account not configured");
      }

      const transferResult = await this.paystackTransfer.createTransfer({
        amount: adminSplit.amount * 100, // Convert to kobo
        recipient_code: adminBankAccount.recipient_code,
        reason: `Admin commission - ${adminSplit.amount} NGN`,
        metadata: {
          payment_split_id: adminSplit.id,
          split_type: "admin",
        },
      });

      if (!transferResult.success) {
        throw new Error(transferResult.error);
      }

      return {
        success: true,
        reference: transferResult.data.transfer_code,
        provider: "paystack",
        amount: adminSplit.amount,
        currency: "NGN",
      };
    } catch (error) {
      console.error("Admin NGN transfer error:", error);
      return {
        success: false,
        error: error.message,
        provider: "paystack",
      };
    }
  }

  // Process admin crypto transfer
  async processAdminCryptoTransfer(adminSplit) {
    try {
      // Get admin crypto wallet address
      const adminWallet = await this.getAdminCryptoWallet(adminSplit.currency);

      if (!adminWallet) {
        throw new Error(`Admin ${adminSplit.currency} wallet not configured`);
      }

      const payoutResult = await this.cryptoPayout.createPayout({
        currency: adminSplit.currency.toLowerCase(),
        amount: adminSplit.amount,
        address: adminWallet.wallet_address,
        description: `Admin commission - ${adminSplit.amount} ${adminSplit.currency}`,
        metadata: {
          payment_split_id: adminSplit.id,
          split_type: "admin",
        },
      });

      if (!payoutResult.success) {
        throw new Error(payoutResult.error);
      }

      return {
        success: true,
        reference: payoutResult.data.payout_id,
        provider: "nowpayments",
        amount: adminSplit.amount,
        currency: adminSplit.currency,
      };
    } catch (error) {
      console.error("Admin crypto transfer error:", error);
      return {
        success: false,
        error: error.message,
        provider: "nowpayments",
      };
    }
  }

  // Schedule split processing for later
  async scheduleSplitProcessing(
    paymentId,
    splitRecords,
    splitCalculation,
    delayInSeconds
  ) {
    try {
      const executeAt = new Date(Date.now() + delayInSeconds * 1000);

      // Store in queue (in production, use Redis or similar)
      this.processQueue.set(paymentId, {
        paymentId,
        splitRecords,
        splitCalculation,
        executeAt,
        retryCount: 0,
      });

      // Update payment status to scheduled
      await this.updatePaymentSplitStatus(
        paymentId,
        "scheduled",
        splitCalculation
      );

      // Log scheduling
      await this.logSplitAction(paymentId, "split_scheduled", {
        execute_at: executeAt.toISOString(),
        delay_seconds: delayInSeconds,
      });

      // Set timeout to process later
      setTimeout(async () => {
        await this.processScheduledSplit(paymentId);
      }, delayInSeconds * 1000);

      console.log(
        `Split processing scheduled for payment ${paymentId} at ${executeAt}`
      );
    } catch (error) {
      console.error("Error scheduling split processing:", error);
      throw error;
    }
  }

  // Process scheduled splits
  async processScheduledSplit(paymentId) {
    try {
      const queuedSplit = this.processQueue.get(paymentId);
      if (!queuedSplit) {
        console.error(`No queued split found for payment ${paymentId}`);
        return;
      }

      console.log(`Processing scheduled split for payment ${paymentId}`);

      // Execute the transfers
      await this.executeSplitTransfers(
        queuedSplit.paymentId,
        queuedSplit.splitRecords,
        queuedSplit.splitCalculation
      );

      // Remove from queue
      this.processQueue.delete(paymentId);
    } catch (error) {
      console.error(
        `Error processing scheduled split for payment ${paymentId}:`,
        error
      );

      // Implement retry logic
      await this.handleSplitRetry(paymentId, error);
    }
  }

  // Handle split retry logic
  async handleSplitRetry(paymentId, error) {
    try {
      const queuedSplit = this.processQueue.get(paymentId);
      if (!queuedSplit) return;

      queuedSplit.retryCount += 1;

      if (queuedSplit.retryCount <= SPLIT_CONFIG.RETRY_CONFIG.max_attempts) {
        const retryDelay =
          SPLIT_CONFIG.RETRY_CONFIG.retry_delays[queuedSplit.retryCount - 1] ||
          900;

        console.log(
          `Retrying split processing for payment ${paymentId} in ${retryDelay} seconds (attempt ${queuedSplit.retryCount})`
        );

        // Schedule retry
        setTimeout(async () => {
          await this.processScheduledSplit(paymentId);
        }, retryDelay * 1000);

        // Log retry
        await this.logSplitAction(paymentId, "split_retry_scheduled", {
          retry_count: queuedSplit.retryCount,
          retry_delay: retryDelay,
          error: error.message,
        });
      } else {
        // Max retries reached
        console.error(`Max retries reached for payment split ${paymentId}`);

        await this.updatePaymentSplitStatus(
          paymentId,
          "failed",
          null,
          "Max retries reached"
        );
        await this.logSplitAction(paymentId, "split_max_retries_reached", {
          final_error: error.message,
          retry_count: queuedSplit.retryCount,
        });

        // Notify admin of permanent failure
        await this.notifications.notifyAdminSplitPermanentFailure(
          paymentId,
          error.message
        );

        // Remove from queue
        this.processQueue.delete(paymentId);
      }
    } catch (retryError) {
      console.error("Error handling split retry:", retryError);
    }
  }

  // Update split record status
  async updateSplitStatus(
    splitId,
    status,
    reference = null,
    errorMessage = null
  ) {
    try {
      const updates = {
        transfer_status: status,
        updated_at: new Date().toISOString(),
      };

      if (reference) {
        updates.transfer_reference = reference;
      }

      if (status === "completed") {
        updates.processed_at = new Date().toISOString();
      }

      if (status === "failed") {
        updates.failed_at = new Date().toISOString();
        updates.error_message = errorMessage;
      }

      await supabase.from("payment_splits").update(updates).eq("id", splitId);
    } catch (error) {
      console.error("Error updating split status:", error);
    }
  }

  // Update main payment split status
  async updatePaymentSplitStatus(
    paymentId,
    status,
    splitCalculation = null,
    errorMessage = null
  ) {
    try {
      const updates = {
        split_status: status,
      };

      if (splitCalculation) {
        updates.vendor_amount = splitCalculation.vendor.amount;
        updates.admin_amount = splitCalculation.admin.amount;
        updates.vendor_currency = splitCalculation.vendor.currency;
        updates.admin_currency = splitCalculation.admin.currency;
        updates.exchange_rate_used = splitCalculation.exchangeRate;
        updates.split_data = splitCalculation;
      }

      if (status === "completed") {
        updates.split_processed_at = new Date().toISOString();
      }

      await supabase.from("payments").update(updates).eq("id", paymentId);
    } catch (error) {
      console.error("Error updating payment split status:", error);
    }
  }

  // Log split actions for audit trail
  async logSplitAction(paymentId, action, details = {}) {
    try {
      await supabase.from("payment_split_logs").insert({
        payment_id: paymentId,
        action: action,
        details: details,
      });
    } catch (error) {
      console.error("Error logging split action:", error);
    }
  }

  // Get admin bank account details
  async getAdminBankAccount() {
    try {
      // This should be stored in your config or database
      // For now, return a placeholder
      return {
        recipient_code: process.env.ADMIN_PAYSTACK_RECIPIENT_CODE,
        bank_name: process.env.ADMIN_BANK_NAME,
        account_number: process.env.ADMIN_ACCOUNT_NUMBER,
      };
    } catch (error) {
      console.error("Error getting admin bank account:", error);
      return null;
    }
  }

  // Get admin crypto wallet
  async getAdminCryptoWallet(currency) {
    try {
      const { data: wallet, error } = await supabase
        .from("admin_wallets")
        .select("*")
        .eq("currency", currency.toLowerCase())
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return wallet;
    } catch (error) {
      console.error("Error getting admin crypto wallet:", error);
      return null;
    }
  }
}

// Export singleton instance
export const paymentSplittingEngine = new PaymentSplittingEngine();

// Helper function for direct usage
export const processPaymentSplit = (paymentId, paymentData) => {
  return paymentSplittingEngine.processPaymentSplit(paymentId, paymentData);
};

export default PaymentSplittingEngine;
