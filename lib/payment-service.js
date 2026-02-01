/**
 * Unified Payment Service
 * Handles both Paystack and NOWPayments in a single interface
 */

import { paystackTransaction } from "./paystack/services/paystack-transaction";
import { nowpaymentsTransaction } from "./nowpayments/services/nowpayments-transaction";
import { generateReference } from "./paystack/utils/reference-generator";
import { generateOrderId } from "./nowpayments/utils/order-id-generator";

export class UnifiedPaymentService {
  /**
   * Initialize payment with either Paystack or NOWPayments
   * @param {Object} params - Payment parameters
   * @returns {Promise<Object>}
   */
  async initializePayment({
    provider, // 'paystack' or 'crypto'
    amount,
    currency = "NGN",
    email,
    reference,
    payCurrency, // For crypto: 'btc', 'eth', etc.
    callbackUrl,
    metadata = {},
  }) {
    if (provider === "paystack") {
      return await this.initializePaystack({
        amount,
        currency,
        email,
        reference,
        callbackUrl,
        metadata,
      });
    } else if (provider === "crypto" || provider === "nowpayments") {
      return await this.initializeCrypto({
        amount,
        currency,
        payCurrency,
        email,
        reference,
        callbackUrl,
        metadata,
      });
    } else {
      throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }

  /**
   * Initialize Paystack payment
   */
  async initializePaystack({
    amount,
    currency,
    email,
    reference,
    callbackUrl,
    metadata,
  }) {
    // Amount should be in kobo for Paystack
    const amountInKobo = Math.round(amount * 100);

    const result = await paystackTransaction.initialize({
      email,
      amount: amountInKobo,
      reference: reference || generateReference(),
      callback_url: callbackUrl,
      metadata,
      currency: currency.toUpperCase(),
    });

    return {
      provider: "paystack",
      success: result.status,
      reference: result.data.reference,
      authorization_url: result.data.authorization_url,
      access_code: result.data.access_code,
      amount: amount,
      currency: currency.toUpperCase(),
    };
  }

  /**
   * Initialize NOWPayments crypto payment
   */
  async initializeCrypto({
    amount,
    currency,
    payCurrency,
    email,
    reference,
    callbackUrl,
    metadata,
  }) {
    if (!payCurrency) {
      throw new Error("payCurrency is required for crypto payments");
    }

    const orderId = reference || generateOrderId();

    // Create invoice
    const result = await nowpaymentsTransaction.createInvoice({
      price_amount: amount,
      price_currency: currency.toLowerCase(),
      order_id: orderId,
      order_description: metadata.description || "Payment",
      ipn_callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/webhook/crypto`,
      success_url:
        callbackUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`,
      is_fee_paid_by_user: true,
      is_fixed_rate: true,
    });

    return {
      provider: "crypto",
      success: true,
      reference: orderId,
      order_id: orderId,
      invoice_id: result.id,
      invoice_url: result.invoice_url,
      amount: amount,
      currency: currency.toUpperCase(),
      pay_currency: payCurrency.toUpperCase(),
    };
  }

  /**
   * Verify payment (works for both providers)
   * @param {string} reference - Payment reference or order_id
   * @param {string} provider - 'paystack' or 'crypto'
   * @returns {Promise<Object>}
   */
  async verifyPayment(reference, provider) {
    if (provider === "paystack") {
      return await this.verifyPaystack(reference);
    } else if (provider === "crypto" || provider === "nowpayments") {
      return await this.verifyCrypto(reference);
    } else {
      throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }

  /**
   * Verify Paystack payment
   */
  async verifyPaystack(reference) {
    const result = await paystackTransaction.verify(reference);

    return {
      provider: "paystack",
      verified: result.transaction.status === "success",
      reference: result.transaction.reference,
      amount: result.transaction.amount / 100, // Convert from kobo
      currency: result.transaction.currency,
      status: result.transaction.status,
      paid_at: result.transaction.paid_at,
      channel: result.transaction.channel,
      transaction: result.transaction,
    };
  }

  /**
   * Verify NOWPayments crypto payment
   */
  async verifyCrypto(paymentId) {
    const result = await nowpaymentsTransaction.getPaymentStatus(paymentId);

    return {
      provider: "crypto",
      verified: result.payment_status === "finished",
      payment_id: result.payment_id,
      order_id: result.order_id,
      status: result.payment_status,
      price_amount: result.price_amount,
      price_currency: result.price_currency,
      pay_amount: result.pay_amount,
      actually_paid: result.actually_paid,
      pay_currency: result.pay_currency,
      payment: result,
    };
  }

  /**
   * Get payment status
   * @param {string} reference - Payment reference
   * @param {string} provider - Payment provider
   * @returns {Promise<string>}
   */
  async getPaymentStatus(reference, provider) {
    try {
      const verification = await this.verifyPayment(reference, provider);
      return verification.status;
    } catch (error) {
      console.error("Failed to get payment status:", error);
      return "unknown";
    }
  }

  /**
   * Format amount for display
   * @param {number} amount
   * @param {string} currency
   * @returns {string}
   */
  formatAmount(amount, currency) {
    const symbols = {
      NGN: "₦",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };

    const symbol = symbols[currency.toUpperCase()] || currency.toUpperCase();
    const formatted = parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${symbol}${formatted}`;
  }

  /**
   * Get available payment methods
   * @param {string} currency - Currency code
   * @returns {Array}
   */
  getAvailablePaymentMethods(currency = "NGN") {
    const methods = [];

    // Paystack available for NGN, GHS, USD, ZAR
    if (["NGN", "GHS", "USD", "ZAR"].includes(currency.toUpperCase())) {
      methods.push({
        id: "paystack",
        name: "Card / Bank Transfer",
        provider: "paystack",
        description: "Pay with debit card, bank transfer, or USSD",
        currencies: ["NGN", "GHS", "USD", "ZAR"],
        icon: "credit-card",
      });
    }

    // Crypto available for all currencies
    methods.push({
      id: "crypto",
      name: "Cryptocurrency",
      provider: "crypto",
      description:
        "Pay with Bitcoin, Ethereum, USDT, and 300+ cryptocurrencies",
      currencies: ["USD", "EUR", "NGN", "GBP"],
      icon: "bitcoin",
      popular: ["BTC", "ETH", "USDT", "USDC", "TRX"],
    });

    return methods;
  }
}

export const unifiedPayment = new UnifiedPaymentService();
