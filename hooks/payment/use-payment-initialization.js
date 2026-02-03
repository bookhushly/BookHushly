"use client";

import { useState, useCallback } from "react";

// Loads Paystack v2 inline script once, caches on window
function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve(window.PaystackPop);

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.onload = () => resolve(window.PaystackPop);
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.head.appendChild(script);
  });
}

export function usePaymentInitialization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);

  const initializePayment = async ({
    requestId,
    requestType,
    amount,
    email,
    provider = "paystack",
    payCurrency,
    currency = "NGN",
    metadata = {},
  }) => {
    setLoading(true);
    setError(null);
    setPayment(null);

    try {
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          requestType,
          amount,
          email,
          provider,
          payCurrency,
          currency,
          metadata,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      setPayment(data.payment);
      return data.payment;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crypto → full-page redirect (NOWPayments requires it)
  // Paystack → v2 resumeTransaction using access_code from server
  const redirectToPayment = useCallback(async (paymentData) => {
    if (!paymentData) return;

    // Crypto path — NOWPayments needs a full redirect
    if (paymentData.provider === "crypto") {
      if (!paymentData.payment_url) return;
      window.location.href = paymentData.payment_url;
      return;
    }

    // Paystack v2 path — resume the transaction the server already created
    if (!paymentData.access_code) {
      // No access_code means we can't use resumeTransaction;
      // fall back to full-page redirect via authorization_url
      if (paymentData.payment_url) {
        window.location.href = paymentData.payment_url;
      }
      return;
    }

    try {
      await loadPaystackScript();

      const popup = new PaystackPop();

      // resumeTransaction picks up the transaction by access_code.
      // Email, amount, key — all already set server-side. Nothing to pass here.
      popup.resumeTransaction(paymentData.access_code, {
        onSuccess: (transaction) => {
          const verifyUrl = new URL(
            `${window.location.origin}/payment/callback`,
          );
          verifyUrl.searchParams.set("reference", transaction.reference);
          verifyUrl.searchParams.set("provider", "paystack");
          window.location.href = verifyUrl.toString();
        },

        onCancel: () => {
          console.log("Payment modal closed by user");
        },

        onError: (error) => {
          console.error("Paystack popup error:", error);
          // Fall back to full-page redirect if the popup itself fails
          if (paymentData.payment_url) {
            window.location.href = paymentData.payment_url;
          }
        },
      });
    } catch (err) {
      console.error("Paystack SDK load error:", err);
      // Script failed to load entirely — redirect is the only option
      if (paymentData.payment_url) {
        window.location.href = paymentData.payment_url;
      }
    }
  }, []);

  const reset = () => {
    setLoading(false);
    setError(null);
    setPayment(null);
  };

  return {
    initializePayment,
    redirectToPayment,
    reset,
    loading,
    error,
    payment,
  };
}
