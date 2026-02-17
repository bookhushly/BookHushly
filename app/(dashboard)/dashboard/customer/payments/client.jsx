"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPaymentHistory } from "@/app/actions/customers";
import {
  PageHeader,
  EmptyState,
  CardSkeleton,
  Pagination,
  StatCard,
  SectionCard,
} from "@/components/shared/customer/shared-ui";

const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: CheckCircle2,
  },
  success: {
    label: "Success",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    color: "text-red-600",
    bg: "bg-red-50",
    icon: XCircle,
  },
  pending: {
    label: "Pending",
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: Clock,
  },
  refunded: {
    label: "Refunded",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: TrendingUp,
  },
};

const PROVIDER_LABELS = {
  paystack: "Paystack",
  crypto: "Crypto",
  nowpayments: "NOWPayments",
};

export function PaymentsClient({ userId, initialData }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["payment-history", userId, page],
    queryFn: () => getPaymentHistory(userId, page, PAGE_SIZE),
    initialData: page === 1 ? initialData : undefined,
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  });

  const payments = data?.data || [];
  const totalPages = Math.ceil((data?.count || 0) / PAGE_SIZE);

  const totalSuccessful = useMemo(
    () =>
      payments
        .filter((p) => ["completed", "success"].includes(p.status))
        .reduce((s, p) => s + parseFloat(p.amount || 0), 0),
    [payments],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        description={`${data?.count || 0} transactions`}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Paid"
          value={`₦${totalSuccessful.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`}
          subtitle="Successful payments"
          icon={CreditCard}
          variant="purple"
        />
        <StatCard
          title="Transactions"
          value={data?.count || 0}
          subtitle="All time"
          icon={TrendingUp}
        />
        <StatCard
          title="This Page"
          value={
            payments.filter((p) => ["completed", "success"].includes(p.status))
              .length
          }
          subtitle="Successful"
          icon={CheckCircle2}
          variant="soft"
        />
      </div>

      {isLoading ? (
        <CardSkeleton count={5} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment history"
          description="Your payment transactions will appear here."
        />
      ) : (
        <SectionCard title="Transactions">
          <div
            className={`divide-y divide-gray-50 ${isFetching ? "opacity-60" : ""}`}
          >
            {payments.map((payment) => {
              const statusConf =
                STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConf.icon;

              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${statusConf.bg}`}>
                      <StatusIcon className={`h-4 w-4 ${statusConf.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {payment.reference}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(
                          new Date(payment.created_at),
                          "MMM d, yyyy · h:mm a",
                        )}
                        {payment.provider && (
                          <span className="ml-2 text-purple-600">
                            via{" "}
                            {PROVIDER_LABELS[payment.provider] ||
                              payment.provider}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ₦{parseFloat(payment.amount || 0).toLocaleString("en-NG")}
                    </p>
                    <span
                      className={`text-xs font-medium capitalize ${statusConf.color}`}
                    >
                      {statusConf.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </SectionCard>
      )}
    </div>
  );
}
