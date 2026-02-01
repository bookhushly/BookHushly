/**
 * NOWPayments Transaction Service
 * Handles cryptocurrency payment creation, estimation, and status tracking
 */

const NOWPAYMENTS_BASE_URL = "https://api.nowpayments.io/v1";
const NOWPAYMENTS_SANDBOX_URL = "https://api-sandbox.nowpayments.io/v1";

export class NOWPaymentsTransactionService {
  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY;
    this.isSandbox = process.env.NOWPAYMENTS_SANDBOX === "true";
    this.baseURL = this.isSandbox
      ? NOWPAYMENTS_SANDBOX_URL
      : NOWPAYMENTS_BASE_URL;

    if (!this.apiKey) {
      throw new Error("NOWPAYMENTS_API_KEY is not defined");
    }
  }

  /**
   * Make authenticated request to NOWPayments API
   */
  async makeRequest(endpoint, method = "GET", data = null) {
    const options = {
      method,
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `NOWPayments API error: ${response.status}`,
        );
      }

      return result;
    } catch (error) {
      console.error("NOWPayments API Request Failed:", error);
      throw error;
    }
  }

  /**
   * Check API status
   * @returns {Promise<Object>}
   */
  async getStatus() {
    return await this.makeRequest("/status");
  }

  /**
   * Get available currencies
   * @returns {Promise<Array>}
   */
  async getAvailableCurrencies() {
    const result = await this.makeRequest("/currencies");
    return result.currencies || [];
  }

  /**
   * Get estimate price
   * @param {number} amount - Amount in fiat currency
   * @param {string} currencyFrom - Currency to convert from (e.g., 'usd')
   * @param {string} currencyTo - Currency to convert to (e.g., 'btc')
   * @returns {Promise<Object>}
   */
  async getEstimatePrice(amount, currencyFrom = "usd", currencyTo = "btc") {
    const params = new URLSearchParams({
      amount: String(amount),
      currency_from: currencyFrom.toLowerCase(),
      currency_to: currencyTo.toLowerCase(),
    });

    return await this.makeRequest(`/estimate?${params.toString()}`);
  }

  /**
   * Get minimum payment amount
   * @param {string} currencyFrom - Payment currency
   * @param {string} currencyTo - Payout currency (optional)
   * @returns {Promise<Object>}
   */
  async getMinimumAmount(currencyFrom, currencyTo = null) {
    const params = new URLSearchParams({
      currency_from: currencyFrom.toLowerCase(),
    });

    if (currencyTo) {
      params.append("currency_to", currencyTo.toLowerCase());
    }

    return await this.makeRequest(`/min-amount?${params.toString()}`);
  }

  /**
   * Create payment
   * @param {Object} params - Payment parameters
   * @returns {Promise<Object>}
   */
  async createPayment({
    price_amount,
    price_currency,
    pay_currency,
    ipn_callback_url,
    order_id,
    order_description,
    purchase_id,
    payout_address,
    payout_currency,
    payout_extra_id,
    fixed_rate = true,
    is_fee_paid_by_user = false,
  }) {
    const payload = {
      price_amount,
      price_currency: price_currency.toLowerCase(),
      pay_currency: pay_currency.toLowerCase(),
      ipn_callback_url,
      order_id,
      order_description,
      fixed_rate,
      is_fee_paid_by_user,
    };

    // Optional fields
    if (purchase_id) payload.purchase_id = purchase_id;
    if (payout_address) payload.payout_address = payout_address;
    if (payout_currency)
      payload.payout_currency = payout_currency.toLowerCase();
    if (payout_extra_id) payload.payout_extra_id = payout_extra_id;

    return await this.makeRequest("/payment", "POST", payload);
  }

  /**
   * Create invoice (payment link)
   * @param {Object} params - Invoice parameters
   * @returns {Promise<Object>}
   */
  async createInvoice({
    price_amount,
    price_currency,
    order_id,
    order_description,
    ipn_callback_url,
    success_url,
    cancel_url,
    partially_paid_url,
    payout_currency,
    payout_address,
    is_fee_paid_by_user = false,
    is_fixed_rate = true,
  }) {
    const payload = {
      price_amount,
      price_currency: price_currency.toLowerCase(),
      order_id,
      order_description,
      ipn_callback_url,
      success_url,
      is_fee_paid_by_user,
      is_fixed_rate,
    };

    // Optional fields
    if (cancel_url) payload.cancel_url = cancel_url;
    if (partially_paid_url) payload.partially_paid_url = partially_paid_url;
    if (payout_currency)
      payload.payout_currency = payout_currency.toLowerCase();
    if (payout_address) payload.payout_address = payout_address;

    return await this.makeRequest("/invoice", "POST", payload);
  }

  /**
   * Get payment status
   * @param {string|number} paymentId - Payment ID
   * @returns {Promise<Object>}
   */
  async getPaymentStatus(paymentId) {
    return await this.makeRequest(`/payment/${paymentId}`);
  }

  /**
   * Get list of payments
   * @param {Object} params - Filter parameters
   * @returns {Promise<Object>}
   */
  async listPayments({
    limit = 10,
    page = 0,
    sortBy = "created_at",
    orderBy = "desc",
    dateFrom,
    dateTo,
    paymentStatus,
    payCurrency,
  } = {}) {
    const params = new URLSearchParams({
      limit: String(limit),
      page: String(page),
      sortBy,
      orderBy,
    });

    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    if (paymentStatus) params.append("paymentStatus", paymentStatus);
    if (payCurrency) params.append("payCurrency", payCurrency.toLowerCase());

    return await this.makeRequest(`/payment/?${params.toString()}`);
  }

  /**
   * Get invoice by ID
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>}
   */
  async getInvoice(invoiceId) {
    return await this.makeRequest(`/invoice/${invoiceId}`);
  }
}

export const nowpaymentsTransaction = new NOWPaymentsTransactionService();
