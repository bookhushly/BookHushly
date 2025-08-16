// lib/exchange-rate-manager.js
// Enhanced exchange rate management with caching and multiple providers

import { supabase } from "./supabase";
import { SPLIT_CONFIG } from "./payment-splitting-config";

// Multiple exchange rate providers for redundancy
const EXCHANGE_PROVIDERS = {
  primary: {
    name: "exchangerate_host",
    url: "https://api.exchangerate.host/convert",
    apiKey:
      process.env.EXCHANGE_RATE_API_KEY || "c2c960ebe9d2757e4a386e03a8f8a7ad",
  },
  fallback: {
    name: "coinapi",
    url: "https://rest.coinapi.io/v1/exchangerate",
    apiKey: process.env.COINAPI_KEY,
  },
  crypto: {
    name: "nowpayments",
    url: "https://api.nowpayments.io/v1/estimate",
    apiKey:
      process.env.NOWPAYMENTS_API_KEY || "NV8WWJR-HF0MY55-NNFTDKN-H5G4SKQ",
  },
};

class ExchangeRateManager {
  constructor() {
    this.cache = new Map();
    this.rateHistory = new Map();
  }

  // Get exchange rate with caching and fallback
  async getExchangeRate(fromCurrency, toCurrency, amount = 1) {
    try {
      // Check cache first
      const cacheKey = `${fromCurrency}_${toCurrency}`;
      const cachedRate = await this.getCachedRate(cacheKey);

      if (cachedRate && this.isRateValid(cachedRate)) {
        return {
          success: true,
          rate: cachedRate.rate,
          amount: amount * cachedRate.rate,
          source: "cache",
          timestamp: cachedRate.timestamp,
        };
      }

      // Fetch fresh rate
      const rateResult = await this.fetchFreshRate(
        fromCurrency,
        toCurrency,
        amount
      );

      if (rateResult.success) {
        // Cache the new rate
        await this.cacheRate(
          cacheKey,
          rateResult.rate,
          fromCurrency,
          toCurrency
        );
        return rateResult;
      }

      // If all fails, try to get the most recent cached rate (even if expired)
      const lastKnownRate = await this.getLastKnownRate(
        fromCurrency,
        toCurrency
      );
      if (lastKnownRate) {
        console.warn(`Using expired rate for ${fromCurrency} to ${toCurrency}`);
        return {
          success: true,
          rate: lastKnownRate.rate,
          amount: amount * lastKnownRate.rate,
          source: "expired_cache",
          timestamp: lastKnownRate.timestamp,
          warning: "Using expired exchange rate",
        };
      }

      throw new Error("No exchange rate available");
    } catch (error) {
      console.error("Exchange rate fetch error:", error);
      return {
        success: false,
        error: error.message,
        rate: null,
        amount: null,
      };
    }
  }

  // Fetch rate from primary provider
  async fetchFromPrimary(fromCurrency, toCurrency, amount) {
    try {
      const provider = EXCHANGE_PROVIDERS.primary;
      const url = `${provider.url}?access_key=${provider.apiKey}&from=${fromCurrency}&to=${toCurrency}&amount=${amount}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.result) {
        return {
          success: true,
          rate: data.info.rate,
          amount: data.result,
          source: provider.name,
          timestamp: Date.now(),
        };
      }

      throw new Error(data.error?.info || "Primary provider failed");
    } catch (error) {
      console.error("Primary provider error:", error);
      throw error;
    }
  }

  // Fetch rate from fallback provider (CoinAPI)
  async fetchFromFallback(fromCurrency, toCurrency, amount) {
    try {
      if (!EXCHANGE_PROVIDERS.fallback.apiKey) {
        throw new Error("Fallback provider API key not configured");
      }

      const provider = EXCHANGE_PROVIDERS.fallback;
      const url = `${provider.url}/${fromCurrency}/${toCurrency}`;

      const response = await fetch(url, {
        headers: {
          "X-CoinAPI-Key": provider.apiKey,
        },
      });

      const data = await response.json();

      if (data.rate) {
        return {
          success: true,
          rate: data.rate,
          amount: amount * data.rate,
          source: provider.name,
          timestamp: Date.now(),
        };
      }

      throw new Error("Fallback provider failed");
    } catch (error) {
      console.error("Fallback provider error:", error);
      throw error;
    }
  }

  // Fetch crypto rate from NOWPayments
  async fetchCryptoRate(fromCurrency, toCurrency, amount) {
    try {
      const provider = EXCHANGE_PROVIDERS.crypto;
      const url = `${provider.url}?amount=${amount}&currency_from=${fromCurrency}&currency_to=${toCurrency}`;

      const response = await fetch(url, {
        headers: {
          "x-api-key": provider.apiKey,
        },
      });

      const data = await response.json();

      if (data.estimated_amount) {
        const rate = data.estimated_amount / amount;
        return {
          success: true,
          rate: rate,
          amount: data.estimated_amount,
          source: provider.name,
          timestamp: Date.now(),
        };
      }

      throw new Error("Crypto provider failed");
    } catch (error) {
      console.error("Crypto provider error:", error);
      throw error;
    }
  }

  // Fetch fresh rate with provider fallback
  async fetchFreshRate(fromCurrency, toCurrency, amount) {
    const errors = [];

    // Try primary provider
    try {
      return await this.fetchFromPrimary(fromCurrency, toCurrency, amount);
    } catch (error) {
      errors.push(`Primary: ${error.message}`);
    }

    // Try crypto provider if dealing with crypto currencies
    if (
      this.isCryptoCurrency(fromCurrency) ||
      this.isCryptoCurrency(toCurrency)
    ) {
      try {
        return await this.fetchCryptoRate(fromCurrency, toCurrency, amount);
      } catch (error) {
        errors.push(`Crypto: ${error.message}`);
      }
    }

    // Try fallback provider
    try {
      return await this.fetchFromFallback(fromCurrency, toCurrency, amount);
    } catch (error) {
      errors.push(`Fallback: ${error.message}`);
    }

    throw new Error(`All providers failed: ${errors.join(", ")}`);
  }

  // Cache rate in database
  async cacheRate(cacheKey, rate, fromCurrency, toCurrency) {
    try {
      const validUntil = new Date(
        Date.now() + SPLIT_CONFIG.EXCHANGE_RATE.cache_duration * 1000
      );

      await supabase.from("exchange_rates").upsert({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        rate: rate,
        provider: "aggregated",
        valid_from: new Date(),
        valid_until: validUntil,
      });

      // Also cache in memory
      this.cache.set(cacheKey, {
        rate,
        timestamp: Date.now(),
        validUntil: validUntil.getTime(),
      });
    } catch (error) {
      console.error("Rate caching error:", error);
    }
  }

  // Get cached rate from database
  async getCachedRate(cacheKey) {
    try {
      // Check memory cache first
      const memoryCache = this.cache.get(cacheKey);
      if (memoryCache && memoryCache.validUntil > Date.now()) {
        return memoryCache;
      }

      // Check database cache
      const [fromCurrency, toCurrency] = cacheKey.split("_");
      const { data, error } = await supabase
        .from("exchange_rates")
        .select("*")
        .eq("from_currency", fromCurrency)
        .eq("to_currency", toCurrency)
        .gte("valid_until", new Date())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return {
        rate: data.rate,
        timestamp: new Date(data.created_at).getTime(),
        validUntil: new Date(data.valid_until).getTime(),
      };
    } catch (error) {
      console.error("Cache retrieval error:", error);
      return null;
    }
  }

  // Check if cached rate is still valid
  isRateValid(cachedRate) {
    return cachedRate.validUntil > Date.now();
  }

  // Get last known rate (even if expired)
  async getLastKnownRate(fromCurrency, toCurrency) {
    try {
      const { data, error } = await supabase
        .from("exchange_rates")
        .select("*")
        .eq("from_currency", fromCurrency)
        .eq("to_currency", toCurrency)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return {
        rate: data.rate,
        timestamp: new Date(data.created_at).getTime(),
      };
    } catch (error) {
      console.error("Last known rate retrieval error:", error);
      return null;
    }
  }

  // Check if currency is cryptocurrency
  isCryptoCurrency(currency) {
    const cryptoCurrencies = [
      "BTC",
      "ETH",
      "USDT",
      "USDC",
      "BNB",
      "ADA",
      "XRP",
      "DOGE",
      "SOL",
      "MATIC",
      "DOT",
      "AVAX",
      "LINK",
      "UNI",
      "LTC",
      "BCH",
      "ATOM",
      "FTM",
      "NEAR",
      "ALGO",
      "XLM",
      "TRON",
      "EOS",
      "AAVE",
      "MKR",
      "COMP",
      "YFI",
    ];
    return cryptoCurrencies.includes(currency.toUpperCase());
  }

  // Convert amount between currencies
  async convertAmount(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return {
        success: true,
        originalAmount: amount,
        convertedAmount: amount,
        rate: 1,
        fromCurrency,
        toCurrency,
      };
    }

    const rateResult = await this.getExchangeRate(
      fromCurrency,
      toCurrency,
      amount
    );

    if (!rateResult.success) {
      return {
        success: false,
        error: rateResult.error,
        originalAmount: amount,
        fromCurrency,
        toCurrency,
      };
    }

    return {
      success: true,
      originalAmount: amount,
      convertedAmount: rateResult.amount,
      rate: rateResult.rate,
      fromCurrency,
      toCurrency,
      source: rateResult.source,
      timestamp: rateResult.timestamp,
    };
  }

  // Get historical rates for a currency pair
  async getHistoricalRates(fromCurrency, toCurrency, days = 7) {
    try {
      const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from("exchange_rates")
        .select("*")
        .eq("from_currency", fromCurrency)
        .eq("to_currency", toCurrency)
        .gte("created_at", sinceDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data.map((rate) => ({
        rate: rate.rate,
        timestamp: new Date(rate.created_at).getTime(),
        date: rate.created_at,
      }));
    } catch (error) {
      console.error("Historical rates error:", error);
      return [];
    }
  }
}

// Export singleton instance
export const exchangeRateManager = new ExchangeRateManager();

// Helper function for direct usage
export const getExchangeRate = (from, to, amount = 1) => {
  return exchangeRateManager.getExchangeRate(from, to, amount);
};

export const convertAmount = (amount, from, to) => {
  return exchangeRateManager.convertAmount(amount, from, to);
};

export default ExchangeRateManager;
