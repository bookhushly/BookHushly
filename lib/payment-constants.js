/**
 * Unified Payment Status Constants
 * Imports and combines Paystack and NOWPayments constants
 */

import { PAYMENT_STATUS as PAYSTACK_PAYMENT_STATUS } from "@/lib/paystack/constants/payment-status";
import {
  NOWPAYMENTS_PAYMENT_STATUS,
  IN_PROGRESS_STATUSES as CRYPTO_IN_PROGRESS,
  COMPLETED_STATUSES as CRYPTO_COMPLETED,
  FAILED_STATUSES as CRYPTO_FAILED,
  POPULAR_CRYPTOCURRENCIES,
} from "@/lib/nowpayments/constants/payment-status";

/**
 * Re-export existing constants for convenience
 */
export {
  PAYSTACK_PAYMENT_STATUS,
  NOWPAYMENTS_PAYMENT_STATUS,
  POPULAR_CRYPTOCURRENCIES,
};

/**
 * Unified Status Categories
 * Combines both Paystack and NOWPayments statuses into logical categories
 */
export const STATUS_CATEGORIES = {
  // Successful payment states (from both providers)
  SUCCESS: [
    PAYSTACK_PAYMENT_STATUS.SUCCESS, // "completed"
    NOWPAYMENTS_PAYMENT_STATUS.FINISHED, // "finished"
    // Also accept these as success
    "success", // Raw Paystack status
    "completed", // Normalized status
    "finished", // Raw NOWPayments status
  ],

  // In-progress states (payment being processed)
  IN_PROGRESS: [
    PAYSTACK_PAYMENT_STATUS.PENDING, // "pending"
    PAYSTACK_PAYMENT_STATUS.ONGOING, // "ongoing"
    PAYSTACK_PAYMENT_STATUS.QUEUED, // "queued"
    ...CRYPTO_IN_PROGRESS, // "waiting", "confirming", "confirmed", "sending"
  ],

  // Failed states (payment failed or cancelled)
  FAILED: [
    PAYSTACK_PAYMENT_STATUS.FAILED, // "failed"
    PAYSTACK_PAYMENT_STATUS.ABANDONED, // "abandoned"
    ...CRYPTO_FAILED, // "failed", "expired", "refunded"
  ],

  // Reversed/Refunded states
  REVERSED: [
    PAYSTACK_PAYMENT_STATUS.REVERSED, // "reversed"
    NOWPAYMENTS_PAYMENT_STATUS.REFUNDED, // "refunded"
  ],

  // Final states (no further action needed)
  FINAL: [
    PAYSTACK_PAYMENT_STATUS.SUCCESS, // "completed"
    PAYSTACK_PAYMENT_STATUS.FAILED, // "failed"
    PAYSTACK_PAYMENT_STATUS.ABANDONED, // "abandoned"
    PAYSTACK_PAYMENT_STATUS.REVERSED, // "reversed"
    NOWPAYMENTS_PAYMENT_STATUS.FINISHED, // "finished"
    NOWPAYMENTS_PAYMENT_STATUS.FAILED, // "failed"
    NOWPAYMENTS_PAYMENT_STATUS.EXPIRED, // "expired"
    NOWPAYMENTS_PAYMENT_STATUS.REFUNDED, // "refunded"
    // Also accept raw statuses
    "completed",
    "success",
    "finished",
    "failed",
    "abandoned",
    "expired",
    "reversed",
    "refunded",
  ],

  // Pending blockchain confirmation (crypto-specific)
  PENDING_BLOCKCHAIN: [
    NOWPAYMENTS_PAYMENT_STATUS.WAITING, // "waiting"
    NOWPAYMENTS_PAYMENT_STATUS.CONFIRMING, // "confirming"
    NOWPAYMENTS_PAYMENT_STATUS.SENDING, // "sending"
  ],

  // Partially paid (crypto-specific edge case)
  PARTIALLY_PAID: [
    NOWPAYMENTS_PAYMENT_STATUS.PARTIALLY_PAID, // "partially_paid"
  ],
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
 * Converts provider-specific statuses to our normalized format
 * @param {string} status - Raw status from provider
 * @param {string} provider - Payment provider
 * @returns {string} - Normalized status
 */
export function normalizePaymentStatus(status, provider = "paystack") {
  if (!status) return PAYSTACK_PAYMENT_STATUS.PENDING;

  const statusLower = status.toLowerCase();

  // Normalize Paystack "success" to "completed"
  if (statusLower === "success" && provider === "paystack") {
    return PAYSTACK_PAYMENT_STATUS.SUCCESS; // "completed"
  }

  // For NOWPayments, keep original status
  // They use descriptive statuses like "waiting", "confirming", "finished"
  return statusLower;
}

/**
 * Helper function to check if payment is successful
 * @param {string} status - Payment status
 * @returns {boolean}
 */
export function isPaymentSuccessful(status) {
  if (!status) return false;
  return STATUS_CATEGORIES.SUCCESS.includes(status.toLowerCase());
}

/**
 * Helper function to check if payment is in progress
 * @param {string} status - Payment status
 * @returns {boolean}
 */
export function isPaymentInProgress(status) {
  if (!status) return false;
  return STATUS_CATEGORIES.IN_PROGRESS.includes(status.toLowerCase());
}

/**
 * Helper function to check if payment has failed
 * @param {string} status - Payment status
 * @returns {boolean}
 */
export function isPaymentFailed(status) {
  if (!status) return false;
  return STATUS_CATEGORIES.FAILED.includes(status.toLowerCase());
}

/**
 * Helper function to check if payment is final (no further updates expected)
 * @param {string} status - Payment status
 * @returns {boolean}
 */
export function isPaymentFinal(status) {
  if (!status) return false;
  return STATUS_CATEGORIES.FINAL.includes(status.toLowerCase());
}

/**
 * Helper function to check if crypto payment is pending blockchain confirmation
 * @param {string} status - Payment status
 * @returns {boolean}
 */
export function isPendingBlockchainConfirmation(status) {
  if (!status) return false;
  return STATUS_CATEGORIES.PENDING_BLOCKCHAIN.includes(status.toLowerCase());
}

/**
 * Get human-readable status display
 * @param {string} status - Payment status
 * @param {string} provider - Payment provider
 * @returns {string} - Display text
 */
export function getStatusDisplay(status, provider = "paystack") {
  if (!status) return "Unknown";

  const statusLower = status.toLowerCase();

  const displays = {
    // Paystack statuses
    pending: "Pending",
    completed: "Completed",
    success: "Success",
    failed: "Failed",
    abandoned: "Abandoned",
    reversed: "Reversed",
    queued: "Queued",
    ongoing: "Processing",

    // NOWPayments/Crypto statuses
    waiting: "Waiting for Payment",
    confirming: "Confirming on Blockchain",
    confirmed: "Confirmed",
    sending: "Sending to Wallet",
    finished: "Completed",
    partially_paid: "Partially Paid",
    expired: "Expired",
    refunded: "Refunded",
  };

  return displays[statusLower] || status;
}

/**
 * Get status color for UI
 * @param {string} status - Payment status
 * @returns {string} - Color name (for Tailwind classes)
 */
export function getStatusColor(status) {
  if (!status) return "gray";

  if (isPaymentSuccessful(status)) return "green";
  if (isPaymentFailed(status)) return "red";
  if (isPaymentInProgress(status)) return "orange";
  if (STATUS_CATEGORIES.REVERSED.includes(status.toLowerCase()))
    return "purple";

  return "gray";
}

/**
 * Get status badge variant for UI
 * @param {string} status - Payment status
 * @returns {object} - Badge styling object
 */
export function getStatusBadge(status) {
  const color = getStatusColor(status);
  const display = getStatusDisplay(status);

  return {
    text: display,
    color: color,
    bgClass: `bg-${color}-50`,
    textClass: `text-${color}-700`,
    borderClass: `border-${color}-200`,
  };
}
