import { useState, useEffect } from "react";
import {
  Wallet,
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

const PaymentMethodSelection = ({ bookingAmount, onPaymentMethodSelect }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [hasSufficientBalance, setHasSufficientBalance] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadWalletBalance();
  }, []);

  const loadWalletBalance = async () => {
    setLoadingWallet(true);
    try {
      const mockBalance = 125000.5;
      setWalletBalance(mockBalance);
      setHasSufficientBalance(mockBalance >= bookingAmount);
    } catch (error) {
      console.error("Error loading wallet:", error);
    } finally {
      setLoadingWallet(false);
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleProceed = async () => {
    if (!selectedMethod) {
      alert("Please select a payment method");
      return;
    }

    setProcessing(true);

    try {
      await onPaymentMethodSelect(selectedMethod);
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: "wallet",
      name: "Wallet Balance",
      description: "Pay instantly from your wallet",
      icon: Wallet,
      available: hasSufficientBalance,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
      disabled: !hasSufficientBalance,
    },
    {
      id: "paystack",
      name: "Card / Bank Transfer",
      description: "Pay with Paystack - Card, Bank, USSD",
      icon: CreditCard,
      available: true,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
      disabled: false,
    },
    {
      id: "crypto",
      name: "Cryptocurrency",
      description: "Pay with BTC, ETH, USDT and more",
      icon: DollarSign,
      available: true,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
      disabled: false,
    },
  ];

  return (
    <div className="bg-white border border-purple-100 rounded-3xl p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Payment Method
        </h2>
        <p className="text-gray-600">
          Choose how you want to pay for this booking
        </p>
      </div>

      <div className="mb-8 p-6 bg-purple-50 rounded-2xl border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Amount to Pay
            </p>
            <p className="text-3xl font-bold text-gray-900">
              ₦{bookingAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {!loadingWallet && (
        <div className="mb-6 p-5 bg-white border-2 border-purple-200 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Your Wallet</h3>
                <p className="text-sm text-gray-600">Available balance</p>
              </div>
            </div>
            <button
              onClick={() => setHideBalance(!hideBalance)}
              className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
            >
              {hideBalance ? (
                <EyeOff className="h-5 w-5 text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">
              {hideBalance
                ? "••••••••"
                : `₦${walletBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
            </p>
            {hasSufficientBalance ? (
              <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                Sufficient
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-full">
                Insufficient
              </span>
            )}
          </div>
          {!hasSufficientBalance && (
            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-sm text-gray-600 mb-3">
                You need ₦{(bookingAmount - walletBalance).toLocaleString()}{" "}
                more
              </p>
              <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                Fund Wallet →
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 mb-8">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => !method.disabled && handleMethodSelect(method.id)}
            disabled={method.disabled}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
              selectedMethod === method.id
                ? "border-purple-600 bg-purple-50"
                : `${method.borderColor} bg-white hover:border-purple-300`
            } ${method.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div
              className={`p-3 rounded-xl ${method.bgColor} ${
                selectedMethod === method.id
                  ? "ring-2 ring-purple-600 ring-offset-2"
                  : ""
              }`}
            >
              <method.icon
                className={`h-6 w-6 ${
                  selectedMethod === method.id
                    ? "text-purple-600"
                    : method.iconColor
                }`}
              />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{method.name}</h3>
                {method.id === "wallet" && !method.available && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Insufficient Balance
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
            {selectedMethod === method.id && (
              <CheckCircle className="h-6 w-6 text-purple-600" />
            )}
          </button>
        ))}
      </div>

      {selectedMethod === "wallet" && !hasSufficientBalance && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900 mb-1">
              Insufficient Wallet Balance
            </p>
            <p className="text-sm text-yellow-700">
              Please fund your wallet or select another payment method to
              continue
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleProceed}
        disabled={
          !selectedMethod ||
          processing ||
          (selectedMethod === "wallet" && !hasSufficientBalance)
        }
        className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            Processing...
          </>
        ) : (
          <>
            Proceed to Payment
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
        <CheckCircle className="h-4 w-4" />
        <span>Secure payment powered by Paystack and NOWPayments</span>
      </div>
    </div>
  );
};

export default PaymentMethodSelection;
