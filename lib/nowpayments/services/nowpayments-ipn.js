import crypto from "crypto";
import { NOWPAYMENTS_PAYMENT_STATUS } from "../constants/payment-status";

/**
 * NOWPayments IPN (Instant Payment Notification) Service
 * Handles webhook verification and event processing
 */
export class NOWPaymentsIPNService {
  constructor() {
    this.ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    if (!this.ipnSecret) {
      throw new Error("NOWPAYMENTS_IPN_SECRET is not defined");
    }
  }

  /**
   * Verify IPN signature using HMAC SHA-512
   * @param {string} signature - x-nowpayments-sig header
   * @param {Object} body - Parsed request body
   * @returns {boolean}
   */
  verifySignature(signature, body) {
    if (!signature) {
      throw new Error("No signature provided");
    }

    // Sort body keys alphabetically
    const sortedBody = this.sortObjectKeys(body);

    // Convert to JSON string without escaping slashes
    const sortedJson = JSON.stringify(
      sortedBody,
      Object.keys(sortedBody).sort(),
    );

    // Calculate HMAC SHA-512
    const hash = crypto
      .createHmac("sha512", this.ipnSecret.trim())
      .update(sortedJson)
      .digest("hex");

    return hash === signature;
  }

  /**
   * Sort object keys recursively
   * @param {Object} obj - Object to sort
   * @returns {Object} - Sorted object
   */
  sortObjectKeys(obj) {
    if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
      return obj;
    }

    const sorted = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = this.sortObjectKeys(obj[key]);
      });

    return sorted;
  }

  /**
   * Parse IPN event
   * @param {Object} payload - IPN payload
   * @returns {Object} - Parsed event data
   */
  parseEvent(payload) {
    return {
      paymentId: payload.payment_id,
      parentPaymentId: payload.parent_payment_id,
      invoiceId: payload.invoice_id,
      status: payload.payment_status,
      payAddress: payload.pay_address,
      priceAmount: payload.price_amount,
      priceCurrency: payload.price_currency,
      payAmount: payload.pay_amount,
      actuallyPaid: payload.actually_paid,
      actuallyPaidAtFiat: payload.actually_paid_at_fiat,
      payCurrency: payload.pay_currency,
      orderId: payload.order_id,
      orderDescription: payload.order_description,
      purchaseId: payload.purchase_id,
      outcomeAmount: payload.outcome_amount,
      outcomeCurrency: payload.outcome_currency,
      fee: payload.fee,
      createdAt: payload.created_at,
      updatedAt: payload.updated_at,
      rawPayload: payload,
    };
  }

  /**
   * Handle finished payment
   * @param {Object} data - Payment data
   * @returns {Promise<Object>}
   */
  async handleFinished(data) {
    console.log("Processing finished payment:", {
      paymentId: data.paymentId,
      amount: data.actuallyPaid,
      currency: data.payCurrency,
    });

    return {
      paymentId: data.paymentId,
      orderId: data.orderId,
      purchaseId: data.purchaseId,
      status: "finished",
      amount: data.actuallyPaid,
      currency: data.payCurrency,
      outcomeAmount: data.outcomeAmount,
      outcomeCurrency: data.outcomeCurrency,
      fee: data.fee,
    };
  }

  /**
   * Handle confirmed payment
   * @param {Object} data - Payment data
   * @returns {Promise<Object>}
   */
  async handleConfirmed(data) {
    console.log("Processing confirmed payment:", {
      paymentId: data.paymentId,
      amount: data.actuallyPaid,
    });

    return {
      paymentId: data.paymentId,
      orderId: data.orderId,
      status: "confirmed",
      amount: data.actuallyPaid,
      currency: data.payCurrency,
    };
  }

  /**
   * Handle partially paid
   * @param {Object} data - Payment data
   * @returns {Promise<Object>}
   */
  async handlePartiallyPaid(data) {
    console.log("Processing partially paid:", {
      paymentId: data.paymentId,
      expected: data.payAmount,
      received: data.actuallyPaid,
    });

    return {
      paymentId: data.paymentId,
      orderId: data.orderId,
      status: "partially_paid",
      expectedAmount: data.payAmount,
      receivedAmount: data.actuallyPaid,
      currency: data.payCurrency,
    };
  }

  /**
   * Handle failed payment
   * @param {Object} data - Payment data
   * @returns {Promise<Object>}
   */
  async handleFailed(data) {
    console.log("Processing failed payment:", {
      paymentId: data.paymentId,
      orderId: data.orderId,
    });

    return {
      paymentId: data.paymentId,
      orderId: data.orderId,
      status: "failed",
    };
  }

  /**
   * Process IPN event
   * @param {Object} payload - IPN payload
   * @returns {Promise<Object>}
   */
  async processEvent(payload) {
    const parsedEvent = this.parseEvent(payload);
    const { status } = parsedEvent;

    switch (status) {
      case NOWPAYMENTS_PAYMENT_STATUS.FINISHED:
        return await this.handleFinished(parsedEvent);

      case NOWPAYMENTS_PAYMENT_STATUS.CONFIRMED:
        return await this.handleConfirmed(parsedEvent);

      case NOWPAYMENTS_PAYMENT_STATUS.PARTIALLY_PAID:
        return await this.handlePartiallyPaid(parsedEvent);

      case NOWPAYMENTS_PAYMENT_STATUS.FAILED:
      case NOWPAYMENTS_PAYMENT_STATUS.EXPIRED:
      case NOWPAYMENTS_PAYMENT_STATUS.REFUNDED:
        return await this.handleFailed(parsedEvent);

      case NOWPAYMENTS_PAYMENT_STATUS.WAITING:
      case NOWPAYMENTS_PAYMENT_STATUS.CONFIRMING:
      case NOWPAYMENTS_PAYMENT_STATUS.SENDING:
        console.log(`Payment in progress: ${status}`, parsedEvent.paymentId);
        return { status, paymentId: parsedEvent.paymentId, inProgress: true };

      default:
        console.log(`Unhandled payment status: ${status}`);
        return { status, paymentId: parsedEvent.paymentId, unhandled: true };
    }
  }
}

export const nowpaymentsIPN = new NOWPaymentsIPNService();
