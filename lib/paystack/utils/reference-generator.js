/**
 * Generate unique transaction reference
 * @param {string} prefix - Optional prefix (e.g., 'LGS' for logistics, 'SEC' for security)
 * @returns {string}
 */
export function generateReference(prefix = "BKH") {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Validate transaction reference format
 * @param {string} reference
 * @returns {boolean}
 */
export function validateReference(reference) {
  if (!reference || typeof reference !== "string") {
    return false;
  }

  // Only -, ., = and alphanumeric characters allowed
  const validPattern = /^[a-zA-Z0-9\-\.=_]+$/;
  return validPattern.test(reference);
}

/**
 * Extract metadata from reference
 * @param {string} reference
 * @returns {Object}
 */
export function parseReference(reference) {
  const parts = reference.split("_");

  return {
    prefix: parts[0] || null,
    timestamp: parts[1] ? parseInt(parts[1]) : null,
    random: parts[2] || null,
    date: parts[1] ? new Date(parseInt(parts[1])) : null,
  };
}
