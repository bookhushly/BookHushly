import crypto from "crypto";
import { PAYSTACK_EVENTS } from "../constants/paystack-events";

/**
 * Paystack Webhook Service
 * Handles webhook verification and event processing
 */
export class PaystackWebhookService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!this.secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not defined");
    }
  }

  /**
   * Verify webhook signature
   * @param {string} signature - x-paystack-signature header
   * @param {string} body - Raw request body
   * @returns {boolean}
   */
  verifySignature(signature, body) {
    if (!signature) {
      throw new Error("No signature provided");
    }

    const hash = crypto
      .createHmac("sha512", this.secretKey)
      .update(body)
      .digest("hex");

    return hash === signature;
  }

  /**
   * Verify webhook IP (additional security layer)
   * @param {string} ip - Request IP address
   * @returns {boolean}
   */
  verifyIP(ip) {
    // Paystack webhook IPs (same for test and live)
    const allowedIPs = ["52.31.139.75", "52.49.173.169", "52.214.14.220"];

    return allowedIPs.includes(ip);
  }

  /**
   * Parse webhook event
   * @param {Object} payload - Webhook payload
   * @returns {Object} - Parsed event data
   */
  parseEvent(payload) {
    const { event, data } = payload;

    return {
      event,
      data,
      isSuccessful: event === PAYSTACK_EVENTS.CHARGE_SUCCESS,
      reference: data?.reference,
      amount: data?.amount,
      customer: data?.customer,
      status: data?.status,
      metadata: data?.metadata,
    };
  }

  /**
   * Handle charge.success event
   * @param {Object} data - Event data
   * @returns {Promise<Object>}
   */
  async handleChargeSuccess(data) {
    console.log("Processing charge.success event:", {
      reference: data.reference,
      amount: data.amount,
      customer: data.customer?.email,
    });

    // Return structured data for database update
    return {
      reference: data.reference,
      transaction_id: data.id,
      amount: data.amount,
      currency: data.currency,
      channel: data.channel,
      status: "success",
      paid_at: data.paid_at,
      customer_email: data.customer?.email,
      customer_code: data.customer?.customer_code,
      metadata: data.metadata,
      authorization: data.authorization,
    };
  }

  /**
   * Handle charge.failed event
   * @param {Object} data - Event data
   * @returns {Promise<Object>}
   */
  async handleChargeFailed(data) {
    console.log("Processing charge.failed event:", {
      reference: data.reference,
      message: data.gateway_response,
    });

    return {
      reference: data.reference,
      transaction_id: data.id,
      status: "failed",
      failed_at: new Date().toISOString(),
      failure_reason: data.gateway_response,
      customer_email: data.customer?.email,
      metadata: data.metadata,
    };
  }

  /**
   * Handle transfer.success event
   * @param {Object} data - Event data
   * @returns {Promise<Object>}
   */
  async handleTransferSuccess(data) {
    console.log("Processing transfer.success event:", {
      reference: data.reference,
      amount: data.amount,
    });

    return {
      reference: data.reference,
      transfer_id: data.id,
      amount: data.amount,
      status: "success",
      completed_at: data.transferred_at,
      recipient: data.recipient,
      metadata: data.metadata,
    };
  }

  /**
   * Process webhook event
   * @param {Object} payload - Webhook payload
   * @returns {Promise<Object>}
   */
  async processEvent(payload) {
    const { event, data } = payload;

    switch (event) {
      case PAYSTACK_EVENTS.CHARGE_SUCCESS:
        return await this.handleChargeSuccess(data);

      case PAYSTACK_EVENTS.CHARGE_FAILED:
        return await this.handleChargeFailed(data);

      case PAYSTACK_EVENTS.TRANSFER_SUCCESS:
        return await this.handleTransferSuccess(data);

      case PAYSTACK_EVENTS.TRANSFER_FAILED:
      case PAYSTACK_EVENTS.TRANSFER_REVERSED:
        console.log(`Processing ${event} event:`, data.reference);
        return { event, reference: data.reference, status: event };

      default:
        console.log(`Unhandled event type: ${event}`);
        return { event, unhandled: true };
    }
  }
}

export const paystackWebhook = new PaystackWebhookService();
