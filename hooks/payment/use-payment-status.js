"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function usePaymentStatus(reference, options = {}) {
  const {
    autoVerify = false,
    pollingInterval = 3000, // 3 seconds
    maxPollingAttempts = 20, // 1 minute total
  } = options;

  const [status, setStatus] = useState("pending");
  const [payment, setPayment] = useState(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const pollingCount = useRef(0);
  const pollingInterval_ref = useRef(null);

  const checkStatus = useCallback(async () => {
    if (!reference) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/payment/status/${reference}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check payment status");
      }

      setPayment(data.payment);
      setRequest(data.request);
      setStatus(data.payment.status);

      // Stop polling if payment is successful or failed
      if (
        data.payment.status === "success" ||
        data.payment.status === "failed"
      ) {
        stopPolling();
      }

      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [reference]);

  const verifyPayment = useCallback(async () => {
    if (!reference) return;

    setVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      if (data.verified) {
        setStatus("success");
        setPayment(data.payment);
      }

      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setVerifying(false);
    }
  }, [reference]);

  const startPolling = useCallback(() => {
    if (pollingInterval_ref.current) return; // Already polling

    pollingCount.current = 0;

    pollingInterval_ref.current = setInterval(() => {
      pollingCount.current += 1;

      if (pollingCount.current >= maxPollingAttempts) {
        stopPolling();
        setError("Payment verification timeout");
        return;
      }

      checkStatus();
    }, pollingInterval);
  }, [checkStatus, pollingInterval, maxPollingAttempts]);

  const stopPolling = useCallback(() => {
    if (pollingInterval_ref.current) {
      clearInterval(pollingInterval_ref.current);
      pollingInterval_ref.current = null;
    }
  }, []);

  // Auto-verify on mount if enabled
  useEffect(() => {
    if (autoVerify && reference) {
      verifyPayment();
    }
  }, [autoVerify, reference, verifyPayment]);

  // Initial status check
  useEffect(() => {
    if (reference) {
      checkStatus();
    }
  }, [reference, checkStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    status,
    payment,
    request,
    loading,
    error,
    verifying,
    checkStatus,
    verifyPayment,
    startPolling,
    stopPolling,
  };
}
