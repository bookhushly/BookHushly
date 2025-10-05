import { useState } from "react";

export default function WalletDashboard() {
  const [hideBalances, setHideBalances] = useState({
    naira: false,
    crypto: false,
  });
  const [activeWallet, setActiveWallet] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const walletData = {
    naira: { balance: 2450000, change: 12.5 },
    crypto: { balance: 0.0456, change: -3.2 },
  };

  const transactions = [
    {
      id: 1,
      type: "credit",
      description: "Wallet Funding",
      amount: 50000,
      currency: "₦",
      date: "Oct 5, 2025",
      wallet: "Naira Wallet",
      status: "completed",
    },
    {
      id: 2,
      type: "debit",
      description: "Service Payment",
      amount: 125000,
      currency: "₦",
      date: "Oct 4, 2025",
      wallet: "Naira Wallet",
      status: "completed",
    },
    {
      id: 3,
      type: "credit",
      description: "Crypto Deposit",
      amount: 0.0023,
      currency: "BTC",
      date: "Oct 3, 2025",
      wallet: "Crypto Wallet",
      status: "pending",
    },
    {
      id: 4,
      type: "debit",
      description: "Booking Payment",
      amount: 75000,
      currency: "₦",
      date: "Oct 2, 2025",
      wallet: "Naira Wallet",
      status: "completed",
    },
    {
      id: 5,
      type: "debit",
      description: "Transfer to Vendor",
      amount: 200000,
      currency: "₦",
      date: "Oct 1, 2025",
      wallet: "Naira Wallet",
      status: "completed",
    },
  ];

  const spendingStats = [
    { category: "Services", amount: 450000, percentage: 45, transactions: 12 },
    { category: "Bookings", amount: 320000, percentage: 32, transactions: 8 },
    { category: "Transfers", amount: 150000, percentage: 15, transactions: 5 },
    { category: "Others", amount: 80000, percentage: 8, transactions: 3 },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesWallet =
      activeWallet === "all" ||
      (activeWallet === "naira" && transaction.wallet === "Naira Wallet") ||
      (activeWallet === "crypto" && transaction.wallet === "Crypto Wallet");

    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesWallet && matchesSearch;
  });

  const WalletBalanceCard = ({
    type,
    balance,
    change,
    isHidden,
    toggleVisibility,
  }) => {
    const isNaira = type === "naira";
    const currency = isNaira ? "₦" : "BTC";
    const changeColor = change >= 0 ? "text-green-600" : "text-red-600";

    return (
      <div className="bg-white rounded-2xl border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${isNaira ? "bg-purple-50" : "bg-purple-100"}`}
            >
              <svg
                className={`h-6 w-6 ${isNaira ? "text-purple-600" : "text-purple-700"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isNaira ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                )}
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isNaira ? "Naira Wallet" : "Crypto Wallet"}
              </h3>
              <p className="text-xs text-gray-500">
                {isNaira ? "NGN Balance" : "Bitcoin Balance"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleVisibility}
            className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            {isHidden ? (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-gray-900">
              {isHidden ? "••••••" : `${currency}${balance.toLocaleString()}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className={`h-4 w-4 ${changeColor}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {change >= 0 ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              )}
            </svg>
            <span className={`text-sm font-medium ${changeColor}`}>
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Fund
          </button>
          <button className="flex-1 border border-purple-200 hover:bg-purple-50 text-purple-700 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Send
          </button>
        </div>
      </div>
    );
  };

  const TransactionItem = ({ transaction }) => {
    const isCredit = transaction.type === "credit";
    const statusColors = {
      completed: "bg-green-50 text-green-700 border-green-200",
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      failed: "bg-red-50 text-red-700 border-red-200",
    };

    return (
      <div className="flex items-center justify-between p-4 hover:bg-purple-50 rounded-xl transition-colors border border-transparent hover:border-purple-100">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${isCredit ? "bg-green-50" : "bg-purple-50"}`}
          >
            <svg
              className={`h-5 w-5 ${isCredit ? "text-green-600" : "text-purple-600"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isCredit ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              )}
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {transaction.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-500">{transaction.date}</p>
              <span
                className={`${statusColors[transaction.status]} text-xs px-2 py-1 rounded-md border`}
              >
                {transaction.status}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`font-semibold ${isCredit ? "text-green-600" : "text-gray-900"}`}
          >
            {isCredit ? "+" : "-"}
            {transaction.currency}
            {transaction.amount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{transaction.wallet}</p>
        </div>
      </div>
    );
  };

  const QuickActions = () => {
    const actions = [
      { label: "Add Money", icon: "M12 4v16m8-8H4" },
      { label: "Transfer", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
      {
        label: "Withdraw",
        icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
      },
      {
        label: "Schedule",
        icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      },
    ];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 group"
          >
            <div className="p-3 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
              <svg
                className="h-5 w-5 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={action.icon}
                />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-700">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
          <p className="text-gray-600">Manage your funds and transactions</p>
        </div>

        {/* Wallet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WalletBalanceCard
            type="naira"
            balance={walletData.naira.balance}
            change={walletData.naira.change}
            isHidden={hideBalances.naira}
            toggleVisibility={() =>
              setHideBalances({ ...hideBalances, naira: !hideBalances.naira })
            }
          />
          <WalletBalanceCard
            type="crypto"
            balance={walletData.crypto.balance}
            change={walletData.crypto.change}
            isHidden={hideBalances.crypto}
            toggleVisibility={() =>
              setHideBalances({ ...hideBalances, crypto: !hideBalances.crypto })
            }
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-purple-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <QuickActions />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-purple-100 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Transactions
                  </h2>
                  <p className="text-sm text-gray-500">
                    Your latest wallet activity
                  </p>
                </div>
                <button className="border border-purple-200 hover:bg-purple-50 p-2 rounded-lg transition-colors">
                  <svg
                    className="h-4 w-4 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-purple-100 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div className="flex bg-purple-50 rounded-xl p-1">
                  <button
                    onClick={() => setActiveWallet("all")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeWallet === "all"
                        ? "bg-white text-purple-700 shadow-sm"
                        : "text-gray-600 hover:text-purple-700"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveWallet("naira")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeWallet === "naira"
                        ? "bg-white text-purple-700 shadow-sm"
                        : "text-gray-600 hover:text-purple-700"
                    }`}
                  >
                    Naira
                  </button>
                  <button
                    onClick={() => setActiveWallet("crypto")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeWallet === "crypto"
                        ? "bg-white text-purple-700 shadow-sm"
                        : "text-gray-600 hover:text-purple-700"
                    }`}
                  >
                    Crypto
                  </button>
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
                    <svg
                      className="h-12 w-12 text-gray-300 mx-auto mb-3"
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
                    <p className="text-sm text-gray-500">
                      No transactions found
                    </p>
                  </div>
                )}
              </div>

              {filteredTransactions.length > 0 && (
                <button className="w-full mt-6 border border-purple-200 hover:bg-purple-50 text-purple-700 px-4 py-2.5 rounded-xl font-medium transition-colors">
                  View All Transactions
                </button>
              )}
            </div>
          </div>

          {/* Spending Statistics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-purple-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Spending Analytics
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Your financial overview
              </p>

              <div className="space-y-6">
                {spendingStats.map((stat, index) => {
                  const colors = ["#a855f7", "#9333ea", "#7e22ce", "#6b21a8"];
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors[index] }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700">
                            {stat.category}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          ₦{stat.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${stat.percentage}%`,
                            backgroundColor: colors[index],
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{stat.percentage}% of total</span>
                        <span>{stat.transactions} transactions</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
