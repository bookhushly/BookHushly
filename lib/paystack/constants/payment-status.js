/**
 * Unified Payment Status Constants
 * Supports both Paystack and NOWPayments
 */

/**
 * Normalized Payment Status (used in our application)
 * These are the statuses we use internally
 */
export const PAYMENT_STATUS = {
  // Initial state
  PENDING: "pending",

  // Success states (normalized)
  SUCCESS: "completed", // We normalize both Paystack 'success' and NOWPayments 'finished' to 'completed'
  COMPLETED: "completed",

  // Failure states
  FAILED: "failed",
  ABANDONED: "abandoned",
  EXPIRED: "expired",

  // In-progress states
  ONGOING: "ongoing",
  QUEUED: "queued",

  // Crypto-specific in-progress states
  WAITING: "waiting", // Customer hasn't sent crypto yet
  CONFIRMING: "confirming", // Transaction on blockchain, accumulating confirmations
  CONFIRMED: "confirmed", // Blockchain confirmed
  SENDING: "sending", // Sending to merchant wallet

  // Special states
  PARTIALLY_PAID: "partially_paid", // Crypto: Customer sent less than required
  REVERSED: "reversed", // Payment reversed
  REFUNDED: "refunded", // Payment refunded to customer
};

/**
 * Paystack Transaction Status
 * These are the exact statuses returned by Paystack API
 */
export const PAYSTACK_STATUS = {
  SUCCESS: "success", // Maps to PAYMENT_STATUS.COMPLETED
  FAILED: "failed",
  ABANDONED: "abandoned",
  REVERSED: "reversed",
  ONGOING: "ongoing",
  PENDING: "pending",
  QUEUED: "queued",
};

/**
 * NOWPayments Transaction Status
 * These are the exact statuses returned by NOWPayments API
 */
export const NOWPAYMENTS_STATUS = {
  WAITING: "waiting", // Customer hasn't sent crypto
  CONFIRMING: "confirming", // Accumulating blockchain confirmations
  CONFIRMED: "confirmed", // Blockchain confirmed
  SENDING: "sending", // Sending to merchant wallet
  FINISHED: "finished", // Complete - Maps to PAYMENT_STATUS.COMPLETED
  PARTIALLY_PAID: "partially_paid", // Customer sent less than required
  FAILED: "failed",
  EXPIRED: "expired",
  REFUNDED: "refunded",
};

/**
 * Status Categories for filtering and logic
 */
export const STATUS_CATEGORIES = {
  // Successful payment states
  SUCCESS: ["completed", "success", "finished"],

  // In-progress states (payment being processed)
  IN_PROGRESS: [
    "pending",
    "waiting",
    "confirming",
    "confirmed",
    "sending",
    "ongoing",
    "queued",
  ],

  // Failed states (payment failed or cancelled)
  FAILED: ["failed", "abandoned", "expired"],

  // Reversible states (can be refunded/reversed)
  REVERSIBLE: ["completed", "success", "finished"],

  // Final states (no further action needed)
  FINAL: [
    "completed",
    "success",
    "finished",
    "failed",
    "abandoned",
    "expired",
    "refunded",
    "reversed",
  ],

  // Pending blockchain confirmation (crypto-specific)
  PENDING_BLOCKCHAIN: ["waiting", "confirming", "sending"],
};

/**
 * Payment Channels (Paystack)
 */
export const PAYMENT_CHANNELS = {
  CARD: "card",
  BANK: "bank",
  USSD: "ussd",
  QR: "qr",
  MOBILE_MONEY: "mobile_money",
  BANK_TRANSFER: "bank_transfer",
  EFT: "eft",
  PAYATTITUDE: "payattitude",
  APPLE_PAY: "apple_pay",
};

/**
 * Payment Providers
 */
export const PAYMENT_PROVIDERS = {
  PAYSTACK: "paystack",
  NOWPAYMENTS: "nowpayments",
  CRYPTO: "crypto", // Alias for nowpayments
};

/**
 * Helper function to normalize status across providers
 * @param {string} status - Raw status from provider
 * @param {string} provider - Payment provider
 * @returns {string} - Normalized status
 */
export function normalizePaymentStatus(status, provider = "paystack") {
  if (!status) return PAYMENT_STATUS.PENDING;

  const statusLower = status.toLowerCase();

  // Normalize success statuses
  if (statusLower === "success" || statusLower === "finished") {
    return PAYMENT_STATUS.COMPLETED;
  }

  // Return as-is for other statuses (they're already normalized)
  return statusLower;
}

/**
 * Helper function to check if payment is successful
 * @param {string} status - Payment status
 * @returns {boolean}
 */
export function isPaymentSuccessful(status) {
  return STATUS_CATEGORIES.SUCCESS.includes(status?.toLowerCase());
}

/**
 * Helper function to check if payment is in progress
 * @param {string} status - Payment status
 * @returns {boolean}
 */
export function isPaymentInProgress(status) {
  return STATUS_CATEGORIES.IN_PROGRESS.includes(status?.toLowerCase());
}

/**
 * Helper function to check if payment has failed
 * @param {string} status - Payment status
 * @returns {boolean}
 */
export function isPaymentFailed(status) {
  return STATUS_CATEGORIES.FAILED.includes(status?.toLowerCase());
}

/**
 * Helper function to check if payment is final (no further updates expected)
 * @param {string} status - Payment status
 * @returns {boolean}
 */
export function isPaymentFinal(status) {
  return STATUS_CATEGORIES.FINAL.includes(status?.toLowerCase());
}

/**
 * Helper function to check if crypto payment is pending blockchain confirmation
 * @param {string} status - Payment status
 * @returns {boolean}
 */
export function isPendingBlockchainConfirmation(status) {
  return STATUS_CATEGORIES.PENDING_BLOCKCHAIN.includes(status?.toLowerCase());
}

/**
 * Get human-readable status display
 * @param {string} status - Payment status
 * @returns {string} - Display text
 */
export function getStatusDisplay(status) {
  const displays = {
    pending: "Pending",
    completed: "Completed",
    success: "Success",
    failed: "Failed",
    abandoned: "Abandoned",
    reversed: "Reversed",
    queued: "Queued",
    ongoing: "Processing",
    waiting: "Waiting for Payment",
    confirming: "Confirming on Blockchain",
    confirmed: "Confirmed",
    sending: "Sending to Wallet",
    finished: "Completed",
    partially_paid: "Partially Paid",
    expired: "Expired",
    refunded: "Refunded",
  };

  return displays[status?.toLowerCase()] || status;
}

/**
 * Get status color for UI
 * @param {string} status - Payment status
 * @returns {string} - Tailwind color class
 */
export function getStatusColor(status) {
  if (isPaymentSuccessful(status)) return "green";
  if (isPaymentFailed(status)) return "red";
  if (isPaymentInProgress(status)) return "orange";
  return "gray";
}
