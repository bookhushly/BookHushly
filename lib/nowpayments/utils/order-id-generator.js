/**
 * Generate unique order ID for NOWPayments
 * @param {string} prefix - Optional prefix (e.g., 'LGS' for logistics, 'SEC' for security)
 * @returns {string}
 */
export function generateOrderId(prefix = "BKH") {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generate purchase ID (can be same as order ID or different)
 * @param {string} requestId - Request UUID
 * @returns {string}
 */
export function generatePurchaseId(requestId) {
  // Use the request ID as purchase ID for easy lookup
  return requestId;
}

/**
 * Validate order ID format
 * @param {string} orderId
 * @returns {boolean}
 */
export function validateOrderId(orderId) {
  if (!orderId || typeof orderId !== "string") {
    return false;
  }

  // Should be in format: PREFIX_TIMESTAMP_RANDOM
  const parts = orderId.split("_");
  return parts.length === 3;
}

/**
 * Parse order ID
 * @param {string} orderId
 * @returns {Object}
 */
export function parseOrderId(orderId) {
  const parts = orderId.split("_");

  return {
    prefix: parts[0] || null,
    timestamp: parts[1] ? parseInt(parts[1]) : null,
    random: parts[2] || null,
    date: parts[1] ? new Date(parseInt(parts[1])) : null,
  };
}
