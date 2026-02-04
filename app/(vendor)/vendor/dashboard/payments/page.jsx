// app/vendor/dashboard/payments/page.jsx
"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  XCircle,
  RotateCcw,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CreditCard,
  Wallet,
} from "lucide-react";
import {
  useVendorPayments,
  useVendorPaymentStats,
  normaliseStatus,
} from "@/hooks/use-vendor-payments";
import { useAuth } from "@/hooks/use-auth";

// ─── status config ───────────────────────────────────────────────────────────
const STATUS_STYLES = {
  completed: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
    label: "Completed",
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
    label: "Pending",
  },
  failed: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    label: "Failed",
  },
  refunded: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    dot: "bg-gray-400",
    label: "Refunded",
  },
};

const PROVIDER_LABEL = {
  paystack: "Paystack",
  nowpayments: "Crypto",
  crypto: "Crypto",
};

const REQUEST_TYPE_LABEL = {
  event: "Event",
  hotel: "Hotel",
  apartment: "Apartment",
  logistics: "Logistics",
  security: "Security",
  general: "General",
};

// ─── helpers ─────────────────────────────────────────────────────────────────
function fmt(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Derive the service name from the joined booking relations
function getServiceLabel(payment) {
  if (payment.event_bookings?.listings?.title)
    return payment.event_bookings.listings.title;
  if (payment.hotel_bookings?.hotels?.name)
    return payment.hotel_bookings.hotels.name;
  if (payment.apartment_bookings?.serviced_apartments?.name)
    return payment.apartment_bookings.serviced_apartments.name;
  return REQUEST_TYPE_LABEL[payment.request_type] || "—";
}

function getCategory(payment) {
  if (payment.event_booking_id) return "event";
  if (payment.hotel_booking_id) return "hotel";
  if (payment.apartment_booking_id) return "apartment";
  return payment.request_type || "general";
}

// ─── sub-components ──────────────────────────────────────────────────────────
function StatusBadge({ rawStatus }) {
  const ns = normaliseStatus(rawStatus);
  const s = STATUS_STYLES[ns] || STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function CategoryBadge({ category }) {
  const colors = {
    event: "bg-purple-50 text-purple-700",
    hotel: "bg-blue-50 text-blue-700",
    apartment: "bg-indigo-50 text-indigo-700",
    logistics: "bg-orange-50 text-orange-700",
    security: "bg-red-50 text-red-700",
    general: "bg-gray-50 text-gray-600",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[11px] font-medium ${colors[category] || colors.general}`}
    >
      {REQUEST_TYPE_LABEL[category] || "General"}
    </span>
  );
}

// ─── stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, Icon, iconBg, iconColor, accent }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-200 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-[13px] font-medium">{label}</p>
          <p
            className={`text-2xl font-bold mt-1.5 ${accent || "text-gray-900"}`}
          >
            {value}
          </p>
          {sub && <p className="text-[12px] text-gray-400 mt-1">{sub}</p>}
        </div>
        <div
          className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────
export default function VendorPaymentsPage() {
  const { data: authData } = useAuth();
  const vendorId = authData?.vendor?.id;

  // ── filter state ───────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [dateRange, setDateRange] = useState("month");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // ── queries ────────────────────────────────────────────────────────────
  const filters = {
    page,
    pageSize: PAGE_SIZE,
    status: statusFilter,
    provider: providerFilter,
    search,
    dateRange,
  };
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    refetch,
  } = useVendorPayments(vendorId, filters);
  const { data: stats, isLoading: statsLoading } = useVendorPaymentStats(
    vendorId,
    dateRange,
  );

  const payments = paymentsData?.payments || [];
  const totalPages = Math.ceil((paymentsData?.total || 0) / PAGE_SIZE);

  // reset page when filters change
  const resetPage = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen ">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className=" border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-0 sm:px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Track every naira coming in and going out
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${paymentsLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-0 sm:px-2 py-6 space-y-6">
        {/* ── Date range tabs ──────────────────────────────────────────── */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {["today", "week", "month", "3months", "all"].map((r) => (
            <button
              key={r}
              onClick={() => {
                setDateRange(r);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                dateRange === r
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r === "3months"
                ? "3 Months"
                : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-5 h-28 animate-pulse"
              />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              label="Total Earnings"
              value={fmt(stats.totalEarnings)}
              sub={`${stats.completedCount} successful`}
              Icon={Wallet}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
            />
            <StatCard
              label="Net Earnings"
              value={fmt(stats.netEarnings)}
              sub={
                stats.totalRefunded > 0
                  ? `₦${stats.totalRefunded.toLocaleString()} refunded`
                  : "No refunds"
              }
              Icon={TrendingUp}
              iconBg="bg-green-50"
              iconColor="text-green-600"
              accent="text-green-700"
            />
            <StatCard
              label="Pending"
              value={stats.pendingCount}
              sub={`awaiting confirmation`}
              Icon={Clock}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              accent="text-amber-600"
            />
            <StatCard
              label="Failed"
              value={stats.failedCount}
              sub="no action needed"
              Icon={XCircle}
              iconBg="bg-red-50"
              iconColor="text-red-500"
              accent="text-red-600"
            />
            <StatCard
              label="Refunded"
              value={fmt(stats.totalRefunded)}
              sub={`total returned`}
              Icon={RotateCcw}
              iconBg="bg-gray-50"
              iconColor="text-gray-500"
            />
          </div>
        ) : null}

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reference or email…"
                value={search}
                onChange={(e) => resetPage(setSearch)(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            {/* status */}
            <select
              value={statusFilter}
              onChange={(e) => resetPage(setStatusFilter)(e.target.value)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            {/* provider */}
            <select
              value={providerFilter}
              onChange={(e) => resetPage(setProviderFilter)(e.target.value)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Providers</option>
              <option value="paystack">Paystack</option>
              <option value="nowpayments">Crypto</option>
            </select>
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {paymentsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-700 font-semibold">No payments found</p>
              <p className="text-gray-400 text-sm mt-1">
                {search || statusFilter !== "all" || providerFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Payments will appear here once customers book your services"}
              </p>
            </div>
          ) : (
            <>
              {/* ── mobile cards ────────────────────────────────────────── */}
              <div className="lg:hidden divide-y divide-gray-100">
                {payments.map((p) => {
                  const ns = normaliseStatus(p.status);
                  const category = getCategory(p);
                  return (
                    <div
                      key={p.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {getServiceLabel(p)}
                          </p>
                          <p className="font-mono text-[11px] text-gray-400 mt-0.5">
                            {p.reference}
                          </p>
                        </div>
                        <StatusBadge rawStatus={p.status} />
                      </div>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <CategoryBadge category={category} />
                        <span className="text-[11px] text-gray-400">
                          {PROVIDER_LABEL[p.provider] || p.provider}
                        </span>
                        <span className="text-[11px] text-gray-400">•</span>
                        <span className="text-[11px] text-gray-400">
                          {fmtDate(p.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-bold text-gray-900">
                          {fmt(p.vendor_amount || p.amount)}
                        </span>
                        {p.refund_amount > 0 && (
                          <span className="text-[11px] text-red-500 font-medium">
                            Refunded {fmt(p.refund_amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── desktop table ────────────────────────────────────── */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((p) => {
                      const category = getCategory(p);
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* service */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <CategoryBadge category={category} />
                              <span className="text-sm text-gray-800 font-medium truncate max-w-[160px]">
                                {getServiceLabel(p)}
                              </span>
                            </div>
                          </td>
                          {/* ref */}
                          <td className="px-5 py-4">
                            <span className="font-mono text-[12px] text-gray-500">
                              {p.reference}
                            </span>
                          </td>
                          {/* customer */}
                          <td className="px-5 py-4 text-sm text-gray-600 truncate max-w-[140px]">
                            {p.email || "—"}
                          </td>
                          {/* provider */}
                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-700">
                              {PROVIDER_LABEL[p.provider] || p.provider}
                            </span>
                          </td>
                          {/* status */}
                          <td className="px-5 py-4">
                            <StatusBadge rawStatus={p.status} />
                          </td>
                          {/* date */}
                          <td className="px-5 py-4 text-[12px] text-gray-400 whitespace-nowrap">
                            {fmtDate(p.created_at)}
                          </td>
                          {/* amount */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-bold text-gray-900">
                                {fmt(p.vendor_amount || p.amount)}
                              </span>
                              {p.refund_amount > 0 && (
                                <span className="text-[11px] text-red-500">
                                  -{fmt(p.refund_amount)}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── pagination ─────────────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-[12px] text-gray-400">
                    Showing {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, paymentsData?.total || 0)} of{" "}
                    {paymentsData?.total || 0}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3.5 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    {/* page numbers — show a small window */}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const num =
                        totalPages <= 5
                          ? i + 1
                          : Math.max(
                              1,
                              Math.min(page - 1 + i, totalPages - 4),
                            ) + (i === 0 ? 0 : 0);
                      // simple sequential window
                      const p_num = i + 1;
                      return (
                        <button
                          key={p_num}
                          onClick={() => setPage(p_num)}
                          className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors ${
                            page === p_num
                              ? "bg-purple-600 text-white"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {p_num}
                        </button>
                      );
                    })}
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-3.5 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
