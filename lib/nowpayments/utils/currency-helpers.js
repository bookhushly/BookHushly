/**
 * Format cryptocurrency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string}
 */
export function formatCryptoAmount(amount, currency) {
  const decimals = getCryptoDecimals(currency);
  return parseFloat(amount).toFixed(decimals);
}

/**
 * Get appropriate decimal places for cryptocurrency
 * @param {string} currency - Currency code
 * @returns {number}
 */
export function getCryptoDecimals(currency) {
  const lowerCurrency = currency.toLowerCase();

  // Bitcoin and high-value coins
  if (["btc", "eth", "bnb", "ltc"].includes(lowerCurrency)) {
    return 8;
  }

  // Stablecoins
  if (["usdt", "usdc", "busd", "dai"].includes(lowerCurrency)) {
    return 2;
  }

  // Low-value coins (Dogecoin, etc.)
  if (["doge", "shib", "trx"].includes(lowerCurrency)) {
    return 4;
  }

  // Default
  return 6;
}

/**
 * Format fiat currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string}
 */
export function formatFiatAmount(amount, currency = "usd") {
  const lowerCurrency = currency.toLowerCase();

  const symbols = {
    usd: "$",
    eur: "€",
    gbp: "£",
    ngn: "₦",
  };

  const symbol = symbols[lowerCurrency] || "";
  const formatted = parseFloat(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formatted}`;
}

/**
 * Convert fiat to crypto estimate
 * @param {number} fiatAmount - Amount in fiat
 * @param {number} cryptoRate - Crypto price in fiat
 * @param {string} cryptoCurrency - Crypto currency code
 * @returns {string}
 */
export function estimateCryptoAmount(fiatAmount, cryptoRate, cryptoCurrency) {
  if (!cryptoRate || cryptoRate === 0) return "0";

  const cryptoAmount = fiatAmount / cryptoRate;
  return formatCryptoAmount(cryptoAmount, cryptoCurrency);
}

/**
 * Get currency display name
 * @param {string} code - Currency code
 * @returns {string}
 */
export function getCurrencyName(code) {
  const names = {
    btc: "Bitcoin",
    eth: "Ethereum",
    usdt: "Tether",
    usdc: "USD Coin",
    bnb: "Binance Coin",
    trx: "Tron",
    ltc: "Litecoin",
    doge: "Dogecoin",
    xrp: "Ripple",
    ada: "Cardano",
    sol: "Solana",
    matic: "Polygon",
    usd: "US Dollar",
    eur: "Euro",
    gbp: "British Pound",
    ngn: "Nigerian Naira",
  };

  return names[code.toLowerCase()] || code.toUpperCase();
}

/**
 * Validate cryptocurrency code
 * @param {string} code - Currency code
 * @returns {boolean}
 */
export function isValidCryptoCurrency(code) {
  // This is a simplified validation
  // In production, you'd check against NOWPayments available currencies
  return code && typeof code === "string" && code.length >= 2;
}
