import crypto from "crypto";

/**
 * Validate Paystack webhook signature
 * @param {string} signature - x-paystack-signature header
 * @param {string} body - Raw request body
 * @param {string} secretKey - Paystack secret key
 * @returns {boolean}
 */
export function validateSignature(signature, body, secretKey) {
  if (!signature || !body || !secretKey) {
    return false;
  }

  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(body)
    .digest("hex");

  return hash === signature;
}

/**
 * Validate Paystack webhook IP addresses
 * @param {string} ip - Request IP address
 * @returns {boolean}
 */
export function validatePaystackIP(ip) {
  const allowedIPs = ["52.31.139.75", "52.49.173.169", "52.214.14.220"];

  return allowedIPs.includes(ip);
}

/**
 * Get client IP from request
 * @param {Object} request - Next.js request object
 * @returns {string|null}
 */
export function getClientIP(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return null;
}
