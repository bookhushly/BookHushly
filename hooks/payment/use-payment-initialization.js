"use client";

import { useState } from "react";

export function usePaymentInitialization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);

  const initializePayment = async ({
    requestId,
    requestType,
    amount,
    email,
    provider = "paystack", // Default to paystack
    payCurrency, // For crypto payments
    currency = "NGN", // Default currency
    metadata = {},
  }) => {
    setLoading(true);
    setError(null);
    setPayment(null);

    try {
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  const redirectToPayment = (paymentUrl) => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  };

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
