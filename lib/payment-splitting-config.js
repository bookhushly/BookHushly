// lib/payment-splitting-config.js
// Configuration for payment splitting logic

export const SPLIT_CONFIG = {
  // Default split percentages
  VENDOR_PERCENTAGE: 85, // 85% to vendor
  ADMIN_PERCENTAGE: 15, // 15% to admin

  // Minimum amounts for transfers
  MIN_TRANSFER_AMOUNT: {
    NGN: 100, // Minimum 100 Naira
    USD: 1, // Minimum 1 USD
    BTC: 0.00001, // Minimum BTC amount
    ETH: 0.001, // Minimum ETH amount
    USDT: 1, // Minimum USDT amount
  },

  // Currency preferences
  VENDOR_PREFERRED_CURRENCY: "NGN", // Always send to vendor in Naira
  ADMIN_CURRENCY_PREFERENCE: {
    // Admin receives in same currency as payment when possible
    PAYSTACK: "NGN", // Paystack payments -> Admin gets NGN
    CRYPTO: "CRYPTO", // Crypto payments -> Admin gets same crypto
  },

  // Transfer providers configuration
  TRANSFER_PROVIDERS: {
    NGN: {
      provider: "paystack",
      method: "transfer",
      fee_bearer: "admin", // Admin bears transfer fees
    },
    CRYPTO: {
      provider: "nowpayments",
      method: "payout",
      fee_bearer: "admin",
    },
  },

  // Exchange rate settings
  EXCHANGE_RATE: {
    provider: "exchangerate_host", // Primary provider
    fallback_provider: "coinapi", // Fallback provider
    cache_duration: 300, // 5 minutes cache
    max_age: 900, // 15 minutes max age for rates
  },

  // Processing delays (in seconds)
  PROCESSING_DELAYS: {
    immediate: 0, // Process immediately for small amounts
    delayed: 300, // 5 minutes delay for larger amounts
    scheduled: 3600, // 1 hour delay for very large amounts
  },

  // Amount thresholds for processing delays
  AMOUNT_THRESHOLDS: {
    small: 50000, // < 50k NGN - immediate
    medium: 500000, // < 500k NGN - delayed
    large: 5000000, // >= 5M NGN - scheduled
  },

  // Retry configuration
  RETRY_CONFIG: {
    max_attempts: 3,
    retry_delays: [60, 300, 900], // 1min, 5min, 15min
    exponential_backoff: true,
  },

  // Notification settings
  NOTIFICATIONS: {
    vendor: {
      success: true,
      failure: true,
      methods: ["email"],
    },
    admin: {
      success: true,
      failure: true,
      large_amounts: true, // Notify for large amounts
      methods: ["email", "slack"],
    },
  },
};

// Validation functions
export const validateSplitConfig = () => {
  const totalPercentage =
    SPLIT_CONFIG.VENDOR_PERCENTAGE + SPLIT_CONFIG.ADMIN_PERCENTAGE;
  if (totalPercentage !== 100) {
    throw new Error(
      `Invalid split configuration: Total percentage is ${totalPercentage}%, must be 100%`
    );
  }
  return true;
};

// Helper functions for split calculations
export const calculateSplitAmounts = (totalAmount, currency = "NGN") => {
  const vendorAmount = (totalAmount * SPLIT_CONFIG.VENDOR_PERCENTAGE) / 100;
  const adminAmount = (totalAmount * SPLIT_CONFIG.ADMIN_PERCENTAGE) / 100;

  return {
    vendor: {
      amount: parseFloat(vendorAmount.toFixed(2)),
      currency: SPLIT_CONFIG.VENDOR_PREFERRED_CURRENCY,
      percentage: SPLIT_CONFIG.VENDOR_PERCENTAGE,
    },
    admin: {
      amount: parseFloat(adminAmount.toFixed(2)),
      currency: currency, // Admin gets same currency as payment
      percentage: SPLIT_CONFIG.ADMIN_PERCENTAGE,
    },
    total: totalAmount,
    original_currency: currency,
  };
};

// Get processing delay based on amount
export const getProcessingDelay = (amount, currency = "NGN") => {
  // Convert to NGN for threshold comparison if needed
  let amountInNGN = amount;
  if (currency !== "NGN") {
    // This would need actual exchange rate conversion
    // For now, assuming 1:1 for simplicity
    amountInNGN = amount;
  }

  if (amountInNGN < SPLIT_CONFIG.AMOUNT_THRESHOLDS.small) {
    return SPLIT_CONFIG.PROCESSING_DELAYS.immediate;
  } else if (amountInNGN < SPLIT_CONFIG.AMOUNT_THRESHOLDS.medium) {
    return SPLIT_CONFIG.PROCESSING_DELAYS.delayed;
  } else {
    return SPLIT_CONFIG.PROCESSING_DELAYS.scheduled;
  }
};

// Check if amount meets minimum transfer requirements
export const meetsMinimumTransfer = (amount, currency) => {
  const minAmount = SPLIT_CONFIG.MIN_TRANSFER_AMOUNT[currency] || 0;
  return amount >= minAmount;
};

// Get transfer provider for currency
export const getTransferProvider = (currency) => {
  if (currency === "NGN") {
    return SPLIT_CONFIG.TRANSFER_PROVIDERS.NGN;
  } else {
    return SPLIT_CONFIG.TRANSFER_PROVIDERS.CRYPTO;
  }
};
