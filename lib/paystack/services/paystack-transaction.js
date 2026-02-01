/**
 * Paystack Transaction Service
 * Handles transaction initialization, verification, and management
 */

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export class PaystackTransactionService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (!this.secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not defined");
    }
  }

  /**
   * Make authenticated request to Paystack API
   */
  async makeRequest(endpoint, method = "GET", data = null) {
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
    };

    if (data && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `Paystack API error: ${response.status}`,
        );
      }

      return result;
    } catch (error) {
      console.error("Paystack API Request Failed:", error);
      throw error;
    }
  }

  /**
   * Initialize a transaction
   * @param {Object} params - Transaction parameters
   * @returns {Promise<Object>} - { status, data: { authorization_url, access_code, reference } }
   */
  async initialize({
    email,
    amount, // Amount in kobo (NGN 100 = 10000 kobo)
    reference,
    callback_url,
    metadata = {},
    channels = ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    currency = "NGN",
    split_code,
  }) {
    // Validate required fields
    if (!email) {
      throw new Error("Email is required");
    }

    if (!amount || amount < 10000) {
      // Minimum NGN 100
      throw new Error("Amount must be at least NGN 100 (10000 kobo)");
    }

    // Amount must be in kobo (multiply by 100)
    const amountInKobo = Math.round(amount);

    const payload = {
      email,
      amount: amountInKobo,
      currency,
      channels,
      metadata: {
        ...metadata,
        custom_fields: metadata.custom_fields || [],
      },
    };

    // Optional fields
    if (reference) payload.reference = reference;
    if (callback_url) payload.callback_url = callback_url;
    if (split_code) payload.split_code = split_code;

    return await this.makeRequest("/transaction/initialize", "POST", payload);
  }

  /**
   * Verify a transaction
   * @param {string} reference - Transaction reference
   * @returns {Promise<Object>} - Verification result
   */
  async verify(reference) {
    if (!reference) {
      throw new Error("Transaction reference is required");
    }

    try {
      const result = await this.makeRequest(`/transaction/verify/${reference}`);

      // Extract critical verification data
      const { data } = result;

      return {
        status: result.status,
        message: result.message,
        transaction: {
          id: data.id,
          status: data.status,
          reference: data.reference,
          amount: data.amount,
          currency: data.currency,
          paid_at: data.paid_at,
          channel: data.channel,
          customer: data.customer,
          metadata: data.metadata,
          authorization: data.authorization,
        },
      };
    } catch (error) {
      console.error("Transaction verification failed:", error);
      throw error;
    }
  }

  /**
   * Fetch transaction details
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>}
   */
  async fetch(id) {
    if (!id) {
      throw new Error("Transaction ID is required");
    }

    return await this.makeRequest(`/transaction/${id}`);
  }

  /**
   * Charge authorization (for recurring payments)
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async chargeAuthorization({
    authorization_code,
    email,
    amount,
    reference,
    metadata = {},
  }) {
    if (!authorization_code || !email || !amount) {
      throw new Error(
        "Authorization code, email, and amount are required for charging",
      );
    }

    const payload = {
      authorization_code,
      email,
      amount: Math.round(amount), // Ensure kobo
      metadata,
    };

    if (reference) payload.reference = reference;

    return await this.makeRequest(
      "/transaction/charge_authorization",
      "POST",
      payload,
    );
  }

  /**
   * List transactions with filters
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async list({
    perPage = 50,
    page = 1,
    customer,
    status,
    from,
    to,
    amount,
  } = {}) {
    const params = new URLSearchParams({
      perPage: String(perPage),
      page: String(page),
    });

    if (customer) params.append("customer", customer);
    if (status) params.append("status", status);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (amount) params.append("amount", amount);

    return await this.makeRequest(`/transaction?${params.toString()}`);
  }

  /**
   * Check authorization before charging
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async checkAuthorization({ authorization_code, email, amount }) {
    const payload = {
      authorization_code,
      email,
      amount: Math.round(amount),
    };

    return await this.makeRequest(
      "/transaction/check_authorization",
      "POST",
      payload,
    );
  }
}

export const paystackTransaction = new PaystackTransactionService();
