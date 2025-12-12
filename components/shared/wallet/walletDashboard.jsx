"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Send,
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  X,
  AlertCircle,
  DollarSign,
  CreditCard,
  RefreshCw,
} from "lucide-react";

const WalletBalanceCard = ({
  balance,
  currency,
  isHidden,
  onToggleVisibility,
  onFund,
  onWithdraw,
}) => (
  <div className="bg-white border border-purple-100 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-purple-600">
          <Wallet className="h-7 w-7 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Main Wallet</h3>
          <p className="text-sm text-gray-500">Available Balance</p>
        </div>
      </div>
      <button
        onClick={onToggleVisibility}
        className="p-3 rounded-xl hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition-colors"
        aria-label={isHidden ? "Show balance" : "Hide balance"}
      >
        {isHidden ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>

    <div className="mb-8">
      <div className="text-4xl font-bold text-gray-900 mb-3">
        {isHidden
          ? "••••••••"
          : `${currency}${balance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
          Active
        </span>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3">
      <button
        onClick={onFund}
        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
      >
        <Plus className="h-5 w-5" />
        Fund Wallet
      </button>
    </div>
  </div>
);

const StatsCard = ({ title, value, icon: Icon, bgColor, iconColor }) => (
  <div className="bg-white border border-purple-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">
          ₦{value.toLocaleString()}
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    </div>
  </div>
);

const TransactionItem = ({ transaction }) => {
  const isCredit =
    transaction.transaction_type === "deposit" ||
    transaction.transaction_type === "refund";

  const statusConfig = {
    completed: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: CheckCircle,
    },
    processing: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      icon: Clock,
    },
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      icon: Clock,
    },
    failed: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: XCircle,
    },
  };

  const status = statusConfig[transaction.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const isMobile = window.innerWidth < 640;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: isMobile ? "2-digit" : "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 hover:bg-purple-50 rounded-xl sm:rounded-2xl transition-all duration-300 border border-transparent hover:border-purple-100 cursor-pointer group gap-3 sm:gap-4">
      {/* Left Section: Icon + Transaction Details */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Icon */}
        <div
          className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 ${
            isCredit
              ? "bg-green-50 group-hover:bg-green-100"
              : "bg-purple-50 group-hover:bg-purple-100"
          } transition-colors`}
        >
          {isCredit ? (
            <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          ) : (
            <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          )}
        </div>

        {/* Transaction Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm sm:text-base text-gray-900 truncate pr-2">
            {transaction.description}
          </p>

          {/* Date and Status - Responsive Layout */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-2 mt-1.5 sm:mt-1">
            <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
              {formatDate(transaction.created_at)}
            </p>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border ${status.bg} ${status.text} ${status.border} w-fit`}
            >
              <StatusIcon className="h-3 w-3 flex-shrink-0" />
              <span className="capitalize">{transaction.status}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Amount and Payment Provider */}
      <div className="flex items-center justify-between sm:block sm:text-right sm:ml-4 flex-shrink-0 pl-11 sm:pl-0">
        <div>
          <p
            className={`text-base sm:text-lg font-bold ${
              isCredit ? "text-green-600" : "text-gray-900"
            }`}
          >
            {isCredit ? "+" : "-"}₦{transaction.amount.toLocaleString()}
          </p>
          {transaction.payment_provider && (
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 capitalize">
              {transaction.payment_provider}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
const FundWalletModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFund = async () => {
    setError("");

    if (!amount || parseFloat(amount) < 100) {
      setError("Minimum deposit is ₦100");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          crypto_currency: paymentMethod === "crypto" ? "btc" : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initialize deposit");
      }

      const result = await response.json();

      if (result.data.authorization_url) {
        window.location.href = result.data.authorization_url;
      } else if (result.data.invoice_url) {
        window.location.href = result.data.invoice_url;
      } else {
        throw new Error("No payment URL returned");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Fund Wallet</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount in Naira
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:outline-none focus:border-purple-300 transition-all"
              min="100"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">Minimum deposit: ₦100</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("paystack")}
                disabled={loading}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === "paystack"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-purple-200"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <CreditCard
                  className={`h-6 w-6 ${
                    paymentMethod === "paystack"
                      ? "text-purple-600"
                      : "text-gray-400"
                  }`}
                />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Paystack</p>
                  <p className="text-xs text-gray-500">
                    Card, Bank Transfer, USSD
                  </p>
                </div>
                {paymentMethod === "paystack" && (
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("crypto")}
                disabled={loading}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === "crypto"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-purple-200"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <DollarSign
                  className={`h-6 w-6 ${
                    paymentMethod === "crypto"
                      ? "text-purple-600"
                      : "text-gray-400"
                  }`}
                />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Cryptocurrency</p>
                  <p className="text-xs text-gray-500">
                    BTC, ETH, USDT - Auto convert to NGN
                  </p>
                </div>
                {paymentMethod === "crypto" && (
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleFund}
            disabled={loading || !amount}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Processing...
              </span>
            ) : (
              `Fund ₦${amount || "0"}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ErrorDisplay = ({ error, onRetry }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
    <div className="bg-white border border-red-200 rounded-3xl p-8 max-w-md w-full shadow-xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-xl bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Error Loading Wallet
          </h3>
          <p className="text-sm text-gray-600">Something went wrong</p>
        </div>
      </div>
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
      >
        <RefreshCw className="h-5 w-5" />
        Try Again
      </button>
    </div>
  </div>
);

const LoadingDisplay = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading your wallet...</p>
    </div>
  </div>
);

export default function WalletDashboard() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showFundModal, setShowFundModal] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch wallet data
      const walletRes = await fetch("/api/wallet");

      // Check if response is OK
      if (!walletRes.ok) {
        if (walletRes.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        }
        const errorText = await walletRes.text();
        console.error("Wallet API error:", errorText);
        throw new Error(`Failed to load wallet (${walletRes.status})`);
      }

      // Check content type
      const contentType = walletRes.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Invalid content-type:", contentType);
        throw new Error(
          "Server returned invalid response. Please check your authentication."
        );
      }

      const walletData = await walletRes.json();

      if (walletData.error) {
        throw new Error(walletData.error);
      }

      if (walletData.data) {
        setWallet(walletData.data);
      }

      // Fetch transactions
      const transactionsRes = await fetch("/api/wallet/transactions");
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        if (transactionsData.data) {
          setTransactions(transactionsData.data);
        }
      }

      // Fetch statistics
      const statsRes = await fetch("/api/wallet/statistics");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.data) {
          setStatistics(statsData.data);
        }
      }
    } catch (error) {
      console.error("Error loading wallet data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "all" || tx.transaction_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <LoadingDisplay />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={loadWalletData} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
            <p className="text-gray-600 mt-1">
              Manage your funds and transactions
            </p>
          </div>
          <button
            onClick={loadWalletData}
            className="p-3 rounded-xl border-2 border-purple-200 hover:bg-purple-50 text-purple-600 transition-all"
            aria-label="Refresh wallet data"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        {/* Balance Card */}
        <WalletBalanceCard
          balance={wallet?.balance || 0}
          currency="₦"
          isHidden={hideBalance}
          onToggleVisibility={() => setHideBalance(!hideBalance)}
          onFund={() => setShowFundModal(true)}
          onWithdraw={() => alert("Withdrawal feature: Add bank account first")}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Deposits"
            value={statistics?.total_deposits || 0}
            icon={ArrowDownLeft}
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <StatsCard
            title="Total Payments"
            value={statistics?.total_payments || 0}
            icon={ArrowUpRight}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatsCard
            title="Total Withdrawals"
            value={statistics?.total_withdrawals || 0}
            icon={Download}
            bgColor="bg-gray-50"
            iconColor="text-gray-600"
          />
        </div>

        {/* Transactions Section */}
        <div className="bg-white border border-purple-100 rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Transaction History
              </h3>
              <p className="text-sm text-gray-500">
                All your wallet activities
              </p>
            </div>
            <button className="p-3 rounded-xl border-2 border-purple-200 hover:bg-purple-50 transition-colors">
              <Filter className="h-5 w-5 text-purple-600" />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-purple-100 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-1.5 sm:gap-2 bg-purple-50 rounded-xl p-1 overflow-x-auto scrollbar-hide">
              {["All", "Deposit", "Payment", "Withdrawal"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter.toLowerCase())}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 min-h-[44px] sm:min-h-0 ${
                    filterType === filter.toLowerCase()
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-gray-600 hover:text-purple-600 active:bg-white/50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-2">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  No transactions found
                </p>
                {searchQuery && (
                  <p className="text-sm text-gray-400 mt-2">
                    Try adjusting your search or filters
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fund Wallet Modal */}
      <FundWalletModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
        onSuccess={loadWalletData}
      />
    </div>
  );
}
