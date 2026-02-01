"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePaymentStatus } from "@/hooks/payment/use-payment-status";

export default function PaymentStatus({ reference }) {
  const router = useRouter();
  const {
    status,
    payment,
    request,
    loading,
    error,
    verifying,
    verifyPayment,
    startPolling,
    stopPolling,
  } = usePaymentStatus(reference, { autoVerify: true });

  useEffect(() => {
    // Start polling for status updates
    if (status === "pending") {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [status, startPolling, stopPolling]);

  const handleRetryVerification = () => {
    verifyPayment();
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (loading && !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking payment status...</p>
        </div>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Verification Error
            </h2>
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={handleRetryVerification}
            disabled={verifying}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors mb-3"
          >
            {verifying ? "Retrying..." : "Retry Verification"}
          </button>
          <button
            onClick={handleBackToHome}
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Success State
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
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
            <h2 className="text-2xl font-semibold text-green-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-green-700 mb-4">
              Your payment has been processed successfully
            </p>
          </div>

          {payment && (
            <div className="bg-white rounded-lg p-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount Paid</span>
                <span className="text-sm font-semibold text-gray-900">
                  ₦{payment.amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reference</span>
                <span className="text-sm font-mono text-gray-900">
                  {payment.reference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Method</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {payment.channel || "N/A"}
                </span>
              </div>
              {payment.paid_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date</span>
                  <span className="text-sm text-gray-900">
                    {new Date(payment.paid_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleBackToHome}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Home
            </button>
            <p className="text-xs text-gray-600 text-center">
              A confirmation email has been sent to your registered email
              address
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Failed State
  if (status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-red-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-red-700">Your payment could not be processed</p>
          </div>

          {payment && (
            <div className="bg-white rounded-lg p-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reference</span>
                <span className="text-sm font-mono text-gray-900">
                  {payment.reference}
                </span>
              </div>
              {payment.failure_reason && (
                <div>
                  <span className="text-sm text-gray-600 block mb-1">
                    Reason
                  </span>
                  <span className="text-sm text-red-700">
                    {payment.failure_reason}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleBackToHome}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pending State (Verification in progress)
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            {verifying ? "Verifying Payment..." : "Payment Pending"}
          </h2>
          <p className="text-yellow-700 mb-6">
            Please wait while we confirm your payment
          </p>

          {payment && (
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reference</span>
                <span className="text-sm font-mono text-gray-900">
                  {payment.reference}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleRetryVerification}
            disabled={verifying}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
          >
            {verifying ? "Checking..." : "Check Status"}
          </button>
        </div>
      </div>
    </div>
  );
}
