"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ServiceRequestSuccessModal from "../../../../components/shared/payment/request-successful";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState("verifying"); // verifying, success, failed, pending
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const reference = searchParams.get("reference");
  const provider = searchParams.get("provider") || "paystack";

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setError("Invalid payment reference");
      return;
    }

    verifyPayment();
  }, [reference, provider]);

  const verifyPayment = async () => {
    try {
      setStatus("verifying");

      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference,
          provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment verification failed");
      }

      if (data.verified) {
        setPaymentDetails(data.payment);
        setStatus("success");

        // Show modal for service requests (logistics/security)
        const requestType = data.payment?.request_type;
        if (requestType === "logistics" || requestType === "security") {
          setShowSuccessModal(true);
        }
      } else {
        setStatus("failed");
        setError(data.message || data.error || "Payment verification failed");
      }

      // For crypto payments, check if still pending
      if (provider === "crypto" || provider === "nowpayments") {
        if (
          data.payment?.status === "waiting" ||
          data.payment?.status === "confirming" ||
          data.payment?.status === "sending"
        ) {
          setStatus("pending");
          setPaymentDetails(data.payment);
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      setStatus("failed");
      setError(err.message);
    }
  };

  const handleContinue = () => {
    if (!paymentDetails) {
      router.push("/dashboard");
      return;
    }

    const requestType = paymentDetails.request_type;

    // Service requests (logistics/security) show modal instead
    if (requestType === "logistics" || requestType === "security") {
      setShowSuccessModal(true);
      return;
    }

    // For bookings, redirect to appropriate pages when they exist
    // For now, redirect to dashboard
    router.push("/dashboard");

    /* Future implementation when booking pages are ready:
    const hotelBookingId = paymentDetails.hotel_booking_id;
    const apartmentBookingId = paymentDetails.apartment_booking_id;
    const eventBookingId = paymentDetails.event_booking_id;

    if (hotelBookingId) {
      router.push(`/bookings/hotel/${hotelBookingId}`);
    } else if (apartmentBookingId) {
      router.push(`/bookings/apartment/${apartmentBookingId}`);
    } else if (eventBookingId) {
      router.push(`/bookings/event/${eventBookingId}`);
    } else {
      router.push("/dashboard");
    }
    */
  };

  const handleRetry = () => {
    router.back();
  };

  // Verifying state
  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Verifying Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment...
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - Show modal for service requests, otherwise show success page
  if (status === "success") {
    const isServiceRequest =
      paymentDetails?.request_type === "logistics" ||
      paymentDetails?.request_type === "security";

    // Service requests show modal
    if (isServiceRequest) {
      return (
        <>
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
              {/* This content is behind the modal but shown if modal is closed */}
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
                Request Confirmed!
              </h2>
              <p className="text-gray-600 mb-6">
                Your {paymentDetails.request_type} service request has been
                confirmed.
              </p>

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>

          <ServiceRequestSuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            requestType={paymentDetails.request_type}
            reference={paymentDetails.reference}
          />
        </>
      );
    }

    // Bookings show standard success page
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
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
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your payment has been confirmed and processed successfully.
          </p>

          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-medium text-gray-900 font-mono">
                    {paymentDetails.reference}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium text-gray-900">
                    ₦{paymentDetails.amount?.toLocaleString()}
                  </span>
                </div>
                {paymentDetails.channel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {paymentDetails.channel}
                    </span>
                  </div>
                )}
                {paymentDetails.paid_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paid At</span>
                    <span className="font-medium text-gray-900">
                      {new Date(paymentDetails.paid_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleContinue}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Continue
          </button>

          <p className="text-xs text-gray-500 mt-4">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    );
  }

  // Pending state (for crypto payments)
  if (status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
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
            Payment Pending
          </h2>
          <p className="text-gray-600 mb-6">
            Your cryptocurrency payment is being processed. This may take a few
            minutes depending on blockchain confirmation times.
          </p>

          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-medium text-gray-900 font-mono">
                    {paymentDetails.reference}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-orange-600 capitalize">
                    {paymentDetails.status || "Pending"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={verifyPayment}
              className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Check Status
            </button>
            <button
              onClick={handleContinue}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Continue Anyway
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            You'll receive a confirmation email once the payment is confirmed on
            the blockchain.
          </p>
        </div>
      </div>
    );
  }

  // Failed state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-red-600"
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

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Payment Failed
        </h2>
        <p className="text-gray-600 mb-6">
          {error || "We couldn't process your payment. Please try again."}
        </p>

        {reference && (
          <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reference</span>
                <span className="font-medium text-gray-900 font-mono">
                  {reference}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="font-medium text-red-600 capitalize">
                  Failed
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          If you continue to experience issues, please contact our support team.
        </p>
      </div>
    </div>
  );
}
