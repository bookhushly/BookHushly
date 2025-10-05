import { useState } from "react";
import {
  Eye,
  EyeOff,
  DollarSign,
  Bitcoin,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Send,
  Download,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
} from "lucide-react";

// Wallet Balance Card Component
const WalletBalanceCard = ({
  type,
  balance,
  change,
  isHidden,
  onToggleVisibility,
}) => {
  const isNaira = type === "naira";
  const Icon = isNaira ? DollarSign : Bitcoin;
  const currency = isNaira ? "₦" : "BTC";
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white border border-purple-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl ${isNaira ? "bg-purple-50" : "bg-purple-100"}`}
          >
            <Icon
              className={`h-6 w-6 ${isNaira ? "text-purple-600" : "text-purple-700"}`}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {isNaira ? "Naira Wallet" : "Crypto Wallet"}
            </h3>
            <p className="text-xs text-gray-500">
              {isNaira ? "NGN Balance" : "Bitcoin Balance"}
            </p>
          </div>
        </div>
        <button
          onClick={onToggleVisibility}
          className="p-2 rounded-lg hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition-colors"
        >
          {isHidden ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {isHidden ? "••••••" : `${currency}${balance.toLocaleString()}`}
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon
            className={`h-4 w-4 ${isPositive ? "text-green-600" : "text-red-600"}`}
          />
          <span
            className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
          <span className="text-sm text-gray-500">vs last month</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-colors">
          <Plus className="h-4 w-4" />
          Fund
        </button>
        <button className="flex items-center justify-center gap-2 border border-purple-200 hover:bg-purple-50 text-purple-700 py-3 px-4 rounded-xl font-medium transition-colors">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Transaction Item Component
const TransactionItem = ({ transaction }) => {
  const isCredit = transaction.type === "credit";
  const statusConfig = {
    completed: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: CheckCircle,
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
  const status = statusConfig[transaction.status];
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center justify-between p-4 hover:bg-purple-50 rounded-xl transition-all duration-300 border border-transparent hover:border-purple-100 cursor-pointer group">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div
          className={`p-3 rounded-xl ${isCredit ? "bg-green-50" : "bg-purple-50"} group-hover:${isCredit ? "bg-green-100" : "bg-purple-100"} transition-colors`}
        >
          {isCredit ? (
            <ArrowDownLeft className="h-5 w-5 text-green-600" />
          ) : (
            <ArrowUpRight className="h-5 w-5 text-purple-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {transaction.description}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">{transaction.date}</p>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}
            >
              <StatusIcon className="h-3 w-3" />
              {transaction.status}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right ml-4">
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

// Quick Actions Component
const QuickActions = () => {
  const actions = [
    { icon: Plus, label: "Add Money" },
    { icon: Send, label: "Send" },
    { icon: Download, label: "Withdraw" },
    { icon: Calendar, label: "Schedule" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <button
          key={index}
          className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 group"
        >
          <div className="p-3 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
            <action.icon className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};

// Main Wallet Section Component
export default function WalletSection() {
  const [hideBalances, setHideBalances] = useState({
    naira: false,
    crypto: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeWallet, setActiveWallet] = useState("all");

  // Mock wallet data - Replace with real API data
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
    {
      category: "Services",
      amount: 450000,
      percentage: 45,
      transactions: 12,
      color: "#9333ea",
    },
    {
      category: "Bookings",
      amount: 320000,
      percentage: 32,
      transactions: 8,
      color: "#7e22ce",
    },
    {
      category: "Transfers",
      amount: 150000,
      percentage: 15,
      transactions: 5,
      color: "#6b21a8",
    },
    {
      category: "Others",
      amount: 80000,
      percentage: 8,
      transactions: 3,
      color: "#581c87",
    },
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

  return (
    <div className="space-y-6">
      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WalletBalanceCard
          type="naira"
          balance={walletData.naira.balance}
          change={walletData.naira.change}
          isHidden={hideBalances.naira}
          onToggleVisibility={() =>
            setHideBalances({ ...hideBalances, naira: !hideBalances.naira })
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-purple-100 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <QuickActions />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-purple-100 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Transactions
                </h3>
                <p className="text-sm text-gray-500">
                  Your latest wallet activity
                </p>
              </div>
              <button className="p-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors">
                <Filter className="h-5 w-5 text-purple-600" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-purple-100 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <div className="flex gap-2 bg-purple-50 rounded-xl p-1">
                {["All", "Naira", "Crypto"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveWallet(filter.toLowerCase())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeWallet === filter.toLowerCase()
                        ? "bg-white text-purple-700 shadow-sm"
                        : "text-gray-600 hover:text-purple-600"
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
                  <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No transactions found</p>
                </div>
              )}
            </div>

            {filteredTransactions.length > 0 && (
              <button className="w-full mt-4 border border-purple-200 hover:bg-purple-50 text-purple-700 py-3 px-4 rounded-xl font-medium transition-colors">
                View All Transactions
              </button>
            )}
          </div>
        </div>

        {/* Spending Analytics */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-purple-100 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Spending Analytics
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Your financial overview
            </p>
            <div className="space-y-6">
              {spendingStats.map((stat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stat.color }}
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
                        backgroundColor: stat.color,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{stat.percentage}% of total</span>
                    <span>{stat.transactions} transactions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
