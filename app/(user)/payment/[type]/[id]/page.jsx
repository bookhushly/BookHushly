"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PaymentMethodSelector from "../../../../../components/shared/payment/payment-method-selector";
import PaymentForm from "../../../../../components/shared/payment/payment-form";
import PaymentStatus from "../../../../../components/shared/payment/payment-status";

export default function PaymentPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Unwrap params Promise using React.use()
  const { type, id } = use(params);

  const [requestData, setRequestData] = useState(null);
  const [quoteData, setQuoteData] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // null, 'paid', 'pending'
  const [existingPayment, setExistingPayment] = useState(null);

  const quoteId = searchParams.get("quote_id");
  const reference = searchParams.get("reference");
  const provider = searchParams.get("provider");

  const MAX_RETRIES = 3;

  // Check online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle beforeunload - warn user before leaving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (selectedProvider && !reference && !paymentStatus) {
        e.preventDefault();
        e.returnValue =
          "You have an incomplete payment. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedProvider, reference, paymentStatus]);

  // Check if already paid or has pending payment
  const checkExistingPayment = useCallback(async (requestId, requestType) => {
    try {
      const response = await fetch("/api/payment/check-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          requestType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.hasPaid) {
          // Already paid - block payment
          setPaymentStatus("paid");
          setExistingPayment(data.payment);
          return "paid";
        } else if (data.hasPending) {
          // Has pending payment - block new payment
          setPaymentStatus("pending");
          setExistingPayment(data.payment);
          return "pending";
        }
      }

      return null;
    } catch (error) {
      console.error("Error checking payment status:", error);
      // Don't block if check fails, let them proceed
      return null;
    }
  }, []);

  // Fetch data with retry logic
  const fetchData = useCallback(
    async (retryAttempt = 0) => {
      try {
        setLoading(true);
        setError(null);

        if (!navigator.onLine) {
          throw new Error(
            "You are offline. Please check your internet connection.",
          );
        }

        let endpoint;
        if (type === "logistics" || type === "security") {
          endpoint = `/api/${type}/requests/${id}`;
        } else if (type === "hotel") {
          endpoint = `/api/bookings/hotel/${id}`;
        } else if (type === "apartment") {
          endpoint = `/api/bookings/apartment/${id}`;
        } else if (type === "event") {
          endpoint = `/api/bookings/event/${id}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(endpoint, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch data");
        }

        const fetchedData = data.request || data.booking;
        setRequestData(fetchedData);

        if (
          fetchedData?.service_quotes &&
          fetchedData.service_quotes.length > 0
        ) {
          if (quoteId) {
            const specificQuote = fetchedData.service_quotes.find(
              (q) => q.id === quoteId,
            );
            setQuoteData(specificQuote || fetchedData.service_quotes[0]);
          } else {
            setQuoteData(fetchedData.service_quotes[0]);
          }
        }

        // CRITICAL: Check if already paid or has pending payment
        await checkExistingPayment(id, type);

        setRetryCount(0);
      } catch (err) {
        console.error("Fetch error:", err);

        if (err.name === "AbortError") {
          setError(
            "Request timeout. Please check your connection and try again.",
          );
        } else if (err.message.includes("offline")) {
          setError(err.message);
        } else if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError")
        ) {
          setError("Network error. Please check your internet connection.");
        } else {
          setError(err.message);
        }

        if (
          retryAttempt < MAX_RETRIES &&
          (err.name === "AbortError" ||
            err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError"))
        ) {
          setRetryCount(retryAttempt + 1);
          const delay = Math.pow(2, retryAttempt) * 2000;
          setTimeout(() => fetchData(retryAttempt + 1), delay);
        }
      } finally {
        setLoading(false);
      }
    },
    [type, id, quoteId, checkExistingPayment],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isOffline && error && error.includes("offline")) {
      fetchData();
    }
  }, [isOffline, error, fetchData]);

  const handleBack = useCallback(() => {
    if (selectedProvider) {
      const confirmBack = window.confirm(
        "Are you sure you want to change your payment method?",
      );
      if (confirmBack) {
        setSelectedProvider(null);
        setSelectedCrypto(null);
      }
    } else {
      router.back();
    }
  }, [selectedProvider, router]);

  // Show status if returning from payment
  if (reference && provider) {
    return <PaymentStatus reference={reference} provider={provider} />;
  }

  // Already paid state
  if (paymentStatus === "paid" && existingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Already Paid
          </h2>
          <p className="text-gray-600 mb-6">
            This {type} request has already been paid for. You cannot make
            duplicate payments.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reference</span>
                <span className="font-medium text-gray-900 font-mono">
                  {existingPayment.reference}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium text-gray-900">
                  ₦{existingPayment.amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="font-medium text-green-600 capitalize">
                  {existingPayment.status}
                </span>
              </div>
              {existingPayment.paid_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Paid At</span>
                  <span className="font-medium text-gray-900">
                    {new Date(existingPayment.paid_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.back()}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    );
  }

  // Pending payment state
  if (paymentStatus === "pending" && existingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Pending Payment Exists
          </h2>
          <p className="text-gray-600 mb-6">
            You have a pending payment for this {type} request. Please complete
            or cancel it before creating a new payment.
          </p>

          <div className="bg-orange-50 rounded-lg p-4 mb-6 text-left border border-orange-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reference</span>
                <span className="font-medium text-gray-900 font-mono">
                  {existingPayment.reference}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium text-gray-900">
                  ₦{existingPayment.amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="font-medium text-orange-600 capitalize">
                  Pending
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created</span>
                <span className="font-medium text-gray-900">
                  {new Date(existingPayment.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() =>
                router.push(
                  `/payment/callback?reference=${existingPayment.reference}&provider=${existingPayment.provider || "paystack"}`,
                )
              }
              className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Check Payment Status
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.back()}
              className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg font-medium border-2 border-gray-200 hover:border-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Contact support if you need to cancel the pending payment.
          </p>
        </div>
      </div>
    );
  }

  // Offline state
  if (isOffline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 pt-20">
        <div className="max-w-md w-full bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-6 h-6 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
            <h2 className="text-lg font-semibold text-orange-900">
              No Internet Connection
            </h2>
          </div>
          <p className="text-orange-700 mb-4">
            You're currently offline. Please check your internet connection and
            we'll automatically retry.
          </p>
          <div className="flex items-center justify-center py-4">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-xs text-orange-600 text-center">
            Waiting for connection...
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment options...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Retry attempt {retryCount} of {MAX_RETRIES}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    const isNetworkError =
      error.includes("network") ||
      error.includes("timeout") ||
      error.includes("Failed to fetch");

    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-red-900">
              {isNetworkError ? "Connection Error" : "Error"}
            </h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>

          <div className="flex gap-3">
            {isNetworkError && retryCount < MAX_RETRIES && (
              <button
                onClick={() => fetchData(0)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => router.push("/quote-service")}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>

          {retryCount >= MAX_RETRIES && isNetworkError && (
            <p className="text-xs text-red-600 mt-3 text-center">
              Maximum retry attempts reached. Please check your connection and
              try again later.
            </p>
          )}
        </div>
      </div>
    );
  }

  // No data state
  if (!requestData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 mb-4">No payment information available</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
      <div className="max-w-4xl mx-auto pt-20 w-full">
        {!selectedProvider && (
          <>
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Complete Payment
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Choose your preferred payment method
              </p>
            </div>
            <PaymentMethodSelector
              amount={
                quoteData?.total_amount ||
                requestData.amount ||
                requestData.total_price
              }
              currency="NGN"
              onSelectMethod={(method, crypto) => {
                setSelectedProvider(method);
                setSelectedCrypto(crypto);
              }}
            />
          </>
        )}

        {selectedProvider && (
          <PaymentForm
            requestData={requestData}
            quoteData={quoteData}
            requestType={type}
            requestId={id}
            provider={selectedProvider}
            selectedCrypto={selectedCrypto}
            onBack={() => {
              setSelectedProvider(null);
              setSelectedCrypto(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
