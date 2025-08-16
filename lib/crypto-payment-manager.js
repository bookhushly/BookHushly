// lib/crypto-payout-manager.js
// Manages cryptocurrency payouts to admin wallets via NOWPayments

import { supabase } from "./supabase";

const NOWPAYMENTS_API_KEY =
  process.env.NOWPAYMENTS_API_KEY || "NV8WWJR-HF0MY55-NNFTDKN-H5G4SKQ";
const NOWPAYMENTS_PAYOUT_API_KEY = process.env.NOWPAYMENTS_PAYOUT_API_KEY; // Separate key for payouts
const NOWPAYMENTS_BASE_URL = "https://api.nowpayments.io/v1";

class CryptoPayoutManager {
  constructor() {
    this.apiKey = NOWPAYMENTS_API_KEY;
    this.payoutApiKey = NOWPAYMENTS_PAYOUT_API_KEY || NOWPAYMENTS_API_KEY;
    this.baseUrl = NOWPAYMENTS_BASE_URL;
  }

  // Check NOWPayments payout API status
  async checkPayoutAPIStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/payout/currencies`, {
        method: "GET",
        headers: {
          "x-api-key": this.payoutApiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Payout API not available");
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          available_currencies: data.currencies || [],
          status: "operational",
        },
        error: null,
      };
    } catch (error) {
      console.error("Payout API status check error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Get available payout currencies
  async getPayoutCurrencies() {
    try {
      const response = await fetch(`${this.baseUrl}/payout/currencies`, {
        method: "GET",
        headers: {
          "x-api-key": this.payoutApiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payout currencies");
      }

      const data = await response.json();

      return {
        success: true,
        data: data.currencies || [],
        error: null,
      };
    } catch (error) {
      console.error("Get payout currencies error:", error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  }

  // Get minimum payout amount for a currency
  async getMinimumPayoutAmount(currency) {
    try {
      const response = await fetch(
        `${this.baseUrl}/payout/min-amount/${currency.toLowerCase()}`,
        {
          method: "GET",
          headers: {
            "x-api-key": this.payoutApiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get minimum payout amount");
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          currency: currency.toLowerCase(),
          min_amount: data.min_amount,
          max_amount: data.max_amount,
        },
        error: null,
      };
    } catch (error) {
      console.error("Get minimum payout amount error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Validate wallet address
  async validateWalletAddress(address, currency) {
    try {
      const response = await fetch(`${this.baseUrl}/payout/validate-address`, {
        method: "POST",
        headers: {
          "x-api-key": this.payoutApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency: currency.toLowerCase(),
          address: address,
        }),
      });

      if (!response.ok) {
        throw new Error("Address validation failed");
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          is_valid: data.valid || data.is_valid,
          currency: currency.toLowerCase(),
          address: address,
        },
        error: null,
      };
    } catch (error) {
      console.error("Validate wallet address error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Create a payout
  async createPayout(payoutData) {
    try {
      if (!this.payoutApiKey) {
        throw new Error("NOWPayments payout API key not configured");
      }

      // Validate payout data
      const validation = await this.validatePayoutData(payoutData);
      if (!validation.valid) {
        throw new Error(`Payout validation failed: ${validation.error}`);
      }

      // Check if address is valid
      const addressValidation = await this.validateWalletAddress(
        payoutData.address,
        payoutData.currency
      );

      if (!addressValidation.success || !addressValidation.data.is_valid) {
        throw new Error("Invalid wallet address");
      }

      const response = await fetch(`${this.baseUrl}/payout`, {
        method: "POST",
        headers: {
          "x-api-key": this.payoutApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency: payoutData.currency.toLowerCase(),
          amount: payoutData.amount,
          address: payoutData.address,
          description: payoutData.description || "Admin commission payout",
          extra_id: payoutData.extra_id || null, // For currencies that require memo/tag
          ipn_callback_url:
            payoutData.callback_url ||
            `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments-payout`,
          metadata: payoutData.metadata || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payout creation failed");
      }

      const data = await response.json();

      // Log payout in database
      await this.logPayout({
        payout_id: data.id,
        currency: payoutData.currency.toLowerCase(),
        amount: payoutData.amount,
        address: payoutData.address,
        status: data.status,
        description: payoutData.description,
        metadata: payoutData.metadata,
        nowpayments_data: data,
      });

      return {
        success: true,
        data: {
          payout_id: data.id,
          status: data.status,
          currency: data.currency,
          amount: data.amount,
          address: data.address,
          hash: data.hash || null,
          created_at: data.created_at || new Date().toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error("Create payout error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Get payout status
  async getPayoutStatus(payoutId) {
    try {
      const response = await fetch(`${this.baseUrl}/payout/${payoutId}`, {
        method: "GET",
        headers: {
          "x-api-key": this.payoutApiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get payout status");
      }

      const data = await response.json();

      // Update payout status in database
      await this.updatePayoutStatus(payoutId, data.status, data);

      return {
        success: true,
        data: {
          payout_id: data.id,
          status: data.status,
          currency: data.currency,
          amount: data.amount,
          address: data.address,
          hash: data.hash || null,
          confirmations: data.confirmations || 0,
          required_confirmations: data.required_confirmations || 0,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
        error: null,
      };
    } catch (error) {
      console.error("Get payout status error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // List payouts with filters
  async listPayouts(options = {}) {
    try {
      const params = new URLSearchParams();

      if (options.limit) params.append("limit", options.limit);
      if (options.offset) params.append("offset", options.offset);
      if (options.status) params.append("status", options.status);
      if (options.currency) params.append("currency", options.currency);
      if (options.date_from) params.append("date_from", options.date_from);
      if (options.date_to) params.append("date_to", options.date_to);

      const queryString = params.toString();
      const url = `${this.baseUrl}/payout${queryString ? "?" + queryString : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-api-key": this.payoutApiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to list payouts");
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          payouts: data.data || data.payouts || [],
          total: data.total || 0,
          limit: data.limit || options.limit || 50,
          offset: data.offset || options.offset || 0,
        },
        error: null,
      };
    } catch (error) {
      console.error("List payouts error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Get payout balance (available funds for payouts)
  async getPayoutBalance() {
    try {
      const response = await fetch(`${this.baseUrl}/payout/balance`, {
        method: "GET",
        headers: {
          "x-api-key": this.payoutApiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get payout balance");
      }

      const data = await response.json();

      return {
        success: true,
        data: data.balances || data,
        error: null,
      };
    } catch (error) {
      console.error("Get payout balance error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Validate payout data
  async validatePayoutData(payoutData) {
    const errors = [];

    if (!payoutData.currency) {
      errors.push("Currency is required");
    }

    if (!payoutData.amount || payoutData.amount <= 0) {
      errors.push("Valid amount is required");
    }

    if (!payoutData.address) {
      errors.push("Wallet address is required");
    }

    // Check minimum amount
    if (payoutData.currency && payoutData.amount) {
      const minAmountResult = await this.getMinimumPayoutAmount(
        payoutData.currency
      );
      if (
        minAmountResult.success &&
        payoutData.amount < minAmountResult.data.min_amount
      ) {
        errors.push(
          `Amount must be at least ${minAmountResult.data.min_amount} ${payoutData.currency.toUpperCase()}`
        );
      }
    }

    // Validate currency is supported
    const currenciesResult = await this.getPayoutCurrencies();
    if (currenciesResult.success) {
      const supportedCurrencies = currenciesResult.data.map((c) =>
        c.toLowerCase()
      );
      if (!supportedCurrencies.includes(payoutData.currency.toLowerCase())) {
        errors.push(
          `Currency ${payoutData.currency.toUpperCase()} is not supported for payouts`
        );
      }
    }

    return {
      valid: errors.length === 0,
      error: errors.join(", "),
    };
  }

  // Log payout in database
  async logPayout(payoutData) {
    try {
      await supabase.from("crypto_payouts").insert({
        payout_id: payoutData.payout_id,
        currency: payoutData.currency,
        amount: payoutData.amount,
        address: payoutData.address,
        status: payoutData.status,
        description: payoutData.description,
        metadata: payoutData.metadata,
        nowpayments_data: payoutData.nowpayments_data,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Log payout error:", error);
    }
  }

  // Update payout status in database
  async updatePayoutStatus(payoutId, status, nowpaymentsData = null) {
    try {
      const updates = {
        status: status,
        updated_at: new Date().toISOString(),
      };

      if (nowpaymentsData) {
        updates.nowpayments_data = nowpaymentsData;
        if (nowpaymentsData.hash) {
          updates.transaction_hash = nowpaymentsData.hash;
        }
      }

      await supabase
        .from("crypto_payouts")
        .update(updates)
        .eq("payout_id", payoutId);
    } catch (error) {
      console.error("Update payout status error:", error);
    }
  }

  // Bulk payout functionality
  async createBulkPayouts(payouts) {
    try {
      const results = [];

      for (const payout of payouts) {
        const result = await this.createPayout(payout);
        results.push({
          payout_data: payout,
          result: result,
        });

        // Add delay to avoid rate limiting
        await this.delay(1000);
      }

      const successful = results.filter((r) => r.result.success);
      const failed = results.filter((r) => !r.result.success);

      return {
        success: true,
        data: {
          total: payouts.length,
          successful: successful.length,
          failed: failed.length,
          results: results,
        },
        error: null,
      };
    } catch (error) {
      console.error("Bulk payout error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Setup admin wallet for a specific currency
  async setupAdminWallet(currency, walletAddress, walletType = "hot") {
    try {
      // Validate the wallet address
      const validation = await this.validateWalletAddress(
        walletAddress,
        currency
      );
      if (!validation.success || !validation.data.is_valid) {
        throw new Error("Invalid wallet address");
      }

      // Save to database
      const { data: wallet, error } = await supabase
        .from("admin_wallets")
        .upsert({
          currency: currency.toLowerCase(),
          wallet_address: walletAddress,
          wallet_type: walletType,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: wallet,
        error: null,
      };
    } catch (error) {
      console.error("Setup admin wallet error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Get payout history for admin
  async getAdminPayoutHistory(options = {}) {
    try {
      let query = supabase
        .from("crypto_payouts")
        .select("*")
        .order("created_at", { ascending: false });

      if (options.currency) {
        query = query.eq("currency", options.currency.toLowerCase());
      }

      if (options.status) {
        query = query.eq("status", options.status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data,
        error: null,
      };
    } catch (error) {
      console.error("Get admin payout history error:", error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  }

  // Retry failed payout
  async retryFailedPayout(payoutId) {
    try {
      // Get original payout data
      const { data: originalPayout, error } = await supabase
        .from("crypto_payouts")
        .select("*")
        .eq("payout_id", payoutId)
        .single();

      if (error || !originalPayout) {
        throw new Error("Original payout not found");
      }

      if (
        originalPayout.status === "completed" ||
        originalPayout.status === "finished"
      ) {
        throw new Error("Payout already completed");
      }

      // Create new payout with same data
      const retryResult = await this.createPayout({
        currency: originalPayout.currency,
        amount: originalPayout.amount,
        address: originalPayout.address,
        description: `Retry: ${originalPayout.description}`,
        metadata: {
          ...originalPayout.metadata,
          retry_of: payoutId,
          retry_date: new Date().toISOString(),
        },
      });

      if (retryResult.success) {
        // Mark original as retried
        await supabase
          .from("crypto_payouts")
          .update({
            status: "retried",
            updated_at: new Date().toISOString(),
            retry_payout_id: retryResult.data.payout_id,
          })
          .eq("payout_id", payoutId);
      }

      return retryResult;
    } catch (error) {
      console.error("Retry failed payout error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Get payout statistics
  async getPayoutStatistics(dateRange = {}) {
    try {
      let query = supabase
        .from("crypto_payouts")
        .select("amount, currency, status, created_at");

      if (dateRange.from) {
        query = query.gte("created_at", dateRange.from);
      }

      if (dateRange.to) {
        query = query.lte("created_at", dateRange.to);
      }

      const { data: payouts, error } = await query;

      if (error) throw error;

      const stats = {
        total_payouts: payouts.length,
        completed_payouts: payouts.filter(
          (p) => p.status === "completed" || p.status === "finished"
        ).length,
        failed_payouts: payouts.filter((p) => p.status === "failed").length,
        pending_payouts: payouts.filter(
          (p) => p.status === "pending" || p.status === "processing"
        ).length,
        currencies: [...new Set(payouts.map((p) => p.currency))],
        total_volume_by_currency: {},
      };

      // Calculate volume by currency
      stats.currencies.forEach((currency) => {
        const currencyPayouts = payouts.filter((p) => p.currency === currency);
        stats.total_volume_by_currency[currency] = {
          total_amount: currencyPayouts.reduce((sum, p) => sum + p.amount, 0),
          completed_amount: currencyPayouts
            .filter((p) => p.status === "completed" || p.status === "finished")
            .reduce((sum, p) => sum + p.amount, 0),
          count: currencyPayouts.length,
        };
      });

      return {
        success: true,
        data: stats,
        error: null,
      };
    } catch (error) {
      console.error("Get payout statistics error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Monitor payout status updates
  async monitorPayoutStatus(payoutId, maxAttempts = 10, intervalMs = 30000) {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          attempts++;
          const statusResult = await this.getPayoutStatus(payoutId);

          if (!statusResult.success) {
            if (attempts >= maxAttempts) {
              reject(new Error("Max monitoring attempts reached"));
              return;
            }
            setTimeout(checkStatus, intervalMs);
            return;
          }

          const status = statusResult.data.status;

          // Final states
          if (
            status === "completed" ||
            status === "finished" ||
            status === "failed"
          ) {
            resolve(statusResult.data);
            return;
          }

          // Continue monitoring if still pending/processing
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, intervalMs);
          } else {
            reject(new Error("Payout monitoring timeout"));
          }
        } catch (error) {
          if (attempts >= maxAttempts) {
            reject(error);
          } else {
            setTimeout(checkStatus, intervalMs);
          }
        }
      };

      checkStatus();
    });
  }

  // Helper function for delays
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get supported networks for a currency
  async getSupportedNetworks(currency) {
    try {
      const response = await fetch(
        `${this.baseUrl}/currencies/${currency.toLowerCase()}`,
        {
          method: "GET",
          headers: {
            "x-api-key": this.payoutApiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get supported networks");
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          currency: currency.toLowerCase(),
          networks: data.networks || [],
          default_network: data.default_network,
        },
        error: null,
      };
    } catch (error) {
      console.error("Get supported networks error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Estimate payout fees
  async estimatePayoutFees(currency, amount) {
    try {
      const response = await fetch(`${this.baseUrl}/payout/estimate-fee`, {
        method: "POST",
        headers: {
          "x-api-key": this.payoutApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency: currency.toLowerCase(),
          amount: amount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to estimate payout fees");
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          currency: currency.toLowerCase(),
          amount: amount,
          fee: data.fee,
          net_amount: data.net_amount || amount - data.fee,
        },
        error: null,
      };
    } catch (error) {
      console.error("Estimate payout fees error:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }
}

// Create crypto_payouts table if it doesn't exist
const createCryptoPayoutsTable = async () => {
  try {
    const { error } = await supabase.rpc("execute_sql", {
      query: `
        CREATE TABLE IF NOT EXISTS crypto_payouts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          payout_id VARCHAR(255) UNIQUE NOT NULL,
          currency VARCHAR(10) NOT NULL,
          amount DECIMAL(20, 8) NOT NULL,
          address VARCHAR(255) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          description TEXT,
          transaction_hash VARCHAR(255),
          metadata JSONB,
          nowpayments_data JSONB,
          retry_payout_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_crypto_payouts_payout_id ON crypto_payouts(payout_id);
        CREATE INDEX IF NOT EXISTS idx_crypto_payouts_currency ON crypto_payouts(currency);
        CREATE INDEX IF NOT EXISTS idx_crypto_payouts_status ON crypto_payouts(status);
        CREATE INDEX IF NOT EXISTS idx_crypto_payouts_created_at ON crypto_payouts(created_at);
      `,
    });

    if (error) {
      console.error("Error creating crypto_payouts table:", error);
    }
  } catch (error) {
    console.log(
      "Crypto payouts table creation error (may already exist):",
      error.message
    );
  }
};

// Export singleton instance
export const cryptoPayoutManager = new CryptoPayoutManager();

// Initialize table on import
createCryptoPayoutsTable();

export default CryptoPayoutManager;
