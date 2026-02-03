"use client";

import { useState, useCallback } from "react";

// Loads Paystack v1 inline script once, caches on window
function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve(window.PaystackPop);

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
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

  // Crypto → redirect (NOWPayments requires it)
  // Paystack → v1 inline modal, callback handles redirect
  const redirectToPayment = useCallback(async (paymentData) => {
    if (!paymentData?.payment_url) return;

    if (paymentData.provider === "crypto") {
      window.location.href = paymentData.payment_url;
      return;
    }

    // Paystack v1 inline path
    try {
      await loadPaystackScript();

      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: paymentData.email,
        amount: paymentData.amount * 100, // kobo
        currency: paymentData.currency || "NGN",
        ref: paymentData.reference,
        metadata: paymentData.metadata || {},

        // v1 uses `callback`, not `onSuccess`
        callback: (transaction) => {
          const verifyUrl = new URL(
            `${window.location.origin}/payment/callback`,
          );
          verifyUrl.searchParams.set("reference", transaction.reference);
          verifyUrl.searchParams.set("provider", "paystack");
          window.location.href = verifyUrl.toString();
        },

        onClose: () => {
          console.log("Payment modal closed by user");
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error("Paystack SDK error:", err);
      // Fallback: full-page redirect to Paystack
      window.location.href = paymentData.payment_url;
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
