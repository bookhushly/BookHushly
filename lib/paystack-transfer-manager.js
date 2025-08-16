// lib/paystack-transfer-manager.js
// Manages NGN transfers via Paystack Transfer API

import { supabase } from "./supabase";

const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY ||
  "sk_test_d85193414f0f8e7b2b95f67b1dacba68dfddef2e";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

class PaystackTransferManager {
  constructor() {
    this.secretKey = PAYSTACK_SECRET_KEY;
    this.baseUrl = PAYSTACK_BASE_URL;
  }

  // Create a transfer recipient (bank account)
  async createTransferRecipient(recipientData) {
    try {
      if (!this.secretKey) {
        throw new Error("Paystack secret key not configured");
      }

      const response = await fetch(`${this.baseUrl}/transferrecipient`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "nuban", // Nigerian bank account
          name: recipientData.account_name,
          account_number: recipientData.account_number,
          bank_code: recipientData.bank_code,
          currency: "NGN",
          metadata: recipientData.metadata || {},
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Failed to create transfer recipient");
      }

      return {
        success: true,
        data: {
          recipient_code: data.data.recipient_code,
          recipient_id: data.data.id,
          bank_name: data.data.details.bank_name,
          account_number: data.data.details.account_number,
          account_name: data.data.name,
        },
        error: null,
      };
    } catch (error) {
      console.error("Create transfer recipient error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // List all banks supported by Paystack
  async listBanks() {
    try {
      const response = await fetch(`${this.baseUrl}/bank`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Failed to fetch banks");
      }

      return {
        success: true,
        data: data.data.map((bank) => ({
          name: bank.name,
          code: bank.code,
          country: bank.country,
          currency: bank.currency,
          type: bank.type,
        })),
        error: null,
      };
    } catch (error) {
      console.error("List banks error:", error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  }

  // Resolve bank account details
  async resolveAccountNumber(accountNumber, bankCode) {
    try {
      const response = await fetch(
        `${this.baseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Failed to resolve account");
      }

      return {
        success: true,
        data: {
          account_number: data.data.account_number,
          account_name: data.data.account_name,
          bank_id: data.data.bank_id,
        },
        error: null,
      };
    } catch (error) {
      console.error("Resolve account error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Create and execute a transfer
  async createTransfer(transferData) {
    try {
      if (!this.secretKey) {
        throw new Error("Paystack secret key not configured");
      }

      // Validate transfer data
      const validation = this.validateTransferData(transferData);
      if (!validation.valid) {
        throw new Error(`Transfer validation failed: ${validation.error}`);
      }

      const response = await fetch(`${this.baseUrl}/transfer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "balance",
          amount: transferData.amount, // Amount in kobo
          recipient: transferData.recipient_code,
          reason: transferData.reason || "Payment transfer",
          currency: "NGN",
          reference: transferData.reference || this.generateTransferReference(),
          metadata: transferData.metadata || {},
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Transfer failed");
      }

      // Log transfer in database
      await this.logTransfer({
        transfer_code: data.data.transfer_code,
        reference: data.data.reference,
        amount: transferData.amount / 100, // Convert back to naira
        recipient_code: transferData.recipient_code,
        status: data.data.status,
        reason: transferData.reason,
        metadata: transferData.metadata,
        paystack_data: data.data,
      });

      return {
        success: true,
        data: {
          transfer_code: data.data.transfer_code,
          reference: data.data.reference,
          amount: data.data.amount / 100, // Convert to naira
          status: data.data.status,
          recipient: data.data.recipient,
          created_at: data.data.createdAt,
        },
        error: null,
      };
    } catch (error) {
      console.error("Create transfer error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Verify a transfer status
  async verifyTransfer(transferCodeOrReference) {
    try {
      const response = await fetch(
        `${this.baseUrl}/transfer/verify/${transferCodeOrReference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Transfer verification failed");
      }

      // Update transfer status in database
      await this.updateTransferStatus(
        transferCodeOrReference,
        data.data.status,
        data.data
      );

      return {
        success: true,
        data: {
          transfer_code: data.data.transfer_code,
          reference: data.data.reference,
          amount: data.data.amount / 100, // Convert to naira
          status: data.data.status,
          reason: data.data.reason,
          recipient: data.data.recipient,
          failures: data.data.failures,
          created_at: data.data.createdAt,
          updated_at: data.data.updatedAt,
        },
        error: null,
      };
    } catch (error) {
      console.error("Verify transfer error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // List transfers with filters
  async listTransfers(options = {}) {
    try {
      const params = new URLSearchParams();

      if (options.perPage) params.append("perPage", options.perPage);
      if (options.page) params.append("page", options.page);
      if (options.status) params.append("status", options.status);
      if (options.from) params.append("from", options.from);
      if (options.to) params.append("to", options.to);

      const queryString = params.toString();
      const url = `${this.baseUrl}/transfer${queryString ? "?" + queryString : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Failed to list transfers");
      }

      return {
        success: true,
        data: {
          transfers: data.data.map((transfer) => ({
            transfer_code: transfer.transfer_code,
            reference: transfer.reference,
            amount: transfer.amount / 100,
            status: transfer.status,
            reason: transfer.reason,
            recipient: transfer.recipient,
            created_at: transfer.createdAt,
            updated_at: transfer.updatedAt,
          })),
          meta: data.meta,
        },
        error: null,
      };
    } catch (error) {
      console.error("List transfers error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Get transfer balance
  async getBalance() {
    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Failed to get balance");
      }

      return {
        success: true,
        data: data.data.map((balance) => ({
          currency: balance.currency,
          balance: balance.balance / 100, // Convert to naira
          available_balance: balance.balance / 100,
        })),
        error: null,
      };
    } catch (error) {
      console.error("Get balance error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Bulk transfer functionality
  async createBulkTransfer(transfers) {
    try {
      const results = [];

      for (const transfer of transfers) {
        const result = await this.createTransfer(transfer);
        results.push({
          transfer_data: transfer,
          result: result,
        });

        // Add small delay between transfers to avoid rate limiting
        await this.delay(500);
      }

      const successful = results.filter((r) => r.result.success);
      const failed = results.filter((r) => !r.result.success);

      return {
        success: true,
        data: {
          total: transfers.length,
          successful: successful.length,
          failed: failed.length,
          results: results,
        },
        error: null,
      };
    } catch (error) {
      console.error("Bulk transfer error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Finalize a transfer (for transfers that require finalization)
  async finalizeTransfer(transferCode, otp) {
    try {
      const response = await fetch(
        `${this.baseUrl}/transfer/finalize_transfer`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transfer_code: transferCode,
            otp: otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Transfer finalization failed");
      }

      // Update transfer status
      await this.updateTransferStatus(transferCode, "success", data.data);

      return {
        success: true,
        data: {
          transfer_code: data.data.transfer_code,
          status: data.data.status,
          message: data.message,
        },
        error: null,
      };
    } catch (error) {
      console.error("Finalize transfer error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Enable OTP for transfers (security feature)
  async enableOTP() {
    try {
      const response = await fetch(`${this.baseUrl}/transfer/enable_otp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Failed to enable OTP");
      }

      return {
        success: true,
        data: data.data,
        error: null,
      };
    } catch (error) {
      console.error("Enable OTP error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Disable OTP for transfers
  async disableOTP(otp) {
    try {
      const response = await fetch(`${this.baseUrl}/transfer/disable_otp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Failed to disable OTP");
      }

      return {
        success: true,
        data: data.data,
        error: null,
      };
    } catch (error) {
      console.error("Disable OTP error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Validate transfer data
  validateTransferData(transferData) {
    const errors = [];

    if (!transferData.amount || transferData.amount <= 0) {
      errors.push("Invalid amount");
    }

    if (!transferData.recipient_code) {
      errors.push("Recipient code is required");
    }

    if (transferData.amount < 10000) {
      // Minimum 100 NGN (10000 kobo)
      errors.push("Amount must be at least 100 NGN");
    }

    // Check if amount exceeds maximum single transfer limit
    if (transferData.amount > 10000000000) {
      // 100 million NGN
      errors.push("Amount exceeds maximum transfer limit");
    }

    return {
      valid: errors.length === 0,
      error: errors.join(", "),
    };
  }

  // Generate unique transfer reference
  generateTransferReference() {
    return `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Log transfer in database
  async logTransfer(transferData) {
    try {
      await supabase.from("paystack_transfers").insert({
        transfer_code: transferData.transfer_code,
        reference: transferData.reference,
        amount: transferData.amount,
        recipient_code: transferData.recipient_code,
        status: transferData.status,
        reason: transferData.reason,
        metadata: transferData.metadata,
        paystack_data: transferData.paystack_data,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Log transfer error:", error);
    }
  }

  // Update transfer status in database
  async updateTransferStatus(
    transferCodeOrReference,
    status,
    paystackData = null
  ) {
    try {
      const updates = {
        status: status,
        updated_at: new Date().toISOString(),
      };

      if (paystackData) {
        updates.paystack_data = paystackData;
      }

      // Try to update by transfer_code first
      let { data: updateResult, error } = await supabase
        .from("paystack_transfers")
        .update(updates)
        .eq("transfer_code", transferCodeOrReference);

      // If no rows updated, try by reference
      if (error || !updateResult || updateResult.length === 0) {
        await supabase
          .from("paystack_transfers")
          .update(updates)
          .eq("reference", transferCodeOrReference);
      }
    } catch (error) {
      console.error("Update transfer status error:", error);
    }
  }

  // Helper function for delays
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Setup vendor bank account and create recipient
  async setupVendorBankAccount(vendorId, bankDetails) {
    try {
      // First, resolve the account to verify it exists
      const accountResolution = await this.resolveAccountNumber(
        bankDetails.account_number,
        bankDetails.bank_code
      );

      if (!accountResolution.success) {
        throw new Error(`Invalid bank account: ${accountResolution.error}`);
      }

      // Create transfer recipient
      const recipientResult = await this.createTransferRecipient({
        account_name: accountResolution.data.account_name,
        account_number: bankDetails.account_number,
        bank_code: bankDetails.bank_code,
        metadata: {
          vendor_id: vendorId,
          setup_date: new Date().toISOString(),
        },
      });

      if (!recipientResult.success) {
        throw new Error(`Failed to create recipient: ${recipientResult.error}`);
      }

      // Save bank account details to database
      const { data: bankAccount, error: bankError } = await supabase
        .from("vendor_bank_accounts")
        .insert({
          vendor_id: vendorId,
          bank_name: bankDetails.bank_name,
          bank_code: bankDetails.bank_code,
          account_number: bankDetails.account_number,
          account_name: accountResolution.data.account_name,
          recipient_code: recipientResult.data.recipient_code,
          is_verified: true,
          is_active: true,
        })
        .select()
        .single();

      if (bankError) {
        throw new Error(`Failed to save bank account: ${bankError.message}`);
      }

      return {
        success: true,
        data: {
          bank_account: bankAccount,
          recipient_data: recipientResult.data,
        },
        error: null,
      };
    } catch (error) {
      console.error("Setup vendor bank account error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Get vendor's transfer history
  async getVendorTransferHistory(vendorId, options = {}) {
    try {
      const query = supabase
        .from("paystack_transfers")
        .select(
          `
          *,
          payment_splits!inner(
            recipient_id
          )
        `
        )
        .eq("payment_splits.recipient_id", vendorId)
        .order("created_at", { ascending: false });

      if (options.limit) {
        query.limit(options.limit);
      }

      if (options.status) {
        query.eq("status", options.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data,
        error: null,
      };
    } catch (error) {
      console.error("Get vendor transfer history error:", error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  }

  // Retry failed transfers
  async retryFailedTransfer(transferCode) {
    try {
      // Get original transfer data
      const { data: originalTransfer, error } = await supabase
        .from("paystack_transfers")
        .select("*")
        .eq("transfer_code", transferCode)
        .single();

      if (error || !originalTransfer) {
        throw new Error("Original transfer not found");
      }

      if (originalTransfer.status === "success") {
        throw new Error("Transfer already successful");
      }

      // Create new transfer with same data
      const retryResult = await this.createTransfer({
        amount: originalTransfer.amount * 100, // Convert to kobo
        recipient_code: originalTransfer.recipient_code,
        reason: `Retry: ${originalTransfer.reason}`,
        reference: this.generateTransferReference(),
        metadata: {
          ...originalTransfer.metadata,
          retry_of: transferCode,
          retry_date: new Date().toISOString(),
        },
      });

      if (retryResult.success) {
        // Mark original as retried
        await supabase
          .from("paystack_transfers")
          .update({
            status: "retried",
            updated_at: new Date().toISOString(),
            retry_transfer_code: retryResult.data.transfer_code,
          })
          .eq("transfer_code", transferCode);
      }

      return retryResult;
    } catch (error) {
      console.error("Retry failed transfer error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Get transfer statistics
  async getTransferStatistics(dateRange = {}) {
    try {
      let query = supabase
        .from("paystack_transfers")
        .select("amount, status, created_at");

      if (dateRange.from) {
        query = query.gte("created_at", dateRange.from);
      }

      if (dateRange.to) {
        query = query.lte("created_at", dateRange.to);
      }

      const { data: transfers, error } = await query;

      if (error) throw error;

      const stats = {
        total_transfers: transfers.length,
        successful_transfers: transfers.filter((t) => t.status === "success")
          .length,
        failed_transfers: transfers.filter((t) => t.status === "failed").length,
        pending_transfers: transfers.filter((t) => t.status === "pending")
          .length,
        total_amount: transfers.reduce((sum, t) => sum + t.amount, 0),
        successful_amount: transfers
          .filter((t) => t.status === "success")
          .reduce((sum, t) => sum + t.amount, 0),
        average_transfer_amount:
          transfers.length > 0
            ? transfers.reduce((sum, t) => sum + t.amount, 0) / transfers.length
            : 0,
      };

      return {
        success: true,
        data: stats,
        error: null,
      };
    } catch (error) {
      console.error("Get transfer statistics error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }
}

// Create paystack_transfers table if it doesn't exist
const createPaystackTransfersTable = async () => {
  try {
    await supabase.rpc("create_paystack_transfers_table", {});
  } catch (error) {
    console.log("Paystack transfers table may already exist");
  }
};

// Export singleton instance
export const paystackTransferManager = new PaystackTransferManager();

// Initialize table on import
createPaystackTransfersTable();

export default PaystackTransferManager;
