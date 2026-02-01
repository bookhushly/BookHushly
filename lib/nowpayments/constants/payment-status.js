/**
 * NOWPayments Payment Status Constants
 * https://documenter.getpostman.com/view/7907941/S1a32n38
 */

export const NOWPAYMENTS_PAYMENT_STATUS = {
  // Initial state - waiting for customer to send crypto
  WAITING: "waiting",

  // Transaction detected on blockchain, accumulating confirmations
  CONFIRMING: "confirming",

  // Transaction confirmed by blockchain (enough confirmations)
  CONFIRMED: "confirmed",

  // Payment is being sent to merchant's wallet
  SENDING: "sending",

  // Customer sent less than required amount
  PARTIALLY_PAID: "partially_paid",

  // Payment successfully completed and sent to merchant
  FINISHED: "finished",

  // Payment failed
  FAILED: "failed",

  // Payment refunded to customer
  REFUNDED: "refunded",

  // Payment expired (customer didn't pay in time)
  EXPIRED: "expired",
};

/**
 * Payment statuses that are considered "in progress"
 */
export const IN_PROGRESS_STATUSES = [
  NOWPAYMENTS_PAYMENT_STATUS.WAITING,
  NOWPAYMENTS_PAYMENT_STATUS.CONFIRMING,
  NOWPAYMENTS_PAYMENT_STATUS.CONFIRMED,
  NOWPAYMENTS_PAYMENT_STATUS.SENDING,
];

/**
 * Payment statuses that are considered "completed"
 */
export const COMPLETED_STATUSES = [
  NOWPAYMENTS_PAYMENT_STATUS.FINISHED,
  NOWPAYMENTS_PAYMENT_STATUS.PARTIALLY_PAID,
];

/**
 * Payment statuses that are considered "failed"
 */
export const FAILED_STATUSES = [
  NOWPAYMENTS_PAYMENT_STATUS.FAILED,
  NOWPAYMENTS_PAYMENT_STATUS.EXPIRED,
  NOWPAYMENTS_PAYMENT_STATUS.REFUNDED,
];

/**
 * Popular cryptocurrencies supported by NOWPayments
 */
export const POPULAR_CRYPTOCURRENCIES = [
  { code: "btc", name: "Bitcoin", symbol: "₿" },
  { code: "eth", name: "Ethereum", symbol: "Ξ" },
  { code: "usdt", name: "Tether (USDT)", symbol: "₮" },
  { code: "usdc", name: "USD Coin", symbol: "$" },
  { code: "bnb", name: "Binance Coin", symbol: "BNB" },
  { code: "trx", name: "Tron", symbol: "TRX" },
  { code: "ltc", name: "Litecoin", symbol: "Ł" },
  { code: "doge", name: "Dogecoin", symbol: "Ð" },
  { code: "xrp", name: "Ripple", symbol: "XRP" },
  { code: "ada", name: "Cardano", symbol: "₳" },
  { code: "sol", name: "Solana", symbol: "SOL" },
  { code: "matic", name: "Polygon", symbol: "MATIC" },
];
