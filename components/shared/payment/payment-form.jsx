"use client";

import { useState, useMemo } from "react";
import { usePaymentInitialization } from "@/hooks/payment/use-payment-initialization";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  // Customer information state (for bookings without pre-filled data)
  const [customerInfo, setCustomerInfo] = useState({
    email:
      requestData?.email ||
      requestData?.contact_email ||
      requestData?.guest_email ||
      "",
    phone:
      requestData?.phone_number ||
      requestData?.phone ||
      requestData?.contact_phone ||
      requestData?.guest_phone ||
      "",
    name:
      requestData?.full_name ||
      requestData?.customer_name ||
      requestData?.guest_name ||
      "",
  });

  // Check if we need to collect customer info (for bookings)
  const needsCustomerInfo =
    (requestType === "hotel" ||
      requestType === "apartment" ||
      requestType === "event") &&
    (!requestData?.email ||
      !requestData?.phone_number ||
      !requestData?.full_name);

  // Parse breakdown
  const breakdown = useMemo(() => {
    if (!quoteData?.breakdown) return [];

    if (Array.isArray(quoteData.breakdown)) {
      return quoteData.breakdown;
    }

    if (typeof quoteData.breakdown === "string") {
      try {
        const parsed = JSON.parse(quoteData.breakdown);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to parse breakdown:", e);
        return [];
      }
    }

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

    // Validate customer info if needed
    if (needsCustomerInfo) {
      if (!customerInfo.email || !/^\S+@\S+\.\S+$/.test(customerInfo.email)) {
        alert("Please enter a valid email address");
        return;
      }
      if (!customerInfo.phone) {
        alert("Please enter your phone number");
        return;
      }
      if (!customerInfo.name) {
        alert("Please enter your full name");
        return;
      }
    }

    try {
      const payment = await initializePayment({
        requestId,
        requestType,
        amount:
          quoteData?.total_amount ||
          requestData?.amount ||
          requestData?.total_amount ||
          requestData?.total_price,
        email: customerInfo.email || requestData?.email,
        provider: provider || "paystack",
        payCurrency: selectedCrypto,
        metadata: {
          customer_name:
            customerInfo.name ||
            requestData?.full_name ||
            requestData?.customer_name,
          customer_phone:
            customerInfo.phone ||
            requestData?.phone_number ||
            requestData?.phone,
          service_type: requestData?.service_type,
          quote_id: quoteData?.id,
          // Add booking-specific metadata
          ...(requestType === "event" && {
            event_title: requestData?.listing?.title,
            event_date: requestData?.booking_date,
            guests: requestData?.guests,
          }),
          ...(requestType === "hotel" && {
            hotel_name: requestData?.hotel?.name,
            check_in: requestData?.check_in_date,
            check_out: requestData?.check_out_date,
            guests: requestData?.number_of_guests,
          }),
          ...(requestType === "apartment" && {
            apartment_name: requestData?.apartment?.name,
            check_in: requestData?.check_in_date,
            check_out: requestData?.check_out_date,
            guests: requestData?.number_of_guests,
          }),
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
    requestData?.total_amount ||
    requestData?.total_price ||
    0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
        {/* Customer Information Form (if needed) */}
        {needsCustomerInfo && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Customer Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, email: e.target.value })
                  }
                  placeholder="your.email@example.com"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Payment confirmation will be sent to this email
                </p>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, phone: e.target.value })
                  }
                  placeholder="+234 800 000 0000"
                  required
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Customer Information Display (if already provided) */}
        {!needsCustomerInfo && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Customer Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name</span>
                <span className="text-sm font-medium text-gray-900">
                  {requestData?.full_name ||
                    requestData?.customer_name ||
                    requestData?.guest_name ||
                    "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-medium text-gray-900">
                  {requestData?.email ||
                    requestData?.contact_email ||
                    requestData?.guest_email ||
                    "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Phone</span>
                <span className="text-sm font-medium text-gray-900">
                  {requestData?.phone_number ||
                    requestData?.phone ||
                    requestData?.contact_phone ||
                    requestData?.guest_phone ||
                    "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details (for events/hotels/apartments) */}
        {(requestType === "event" ||
          requestType === "hotel" ||
          requestType === "apartment") && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Booking Details
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {requestType === "event" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Event</span>
                    <span className="text-sm font-medium text-gray-900">
                      {requestData?.listing?.title || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {requestData?.booking_date
                        ? new Date(
                            requestData.booking_date,
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tickets</span>
                    <span className="text-sm font-medium text-gray-900">
                      {requestData?.guests || 0}
                    </span>
                  </div>
                </>
              )}

              {requestType === "hotel" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hotel</span>
                    <span className="text-sm font-medium text-gray-900">
                      {requestData?.hotel?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Check-in</span>
                    <span className="text-sm font-medium text-gray-900">
                      {requestData?.check_in_date
                        ? new Date(
                            requestData.check_in_date,
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Check-out</span>
                    <span className="text-sm font-medium text-gray-900">
                      {requestData?.check_out_date
                        ? new Date(
                            requestData.check_out_date,
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Guests</span>
                    <span className="text-sm font-medium text-gray-900">
                      {requestData?.number_of_guests || 0}
                    </span>
                  </div>
                </>
              )}

              {requestType === "apartment" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Apartment</span>
                    <span className="text-sm font-medium text-gray-900">
                      {requestData?.apartment?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Check-in</span>
                    <span className="text-sm font-medium text-gray-900">
                      {requestData?.check_in_date
                        ? new Date(
                            requestData.check_in_date,
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Check-out</span>
                    <span className="text-sm font-medium text-gray-900">
                      {requestData?.check_out_date
                        ? new Date(
                            requestData.check_out_date,
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Guests</span>
                    <span className="text-sm font-medium text-gray-900">
                      {requestData?.number_of_guests || 0}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quote Details */}
        {quoteData && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              {requestType === "logistics" || requestType === "security"
                ? "Quote Breakdown"
                : "Payment Breakdown"}
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
                  <span className="text-sm text-gray-600">
                    {requestType === "event" ? "Ticket(s)" : "Service Charge"}
                  </span>
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
              this payment is for{" "}
              {requestType === "event"
                ? "event tickets"
                : requestType === "hotel" || requestType === "apartment"
                  ? "accommodation booking"
                  : "the quoted service"}{" "}
              and is subject to the cancellation policy.
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
              Proceed to Secure Payment (₦{totalAmount.toLocaleString()})
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
