// lib/payments.js (Updated with splitting integration)
// Enhanced Payment integration with automatic splitting

import { supabase } from "./supabase";
import { paymentSplittingEngine } from "./payment-splitting-engine";
import { notificationManager } from "./notification-manager";

// Paystack configuration
const PAYSTACK_PUBLIC_KEY = "pk_test_9c09c55262fece4cb0282d6e5c52f0926b852ded";
const PAYSTACK_SECRET_KEY = "sk_test_d85193414f0f8e7b2b95f67b1dacba68dfddef2e";

// NOWPayments configuration
const NOWPAYMENTS_API_KEY = "NV8WWJR-HF0MY55-NNFTDKN-H5G4SKQ";
const NOWPAYMENTS_IPN_SECRET = "0S9if6eYVbw79WlUYMtbVTC7grlIQXAO";
const NOWPAYMENTS_BASE_URL = "https://api.nowpayments.io/v1";

// Step 1: Check NOWPayments API status
export const checkNOWPaymentsStatus = async () => {
  try {
    if (!NOWPAYMENTS_API_KEY) {
      throw new Error("NOWPayments API key not configured");
    }

    const response = await fetch(`${NOWPAYMENTS_BASE_URL}/status`, {
      method: "GET",
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error("NOWPayments API is not available");
    }

    const data = await response.json();
    return {
      data: {
        message: data.message || "API is working",
        status: "ok",
      },
      error: null,
    };
  } catch (error) {
    console.error("NOWPayments status check error:", error);
    return { data: null, error };
  }
};

// Step 2: Get available currencies from NOWPayments
export const getAvailableCryptoCurrencies = async () => {
  try {
    if (!NOWPAYMENTS_API_KEY) {
      throw new Error("NOWPayments API key not configured");
    }

    const response = await fetch(`${NOWPAYMENTS_BASE_URL}/currencies`, {
      method: "GET",
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch available currencies");
    }

    const data = await response.json();
    return { data: data.currencies || [], error: null };
  } catch (error) {
    console.error("Get currencies error:", error);
    return { data: [], error };
  }
};

// Enhanced currency search and filtering
export const searchAvailableCurrencies = async (searchQuery) => {
  try {
    const { data: allCurrencies, error } = await getAvailableCryptoCurrencies();

    if (error) {
      return { data: [], error };
    }

    // If no search query, return empty array to encourage searching
    if (!searchQuery || searchQuery.length < 2) {
      return { data: [], error: null };
    }

    // Filter currencies based on search query
    const filteredCurrencies = allCurrencies.filter((currency) =>
      currency.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Limit results to prevent overwhelming the user
    const limitedResults = filteredCurrencies.slice(0, 20);

    return { data: limitedResults, error: null };
  } catch (error) {
    console.error("Currency search error:", error);
    return { data: [], error };
  }
};

// Get currency details with additional information
export const getCurrencyDetails = async (currency) => {
  try {
    // This would typically fetch additional details about the currency
    // For now, we'll return basic information
    const currencyInfo = {
      symbol: currency.toLowerCase(),
      name: getCurrencyName(currency),
      network: getCurrencyNetwork(currency),
      decimals: getCurrencyDecimals(currency),
    };

    return { data: currencyInfo, error: null };
  } catch (error) {
    console.error("Get currency details error:", error);
    return { data: null, error };
  }
};

// Helper function to get currency display name
const getCurrencyName = (symbol) => {
  const currencyNames = {
    btc: "Bitcoin",
    eth: "Ethereum",
    usdt: "Tether USD",
    usdc: "USD Coin",
    ltc: "Litecoin",
    bch: "Bitcoin Cash",
    bnb: "Binance Coin",
    ada: "Cardano",
    xrp: "Ripple",
    doge: "Dogecoin",
    dot: "Polkadot",
    link: "Chainlink",
    uni: "Uniswap",
    sol: "Solana",
    matic: "Polygon",
    avax: "Avalanche",
    atom: "Cosmos",
    ftm: "Fantom",
    near: "NEAR Protocol",
    algo: "Algorand",
  };

  return currencyNames[symbol.toLowerCase()] || symbol.toUpperCase();
};

// Helper function to get currency network
const getCurrencyNetwork = (symbol) => {
  const networks = {
    btc: "Bitcoin",
    eth: "Ethereum",
    usdt: "Multiple",
    usdc: "Multiple",
    ltc: "Litecoin",
    bch: "Bitcoin Cash",
    bnb: "BSC",
    ada: "Cardano",
    xrp: "Ripple",
    doge: "Dogecoin",
    dot: "Polkadot",
    link: "Ethereum",
    uni: "Ethereum",
    sol: "Solana",
    matic: "Polygon",
    avax: "Avalanche",
    atom: "Cosmos",
    ftm: "Fantom",
    near: "NEAR",
    algo: "Algorand",
  };

  return networks[symbol.toLowerCase()] || "Unknown";
};

// Helper function to get currency decimals
const getCurrencyDecimals = (symbol) => {
  const decimals = {
    btc: 8,
    eth: 18,
    usdt: 6,
    usdc: 6,
    ltc: 8,
    bch: 8,
    bnb: 18,
    ada: 6,
    xrp: 6,
    doge: 8,
    dot: 10,
    link: 18,
    uni: 18,
    sol: 9,
    matic: 18,
    avax: 18,
    atom: 6,
    ftm: 18,
    near: 24,
    algo: 6,
  };

  return decimals[symbol.toLowerCase()] || 8;
};

// Step 3: Get minimum payment amount for selected currency pair
export const getMinimumPaymentAmount = async (fromCurrency, toCurrency) => {
  try {
    if (!NOWPAYMENTS_API_KEY) {
      throw new Error("NOWPayments API key not configured");
    }

    const response = await fetch(
      `${NOWPAYMENTS_BASE_URL}/min-amount?currency_from=${fromCurrency}&currency_to=${toCurrency}`,
      {
        method: "GET",
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch minimum payment amount");
    }

    const data = await response.json();
    console.log("Minimum payment amount data:", data);
    return {
      data: {
        min_amount: data.min_amount,
        currency_from: data.currency_from,
        currency_to: data.currency_to,
        fiat_equivalent: data.fiat_equivalent,
      },
      error: null,
    };
  } catch (error) {
    console.error("Get minimum amount error:", error);
    return { data: null, error };
  }
};

// Enhanced exchange rate function with better error handling
export const getExchangeRate = async (amount, fromCurrency, toCurrency) => {
  try {
    const response = await fetch(
      `https://api.exchangerate.host/convert?access_key=c2c960ebe9d2757e4a386e03a8f8a7ad&from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
    );

    if (!response.ok) {
      console.error("Exchange rate API response not ok:", response.status);
      return { error: true };
    }

    const data = await response.json();

    if (!data.success) {
      console.error("Exchange rate API Error:", data.error);
      return { error: true };
    }

    const result = {
      success: true,
      terms: "https://currencylayer.com/terms",
      privacy: "https://currencylayer.com/privacy",
      query: {
        from: fromCurrency,
        to: toCurrency,
        amount: amount,
      },
      info: {
        timestamp: Math.floor(Date.now() / 1000),
        quote: data.info.rate, // actual exchange rate
      },
      result: data.result, // converted amount
    };

    return { data: result, error: false };
  } catch (error) {
    console.error("Exchange rate fetch error:", error);
    return { error: true };
  }
};

// Step 4: Get estimated price in selected cryptocurrency
export const getEstimatedCryptoPrice = async (
  amount,
  fromCurrency,
  toCurrency
) => {
  try {
    if (!NOWPAYMENTS_API_KEY) {
      throw new Error("NOWPayments API key not configured");
    }

    const response = await fetch(
      `${NOWPAYMENTS_BASE_URL}/estimate?amount=${amount}&currency_from=${fromCurrency}&currency_to=${toCurrency}`,
      {
        method: "GET",
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Estimate API error:", errorData);
      throw new Error("Failed to get price estimate");
    }

    const data = await response.json();
    return {
      data: {
        currency_from: data.currency_from,
        currency_to: data.currency_to,
        amount_from: data.amount_from,
        estimated_amount: data.estimated_amount,
      },
      error: null,
    };
  } catch (error) {
    console.error("Get estimate error:", error);
    return { data: null, error };
  }
};

// Step 5: Create NOWPayments invoice with enhanced validation
export const createNOWPaymentsInvoice = async (
  paymentData,
  selectedCurrency
) => {
  try {
    if (!NOWPAYMENTS_API_KEY) {
      throw new Error("NOWPayments API key not configured");
    }

    const usdAmount = paymentData.amount;
    const currency = paymentData.currency;

    const invoiceData = {
      price_amount: usdAmount,
      price_currency: currency,
      pay_currency: selectedCurrency.toLowerCase(),
      order_id: paymentData.reference,
      order_description: `Payment for ${paymentData.metadata.service_title}`,
      success_url: `${paymentData.callback_url}&status=success`,
      cancel_url: `${paymentData.callback_url}&status=cancelled`,
      ipn_callback_url: `${window.location.origin}/api/webhooks/nowpayments`,
      is_fixed_rate: true,
      is_fee_paid_by_user: false,
    };

    console.log("Creating invoice with data:", invoiceData);

    const response = await fetch(`${NOWPAYMENTS_BASE_URL}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Invoice creation error:", errorData);
      throw new Error(errorData.message || "Failed to create invoice");
    }

    const data = await response.json();
    console.log("Invoice created successfully:", data);

    // Store payment record in database with splitting metadata
    await createPaymentRecord({
      reference: paymentData.reference,
      booking_id: paymentData.metadata.booking_id,
      customer_id: paymentData.metadata.customer_id,
      amount: usdAmount,
      provider: "crypto",
      status: "pending",
      payment_data: data,
      // Add splitting metadata
      split_status: "pending",
      requires_splitting: true,
    });

    return {
      data: {
        invoice_id: data.id,
        invoice_url: data.invoice_url,
        pay_address: data.pay_address,
        pay_amount: data.pay_amount,
        pay_currency: data.pay_currency,
        price_amount: data.price_amount,
        price_currency: data.price_currency,
        order_id: data.order_id,
        payment_status: data.payment_status,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
      error: null,
    };
  } catch (error) {
    console.error("Create invoice error:", error);
    return { data: null, error };
  }
};

// Initialize payment with selected provider
export const initializePayment = async (provider, paymentData) => {
  try {
    console.log("Initializing payment with data:", paymentData);
    if (provider === "paystack") {
      return await initializePaystackPayment(paymentData);
    } else if (provider === "crypto") {
      return await initializeNOWPaymentsPayment(paymentData);
    } else {
      throw new Error("Unsupported payment provider");
    }
  } catch (error) {
    console.error("Payment initialization error:", error);
    return { data: null, error };
  }
};

// lib/payments.js
const initializePaystackPayment = async (paymentData) => {
  try {
    // Validate environment variable
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("Paystack secret key not configured");
    }

    // Validate required fields
    const requiredFields = [
      "email",
      "amount",
      "reference",
      "callback_url",
      "metadata",
    ];
    for (const field of requiredFields) {
      if (!paymentData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate email and amount
    if (!/^\S+@\S+\.\S+$/.test(paymentData.email)) {
      throw new Error("Invalid email format");
    }
    if (
      typeof paymentData.amount !== "number" ||
      paymentData.amount <= 0 ||
      isNaN(paymentData.amount)
    ) {
      throw new Error("Amount must be a positive number");
    }

    // Validate currency
    const supportedCurrencies = ["NGN", "GHS", "USD", "ZAR"];
    const currency = paymentData.currency || "NGN";
    if (!supportedCurrencies.includes(currency)) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    // Validate metadata
    if (
      !paymentData.metadata?.event_booking_id ||
      !paymentData.metadata?.customer_id
    ) {
      throw new Error(
        "Missing required metadata: event_booking_id or customer_id"
      );
    }

    // Ensure metadata fields are strings
    const metadata = {
      ...paymentData.metadata,
      event_booking_id: String(paymentData.metadata.event_booking_id),
      customer_id: String(paymentData.metadata.customer_id),
    };

    // Convert amount to kobo (Paystack expects amount in smallest currency unit)
    const amountInKobo = Math.round(paymentData.amount * 100);

    // Log paymentData for debugging
    console.log("Paystack payment data:", {
      email: paymentData.email,
      amount: amountInKobo,
      currency,
      reference: paymentData.reference,
      callback_url: paymentData.callback_url,
      metadata,
    });

    // Make API request to Paystack
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: paymentData.email,
          amount: amountInKobo,
          currency,
          reference: paymentData.reference,
          callback_url: paymentData.callback_url,
          metadata,
          channels: paymentData.channels || [
            "card",
            "bank",
            "ussd",
            "qr",
            "mobile_money",
            "bank_transfer",
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Payment initialization failed");
    }

    if (!data?.status || !data?.data) {
      throw new Error("Invalid Paystack response");
    }

    // Log Paystack response for debugging
    console.log("Paystack response:", data);

    // Store payment record
    const paymentRecord = {
      reference: paymentData.reference,
      event_booking_id: metadata.event_booking_id,
      customer_id: metadata.customer_id,
      amount: parseFloat(paymentData.amount.toFixed(2)), // Ensure NUMERIC(10,2)
      provider: "paystack",
      status: "pending",
      payment_data: data.data, // JSONB field
      split_status: "pending",
      requires_splitting: true,
      vendor_currency: currency,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Log payment record for debugging
    console.log("Payment record to be created:", paymentRecord);

    const { data: paymentRecordData, error: paymentRecordError } =
      await createPaymentRecord(paymentRecord);

    if (paymentRecordError) {
      throw new Error(
        `Failed to create payment record: ${paymentRecordError.message}`
      );
    }

    return { data: data.data, error: null };
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return { data: null, error };
  }
};

// Legacy NOWPayments payment initialization (for backward compatibility)
const initializeNOWPaymentsPayment = async (paymentData) => {
  try {
    if (!NOWPAYMENTS_API_KEY) {
      throw new Error("NOWPayments API key not configured");
    }

    const usdAmount = (paymentData.amount / 100) * 0.0024;

    const response = await fetch(`${NOWPAYMENTS_BASE_URL}/payment`, {
      method: "POST",
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: usdAmount.toFixed(2),
        price_currency: "usd",
        pay_currency: "btc",
        ipn_callback_url: `${paymentData.callback_url}/api/webhooks/nowpayments`,
        order_id: paymentData.reference,
        order_description: `Payment for ${paymentData.metadata.service_title}`,
        customer_email: paymentData.email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Crypto payment initialization failed");
    }

    await createPaymentRecord({
      reference: paymentData.reference,
      booking_id: paymentData.metadata.booking_id,
      customer_id: paymentData.metadata.customer_id,
      amount: paymentData.amount / 100,
      provider: "crypto",
      status: "pending",
      payment_data: data,
      // Add splitting metadata
      split_status: "pending",
      requires_splitting: true,
    });

    return {
      data: {
        authorization_url: data.invoice_url || data.pay_url,
        payment_id: data.payment_id,
        pay_address: data.pay_address,
        pay_amount: data.pay_amount,
        pay_currency: data.pay_currency,
        price_amount: data.price_amount,
        price_currency: data.price_currency,
      },
      error: null,
    };
  } catch (error) {
    console.error("NOWPayments initialization error:", error);
    return { data: null, error };
  }
};

// Enhanced verify payment status with splitting integration
export const verifyPayment = async (reference) => {
  try {
    const { data: paymentRecord, error: dbError } =
      await getPaymentRecord(reference);

    if (dbError || !paymentRecord) {
      throw new Error("Payment record not found");
    }

    let verificationResult;
    if (paymentRecord.provider === "paystack") {
      verificationResult = await verifyPaystackPayment(reference);
    } else if (paymentRecord.provider === "crypto") {
      verificationResult = await verifyNOWPaymentsPayment(
        paymentRecord.payment_data.payment_id || paymentRecord.payment_data.id
      );
    } else {
      throw new Error("Unsupported payment provider");
    }

    if (
      verificationResult.data &&
      (verificationResult.data.status === "success" ||
        verificationResult.data.payment_status === "finished")
    ) {
      // Update payment status
      await updatePaymentRecord(reference, {
        status: "completed",
        verified_at: new Date().toISOString(),
        verification_data: verificationResult.data,
      });

      // **TRIGGER PAYMENT SPLITTING HERE**
      if (
        paymentRecord.requires_splitting &&
        paymentRecord.split_status === "pending"
      ) {
        try {
          console.log(
            `Triggering payment split for payment ${paymentRecord.id}`
          );

          // Extract payment data for splitting
          const splitPaymentData = {
            id: paymentRecord.id,
            amount: paymentRecord.amount,
            currency:
              paymentRecord.provider === "paystack"
                ? "NGN"
                : verificationResult.data.crypto_currency || "USD",
            provider: paymentRecord.provider,
            booking_id: paymentRecord.booking_id,
            customer_id: paymentRecord.customer_id,
            status: "completed",
            reference: reference,
          };

          // Process the split (async - don't wait for completion)
          paymentSplittingEngine
            .processPaymentSplit(paymentRecord.id, splitPaymentData)
            .then((splitResult) => {
              if (splitResult.success) {
                console.log(
                  `Payment split initiated successfully for payment ${paymentRecord.id}`
                );
              } else {
                console.error(
                  `Payment split failed for payment ${paymentRecord.id}:`,
                  splitResult.error
                );
              }
            })
            .catch((splitError) => {
              console.error(
                `Payment split error for payment ${paymentRecord.id}:`,
                splitError
              );
            });
        } catch (splitInitError) {
          console.error("Error initiating payment split:", splitInitError);
          // Don't fail the verification if splitting fails
        }
      }
    }

    return verificationResult;
  } catch (error) {
    console.error("Payment verification error:", error);
    return { data: null, error };
  }
};

// Verify Paystack payment (unchanged)
const verifyPaystackPayment = async (reference) => {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Payment verification failed");
    }

    return {
      data: {
        status: data.data.status === "success" ? "success" : "failed",
        amount: data.data.amount / 100,
        reference: data.data.reference,
        gateway_response: data.data.gateway_response,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
};

// Verify NOWPayments crypto payment
const verifyNOWPaymentsPayment = async (paymentId) => {
  try {
    const response = await fetch(
      `${NOWPAYMENTS_BASE_URL}/payment/${paymentId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Crypto payment verification failed");
    }

    return {
      data: {
        status:
          data.payment_status === "finished"
            ? "success"
            : data.payment_status === "failed"
              ? "failed"
              : "pending",
        payment_status: data.payment_status,
        amount: data.price_amount,
        reference: data.order_id,
        gateway_response: data.payment_status,
        crypto_amount: data.pay_amount,
        crypto_currency: data.pay_currency,
        actual_paid_amount: data.actually_paid,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
};

// Enhanced database operations with splitting metadata
const createPaymentRecord = async (paymentData) => {
  try {
    // Validate required fields
    const requiredFields = [
      "reference",
      "event_booking_id",
      "customer_id",
      "amount",
      "provider",
      "status",
    ];
    for (const field of requiredFields) {
      if (!paymentData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate provider
    if (!["paystack", "crypto"].includes(paymentData.provider)) {
      throw new Error(`Invalid provider: ${paymentData.provider}`);
    }

    // Validate amount
    const formattedAmount = Number(paymentData.amount).toFixed(2);
    if (isNaN(formattedAmount) || formattedAmount <= 0) {
      throw new Error(`Invalid amount: ${paymentData.amount}`);
    }

    // Validate payment_data
    if (
      !paymentData.payment_data ||
      typeof paymentData.payment_data !== "object"
    ) {
      throw new Error("Invalid payment_data: must be a valid JSON object");
    }

    // Construct payload
    const payload = {
      reference: paymentData.reference,
      event_booking_id: String(paymentData.event_booking_id),
      customer_id: String(paymentData.customer_id),
      amount: formattedAmount,
      provider: paymentData.provider,
      status: paymentData.status,
      payment_data: paymentData.payment_data,
      split_status: paymentData.split_status || "pending",
      requires_splitting: paymentData.requires_splitting || false,
      vendor_currency: paymentData.vendor_currency || "NGN",
      created_at: paymentData.created_at || new Date().toISOString(),
      updated_at: paymentData.updated_at || new Date().toISOString(),
    };

    // Log payload for debugging
    console.log("Creating payment record with data:", payload);

    // Verify booking_id exists (optional, enable if foreign key constraint exists)
    /*
    const { data: bookingCheck } = await supabase
      .from("bookings")
      .select("id")
      .eq("id", payload.event_booking_id)
      .single();
    if (!bookingCheck) {
      throw new Error(`Booking ID ${payload.event_booking_id} does not exist`);
    }
    */

    const { data, error } = await supabase
      .from("payments")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    console.log("Payment record created:", data);
    return { data, error: null };
  } catch (error) {
    console.error("Create payment record error:", error);
    return { data: null, error };
  }
};
const getPaymentRecord = async (reference) => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

const updatePaymentRecord = async (reference, updates) => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("reference", reference)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Enhanced webhook handlers with splitting integration
export const handlePaystackWebhook = async (event) => {
  try {
    if (event.event === "charge.success") {
      const reference = event.data.reference;

      // Verify the payment (this will trigger splitting automatically)
      const verificationResult = await verifyPayment(reference);

      if (verificationResult.data?.status === "success") {
        console.log(
          `Paystack webhook: Payment ${reference} verified and split initiated`
        );
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return { success: false, error };
  }
};

export const handleNOWPaymentsWebhook = async (event, signature) => {
  try {
    if (NOWPAYMENTS_IPN_SECRET) {
      const crypto = require("crypto");
      const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_SECRET);
      hmac.update(JSON.stringify(event));
      const computedSignature = hmac.digest("hex");

      if (computedSignature !== signature) {
        throw new Error("Invalid webhook signature");
      }
    }

    if (event.payment_status === "finished") {
      const reference = event.order_id;

      // Verify the payment (this will trigger splitting automatically)
      const verificationResult = await verifyPayment(reference);

      if (verificationResult.data?.status === "success") {
        console.log(
          `NOWPayments webhook: Payment ${reference} verified and split initiated`
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("NOWPayments webhook error:", error);
    return { success: false, error };
  }
};

// Client-side payment initialization (unchanged)
export const initializeClientPayment = (paymentData, provider = "paystack") => {
  return new Promise((resolve, reject) => {
    if (provider === "paystack") {
      if (typeof window !== "undefined" && window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email: paymentData.email,
          amount: paymentData.amount,
          currency: paymentData.currency || "NGN",
          ref: paymentData.reference,
          metadata: paymentData.metadata,
          callback: function (response) {
            resolve(response);
          },
          onClose: function () {
            reject(new Error("Payment cancelled"));
          },
        });
        handler.openIframe();
      } else {
        reject(new Error("Paystack not loaded"));
      }
    } else if (provider === "crypto") {
      resolve({ status: "redirect_required" });
    }
  });
};

// Update booking payment status
export const updatePaymentStatus = async (bookingId, status, reference) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({
        payment_status: status,
        payment_reference: reference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Update booking payment status error:", error);
    return { success: false, error: error.message };
  }
};

// Get booking details
export const getBooking = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        listings!inner(
          *,
          vendors!inner(*)
        )
      `
      )
      .eq("id", bookingId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Get booking error:", error);
    return { data: null, error };
  }
};

// Helper functions
export const formatCryptoAmount = (amount, currency) => {
  const decimals = getCurrencyDecimals(currency);
  return parseFloat(amount).toFixed(decimals);
};

// Enhanced refund functionality (Paystack only) - now considers splits
export const processRefund = async (reference, amount = null) => {
  try {
    const { data: paymentRecord, error } = await getPaymentRecord(reference);

    if (error || !paymentRecord) {
      throw new Error("Payment record not found");
    }

    if (paymentRecord.provider === "crypto") {
      throw new Error("Crypto payments cannot be refunded automatically");
    }

    // Check if payment was already split
    if (paymentRecord.split_status === "completed") {
      throw new Error(
        "Cannot refund payment that has been split. Manual intervention required."
      );
    }

    const refundAmount = amount || paymentRecord.amount;

    let refundResult;
    if (paymentRecord.provider === "paystack") {
      refundResult = await processPaystackRefund(reference, refundAmount * 100);
    } else {
      throw new Error("Unsupported payment provider for refunds");
    }

    if (refundResult.data) {
      await updatePaymentRecord(reference, {
        status: "refunded",
        refund_amount: refundAmount,
        refunded_at: new Date().toISOString(),
        refund_data: refundResult.data,
        split_status: "cancelled", // Cancel any pending splits
      });
    }

    return refundResult;
  } catch (error) {
    return { data: null, error };
  }
};

const processPaystackRefund = async (reference, amount) => {
  try {
    const response = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction: reference,
        amount: amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Refund failed");
    }

    return { data: data.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// New function: Get payment split status
export const getPaymentSplitStatus = async (reference) => {
  try {
    const { data: paymentRecord, error } = await getPaymentRecord(reference);

    if (error || !paymentRecord) {
      throw new Error("Payment record not found");
    }

    // Get split records
    const { data: splits, error: splitsError } = await supabase
      .from("payment_splits")
      .select("*")
      .eq("payment_id", paymentRecord.id);

    if (splitsError) {
      console.error("Error fetching splits:", splitsError);
    }

    return {
      success: true,
      data: {
        payment_id: paymentRecord.id,
        split_status: paymentRecord.split_status,
        vendor_amount: paymentRecord.vendor_amount,
        admin_amount: paymentRecord.admin_amount,
        exchange_rate_used: paymentRecord.exchange_rate_used,
        split_processed_at: paymentRecord.split_processed_at,
        splits: splits || [],
      },
      error: null,
    };
  } catch (error) {
    console.error("Get payment split status error:", error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// New function: Manually trigger payment split (admin use)
export const manuallyTriggerPaymentSplit = async (paymentId) => {
  try {
    // Get payment record
    const { data: paymentRecord, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (error || !paymentRecord) {
      throw new Error("Payment record not found");
    }

    if (paymentRecord.status !== "completed") {
      throw new Error("Payment must be completed before splitting");
    }

    if (paymentRecord.split_status === "completed") {
      throw new Error("Payment has already been split");
    }

    // Prepare payment data for splitting
    const splitPaymentData = {
      id: paymentRecord.id,
      amount: paymentRecord.amount,
      currency: paymentRecord.provider === "paystack" ? "NGN" : "USD", // Default for crypto
      provider: paymentRecord.provider,
      booking_id: paymentRecord.booking_id,
      customer_id: paymentRecord.customer_id,
      status: "completed",
      reference: paymentRecord.reference,
    };

    // Process the split
    const splitResult = await paymentSplittingEngine.processPaymentSplit(
      paymentRecord.id,
      splitPaymentData
    );

    return {
      success: true,
      data: splitResult,
      error: null,
    };
  } catch (error) {
    console.error("Manual payment split trigger error:", error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// New function: Get split statistics for admin dashboard
export const getPaymentSplitStatistics = async (dateRange = {}) => {
  try {
    let query = supabase
      .from("payments")
      .select(
        `
        id,
        amount,
        currency,
        provider,
        split_status,
        vendor_amount,
        admin_amount,
        created_at,
        split_processed_at
      `
      )
      .not("split_status", "is", null);

    if (dateRange.from) {
      query = query.gte("created_at", dateRange.from);
    }

    if (dateRange.to) {
      query = query.lte("created_at", dateRange.to);
    }

    const { data: payments, error } = await query;

    if (error) throw error;

    const statistics = {
      total_payments_with_splits: payments.length,
      completed_splits: payments.filter((p) => p.split_status === "completed")
        .length,
      pending_splits: payments.filter((p) => p.split_status === "pending")
        .length,
      failed_splits: payments.filter((p) => p.split_status === "failed").length,
      total_vendor_amount: payments
        .filter((p) => p.split_status === "completed")
        .reduce((sum, p) => sum + (p.vendor_amount || 0), 0),
      total_admin_amount: payments
        .filter((p) => p.split_status === "completed")
        .reduce((sum, p) => sum + (p.admin_amount || 0), 0),
      provider_breakdown: {},
    };

    // Calculate provider breakdown
    ["paystack", "crypto"].forEach((provider) => {
      const providerPayments = payments.filter((p) => p.provider === provider);
      statistics.provider_breakdown[provider] = {
        total: providerPayments.length,
        completed: providerPayments.filter(
          (p) => p.split_status === "completed"
        ).length,
        pending: providerPayments.filter((p) => p.split_status === "pending")
          .length,
        failed: providerPayments.filter((p) => p.split_status === "failed")
          .length,
      };
    });

    return {
      success: true,
      data: statistics,
      error: null,
    };
  } catch (error) {
    console.error("Get split statistics error:", error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// New function: Retry failed split
export const retryFailedPaymentSplit = async (paymentId) => {
  try {
    // Get payment record
    const { data: paymentRecord, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (error || !paymentRecord) {
      throw new Error("Payment record not found");
    }

    if (paymentRecord.split_status !== "failed") {
      throw new Error("Can only retry failed splits");
    }

    // Reset split status to pending
    await supabase
      .from("payments")
      .update({
        split_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    // Reset any existing split records
    await supabase
      .from("payment_splits")
      .update({
        transfer_status: "pending",
        error_message: null,
        failed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_id", paymentId);

    // Trigger the split again
    return await manuallyTriggerPaymentSplit(paymentId);
  } catch (error) {
    console.error("Retry failed split error:", error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// Export all payment splitting related functions
export // Existing functions (unchanged)
// New splitting functions
 {};
