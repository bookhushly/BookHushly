"use client";

import { useState } from "react";
import { POPULAR_CRYPTOCURRENCIES } from "@/lib/nowpayments/constants/payment-status";

export default function PaymentMethodSelector({
  amount,
  currency,
  onSelectMethod,
}) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [showCryptoOptions, setShowCryptoOptions] = useState(false);

  const handleMethodSelect = (method) => {
    if (method === "paystack") {
      onSelectMethod("paystack", null);
    } else {
      setSelectedMethod("crypto");
      setShowCryptoOptions(true);
    }
  };

  const handleCryptoSelect = (crypto) => {
    setSelectedCrypto(crypto);
    onSelectMethod("crypto", crypto);
  };

  return (
    <div className="space-y-4">
      {!showCryptoOptions ? (
        <>
          {/* Paystack - Card/Bank */}
          <div
            onClick={() => handleMethodSelect("paystack")}
            className="bg-white border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-purple-600 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-purple-600"
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
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Card / Bank Transfer
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Pay with debit card, bank transfer, or USSD
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-700 rounded">
                    Visa
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-700 rounded">
                    Mastercard
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-700 rounded">
                    Verve
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-700 rounded">
                    Bank Transfer
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-700 rounded">
                    USSD
                  </span>
                </div>
              </div>
              <svg
                className="w-6 h-6 text-gray-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          {/* Cryptocurrency */}
          <div
            onClick={() => handleMethodSelect("crypto")}
            className="bg-white border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-purple-600 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Cryptocurrency
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Pay with Bitcoin, Ethereum, USDT, and 300+ cryptocurrencies
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CRYPTOCURRENCIES.slice(0, 6).map((crypto) => (
                    <span
                      key={crypto.code}
                      className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-700 rounded"
                    >
                      {crypto.code.toUpperCase()}
                    </span>
                  ))}
                  <span className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-700 rounded">
                    +300 more
                  </span>
                </div>
              </div>
              <svg
                className="w-6 h-6 text-gray-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Crypto Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Cryptocurrency
              </h3>
              <button
                onClick={() => {
                  setShowCryptoOptions(false);
                  setSelectedCrypto(null);
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {POPULAR_CRYPTOCURRENCIES.map((crypto) => (
                <button
                  key={crypto.code}
                  onClick={() => handleCryptoSelect(crypto.code)}
                  className={`p-4 border-2 rounded-lg text-left hover:border-purple-600 transition-all ${
                    selectedCrypto === crypto.code
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="text-2xl mb-2">{crypto.symbol}</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {crypto.name}
                  </div>
                  <div className="text-xs text-gray-500 uppercase">
                    {crypto.code}
                  </div>
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Don't see your preferred cryptocurrency? You can select from 300+
              options on the payment page
            </p>
          </div>
        </>
      )}
    </div>
  );
}
