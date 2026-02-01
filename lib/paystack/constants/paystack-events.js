/**
 * Paystack Webhook Events
 * https://paystack.com/docs/payments/webhooks/#supported-events
 */
export const PAYSTACK_EVENTS = {
  // Charge events
  CHARGE_SUCCESS: "charge.success",
  CHARGE_FAILED: "charge.failed",

  // Transfer events
  TRANSFER_SUCCESS: "transfer.success",
  TRANSFER_FAILED: "transfer.failed",
  TRANSFER_REVERSED: "transfer.reversed",

  // Subscription events
  SUBSCRIPTION_CREATE: "subscription.create",
  SUBSCRIPTION_DISABLE: "subscription.disable",
  SUBSCRIPTION_ENABLE: "subscription.enable",
  SUBSCRIPTION_NOT_RENEW: "subscription.not_renew",

  // Invoice events
  INVOICE_CREATE: "invoice.create",
  INVOICE_UPDATE: "invoice.update",
  INVOICE_PAYMENT_FAILED: "invoice.payment_failed",

  // Customer events
  CUSTOMERIDENTIFICATION_SUCCESS: "customeridentification.success",
  CUSTOMERIDENTIFICATION_FAILED: "customeridentification.failed",

  // Refund events
  REFUND_PENDING: "refund.pending",
  REFUND_PROCESSED: "refund.processed",
  REFUND_FAILED: "refund.failed",

  // Dispute events
  DISPUTE_CREATE: "dispute.create",
  DISPUTE_RESOLVE: "dispute.resolve",
  DISPUTE_MERCHANT_ACCEPTED: "dispute.merchant.accepted",
};
