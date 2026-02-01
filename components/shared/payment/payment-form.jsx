"use client";

import { useState, useMemo } from "react";
import { usePaymentInitialization } from "@/hooks/payment/use-payment-initialization";

export default function PaymentForm({
  requestData,
  quoteData,
  requestType,
  requestId,
  provider,
  selectedCrypto,
  onBack,
}) {
  const { initializePayment, redirectToPayment, loading, error } =
    usePaymentInitialization();
  const [agreed, setAgreed] = useState(false);

  // Parse breakdown - handle string, object, or array
  const breakdown = useMemo(() => {
    if (!quoteData?.breakdown) return [];

    // If it's already an array, use it
    if (Array.isArray(quoteData.breakdown)) {
      return quoteData.breakdown;
    }

    // If it's a string, try to parse it
    if (typeof quoteData.breakdown === "string") {
      try {
        const parsed = JSON.parse(quoteData.breakdown);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to parse breakdown:", e);
        return [];
      }
    }

    // If it's an object, convert to array
    if (typeof quoteData.breakdown === "object") {
      return Object.entries(quoteData.breakdown).map(([key, value]) => ({
        description: key,
        amount: value,
      }));
    }

    return [];
  }, [quoteData?.breakdown]);

  const handlePayment = async () => {
    if (!agreed) {
      alert("Please agree to the terms and conditions");
      return;
    }

    try {
      const payment = await initializePayment({
        requestId,
        requestType,
        amount:
          quoteData?.total_amount ||
          requestData?.amount ||
          requestData?.total_price,
        email: requestData?.email,
        provider: provider || "paystack",
        payCurrency: selectedCrypto,
        metadata: {
          customer_name: requestData?.full_name || requestData?.customer_name,
          service_type: requestData?.service_type,
          quote_id: quoteData?.id,
        },
      });

      // Redirect to payment page
      redirectToPayment(payment.payment_url || payment.authorization_url);
    } catch (err) {
      console.error("Payment initialization failed:", err);
    }
  };

  // Get total amount with fallbacks
  const totalAmount =
    quoteData?.total_amount ||
    requestData?.amount ||
    requestData?.total_price ||
    0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 ">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Complete Payment
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {requestType === "logistics" && "Logistics Service Payment"}
              {requestType === "security" && "Security Service Payment"}
              {requestType === "hotel" && "Hotel Booking Payment"}
              {requestType === "apartment" && "Apartment Booking Payment"}
              {requestType === "event" && "Event Booking Payment"}
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Change Payment Method
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Customer Information */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Customer Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Name</span>
              <span className="text-sm font-medium text-gray-900">
                {requestData?.full_name || requestData?.customer_name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Email</span>
              <span className="text-sm font-medium text-gray-900">
                {requestData?.email || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Phone</span>
              <span className="text-sm font-medium text-gray-900">
                {requestData?.phone_number || requestData?.phone || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Quote Details */}
        {quoteData && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Quote Breakdown
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {breakdown.length > 0 ? (
                breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {item.description || item.item || `Item ${index + 1}`}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ₦{(item.amount || 0).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Service Charge</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₦{totalAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-base font-bold text-purple-600">
                    ₦{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Provider Info */}
        {provider && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Payment Method
            </h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                {provider === "paystack" ? (
                  <>
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Card / Bank Transfer
                      </p>
                      <p className="text-xs text-gray-600">
                        Visa, Mastercard, Verve, Bank Transfer, USSD
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-8 h-8 text-orange-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Cryptocurrency
                        {selectedCrypto && ` (${selectedCrypto.toUpperCase()})`}
                      </p>
                      <p className="text-xs text-gray-600">
                        Secure blockchain payment
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Available Payment Methods (only show if provider not selected) */}
        {!provider && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Available Payment Methods
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-200 rounded-lg p-3 text-center">
                <svg
                  className="w-8 h-8 mx-auto mb-2 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <p className="text-xs font-medium text-gray-700">Card</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3 text-center">
                <svg
                  className="w-8 h-8 mx-auto mb-2 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <p className="text-xs font-medium text-gray-700">
                  Bank Transfer
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3 text-center">
                <svg
                  className="w-8 h-8 mx-auto mb-2 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-xs font-medium text-gray-700">USSD</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3 text-center">
                <svg
                  className="w-8 h-8 mx-auto mb-2 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                <p className="text-xs font-medium text-gray-700">QR Code</p>
              </div>
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">
              I agree to BookHushly's terms and conditions. I understand that
              this payment is for the quoted service and is non-refundable once
              the service has been rendered.
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4">
        <button
          onClick={handlePayment}
          disabled={loading || !agreed}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Proceed to Secure Payment
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          {provider === "paystack"
            ? "Secured by Paystack. Your payment information is encrypted and secure."
            : provider === "crypto"
              ? "Secured by NOWPayments. Blockchain-verified cryptocurrency payment."
              : "Your payment information is encrypted and secure."}
        </p>
      </div>
    </div>
  );
}
