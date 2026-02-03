"use client";

import { useState, useCallback } from "react";

// Loads Paystack's inline script once, returns the PaystackPop constructor
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

  // For Paystack: uses inline SDK so callback is handled client-side, no dashboard config needed.
  // For crypto: falls back to redirect since NOWPayments requires it.
  const redirectToPayment = useCallback(async (paymentData) => {
    if (!paymentData?.payment_url) return;

    // Crypto payments still use redirect — NOWPayments requires it
    if (paymentData.provider === "crypto") {
      window.location.href = paymentData.payment_url;
      return;
    }

    // Paystack inline SDK path
    try {
      const PaystackPop = await loadPaystackScript();

      const handler = new PaystackPop({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: paymentData.email,
        amount: paymentData.amount * 100, // Paystack expects kobo
        currency: paymentData.currency || "NGN",
        reference: paymentData.reference,
        metadata: paymentData.metadata || {},

        // Fires after successful payment — this is your reliable callback
        onSuccess: (transaction) => {
          // Redirect to your verification/callback page with the reference
          const verifyUrl = new URL(
            `${window.location.origin}/payment/callback`,
          );
          verifyUrl.searchParams.set("reference", transaction.reference);
          verifyUrl.searchParams.set("provider", "paystack");
          window.location.href = verifyUrl.toString();
        },

        // User closed the payment modal without completing
        onClose: () => {
          console.log("Payment modal closed by user");
        },
      });

      handler.openModal();
    } catch (err) {
      console.error("Paystack SDK error:", err);
      // Fallback: open authorization_url directly (still subject to dashboard callback issue)
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
